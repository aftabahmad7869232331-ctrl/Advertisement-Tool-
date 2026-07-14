import asyncio
import base64
import io
import os
import threading
import uuid
import zipfile
from functools import lru_cache
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, ConfigDict, Field

PROJECT_ROOT = Path(__file__).resolve().parents[3]
MODELS_ROOT = PROJECT_ROOT / "models"
router = APIRouter()
_inference_lock = threading.Lock()


class ImageRequest(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    prompt: str = Field(min_length=1, max_length=2000)
    negative_prompt: str = Field(default="", alias="negativePrompt", max_length=2000)
    image_count: int = Field(default=1, alias="imageCount", ge=1, le=4)
    aspect_ratio: str = Field(default="1:1 Square", alias="aspectRatio")
    seed: str | int | None = None
    creativity: float = Field(default=50, ge=0, le=100)


class TranscriptionRequest(BaseModel):
    video_path: str
    language: str | None = None


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    voice_id: str = "local-female"
    language_code: str = "en"


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    source_language: str = "en"
    target_language: str


def _safe_media_path(raw: str) -> Path:
    candidate = Path(raw).expanduser().resolve()
    try:
        candidate.relative_to(PROJECT_ROOT)
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Media path project ke bahar hai.") from error
    if not candidate.is_file():
        raise HTTPException(status_code=404, detail="Media file nahi mili.")
    return candidate


@lru_cache(maxsize=1)
def _image_pipeline():
    import torch
    from diffusers import StableDiffusionPipeline

    model_path = Path(os.getenv("IMAGE_MODEL_PATH", MODELS_ROOT / "segmind-tiny-sd"))
    if not (model_path / "model_index.json").is_file():
        raise RuntimeError("Local image model files missing hain.")
    torch.set_num_threads(max(1, min(8, os.cpu_count() or 1)))
    pipeline = StableDiffusionPipeline.from_pretrained(
        str(model_path), torch_dtype=torch.float32,
        safety_checker=None, requires_safety_checker=False,
    )
    pipeline.set_progress_bar_config(disable=True)
    return pipeline


def _image_dimensions(label: str) -> tuple[int, int]:
    if "16:9" in label:
        return 384, 216
    if "9:16" in label:
        return 216, 384
    if "4:5" in label:
        return 256, 320
    if "Landscape" in label:
        return 384, 256
    if "Portrait" in label:
        return 256, 384
    return 256, 256


def _generate_images(request: ImageRequest) -> list[dict[str, str]]:
    import torch

    pipeline = _image_pipeline()
    width, height = _image_dimensions(request.aspect_ratio)
    try:
        seed = int(request.seed) if request.seed not in (None, "") else int.from_bytes(os.urandom(4), "big")
    except (TypeError, ValueError):
        seed = int.from_bytes(os.urandom(4), "big")
    steps = max(2, min(8, round(2 + request.creativity / 20)))
    results: list[dict[str, str]] = []
    with _inference_lock:
        for index in range(request.image_count):
            generator = torch.Generator(device="cpu").manual_seed(seed + index)
            image = pipeline(
                request.prompt,
                negative_prompt=request.negative_prompt or None,
                width=width,
                height=height,
                num_inference_steps=steps,
                guidance_scale=1.0,
                generator=generator,
            ).images[0]
            buffer = io.BytesIO()
            image.save(buffer, format="PNG", optimize=True)
            encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
            results.append({"id": str(uuid.uuid4()), "imageUrl": f"data:image/png;base64,{encoded}"})
    return results


@lru_cache(maxsize=1)
def _whisper_model():
    from faster_whisper import WhisperModel

    model_path = Path(os.getenv("WHISPER_MODEL_PATH", MODELS_ROOT / "faster-whisper-small"))
    if not (model_path / "model.bin").is_file():
        raise RuntimeError("Faster-Whisper model files missing hain.")
    return WhisperModel(str(model_path), device="cpu", compute_type="int8", cpu_threads=max(1, min(8, os.cpu_count() or 1)))


def _transcribe(path: Path, language: str | None) -> dict[str, object]:
    model = _whisper_model()
    segments, info = model.transcribe(
        str(path), language=None if not language or language == "auto" else language,
        vad_filter=True, beam_size=3,
    )
    entries = []
    for index, segment in enumerate(segments):
        text = segment.text.strip()
        if text:
            entries.append({
                "id": str(uuid.uuid4()), "index": index,
                "startTime": round(segment.start * 1000),
                "endTime": round(segment.end * 1000), "text": text,
            })
    return {"entries": entries, "language": info.language, "duration": info.duration}


@lru_cache(maxsize=2)
def _speaker_embedding(voice_id: str):
    import numpy as np
    import torch

    archive_path = MODELS_ROOT / "cmu-arctic-xvectors" / "spkrec-xvect.zip"
    preferred = "cmu_us_bdl" if "male" in voice_id else "cmu_us_clb"
    with zipfile.ZipFile(archive_path) as archive:
        name = next(item for item in archive.namelist() if preferred in item and item.endswith(".npy"))
        with archive.open(name) as source:
            vector = np.load(io.BytesIO(source.read()))
    return torch.tensor(vector, dtype=torch.float32).unsqueeze(0)


@lru_cache(maxsize=1)
def _speech_models():
    import torch
    from transformers import SpeechT5ForTextToSpeech, SpeechT5HifiGan, SpeechT5Processor

    tts_path = Path(os.getenv("TTS_MODEL_PATH", MODELS_ROOT / "speecht5_tts"))
    vocoder_path = Path(os.getenv("TTS_VOCODER_PATH", MODELS_ROOT / "speecht5_hifigan"))
    processor = SpeechT5Processor.from_pretrained(str(tts_path))
    model = SpeechT5ForTextToSpeech.from_pretrained(str(tts_path))
    vocoder = SpeechT5HifiGan.from_pretrained(str(vocoder_path))
    model.to(torch.device("cpu")); vocoder.to(torch.device("cpu"))
    return processor, model, vocoder


def _synthesize(request: SpeechRequest) -> bytes:
    import soundfile as sf

    language = request.language_code.split("-")[0].lower()
    if language in {"en", "hi"}:
        import torch
        tokenizer, model = _mms_models(language)
        inputs = tokenizer(text=request.text, return_tensors="pt")
        with _inference_lock, torch.no_grad():
            speech = model(**inputs).waveform[0]
        buffer = io.BytesIO()
        sf.write(buffer, speech.cpu().numpy(), samplerate=model.config.sampling_rate, format="WAV")
        return buffer.getvalue()
    if language != "en":
        raise HTTPException(status_code=400, detail="Installed local voices English aur Hindi support karti hain.")
    processor, model, vocoder = _speech_models()
    inputs = processor(text=request.text, return_tensors="pt")
    with _inference_lock:
        speech = model.generate_speech(inputs["input_ids"], _speaker_embedding(request.voice_id), vocoder=vocoder)
    buffer = io.BytesIO()
    sf.write(buffer, speech.cpu().numpy(), samplerate=16000, format="WAV")
    return buffer.getvalue()


@lru_cache(maxsize=2)
def _mms_models(language: str):
    from transformers import AutoTokenizer, VitsModel

    folder = "mms-tts-hin" if language == "hi" else "mms-tts-eng"
    model_path = MODELS_ROOT / folder
    tokenizer = AutoTokenizer.from_pretrained(str(model_path))
    model = VitsModel.from_pretrained(str(model_path))
    return tokenizer, model


_NLLB_CODES = {
    "en": "eng_Latn", "hi": "hin_Deva", "es": "spa_Latn", "fr": "fra_Latn",
    "de": "deu_Latn", "pt": "por_Latn", "ar": "arb_Arab", "ja": "jpn_Jpan",
    "ko": "kor_Hang", "zh": "zho_Hans",
}


@lru_cache(maxsize=1)
def _translation_models():
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

    model_path = MODELS_ROOT / "nllb-200-distilled-600M"
    tokenizer = AutoTokenizer.from_pretrained(str(model_path))
    model = AutoModelForSeq2SeqLM.from_pretrained(str(model_path))
    return tokenizer, model


def _translate(request: TranslationRequest) -> str:
    source = _NLLB_CODES.get(request.source_language.split("-")[0].lower())
    target = _NLLB_CODES.get(request.target_language.split("-")[0].lower())
    if not source or not target:
        raise HTTPException(status_code=400, detail="Requested translation language supported nahi hai.")
    if source == target:
        return request.text
    tokenizer, model = _translation_models()
    tokenizer.src_lang = source
    inputs = tokenizer(request.text, return_tensors="pt", truncation=True, max_length=1024)
    with _inference_lock:
        output = model.generate(
            **inputs, forced_bos_token_id=tokenizer.convert_tokens_to_ids(target),
            max_new_tokens=min(1024, max(64, len(request.text) * 2)),
        )
    return tokenizer.batch_decode(output, skip_special_tokens=True)[0]


@router.get("/local-ai/health")
def local_ai_health() -> dict[str, object]:
    return {
        "status": "ok",
        "imageModel": (MODELS_ROOT / "segmind-tiny-sd" / "model_index.json").is_file(),
        "whisperModel": (MODELS_ROOT / "faster-whisper-small" / "model.bin").is_file(),
        "speechModel": (MODELS_ROOT / "speecht5_tts" / "pytorch_model.bin").is_file(),
        "translationModel": (MODELS_ROOT / "nllb-200-distilled-600M" / "pytorch_model.bin").is_file(),
    }


@router.post("/image/generate")
async def generate_image(request: ImageRequest) -> dict[str, object]:
    try:
        return {"images": await asyncio.to_thread(_generate_images, request), "provider": "local-tiny-sd"}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@router.post("/captions/transcribe")
async def transcribe(request: TranscriptionRequest) -> dict[str, object]:
    path = _safe_media_path(request.video_path)
    try:
        return await asyncio.to_thread(_transcribe, path, request.language)
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@router.post("/voice/synthesize")
async def synthesize(request: SpeechRequest) -> Response:
    try:
        audio = await asyncio.to_thread(_synthesize, request)
        return Response(content=audio, media_type="audio/wav", headers={"Content-Disposition": "inline; filename=voice.wav"})
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@router.post("/translate")
async def translate(request: TranslationRequest) -> dict[str, str]:
    try:
        return {"text": await asyncio.to_thread(_translate, request)}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
