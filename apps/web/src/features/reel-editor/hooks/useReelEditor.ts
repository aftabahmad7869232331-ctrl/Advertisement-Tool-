import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  ReelClip,
  ReelEngine,
  ReelEngineError,
  ReelProject,
  RendererPreference,
} from "../engine/reel-engine";
import { workspaceApi } from "../../../services/workspaceApi";

export type ReelTool =
  | "Upload"
  | "Media"
  | "Trim"
  | "Timeline"
  | "VFX"
  | "Text"
  | "Captions"
  | "Music"
  | "Watermark"
  | "Templates"
  | "Publish";

export function useReelEditor() {
  const engineRef = useRef<ReelEngine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [project, setProject] = useState<ReelProject | null>(null);
  const [activeTool, setActiveTool] = useState<ReelTool>("Upload");
  const [message, setMessage] = useState("Upload a video to begin editing your reel.");
  const [isBusy, setIsBusy] = useState(false);
  const [vfxIntensity, setVfxIntensity] = useState(0.68);
  const [lastSavedAt, setLastSavedAt] = useState("Just now");
  const [renderJobs, setRenderJobs] = useState(0);

  if (!engineRef.current) engineRef.current = new ReelEngine("Untitled Reel");

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setProject(engine.getProject());
    const unsubscribe = engine.subscribe((event) => {
      if (event.type === "state") setProject(event.project);
      if (event.type === "saved") {
        setLastSavedAt("Just now");
        setMessage("Draft saved locally.");
      }
      if (event.type === "error") setMessage(event.error.message);
    });
    return unsubscribe;
  }, []);

  const activeClip =
    project?.clips.find((clip) => clip.id === project.activeClipId)
    ?? project?.clips[0]
    ?? null;

  const selectTool = (tool: ReelTool): void => {
    setActiveTool(tool);
    if (tool === "Upload") {
      fileInputRef.current?.click();
      return;
    }
    if (!activeClip && ["Trim", "Timeline", "VFX", "Text", "Captions", "Music", "Watermark"].includes(tool)) {
      setMessage(`Upload a video before using ${tool}.`);
      return;
    }
    setMessage(`${tool} controls selected.`);
  };

  const importVideo = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !engineRef.current) return;
    setIsBusy(true);
    setMessage(`Reading ${file.name}…`);
    try {
      const clip = await engineRef.current.importVideo(file);
      setActiveTool("Media");
      setMessage(`${clip.name} added · ${clip.trimEnd.toFixed(1)} seconds.`);
    } catch (error) {
      setMessage(error instanceof ReelEngineError ? error.message : "Video could not be imported.");
    } finally {
      setIsBusy(false);
    }
  };

  const saveDraft = (): void => engineRef.current?.saveNow();

  const createExportJob = (renderer: RendererPreference = "browser-preview"): void => {
    if (!engineRef.current || engineRef.current.getProject().clips.length === 0) {
      setMessage("Upload at least one video before export.");
      return;
    }
    const job = engineRef.current.createExportJob(renderer);
    void workspaceApi.action("video", "export-queued", job).catch(() => undefined);
    const blob = new Blob([JSON.stringify(job.project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${job.project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "reel"}-project.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setRenderJobs((count) => count + 1);
    setMessage(`Local project export ${job.id.slice(-8)} downloaded. No cloud render used.`);
  };

  const applyVfx = (): void => {
    if (!activeClip || !engineRef.current) {
      setMessage("Upload a video before applying VFX.");
      return;
    }
    engineRef.current.upsertEffect({
      id: `color-grade-${activeClip.id}`,
      clipId: activeClip.id,
      type: "color-grade",
      intensity: vfxIntensity,
      enabled: true,
    });
    setMessage(`Color Grade applied at ${Math.round(vfxIntensity * 100)}%.`);
  };

  const undo = (): void => {
    if (!engineRef.current?.undo()) setMessage("Nothing to undo.");
  };
  const redo = (): void => {
    if (!engineRef.current?.redo()) setMessage("Nothing to redo.");
  };
  const removeActiveClip = (): void => {
    if (!activeClip || !engineRef.current) {
      setMessage("Upload a clip before deleting.");
      return;
    }
    engineRef.current.removeClip(activeClip.id);
    setMessage(`${activeClip.name} removed.`);
  };

  const splitActiveClip = (timelineSecond: number): void => {
    if (!activeClip || !engineRef.current) return setMessage("Upload a clip before splitting.");
    try {
      engineRef.current.splitClip(activeClip.id, timelineSecond);
      setMessage(`Clip split at ${timelineSecond.toFixed(2)} seconds.`);
    } catch (error) {
      setMessage(error instanceof ReelEngineError ? error.message : "Clip could not be split.");
    }
  };

  const duplicateActiveClip = (): void => {
    if (!activeClip || !engineRef.current) return setMessage("Upload a clip before duplicating.");
    try {
      const duplicate = engineRef.current.duplicateClip(activeClip.id);
      setMessage(`${duplicate.name} added to the timeline.`);
    } catch (error) {
      setMessage(error instanceof ReelEngineError ? error.message : "Clip could not be duplicated.");
    }
  };

  const setClipVolume = (volume: number): void => {
    if (!activeClip || !engineRef.current) return;
    engineRef.current.setVolume(activeClip.id, volume);
    setMessage(`Clip volume set to ${Math.round(volume * 100)}%.`);
  };

  const addTextOverlay = (text: string, fontFamily: string, fontSize: number): void => {
    if (!activeClip || !engineRef.current || !text.trim()) return setMessage("Enter text and upload a clip first.");
    engineRef.current.upsertText({
      id: `text-${activeClip.id}`, text: text.trim(), start: activeClip.timelineStart,
      end: Math.min(30, activeClip.timelineStart + activeClip.trimEnd - activeClip.trimStart),
      xPercent: 50, yPercent: 18, fontFamily, fontSize, color: "#ffffff",
    });
    setMessage("Text overlay applied locally.");
  };

  const notify = (nextMessage: string): void => setMessage(nextMessage);

  return {
    activeClip,
    activeTool,
    applyVfx,
    createExportJob,
    fileInputRef,
    importVideo,
    isBusy,
    lastSavedAt,
    message,
    notify,
    project,
    redo,
    duplicateActiveClip,
    removeActiveClip,
    renderJobs,
    saveDraft,
    splitActiveClip,
    setClipVolume,
    addTextOverlay,
    selectTool,
    setVfxIntensity,
    undo,
    vfxIntensity,
  };
}
