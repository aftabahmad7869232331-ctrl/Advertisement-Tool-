from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Protocol

ProgressCallback = Callable[[int, str], None]
CancellationCheck = Callable[[], bool]


@dataclass(frozen=True)
class VideoProviderRequest:
    job_id: str
    prompts: list[str]
    model: str
    output_format: str
    token: str | None
    duration: float | None = None
    seed: int | None = None
    negative_prompt: str | None = None


@dataclass(frozen=True)
class VideoProviderResult:
    output_path: Path
    mime_type: str
    file_size_bytes: int


class ProviderError(RuntimeError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


class VideoProvider(Protocol):
    def validate_request(self, request: VideoProviderRequest) -> None: ...

    def generate_video(
        self,
        request: VideoProviderRequest,
        progress_callback: ProgressCallback,
        cancellation_check: CancellationCheck,
        timeout_seconds: float,
    ) -> VideoProviderResult: ...

