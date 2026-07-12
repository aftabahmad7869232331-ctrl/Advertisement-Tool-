import { ImagePlus, Settings2, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { GenerationSettings, UploadedReferenceImage } from "../../types/imageGenerator";
import { GenerationSettings as SettingsFields } from "./GenerationSettings";

export function PromptComposer(props: {
  prompt: string;
  onPrompt: (value: string) => void;
  generating: boolean;
  onGenerate: () => void;
  settings: GenerationSettings;
  onSettings: (value: GenerationSettings) => void;
  referenceImage: UploadedReferenceImage | null;
  onReferenceImage: (value: UploadedReferenceImage | null) => void;
  onAdvanced: () => void;
  notify: (message: string, type?: "success" | "error" | "info") => void;
}) {
  const selectFile = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return props.notify("Use PNG, JPG, JPEG, or WEBP files.", "error");
    if (file.size > 10 * 1024 * 1024) return props.notify("Image must be smaller than 10 MB.", "error");
    if (props.referenceImage) URL.revokeObjectURL(props.referenceImage.previewUrl);
    props.onReferenceImage({ file, previewUrl: URL.createObjectURL(file) });
  };
  return (
    <section className="ig-composer">
      <div className="ig-composer-tools">
        <button onClick={props.onAdvanced}><Settings2 size={15} /> Settings</button>
        <label><ImagePlus size={15} /> Upload Image<input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(event) => selectFile(event.target.files?.[0])} /></label>
        {props.referenceImage && <span className="ig-upload-preview"><img src={props.referenceImage.previewUrl} alt="Uploaded reference" />{props.referenceImage.file.name}<button onClick={() => props.onReferenceImage(null)} aria-label="Remove uploaded image"><X size={13} /></button></span>}
      </div>
      <div className="ig-prompt-row">
        <div className="ig-textarea-wrap">
          <textarea maxLength={2000} value={props.prompt} onChange={(event) => props.onPrompt(event.target.value)} onKeyDown={(event) => { if (event.ctrlKey && event.key === "Enter") props.onGenerate(); }} placeholder="Describe the image, poster, advertisement, branding design, colors, typography, layout, and text you want to create..." />
          <span>{props.prompt.length} / 2000</span>
        </div>
        <button className="ig-generate" disabled={!props.prompt.trim() || props.generating} onClick={props.onGenerate}><Sparkles size={19} />{props.generating ? "Creating..." : "Generate"}<small>Ctrl + Enter</small></button>
      </div>
      <div className="ig-settings-bottom"><SettingsFields settings={props.settings} onChange={props.onSettings} /><button onClick={props.onAdvanced}><SlidersHorizontal size={15} /> Advanced Settings</button></div>
    </section>
  );
}
