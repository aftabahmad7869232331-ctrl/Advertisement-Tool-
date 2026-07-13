from pathlib import Path
from types import SimpleNamespace

import pytest

from src.providers.base import ProviderError, VideoProviderRequest
from src.providers.huggingface_provider import HuggingFaceVideoProvider


def request(**changes: object) -> VideoProviderRequest:
    values = {
        "job_id": "job-123",
        "prompts": ["A safe cinematic prompt"],
        "model": "configured/model",
        "output_format": "mp4",
        "token": "hf_test_secret",
    }
    values.update(changes)
    return VideoProviderRequest(**values)  # type: ignore[arg-type]


def test_binary_result_creates_non_empty_atomic_file(tmp_path: Path) -> None:
    class Client:
        def text_to_video(self, prompt: str, **kwargs: object) -> bytes:
            assert prompt == "Scene 1: A safe cinematic prompt"
            assert kwargs["model"] == "configured/model"
            return b"video-bytes"

    provider = HuggingFaceVideoProvider(tmp_path, lambda **_: Client())
    result = provider.generate_video(request(), lambda *_: None, lambda: False, 30)

    assert result.output_path.read_bytes() == b"video-bytes"
    assert result.file_size_bytes > 0


def test_missing_model_fails_safely(tmp_path: Path) -> None:
    provider = HuggingFaceVideoProvider(tmp_path, lambda **_: object())
    with pytest.raises(ProviderError, match="HF_VIDEO_MODEL") as caught:
        provider.generate_video(request(model=""), lambda *_: None, lambda: False, 30)
    assert caught.value.code == "model_not_configured"


@pytest.mark.parametrize(
    ("error", "code"),
    [
        (type("Unauthorized", (Exception,), {"response": SimpleNamespace(status_code=401)})(), "invalid_credential"),
        (TimeoutError(), "provider_timeout"),
    ],
)
def test_provider_errors_are_safely_mapped(tmp_path: Path, error: Exception, code: str) -> None:
    class Client:
        def text_to_video(self, *_: object, **__: object) -> bytes:
            raise error

    provider = HuggingFaceVideoProvider(tmp_path, lambda **_: Client())
    with pytest.raises(ProviderError) as caught:
        provider.generate_video(request(), lambda *_: None, lambda: False, 30)
    assert caught.value.code == code
    assert "hf_test_secret" not in str(caught.value)


def test_prompt_cannot_control_output_filename(tmp_path: Path) -> None:
    class Client:
        def text_to_video(self, *_: object, **__: object) -> bytes:
            return b"safe"

    provider = HuggingFaceVideoProvider(tmp_path, lambda **_: Client())
    result = provider.generate_video(
        request(prompts=["../../prompt-controlled-name.mp4"]),
        lambda *_: None,
        lambda: False,
        30,
    )
    assert result.output_path.parent == tmp_path
    assert result.output_path.name == "job-123.mp4"

