// ============================================================
// MEDIAPIPE SEGMENTER UTIL
// Client-side background removal / blur / replace using
// MediaPipe Tasks Vision (Image Segmenter - Selfie Segmentation).
// Runs entirely in the browser — no backend / API cost.
// ============================================================

import {
  FilesetResolver,
  ImageSegmenter,
  type ImageSegmenterResult,
} from '@mediapipe/tasks-vision';

export type BackgroundMode = 'transparent' | 'blur' | 'color' | 'image';

export interface SegmentationOptions {
  mode: BackgroundMode;
  color?: string;        // used when mode === 'color', e.g. '#00FF00' for green screen
  blurPx?: number;       // used when mode === 'blur'
  bgImage?: HTMLImageElement; // used when mode === 'image'
  onProgress?: (percent: number) => void;
}

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';

let segmenterPromise: Promise<ImageSegmenter> | null = null;

/** Lazily load + cache the MediaPipe ImageSegmenter (downloads wasm + model once). */
async function getSegmenter(): Promise<ImageSegmenter> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
      return ImageSegmenter.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        outputCategoryMask: false,
        outputConfidenceMasks: true,
      });
    })();
  }
  return segmenterPromise;
}

/**
 * Processes a source video element frame-by-frame, removing/replacing the
 * background using MediaPipe segmentation, and records the result to a
 * downloadable WebM blob via MediaRecorder + canvas.captureStream().
 */
export async function removeBackgroundFromVideo(
  videoEl: HTMLVideoElement,
  options: SegmentationOptions,
): Promise<Blob> {
  const segmenter = await getSegmenter();

  const width = videoEl.videoWidth;
  const height = videoEl.videoHeight;
  if (!width || !height) {
    throw new Error('Video has no dimensions yet — wait for metadata to load.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas 2D context.');

  // Off-screen canvas to draw the raw video frame before masking
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d')!;

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 8_000_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingDone = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
  });

  videoEl.currentTime = 0;
  await new Promise((r) => {
    videoEl.onseeked = r;
  });

  recorder.start();

  const duration = videoEl.duration;
  let lastTimestamp = -1;

  await new Promise<void>((resolve, reject) => {
    function processFrame() {
      if (videoEl.ended || videoEl.currentTime >= duration - 0.01) {
        resolve();
        return;
      }

      const timestampMs = performance.now();
      if (timestampMs === lastTimestamp) {
        videoEl.requestVideoFrameCallback(processFrame);
        return;
      }
      lastTimestamp = timestampMs;

      srcCtx.drawImage(videoEl, 0, 0, width, height);

      segmenter.segmentForVideo(srcCanvas, timestampMs, (result: ImageSegmenterResult) => {
        try {
          drawMaskedFrame(ctx!, srcCtx, result, width, height, options);
        } catch (err) {
          reject(err);
          return;
        }
        options.onProgress?.(Math.min(100, Math.round((videoEl.currentTime / duration) * 100)));
        videoEl.requestVideoFrameCallback(processFrame);
      });
    }
    videoEl.play().catch(reject);
    videoEl.requestVideoFrameCallback(processFrame);
  });

  videoEl.pause();
  recorder.stop();

  return recordingDone;
}

function drawMaskedFrame(
  ctx: CanvasRenderingContext2D,
  srcCtx: CanvasRenderingContext2D,
  result: ImageSegmenterResult,
  width: number,
  height: number,
  options: SegmentationOptions,
) {
  const confidenceMask = result.confidenceMasks?.[0];
  if (!confidenceMask) return;

  const maskData = confidenceMask.getAsFloat32Array();
  const frame = srcCtx.getImageData(0, 0, width, height);
  const out = ctx.createImageData(width, height);

  // Pre-render background layer depending on mode
  let bgImageData: ImageData | null = null;
  if (options.mode === 'color') {
    const [r, g, b] = hexToRgb(options.color ?? '#00FF00');
    bgImageData = ctx.createImageData(width, height);
    for (let i = 0; i < bgImageData.data.length; i += 4) {
      bgImageData.data[i] = r;
      bgImageData.data[i + 1] = g;
      bgImageData.data[i + 2] = b;
      bgImageData.data[i + 3] = 255;
    }
  } else if (options.mode === 'blur') {
    ctx.save();
    ctx.filter = `blur(${options.blurPx ?? 12}px)`;
    ctx.drawImage(srcCtx.canvas, 0, 0, width, height);
    ctx.restore();
    bgImageData = ctx.getImageData(0, 0, width, height);
  } else if (options.mode === 'image' && options.bgImage) {
    ctx.drawImage(options.bgImage, 0, 0, width, height);
    bgImageData = ctx.getImageData(0, 0, width, height);
  }

  for (let i = 0; i < maskData.length; i++) {
    const personAlpha = maskData[i] ?? 0;
    const px = i * 4;

    const frameR = frame.data[px] ?? 0;
    const frameG = frame.data[px + 1] ?? 0;
    const frameB = frame.data[px + 2] ?? 0;

    out.data[px] = frameR;
    out.data[px + 1] = frameG;
    out.data[px + 2] = frameB;

    if (options.mode === 'transparent') {
      out.data[px + 3] = Math.round(personAlpha * 255);
    } else if (bgImageData) {
      const bgR = bgImageData.data[px] ?? 0;
      const bgG = bgImageData.data[px + 1] ?? 0;
      const bgB = bgImageData.data[px + 2] ?? 0;

      out.data[px] = Math.round(
        frameR * personAlpha + bgR * (1 - personAlpha)
      );
      out.data[px + 1] = Math.round(
        frameG * personAlpha + bgG * (1 - personAlpha)
      );
      out.data[px + 2] = Math.round(
        frameB * personAlpha + bgB * (1 - personAlpha)
      );
      out.data[px + 3] = 255;
    } else {
      out.data[px + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

/** Releases the cached segmenter (call on app/component unmount if desired). */
export async function disposeSegmenter() {
  if (segmenterPromise) {
    const s = await segmenterPromise;
    s.close();
    segmenterPromise = null;
  }
}

