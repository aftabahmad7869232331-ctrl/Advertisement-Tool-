import type { GenerationSettings as Settings } from "../../types/imageGenerator";

const fields = [
  ["model", "Model", ["ChatGPT Image", "Gemini Image", "Ocean 4.0", "Custom Provider"]],
  ["aspectRatio", "Aspect Ratio", ["1:1 Square", "16:9 Landscape", "9:16 Portrait", "4:5 Social", "A4 Portrait", "A4 Landscape"]],
  ["style", "Style", ["Photorealistic", "3D", "Cinematic", "Luxury", "Minimal", "Illustration", "Product Photography", "Social Media", "Corporate", "Educational"]],
  ["quality", "Quality", ["Standard", "High", "Ultra"]],
  ["imageCount", "Images", ["1", "2", "4"]],
] as const;

export function GenerationSettings({ settings, onChange }: { settings: Settings; onChange: (settings: Settings) => void }) {
  return (
    <div className="ig-settings-row">
      {fields.map(([key, label, options]) => (
        <label key={key}><span>{label}</span><select value={String(settings[key])} onChange={(event) => onChange({ ...settings, [key]: key === "imageCount" ? Number(event.target.value) : event.target.value })}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
      ))}
    </div>
  );
}
