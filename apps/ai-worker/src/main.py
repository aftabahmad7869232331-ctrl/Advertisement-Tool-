from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="Bricks Maker AI Worker",
    version="0.1.0",
)


class VideoGenerationRequest(BaseModel):
    job_id: str = Field(min_length=1)
    prompts: list[str] = Field(min_length=1, max_length=5)
    format: Literal["mp4", "webm", "mov"] = "mp4"
    quality: Literal["720p", "1080p", "4k"] = "1080p"
    aspect_ratio: Literal["16:9", "9:16", "1:1"] = "16:9"
    language: str = Field(default="en", min_length=2)
    provider: str = "local-ai-worker"
    model: str = "wan2.1"


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "ai-worker",
        "model": "wan2.1",
    }


@app.post("/generate")
def generate_video(request: VideoGenerationRequest) -> dict[str, object]:
    return {
        "jobId": request.job_id,
        "status": "accepted",
        "promptCount": len(request.prompts),
        "provider": request.provider,
        "model": request.model,
    }


def main() -> None:
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host="127.0.0.1",
        port=8100,
        reload=False,
    )


if __name__ == "__main__":
    main()
