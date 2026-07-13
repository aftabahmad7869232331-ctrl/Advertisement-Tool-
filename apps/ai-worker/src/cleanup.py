import os
import time
from pathlib import Path


def cleanup_abandoned_temp_files(output_dir: Path) -> int:
    """Delete only abandoned worker temp artifacts; permanent videos live in API storage."""
    retention_hours = float(os.getenv("FAILED_ARTIFACT_RETENTION_HOURS", "72"))
    cutoff = time.time() - max(retention_hours, 1) * 3600
    if not output_dir.exists():
        return 0
    removed = 0
    for candidate in output_dir.iterdir():
        if candidate.is_file() and candidate.stat().st_mtime < cutoff:
            candidate.unlink(missing_ok=True)
            removed += 1
    return removed
