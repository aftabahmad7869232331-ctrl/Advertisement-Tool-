import { X } from "lucide-react";
import type { GenerationSettings } from "../../types/imageGenerator";

export function AdvancedSettingsDrawer({ open, settings, onChange, onClose }: { open: boolean; settings: GenerationSettings; onChange: (value: GenerationSettings) => void; onClose: () => void }) {
  if (!open) return null;
  const update = <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => onChange({ ...settings, [key]: value });
  return (
    <div className="ig-drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="ig-drawer" role="dialog" aria-modal="true" aria-label="Advanced generation settings" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span>GENERATION CONTROL</span><h2>Advanced Settings</h2></div><button onClick={onClose} aria-label="Close advanced settings"><X /></button></header>
        <label>Negative prompt<textarea value={settings.negativePrompt} onChange={(event) => update("negativePrompt", event.target.value)} placeholder="Things to exclude from the result..." /></label>
        <label>Brand colors<input value={settings.brandColors} onChange={(event) => update("brandColors", event.target.value)} /></label>
        <label>Text language<select value={settings.textLanguage} onChange={(event) => update("textLanguage", event.target.value)}><option>English</option><option>Hindi</option><option>Urdu</option></select></label>
        <label>Creativity level <b>{settings.creativity}%</b><input type="range" min="0" max="100" value={settings.creativity} onChange={(event) => update("creativity", Number(event.target.value))} /></label>
        <label>Seed<input value={settings.seed} onChange={(event) => update("seed", event.target.value)} placeholder="Random" /></label>
        {([["addLogo", "Add brand logo"], ["watermark", "Add watermark"], ["transparentBackground", "Transparent background"]] as const).map(([key, label]) => <label className="ig-check" key={key}><input type="checkbox" checked={settings[key]} onChange={(event) => update(key, event.target.checked)} /><span>{label}</span></label>)}
        <button className="ig-apply" onClick={onClose}>Apply settings</button>
      </aside>
    </div>
  );
}
