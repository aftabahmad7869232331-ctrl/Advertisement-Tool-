"""
download_models.py

Downloads the image and video models specified in .env.local from Hugging Face Hub.

Reads:
    HF_TOKEN         - your Hugging Face access token
    HF_IMAGE_MODEL   - repo id for the image model (optional)
    HF_VIDEO_MODEL   - repo id for the video model (e.g. Wan-AI/Wan2.1-T2V-1.3B)

Usage:
    python download_models.py
    python download_models.py --only video
    python download_models.py --only image
    python download_models.py --models-dir ./models
"""

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv


def load_env():
    """Load .env.local (falls back to .env if .env.local is missing)."""
    root = Path(__file__).resolve().parent
    env_local = root / ".env.local"
    env_default = root / ".env"

    if env_local.exists():
        load_dotenv(env_local)
        print(f"[env] loaded {env_local}")
    elif env_default.exists():
        load_dotenv(env_default)
        print(f"[env] .env.local not found, loaded {env_default}")
    else:
        print("[env] WARNING: no .env.local or .env file found next to this script")


def download_repo(repo_id: str, token: str, models_dir: Path, label: str):
    if not repo_id:
        print(f"[skip] {label}: no repo id set in .env.local, skipping")
        return

    from huggingface_hub import snapshot_download

    # e.g. "Wan-AI/Wan2.1-T2V-1.3B" -> "Wan-AI-Wan2.1-T2V-1.3B"
    folder_name = repo_id.replace("/", "-")
    local_dir = models_dir / folder_name

    print(f"\n[download] {label}: {repo_id}")
    print(f"[download] target: {local_dir}")

    try:
        snapshot_download(
            repo_id=repo_id,
            local_dir=str(local_dir),
            token=token,
        )
        print(f"[done] {label} downloaded to {local_dir}")
    except Exception as e:
        print(f"[error] failed to download {label} ({repo_id}): {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="Download HF models listed in .env.local")
    parser.add_argument(
        "--only",
        choices=["image", "video", "both"],
        default="both",
        help="Download only the image model, only the video model, or both (default: both)",
    )
    parser.add_argument(
        "--models-dir",
        default="./models",
        help="Directory to store downloaded models (default: ./models)",
    )
    args = parser.parse_args()

    load_env()

    token = os.getenv("HF_TOKEN")
    image_model = os.getenv("HF_IMAGE_MODEL")
    video_model = os.getenv("HF_VIDEO_MODEL")

    if not token:
        print("[error] HF_TOKEN not found in .env.local — cannot authenticate.", file=sys.stderr)
        sys.exit(1)

    models_dir = Path(args.models_dir)
    models_dir.mkdir(parents=True, exist_ok=True)

    if args.only in ("image", "both"):
        download_repo(image_model, token, models_dir, "HF_IMAGE_MODEL")

    if args.only in ("video", "both"):
        download_repo(video_model, token, models_dir, "HF_VIDEO_MODEL")

    print("\n[complete] all requested downloads processed.")


if __name__ == "__main__":
    main()
