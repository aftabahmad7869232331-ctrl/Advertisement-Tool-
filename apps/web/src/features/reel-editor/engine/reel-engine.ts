export const MAX_REEL_SECONDS = 30;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export type AcceptedVideoType = (typeof ACCEPTED_VIDEO_TYPES)[number];
export type RendererPreference = "backend-CPU" | "backend-cpu" | "browser-preview";

export interface ReelClip {
  id: string;
  name: string;
  type: AcceptedVideoType;
  sizeBytes: number;
  objectUrl: string;
  sourceDuration: number;
  trimStart: number;
  trimEnd: number;
  timelineStart: number;
  playbackRate: number;
  volume: number;
  muted: boolean;
}

export interface ReelEffect {
  id: string;
  clipId: string;
  type:
    | "color-grade"
    | "light-leak"
    | "motion-blur"
    | "vignette"
    | "film-grain"
    | "glitch"
    | "camera-shake";
  intensity: number;
  enabled: boolean;
}

export interface ReelTextOverlay {
  id: string;
  text: string;
  start: number;
  end: number;
  xPercent: number;
  yPercent: number;
  fontFamily: string;
  fontSize: number;
  color: string;
}

export interface ReelExportPreset {
  width: number;
  height: number;
  fps: 24 | 25 | 30 | 50 | 60;
  videoCodec: "h264";
  audioCodec: "aac";
  container: "mp4";
}

export interface ReelProject {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  activeClipId: string | null;
  clips: ReelClip[];
  effects: ReelEffect[];
  textOverlays: ReelTextOverlay[];
  exportPreset: ReelExportPreset;
}

export interface ReelExportJob {
  id: string;
  status: "queued";
  rendererPreference: RendererPreference;
  project: ReelProject;
  createdAt: string;
}

export type ReelEngineEvent =
  | { type: "state"; reason: string; project: ReelProject }
  | { type: "saved"; projectId: string; savedAt: string }
  | { type: "error"; error: ReelEngineError };

export type ReelEngineListener = (event: ReelEngineEvent) => void;

export class ReelEngineError extends Error {
  public constructor(
    public readonly code:
      | "INVALID_TYPE"
      | "FILE_TOO_LARGE"
      | "INVALID_MEDIA"
      | "TIMELINE_FULL"
      | "INVALID_TRIM"
      | "CLIP_NOT_FOUND"
      | "DRAFT_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "ReelEngineError";
  }
}

const DEFAULT_PRESET: ReelExportPreset = {
  width: 1080,
  height: 1920,
  fps: 30,
  videoCodec: "h264",
  audioCodec: "aac",
  container: "mp4",
};

const round = (value: number): number => Math.round(value * 1000) / 1000;
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
const clone = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
const makeId = (prefix: string): string =>
  `${prefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const clipDuration = (clip: ReelClip): number =>
  round((clip.trimEnd - clip.trimStart) / clip.playbackRate);
const totalDuration = (clips: ReelClip[]): number =>
  round(clips.reduce((total, clip) => total + clipDuration(clip), 0));

const normalizeTimeline = (clips: ReelClip[]): ReelClip[] => {
  let cursor = 0;
  return clips.map((clip) => {
    const next = { ...clip, timelineStart: round(cursor) };
    cursor += clipDuration(next);
    return next;
  });
};

const validateTimeline = (clips: ReelClip[]): void => {
  if (totalDuration(clips) > MAX_REEL_SECONDS + 0.001) {
    throw new ReelEngineError(
      "INVALID_TRIM",
      `Final reel cannot exceed ${MAX_REEL_SECONDS} seconds.`,
    );
  }
};

const readMetadata = async (
  file: File,
): Promise<{ duration: number; objectUrl: string }> => {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      const clean = (): void => {
        video.removeAttribute("src");
        video.load();
      };
      video.addEventListener("loadedmetadata", () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) {
          clean();
          reject(new ReelEngineError("INVALID_MEDIA", "Video duration could not be read."));
          return;
        }
        const duration = round(video.duration);
        clean();
        resolve({ duration, objectUrl });
      }, { once: true });
      video.addEventListener("error", () => {
        clean();
        reject(new ReelEngineError("INVALID_MEDIA", "The browser could not read this video."));
      }, { once: true });
      video.src = objectUrl;
    });
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
};

export class ReelEngine {
  private project: ReelProject;
  private readonly listeners = new Set<ReelEngineListener>();
  private readonly undoStack: ReelProject[] = [];
  private readonly redoStack: ReelProject[] = [];
  private saveTimer: number | null = null;

  public constructor(projectName = "Untitled Reel") {
    const now = new Date().toISOString();
    this.project = {
      id: makeId("project"),
      name: projectName,
      version: 1,
      createdAt: now,
      updatedAt: now,
      activeClipId: null,
      clips: [],
      effects: [],
      textOverlays: [],
      exportPreset: { ...DEFAULT_PRESET },
    };
  }

  public subscribe(listener: ReelEngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getProject(): ReelProject { return clone(this.project); }
  public getDuration(): number { return totalDuration(this.project.clips); }
  public getRemainingDuration(): number {
    return round(Math.max(0, MAX_REEL_SECONDS - this.getDuration()));
  }

  public async importVideo(file: File): Promise<ReelClip> {
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type as AcceptedVideoType)) {
      throw this.fail(new ReelEngineError("INVALID_TYPE", "Only MP4, MOV and WebM files are supported."));
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw this.fail(new ReelEngineError("FILE_TOO_LARGE", "Video exceeds the 200 MB limit."));
    }
    const remaining = this.getRemainingDuration();
    if (remaining <= 0) {
      throw this.fail(new ReelEngineError("TIMELINE_FULL", "The 30-second timeline is full."));
    }
    const metadata = await readMetadata(file);
    const clip: ReelClip = {
      id: makeId("clip"),
      name: file.name,
      type: file.type as AcceptedVideoType,
      sizeBytes: file.size,
      objectUrl: metadata.objectUrl,
      sourceDuration: metadata.duration,
      trimStart: 0,
      trimEnd: Math.min(metadata.duration, remaining),
      timelineStart: this.getDuration(),
      playbackRate: 1,
      volume: 1,
      muted: false,
    };
    this.mutate("import-video", (draft) => {
      draft.clips = normalizeTimeline([...draft.clips, clip]);
      draft.activeClipId = clip.id;
    });
    return clone(clip);
  }

  public trimClip(clipId: string, start: number, end: number): void {
    const current = this.requireClip(clipId);
    const safeStart = clamp(start, 0, current.sourceDuration);
    const safeEnd = clamp(end, 0, current.sourceDuration);
    if (safeEnd <= safeStart) {
      throw this.fail(new ReelEngineError("INVALID_TRIM", "Trim end must be greater than trim start."));
    }
    this.mutate("trim-clip", (draft) => {
      const clip = draft.clips.find((item) => item.id === clipId);
      if (!clip) return;
      clip.trimStart = round(safeStart);
      clip.trimEnd = round(safeEnd);
      draft.clips = normalizeTimeline(draft.clips);
    });
  }

  public setPlaybackRate(clipId: string, rate: number): void {
    this.mutate("set-speed", (draft) => {
      const clip = draft.clips.find((item) => item.id === clipId);
      if (!clip) throw new ReelEngineError("CLIP_NOT_FOUND", "Clip not found.");
      clip.playbackRate = clamp(rate, 0.25, 4);
      draft.clips = normalizeTimeline(draft.clips);
    });
  }

  public setVolume(clipId: string, volume: number, muted?: boolean): void {
    this.mutate("set-volume", (draft) => {
      const clip = draft.clips.find((item) => item.id === clipId);
      if (!clip) throw new ReelEngineError("CLIP_NOT_FOUND", "Clip not found.");
      clip.volume = clamp(volume, 0, 1);
      clip.muted = muted ?? clip.muted;
    });
  }

  public reorderClip(clipId: string, targetIndex: number): void {
    this.mutate("reorder-clip", (draft) => {
      const index = draft.clips.findIndex((item) => item.id === clipId);
      if (index < 0) throw new ReelEngineError("CLIP_NOT_FOUND", "Clip not found.");
      const [clip] = draft.clips.splice(index, 1);
      if (!clip) return;
      draft.clips.splice(clamp(Math.trunc(targetIndex), 0, draft.clips.length), 0, clip);
      draft.clips = normalizeTimeline(draft.clips);
    });
  }

  public removeClip(clipId: string): void {
    const clip = this.requireClip(clipId);
    this.mutate("remove-clip", (draft) => {
      draft.clips = normalizeTimeline(draft.clips.filter((item) => item.id !== clipId));
      draft.effects = draft.effects.filter((effect) => effect.clipId !== clipId);
      if (draft.activeClipId === clipId) draft.activeClipId = draft.clips[0]?.id ?? null;
    });
    if (clip.objectUrl.startsWith("blob:") && !this.project.clips.some((item) => item.objectUrl === clip.objectUrl)) {
      URL.revokeObjectURL(clip.objectUrl);
    }
  }

  public splitClip(clipId: string, timelineSecond: number): void {
    const current = this.requireClip(clipId);
    const localSecond = timelineSecond - current.timelineStart;
    const sourceSplit = round(current.trimStart + localSecond * current.playbackRate);
    if (sourceSplit <= current.trimStart + 0.05 || sourceSplit >= current.trimEnd - 0.05) {
      throw this.fail(new ReelEngineError("INVALID_TRIM", "Move the playhead inside the active clip before splitting."));
    }
    this.mutate("split-clip", (draft) => {
      const index = draft.clips.findIndex((item) => item.id === clipId);
      const clip = draft.clips[index];
      if (!clip) throw new ReelEngineError("CLIP_NOT_FOUND", "Clip not found.");
      const right: ReelClip = {
        ...clip,
        id: makeId("clip"),
        name: `${clip.name.replace(/(\.[^.]+)?$/, "")}-split$1`,
        trimStart: sourceSplit,
      };
      clip.trimEnd = sourceSplit;
      draft.clips.splice(index + 1, 0, right);
      draft.clips = normalizeTimeline(draft.clips);
      draft.activeClipId = right.id;
    });
  }

  public duplicateClip(clipId: string): ReelClip {
    const current = this.requireClip(clipId);
    const duration = clipDuration(current);
    if (duration > this.getRemainingDuration()) {
      throw this.fail(new ReelEngineError("TIMELINE_FULL", "Not enough room in the 30-second timeline to duplicate this clip."));
    }
    const duplicate: ReelClip = { ...current, id: makeId("clip"), name: `Copy of ${current.name}` };
    this.mutate("duplicate-clip", (draft) => {
      const index = draft.clips.findIndex((item) => item.id === clipId);
      draft.clips.splice(index + 1, 0, duplicate);
      draft.clips = normalizeTimeline(draft.clips);
      draft.activeClipId = duplicate.id;
    });
    return clone(duplicate);
  }

  public upsertEffect(effect: ReelEffect): void {
    this.requireClip(effect.clipId);
    this.mutate("upsert-effect", (draft) => {
      const next = { ...effect, intensity: clamp(effect.intensity, 0, 1) };
      const index = draft.effects.findIndex((item) => item.id === next.id);
      if (index >= 0) draft.effects[index] = next;
      else draft.effects.push(next);
    });
  }

  public upsertText(overlay: ReelTextOverlay): void {
    if (overlay.end <= overlay.start || overlay.end > MAX_REEL_SECONDS) {
      throw this.fail(new ReelEngineError("INVALID_TRIM", "Invalid text timing."));
    }
    this.mutate("upsert-text", (draft) => {
      const next = {
        ...overlay,
        xPercent: clamp(overlay.xPercent, 0, 100),
        yPercent: clamp(overlay.yPercent, 0, 100),
        fontSize: clamp(overlay.fontSize, 8, 240),
      };
      const index = draft.textOverlays.findIndex((item) => item.id === next.id);
      if (index >= 0) draft.textOverlays[index] = next;
      else draft.textOverlays.push(next);
    });
  }

  public setExportPreset(preset: ReelExportPreset): void {
    this.mutate("set-export-preset", (draft) => { draft.exportPreset = clone(preset); });
  }

  public undo(): boolean {
    const previous = this.undoStack.pop();
    if (!previous) return false;
    this.redoStack.push(clone(this.project));
    this.project = previous;
    this.emitState("undo");
    this.scheduleSave();
    return true;
  }

  public redo(): boolean {
    const next = this.redoStack.pop();
    if (!next) return false;
    this.undoStack.push(clone(this.project));
    this.project = next;
    this.emitState("redo");
    this.scheduleSave();
    return true;
  }

  public saveNow(): void {
    localStorage.setItem(this.storageKey(), JSON.stringify(this.project));
    this.emit({ type: "saved", projectId: this.project.id, savedAt: new Date().toISOString() });
  }

  public loadDraft(projectId = this.project.id): ReelProject {
    const raw = localStorage.getItem(`reel-editor:project:${projectId}`);
    if (!raw) throw this.fail(new ReelEngineError("DRAFT_NOT_FOUND", "Draft not found."));
    const parsed = JSON.parse(raw) as ReelProject;
    parsed.clips = normalizeTimeline(parsed.clips);
    validateTimeline(parsed.clips);
    this.project = parsed;
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.emitState("load-draft");
    return this.getProject();
  }

  public createExportJob(
    rendererPreference: RendererPreference = "backend-CPU",
  ): ReelExportJob {
    validateTimeline(this.project.clips);
    return {
      id: makeId("render"),
      status: "queued",
      rendererPreference,
      project: this.getProject(),
      createdAt: new Date().toISOString(),
    };
  }

  public async syncProject(endpoint: string): Promise<Response> {
    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Reel-Offline-Queue": "true" },
      credentials: "include",
      body: JSON.stringify(this.project),
    });
  }

  public dispose(): void {
    if (this.saveTimer !== null) window.clearTimeout(this.saveTimer);
    for (const clip of this.project.clips) {
      if (clip.objectUrl.startsWith("blob:")) URL.revokeObjectURL(clip.objectUrl);
    }
    this.listeners.clear();
  }

  private mutate(reason: string, update: (draft: ReelProject) => void): void {
    const previous = clone(this.project);
    const draft = clone(this.project);
    update(draft);
    validateTimeline(draft.clips);
    draft.version += 1;
    draft.updatedAt = new Date().toISOString();
    this.undoStack.push(previous);
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack.length = 0;
    this.project = draft;
    this.emitState(reason);
    this.scheduleSave();
  }

  private requireClip(clipId: string): ReelClip {
    const clip = this.project.clips.find((item) => item.id === clipId);
    if (!clip) throw this.fail(new ReelEngineError("CLIP_NOT_FOUND", "Clip not found."));
    return clip;
  }

  private scheduleSave(): void {
    if (this.saveTimer !== null) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => this.saveNow(), 700);
  }
  private storageKey(): string { return `reel-editor:project:${this.project.id}`; }
  private emitState(reason: string): void {
    this.emit({ type: "state", reason, project: this.getProject() });
  }
  private emit(event: ReelEngineEvent): void {
    for (const listener of this.listeners) listener(event);
  }
  private fail(error: ReelEngineError): ReelEngineError {
    this.emit({ type: "error", error });
    return error;
  }
}


