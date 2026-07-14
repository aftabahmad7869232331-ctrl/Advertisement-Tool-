import json
import hashlib
import os
import tempfile
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from fastapi import BackgroundTasks, FastAPI, Header, HTTPException
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from .providers.base import ProviderError, VideoProviderRequest
from .providers.provider_registry import get_provider
from .cleanup import cleanup_abandoned_temp_files
from .queue.job_queue import InProcessJobQueue, QueueFullError, QueuedJob
from .local_ai import router as local_ai_router

WORKER_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = Path(__file__).resolve().parents[3]

# Root configuration is shared by API/workers. A worker-local file may fill
# missing values but never silently override values already loaded from root or
# the process environment.
load_dotenv(PROJECT_ROOT / ".env", override=False)
load_dotenv(WORKER_ROOT / ".env", override=False)

API_BASE_URL = os.getenv(
    "API_BASE_URL",
    "http://127.0.0.1:3000",
).rstrip("/")

CALLBACK_TOKEN = os.getenv(
    "AI_WORKER_CALLBACK_TOKEN",
    "local-dev-ai-worker",
)

JOB_QUEUE = InProcessJobQueue(
    concurrency=int(os.getenv("AI_WORKER_CONCURRENCY", "1")),
    max_size=int(os.getenv("AI_MAX_QUEUE_SIZE", "20")),
)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield
    JOB_QUEUE.shutdown()


app = FastAPI(
    title="Bricks Maker AI Worker",
    version="0.1.0",
    lifespan=lifespan,
)
app.include_router(local_ai_router)


class VideoGenerationRequest(BaseModel):
    job_id: str = Field(min_length=1)
    prompts: list[str] = Field(min_length=1, max_length=10)
    format: Literal["mp4", "webm", "mov"] = "mp4"
    quality: Literal["720p", "1080p", "4k"] = "1080p"
    aspect_ratio: Literal["16:9", "9:16", "1:1"] = "16:9"
    language: str = Field(default="en", min_length=2, max_length=16)
    provider: str = "local-wan"
    model: str = "Wan2.1-T2V-1.3B"
    provider_api_key: str | None = None
    duration: float | None = Field(default=None, gt=0, le=10)
    seed: int | None = Field(default=None, ge=0)
    negative_prompt: str | None = Field(default=None, max_length=2000)


def send_job_update(
    job_id: str,
    payload: dict[str, object],
) -> None:
    safe_job_id = quote(job_id, safe="")

    url = (
        f"{API_BASE_URL}"
        f"/api/internal/ai/jobs/{safe_job_id}/update"
    )

    request = Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-ai-worker-token": CALLBACK_TOKEN,
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            if response.status >= 400:
                raise RuntimeError(
                    f"Callback failed with status {response.status}"
                )
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"Callback HTTP error {error.code}: {body}"
        ) from error
    except URLError as error:
        raise RuntimeError(
            f"Fastify API callback connection failed: {error.reason}"
        ) from error


def upload_generated_artifact(job_id: str, output_path: Path, mime_type: str) -> dict[str, object]:
    digest = hashlib.sha256()
    with output_path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)

    safe_job_id = quote(job_id, safe="")
    url = f"{API_BASE_URL}/api/internal/ai/jobs/{safe_job_id}/artifact"
    with output_path.open("rb") as source:
        request = Request(
            url=url,
            data=source,
            method="POST",
            headers={
                "Content-Type": "application/octet-stream",
                "Content-Length": str(output_path.stat().st_size),
                "x-ai-worker-token": CALLBACK_TOKEN,
                "x-artifact-filename": output_path.name,
                "x-artifact-mime-type": mime_type,
                "x-artifact-sha256": digest.hexdigest(),
            },
        )
        try:
            with urlopen(request, timeout=_positive_timeout("HF_CONNECT_TIMEOUT_SECONDS", 15)) as response:
                body = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError) as error:
            raise ProviderError("provider_unavailable", "Generated artifact API ingestion fail hui.") from error

    if not isinstance(body, dict) or body.get("status") != "ok":
        raise ProviderError("invalid_output", "Generated artifact API ne accept nahi ki.")
    return body


def run_callback_test(job_id: str, cancellation_check=lambda: False) -> None:
    """
    Temporary lifecycle simulator.

    Actual Wan2.1 integration ke baad isi jagah real model
    loading, generation aur progress updates aayenge.
    """

    try:
        updates = [
            (10, "validating"),
            (30, "provider_queued"),
            (65, "generating"),
            (90, "output_ready"),
        ]

        for progress, stage in updates:
            if cancellation_check():
                send_job_update(job_id, {"status": "error", "error": "Generation cancelled.", "result": {"errorCode": "cancelled"}})
                return
            time.sleep(1)

            send_job_update(
                job_id,
                {
                    "status": "processing",
                    "progress": progress,
                    "stage": stage,
                },
            )

        time.sleep(1)

        # Write mock video file (with valid ftyp signature) to bypass fastify verification
        out_dir = _temporary_output_directory()
        out_dir.mkdir(parents=True, exist_ok=True)
        
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="wb",
                dir=out_dir,
                prefix=".pending-",
                suffix=".mp4",
                delete=False,
            ) as temporary:
                temporary.write(b"\x00\x00\x00\x18ftypisommock-video-content")
                temporary.flush()
                os.fsync(temporary.fileno())
                temp_path = Path(temporary.name)
            
            destination = out_dir / f"mock-{job_id}.mp4"
            os.replace(temp_path, destination)
            temp_path = destination
            
            artifact = upload_generated_artifact(
                job_id,
                temp_path,
                "video/mp4",
            )
            temp_path.unlink(missing_ok=True)
            
            send_job_update(
                job_id,
                {
                    "status": "done",
                    "progress": 100,
                    "stage": "completed",
                    "result": {
                        "provider": "simulator",
                        "model": "simulator-model",
                        "videoId": artifact.get("videoId"),
                        "mimeType": "video/mp4",
                        "fileSizeBytes": len(b"\x00\x00\x00\x18ftypisommock-video-content"),
                        "sha256": artifact.get("sha256"),
                    },
                },
            )
        except Exception as upload_err:
            if temp_path and temp_path.exists():
                temp_path.unlink(missing_ok=True)
            raise upload_err

    except Exception as error:
        print(
            f"[ai-worker] Callback test failed "
            f"for job {job_id}: {error}"
        )

        try:
            send_job_update(
                job_id,
                {
                    "status": "error",
                    "error": str(error),
                },
            )
        except Exception as callback_error:
            print(
                "[ai-worker] Error callback bhi fail hua: "
                f"{callback_error}"
            )


def _environment_flag(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _positive_timeout(name: str, default: float) -> float:
    try:
        value = float(os.getenv(name, str(default)))
        return value if value > 0 else default
    except ValueError:
        return default


def _temporary_output_directory() -> Path:
    configured = os.getenv("AI_TEMP_OUTPUT_DIR", "").strip()
    if configured:
        return Path(configured).expanduser().resolve()
    return (Path(__file__).resolve().parents[1] / ".artifacts" / "tmp").resolve()


def run_provider_generation(request: VideoGenerationRequest, cancellation_check=lambda: False, attempt: int = 0) -> None:
    """Run cloud generation without logging or persisting request credentials."""
    try:
        send_job_update(
            request.job_id,
            {"status": "processing", "progress": 10, "stage": "validating"},
        )
        model = os.getenv("HF_VIDEO_MODEL", "").strip() if request.provider == "huggingface" else request.model
        provider_request = VideoProviderRequest(
            job_id=request.job_id,
            prompts=request.prompts,
            model=model,
            output_format=request.format,
            token=request.provider_api_key,
            duration=request.duration,
            seed=request.seed,
            negative_prompt=request.negative_prompt,
        )
        provider = get_provider(request.provider, _temporary_output_directory())

        def report(progress: int, stage: str) -> None:
            send_job_update(
                request.job_id,
                {"status": "processing", "progress": progress, "stage": stage},
            )

        result = provider.generate_video(
            provider_request,
            report,
            cancellation_check,
            min(_positive_timeout("HF_GENERATION_TIMEOUT_SECONDS", 900), _positive_timeout("AI_JOB_TIMEOUT_SECONDS", 1200)),
        )
        artifact = upload_generated_artifact(
            request.job_id,
            result.output_path,
            result.mime_type,
        )
        result.output_path.unlink(missing_ok=True)
        send_job_update(
            request.job_id,
            {
                "status": "done",
                "progress": 100,
                "stage": "completed",
                "result": {
                    "provider": request.provider,
                    "model": model,
                    "videoId": artifact.get("videoId"),
                    "mimeType": result.mime_type,
                    "fileSizeBytes": result.file_size_bytes,
                    "sha256": artifact.get("sha256"),
                },
            },
        )
    except ProviderError as error:
        transient = {"rate_limited", "provider_timeout", "provider_unavailable"}
        max_retries = int(os.getenv("AI_MAX_RETRIES", "2"))
        if error.code in transient and attempt < max_retries and not cancellation_check():
            delay = min(float(os.getenv("AI_RETRY_BASE_DELAY_SECONDS", "10")) * (2 ** attempt), 120)
            send_job_update(request.job_id, {"status": "processing", "progress": 10, "stage": "retrying", "result": {"retryCount": attempt + 1, "errorCode": error.code}})
            time.sleep(delay)
            run_provider_generation(request, cancellation_check, attempt + 1)
            return
        send_job_update(
            request.job_id,
            {
                "status": "error",
                "error": str(error),
                "result": {"errorCode": error.code},
            },
        )
    except Exception:
        send_job_update(
            request.job_id,
            {
                "status": "error",
                "error": "Generation worker unexpectedly fail ho gaya.",
                "result": {"errorCode": "generation_failed"},
            },
        )
def detect_local_wan_runtime() -> dict[str, object]:
    model_path = os.getenv("WAN_MODEL_PATH", "").strip()
    model_exists = bool(model_path) and os.path.isdir(model_path)
    requested_device = os.getenv("AI_DEVICE", "auto").strip().lower()

    try:
        import torch

        torch_installed = True
        cuda_available = torch.cuda.is_available()

        if requested_device == "cpu":
            device = "cpu"
        elif requested_device == "cuda":
            device = (
                torch.cuda.get_device_name(0)
                if cuda_available
                else "cuda-unavailable"
            )
        else:
            device = (
                torch.cuda.get_device_name(0)
                if cuda_available
                else "cpu"
            )
    except Exception:
        torch_installed = False
        cuda_available = False
        device = "unavailable"

    cpu_mode = device == "cpu"
    local_wan_ready = (
        model_exists
        and torch_installed
        and (cuda_available or cpu_mode)
    )

    if not model_exists:
        reason = "WAN_MODEL_PATH configured nahi hai ya model folder nahi mila."
    elif not torch_installed:
        reason = "PyTorch runtime installed nahi hai."
    elif requested_device == "cuda" and not cuda_available:
        reason = "CUDA-compatible NVIDIA GPU available nahi hai."
    elif cpu_mode:
        reason = (
            "Local Wan2.1 CPU mode me ready hai. "
            "Generation bahut slow ho sakti hai."
        )
    else:
        reason = "Local Wan2.1 CUDA runtime ready hai."

    return {
        "localWanReady": local_wan_ready,
        "modelExists": model_exists,
        "torchInstalled": torch_installed,
        "cudaAvailable": cuda_available,
        "device": device,
        "reason": reason,
    }


@app.get("/health")
def health() -> dict[str, object]:
    runtime = detect_local_wan_runtime()

    return {
        "status": "ok",
        "service": "ai-worker",
        "model": "Wan2.1-T2V-1.3B",
        **runtime,
        **JOB_QUEUE.stats(),
    }


@app.post("/generate")
def generate_video(
    request: VideoGenerationRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, object]:
    try:
        if _environment_flag("AI_WORKER_SIMULATOR", False):
            queued = QueuedJob(request.job_id, lambda cancelled: run_callback_test(request.job_id, cancelled))
        else:
            queued = QueuedJob(request.job_id, lambda cancelled: run_provider_generation(request, cancelled))
        created = JOB_QUEUE.enqueue(queued)
    except QueueFullError as error:
        from fastapi import HTTPException
        raise HTTPException(status_code=429, detail=str(error)) from error

    return {
        "jobId": request.job_id,
        "status": "queued" if created else "accepted",
        "promptCount": len(request.prompts),
        "provider": request.provider,
        "model": request.model,
    }


@app.post("/jobs/{job_id}/cancel")
def cancel_job(
    job_id: str,
    x_ai_worker_token: str | None = Header(default=None),
) -> dict[str, object]:
    if x_ai_worker_token != CALLBACK_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"status": "ok", "jobId": job_id, "cancelRequested": JOB_QUEUE.cancel(job_id)}


def main() -> None:
    import uvicorn

    cleanup_abandoned_temp_files(_temporary_output_directory())

    host = os.getenv("AI_WORKER_HOST", "127.0.0.1")
    port = int(os.getenv("AI_WORKER_PORT", "8100"))

    uvicorn.run(
        "src.main:app",
        host=host,
        port=port,
        reload=False,
    )


if __name__ == "__main__":
    main()
