import json
from pathlib import Path

from src import main
from src.providers.base import VideoProviderResult


def test_real_callback_never_contains_key(monkeypatch, tmp_path: Path) -> None:
    callbacks: list[dict[str, object]] = []

    class Provider:
        def generate_video(self, request, progress_callback, cancellation_check, timeout_seconds):
            progress_callback(45, "generating")
            output = tmp_path / "job.mp4"
            output.write_bytes(b"video")
            return VideoProviderResult(output, "video/mp4", 5)

    monkeypatch.setattr(main, "get_provider", lambda *_: Provider())
    monkeypatch.setattr(main, "send_job_update", lambda _job_id, payload: callbacks.append(payload))
    monkeypatch.setattr(main, "upload_generated_artifact", lambda *_: {"status": "ok", "videoId": "video-1", "sha256": "abc"})
    monkeypatch.setenv("HF_VIDEO_MODEL", "configured/model")
    secret = "hf_callback_secret"
    main.run_provider_generation(main.VideoGenerationRequest(
        job_id="job-1",
        prompts=["prompt"],
        provider="huggingface",
        model="configured/model",
        provider_api_key=secret,
    ))

    assert secret not in json.dumps(callbacks)
    assert callbacks[-1]["status"] == "done"


def test_simulator_still_completes(monkeypatch) -> None:
    callbacks: list[dict[str, object]] = []
    monkeypatch.setattr(main.time, "sleep", lambda _: None)
    monkeypatch.setattr(main, "send_job_update", lambda _job_id, payload: callbacks.append(payload))
    monkeypatch.setattr(
        main,
        "upload_generated_artifact",
        lambda *_: {"status": "ok", "videoId": "simulated-video", "sha256": "abc"},
    )

    main.run_callback_test("simulated-job")

    assert callbacks[-1]["status"] == "done"
    assert callbacks[-1]["stage"] == "completed"
