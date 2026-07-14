import { useEffect, useRef, useState } from "react";
import {
  Captions, ChevronDown, Clapperboard, Clock3, Copy, Film, FolderOpen,
  Image, Layers3, Lock, Maximize2, Music2, Pause, Play, Redo2, Save,
  Scissors, Send, Settings2, Sparkles, Trash2, Type, Undo2, Upload,
  Video, Volume2, Waves, Eye, Droplets,
} from "lucide-react";
import { REEL_EDITOR_LIMITS } from "./config";
import { ReelTool, useReelEditor } from "./hooks/useReelEditor";
import { ViewType } from "../../components/Sidebar";
import "./reel-editor.css";

const tools: Array<{ label: ReelTool; icon: typeof Upload }> = [
  { label: "Upload", icon: Upload }, { label: "Media", icon: Image },
  { label: "Trim", icon: Scissors }, { label: "Timeline", icon: Layers3 },
  { label: "VFX", icon: Sparkles }, { label: "Text", icon: Type },
  { label: "Captions", icon: Captions }, { label: "Music", icon: Music2 },
  { label: "Watermark", icon: Droplets }, { label: "Templates", icon: FolderOpen },
  { label: "Publish", icon: Send },
];

const supportedTools = new Set<ReelTool>(["Upload", "Media", "Trim", "Timeline", "VFX", "Text"]);

interface ReelEditorShellProps {
  setActiveView: (view: ViewType) => void;
}

export function ReelEditorShell({ setActiveView }: ReelEditorShellProps) {
  const editor = useReelEditor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFit, setIsFit] = useState(true);
  const [playheadSeconds, setPlayheadSeconds] = useState(8.42);
  const [overlayText, setOverlayText] = useState("Adventure Awaits");
  const [fontFamily, setFontFamily] = useState("Outfit");
  const [fontSize, setFontSize] = useState(48);
  const [clipVolume, setClipVolume] = useState(0.7);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hiddenTracks, setHiddenTracks] = useState<string[]>([]);
  const [lockedTracks, setLockedTracks] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState(["effects", "audio", "export", "clip"]);
  const toggleSection = (section: string): void =>
    setOpenSections((items) => items.includes(section)
      ? items.filter((item) => item !== section)
      : [...items, section]);
  const movePlayhead = (delta: number): void => {
    const next = Math.max(0, Math.min(30, playheadSeconds + delta));
    setPlayheadSeconds(next);
    if (videoRef.current && editor.activeClip) {
      const local = Math.max(0, next - editor.activeClip.timelineStart);
      videoRef.current.currentTime = editor.activeClip.trimStart + local * editor.activeClip.playbackRate;
    }
    editor.notify(`Playhead moved to ${next.toFixed(2)} seconds.`);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    if (isPlaying) void video.play().catch(() => setIsPlaying(false));
    else video.pause();
  }, [isMuted, isPlaying, editor.activeClip?.id]);
  const toggleTrack = (track: string, mode: "hidden" | "locked"): void => {
    const setter = mode === "hidden" ? setHiddenTracks : setLockedTracks;
    setter((items) => items.includes(track)
      ? items.filter((item) => item !== track)
      : [...items, track]);
    editor.notify(`${track} ${mode === "hidden" ? "visibility" : "lock"} updated.`);
  };

  return (
    <section className="reel-editor" aria-labelledby="reel-editor-title">
      <header className="reel-editor__header">
        <h1 id="reel-editor-title"><Clapperboard /> Video / Reel Editor</h1>
        <nav className="reel-editor__local-nav" aria-label="Editor navigation">
          <button type="button" onClick={() => setActiveView("projects")}><FolderOpen /> Projects</button>
          <button type="button" className="is-active" onClick={() => editor.notify("Video Editor is already active.")}><Video /> Video</button>
          <button type="button" onClick={() => setActiveView("studio")}><Layers3 /> Studio</button>
        </nav>
        <div className="reel-editor__actions">
          <button type="button" onClick={editor.saveDraft}><Save /> Save Draft</button>
          <button type="button" className="reel-editor__primary" onClick={() => editor.createExportJob("browser-preview")}>
            <Upload /> Export Project
          </button>
          <span className="reel-editor__render-badge"><span /> Local Editing · Cloud Optional</span>
        </div>
      </header>

      <div className="reel-editor__main">
        <nav className="reel-editor__tools" aria-label="Reel editor tools">
          {tools.map(({ label, icon: Icon }) => (
            <button key={label} type="button"
              className={editor.activeTool === label ? "is-active" : ""}
              onClick={() => editor.selectTool(label)} aria-pressed={editor.activeTool === label}
              disabled={editor.isBusy || !supportedTools.has(label)}
              title={supportedTools.has(label) ? label : `${label}: processing module not installed`}>
              <Icon /><span>{label}</span>
            </button>
          ))}
          <input ref={editor.fileInputRef} className="reel-editor__file-input" type="file"
            accept="video/mp4,video/quicktime,video/webm"
            onChange={(event) => void editor.importVideo(event)} aria-label="Upload video" />
        </nav>

        <main className="reel-editor__preview-area">
          <div className="reel-editor__preview-label"><span /> Preview Canvas</div>
          <div className={`reel-editor__canvas ${isFit ? "is-fit" : "is-fill"}`}>
            <span className="reel-editor__ratio">▣ 9:16</span>
            {editor.activeClip ? (
              <video ref={videoRef} src={editor.activeClip.objectUrl} playsInline controls={false}
                muted={isMuted} style={{ objectFit: isFit ? "contain" : "cover" }}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={(event) => setPlayheadSeconds(editor.activeClip!.timelineStart + (event.currentTarget.currentTime - editor.activeClip!.trimStart) / editor.activeClip!.playbackRate)}
                aria-label={`Preview ${editor.activeClip.name}`} />
            ) : (
              <div className="reel-editor__poster">
                <Sparkles />
                <div><em>Adventure</em><strong>AWAITS</strong><small>Keep exploring.<br />Never stop.</small></div>
              </div>
            )}
          </div>
          <div className="reel-editor__playback">
            <button type="button" title={isFit ? "Fill screen" : "Fit to screen"} className={isFit ? "is-active" : ""}
              onClick={() => { setIsFit((value) => !value); editor.notify(isFit ? "Preview fills the canvas." : "Preview fitted to the canvas."); }}><Maximize2 /></button>
            <span />
            <button type="button" title="Previous frame" onClick={() => movePlayhead(-1 / 30)}>|◀</button>
            <button type="button" className="play" disabled={!editor.activeClip} onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause" : "Play"}>{isPlaying ? <Pause /> : <Play />}</button>
            <button type="button" title="Next frame" onClick={() => movePlayhead(1 / 30)}>▶|</button>
            <span />
            <button type="button" title="Volume" className={isMuted ? "is-active" : ""}
              onClick={() => { setIsMuted(!isMuted); editor.notify(isMuted ? "Preview audio enabled." : "Preview audio muted."); }}>
              <Volume2 />
            </button>
            <strong>00:{playheadSeconds.toFixed(2).padStart(5, "0")} <i>/ 00:30.00</i></strong>
          </div>
          <p className="reel-editor__message" role="status">{editor.message}</p>
        </main>

        <aside className="reel-editor__properties" aria-label="Properties and settings">
          <h2><Settings2 /> Properties / Settings</h2>
          <PropertySection title="Effect Settings" icon={<Sparkles />} name="effects"
            open={openSections.includes("effects")} toggle={toggleSection}>
            <label>Effect<select defaultValue="color-grade"><option value="color-grade">Color Grade</option></select></label>
            <label>Intensity <b>{Math.round(editor.vfxIntensity * 100)}%</b>
              <input type="range" min="0" max="1" step=".01" value={editor.vfxIntensity}
                onChange={(event) => editor.setVfxIntensity(Number(event.target.value))} />
            </label>
            <label>Blend Mode<select defaultValue="normal"><option value="normal">Normal</option></select></label>
            <button type="button" onClick={editor.applyVfx}>Apply Effect</button>
          </PropertySection>
          <PropertySection title="Text Style" icon={<Type />} name="text"
            open={openSections.includes("text")} toggle={toggleSection}>
            <label>Text<input value={overlayText} onChange={(event) => setOverlayText(event.target.value)} /></label>
            <label>Font<select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)}><option>Outfit</option><option>Inter</option><option>Playfair Display</option></select></label>
            <label>Size<input type="number" min="8" max="240" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} /></label>
            <button type="button" onClick={() => editor.addTextOverlay(overlayText, fontFamily, fontSize)}>Apply Text</button>
          </PropertySection>
          <PropertySection title="Audio Levels" icon={<Volume2 />} name="audio"
            open={openSections.includes("audio")} toggle={toggleSection}>
            <label>Volume <b>{Math.round(clipVolume * 100)}%</b><input type="range" min="0" max="1" step=".01" value={clipVolume}
              onChange={(event) => { const value = Number(event.target.value); setClipVolume(value); editor.setClipVolume(value); }} /></label>
            <div className="reel-editor__meter"><span /><span /></div>
          </PropertySection>
          <PropertySection title="Export Preset" icon={<Film />} name="export"
            open={openSections.includes("export")} toggle={toggleSection}>
            <select defaultValue="reel"><option value="reel">1080×1920 (9:16) · H.264 · 30fps · AAC</option></select>
          </PropertySection>
          <PropertySection title="Clip Info" icon={<Clock3 />} name="clip"
            open={openSections.includes("clip")} toggle={toggleSection}>
            <dl><dt>Name</dt><dd>{editor.activeClip?.name ?? "No clip imported"}</dd>
              <dt>Resolution</dt><dd>{editor.activeClip ? "Source resolution" : "—"}</dd><dt>Duration</dt><dd>{editor.activeClip ? `${(editor.activeClip.trimEnd - editor.activeClip.trimStart).toFixed(2)}s` : "—"}</dd>
              <dt>FPS</dt><dd>Source</dd><dt>Size</dt><dd>{editor.activeClip ? `${(editor.activeClip.sizeBytes / 1048576).toFixed(1)} MB` : "—"}</dd></dl>
          </PropertySection>
        </aside>
      </div>

      <section className="reel-editor__timeline" aria-label="Timeline">
        <div className="reel-editor__timeline-toolbar">
          <button type="button" onClick={editor.undo} title="Undo"><Undo2 /></button>
          <button type="button" onClick={editor.redo} title="Redo"><Redo2 /></button><span />
          <button type="button" title="Split" onClick={() => editor.splitActiveClip(playheadSeconds)}><Scissors /></button>
          <button type="button" onClick={editor.removeActiveClip} title="Delete"><Trash2 /></button>
          <button type="button" title="Duplicate" onClick={editor.duplicateActiveClip}><Copy /></button>
          <strong>{REEL_EDITOR_LIMITS.maxDurationSeconds} sec final reel limit</strong>
        </div>
        <div className="reel-editor__timeline-scroll">
          <div className="reel-editor__track-labels">
            {["Video Track", "VFX Track", "Text Track", "Audio Track"].map((track) =>
              <div key={track} className={hiddenTracks.includes(track) ? "is-track-hidden" : ""}>
                <span>{track}</span>
                <button type="button" title={`Toggle ${track} visibility`}
                  className={hiddenTracks.includes(track) ? "is-active" : ""}
                  onClick={() => toggleTrack(track, "hidden")}><Eye /></button>
                <button type="button" title={`Toggle ${track} lock`}
                  className={lockedTracks.includes(track) ? "is-active" : ""}
                  onClick={() => toggleTrack(track, "locked")}><Lock /></button>
              </div>)}
          </div>
          <div className="reel-editor__tracks">
            <div className="reel-editor__ruler">{["00:00","00:05","00:10","00:15","00:20","00:25","00:30"].map(t => <span key={t}>{t}</span>)}</div>
            <div className="reel-editor__playhead"><b>00:08.42</b></div>
            <div className="reel-editor__track video-track">{editor.project?.clips.length ? editor.project.clips.map((clip, index) =>
              <div key={clip.id} className={index % 2 ? "city" : "mountain"}
                style={{ width: `${Math.max(8, ((clip.trimEnd - clip.trimStart) / 30) * 100)}%` }}>{clip.name}<small>{(clip.trimEnd - clip.trimStart).toFixed(2)}s</small></div>) : <div className="reel-editor__empty-track">Import a video to begin</div>}</div>
            <div className="reel-editor__track vfx-track">{editor.project?.effects.filter((effect) => effect.enabled).map((effect) => <div key={effect.id}>✦ {effect.type}</div>)}</div>
            <div className="reel-editor__track text-track">{editor.project?.textOverlays.map((overlay) => <div key={overlay.id}>{overlay.text}</div>)}</div>
            <div className="reel-editor__track audio-track">{editor.activeClip && <div><Waves /> Source audio</div>}</div>
          </div>
        </div>
      </section>

      <footer className="reel-editor__footer">
        <span>✓ Autosave <b>{editor.lastSavedAt}</b></span>
        <span>▣ Draft storage <b>Browser local</b></span>
        <span>▤ Project exports <b>{editor.renderJobs}</b></span>
        <span>◷ Project Version <b>v{editor.project?.version ?? 1}.0.0</b></span>
      </footer>
    </section>
  );
}

function PropertySection({ title, icon, name, open, toggle, children }: {
  title: string; icon: React.ReactNode; name: string; open: boolean;
  toggle: (name: string) => void; children: React.ReactNode;
}) {
  return <section className="reel-editor__property">
    <button type="button" className="reel-editor__property-head" onClick={() => toggle(name)}
      aria-expanded={open}>{icon}<span>{title}</span><ChevronDown className={open ? "open" : ""} /></button>
    {open && <div className="reel-editor__property-body">{children}</div>}
  </section>;
}
