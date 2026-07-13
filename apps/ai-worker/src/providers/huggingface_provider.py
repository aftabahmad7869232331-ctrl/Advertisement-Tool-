from __future__ import annotations

import hashlib
import os
import re
import tempfile
from pathlib import Path
from typing import Any, Callable

from huggingface_hub import InferenceClient

from .base import (
    CancellationCheck,
    ProgressCallback,
    ProviderError,
    VideoProviderRequest,
    VideoProviderResult,
)

ClientFactory = Callable[..., Any]


def _safe_job_filename(job_id: str, extension: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9_-]", "-", job_id).strip("-_")[:64]
    if not normalized:
        normalized = hashlib.sha256(job_id.encode("utf-8")).hexdigest()[:24]
    return f"{normalized}.{extension}"


def _output_bytes(output: object) -> bytes:
    if isinstance(output, bytes):
        return output
    if isinstance(output, bytearray):
        return bytes(output)
    if isinstance(output, memoryview):
        return output.tobytes()
    if isinstance(output, Path):
        return output.read_bytes()
    if isinstance(output, str):
        return Path(output).read_bytes()
    if hasattr(output, "read"):
        data = output.read()
        if isinstance(data, bytes):
            return data
    raise ProviderError("invalid_output", "Provider ne unsupported video output diya.")


def _map_provider_error(error: Exception) -> ProviderError:
    if isinstance(error, ProviderError):
        return error

    response = getattr(error, "response", None)
    status = getattr(response, "status_code", None)
    if status in (401, 403):
        return ProviderError("invalid_credential", "Hugging Face credential invalid hai.")
    if status == 402:
        return ProviderError("insufficient_credit", "Hugging Face credit insufficient hai.")
    if status == 404:
        return ProviderError("model_not_available", "Configured Hugging Face model available nahi hai.")
    if status == 429:
        return ProviderError("rate_limited", "Hugging Face rate limit reach ho gayi.")
    if isinstance(error, TimeoutError) or "timeout" in type(error).__name__.lower():
        return ProviderError("provider_timeout", "Hugging Face generation timed out.")
    if status is not None and int(status) >= 500:
        return ProviderError("provider_unavailable", "Hugging Face provider unavailable hai.")
    return ProviderError("generation_failed", "Hugging Face video generation fail ho gayi.")


class HuggingFaceVideoProvider:
    def __init__(
        self,
        output_dir: Path,
        client_factory: ClientFactory = InferenceClient,
    ) -> None:
        self.output_dir = output_dir
        self.client_factory = client_factory

    def validate_request(self, request: VideoProviderRequest) -> None:
        if not request.model.strip():
            raise ProviderError("model_not_configured", "HF_VIDEO_MODEL configure nahi hai.")
        if not request.token or not request.token.strip():
            raise ProviderError("invalid_credential", "Hugging Face credential required hai.")
        if not any(prompt.strip() for prompt in request.prompts):
            raise ProviderError("generation_failed", "Video prompt required hai.")

    def generate_video(
        self,
        request: VideoProviderRequest,
        progress_callback: ProgressCallback,
        cancellation_check: CancellationCheck,
        timeout_seconds: float,
    ) -> VideoProviderResult:
        self.validate_request(request)
        if cancellation_check():
            raise ProviderError("cancelled", "Generation cancel kar di gayi.")

        prompt = "\n\n".join(
            f"Scene {index + 1}: {' '.join(value.split())}"
            for index, value in enumerate(request.prompts)
            if value.strip()
        )
        negative = (
            [" ".join(request.negative_prompt.split())]
            if request.negative_prompt and request.negative_prompt.strip()
            else None
        )

        progress_callback(30, "provider_queued")
        try:
            client = self.client_factory(token=request.token.strip(), timeout=timeout_seconds)
            progress_callback(45, "generating")
            output = client.text_to_video(
                prompt,
                model=request.model.strip(),
                negative_prompt=negative,
                seed=request.seed,
            )
            progress_callback(80, "downloading")
            data = _output_bytes(output)
        except Exception as error:
            raise _map_provider_error(error) from None

        if cancellation_check():
            raise ProviderError("cancelled", "Generation cancel kar di gayi.")
        if not data:
            raise ProviderError("invalid_output", "Provider ne empty video output diya.")

        extension = request.output_format if request.output_format in {"mp4", "webm", "mov"} else "mp4"
        mime_type = {"mp4": "video/mp4", "webm": "video/webm", "mov": "video/quicktime"}[extension]
        self.output_dir.mkdir(parents=True, exist_ok=True)
        destination = self.output_dir / _safe_job_filename(request.job_id, extension)

        temp_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="wb",
                dir=self.output_dir,
                prefix=".pending-",
                suffix=f".{extension}",
                delete=False,
            ) as temporary:
                temporary.write(data)
                temporary.flush()
                os.fsync(temporary.fileno())
                temp_path = Path(temporary.name)
            os.replace(temp_path, destination)
        finally:
            if temp_path and temp_path.exists():
                temp_path.unlink(missing_ok=True)

        size = destination.stat().st_size
        if size <= 0:
            destination.unlink(missing_ok=True)
            raise ProviderError("invalid_output", "Generated video file empty hai.")

        progress_callback(90, "output_ready")
        return VideoProviderResult(destination, mime_type, size)
