import json
import os
import time
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from fastapi import BackgroundTasks, FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="Bricks Maker AI Worker",
    version="0.1.0",
)

API_BASE_URL = os.getenv(
    "API_BASE_URL",
    "http://127.0.0.1:3000",
).rstrip("/")

CALLBACK_TOKEN = os.getenv(
    "AI_WORKER_CALLBACK_TOKEN",
    "local-dev-ai-worker",
)


class VideoGenerationRequest(BaseModel):
    job_id: str = Field(min_length=1)
    prompts: list[str] = Field(min_length=1, max_length=5)
    format: Literal["mp4", "webm", "mov"] = "mp4"
    quality: Literal["720p", "1080p", "4k"] = "1080p"
    aspect_ratio: Literal["16:9", "9:16", "1:1"] = "16:9"
    language: str = Field(default="en", min_length=2)
    provider: str = "local-wan"
    model: str = "Wan2.1-T2V-1.3B"


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


def run_callback_test(job_id: str) -> None:
    """
    Temporary lifecycle simulator.

    Actual Wan2.1 integration ke baad isi jagah real model
    loading, generation aur progress updates aayenge.
    """

    try:
        updates = [
            (10, "worker_started"),
            (35, "generation_preparing"),
            (65, "generation_processing"),
            (90, "generation_finishing"),
        ]

        for progress, stage in updates:
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

        send_job_update(
            job_id,
            {
                "status": "done",
                "progress": 100,
                "stage": "completed",
                "result": {
                    "callbackTest": True,
                    "message": (
                        "AI Worker callback lifecycle "
                        "successfully completed."
                    ),
                },
            },
        )

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


def detect_local_wan_runtime() -> dict[str, object]:
    model_path = os.getenv("WAN_MODEL_PATH", "").strip()
    model_exists = bool(model_path) and os.path.isdir(model_path)

    try:
        import torch

        cuda_available = torch.cuda.is_available()
        device = (
            torch.cuda.get_device_name(0)
            if cuda_available
            else "cpu"
        )
        torch_installed = True
    except Exception:
        cuda_available = False
        device = "unavailable"
        torch_installed = False

    local_wan_ready = (
        model_exists
        and torch_installed
        and cuda_available
    )

    if not model_exists:
        reason = "WAN_MODEL_PATH configured nahi hai ya model folder nahi mila."
    elif not torch_installed:
        reason = "PyTorch runtime installed nahi hai."
    elif not cuda_available:
        reason = "CUDA-compatible NVIDIA GPU available nahi hai."
    else:
        reason = "Local Wan2.1 runtime ready hai."

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
    }


@app.post("/generate")
def generate_video(
    request: VideoGenerationRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, object]:
    background_tasks.add_task(
        run_callback_test,
        request.job_id,
    )

    return {
        "jobId": request.job_id,
        "status": "accepted",
        "promptCount": len(request.prompts),
        "provider": request.provider,
        "model": request.model,
    }


def main() -> None:
    import uvicorn

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