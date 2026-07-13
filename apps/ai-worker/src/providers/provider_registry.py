from pathlib import Path

from .base import ProviderError, VideoProvider
from .huggingface_provider import HuggingFaceVideoProvider


def get_provider(name: str, output_dir: Path) -> VideoProvider:
    if name == "huggingface":
        return HuggingFaceVideoProvider(output_dir)
    raise ProviderError("provider_unavailable", "Requested generation provider supported nahi hai.")
