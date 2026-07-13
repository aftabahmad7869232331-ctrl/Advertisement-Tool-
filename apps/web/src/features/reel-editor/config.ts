import { MAX_REEL_SECONDS, MAX_VIDEO_BYTES } from "./engine/reel-engine";

export const REEL_EDITOR_LIMITS = {
  maxDurationSeconds: MAX_REEL_SECONDS,
  maxUploadBytes: MAX_VIDEO_BYTES,
  acceptedExtensions: [".mp4", ".mov", ".webm", ".avi", ".mkv"],
} as const;

export const REEL_EDITOR_OUTPUT = {
  width: 1080,
  height: 1920,
  aspectRatio: "9:16",
  videoCodec: "H.264",
  audioCodec: "AAC",
  frameRate: 30,
} as const;


