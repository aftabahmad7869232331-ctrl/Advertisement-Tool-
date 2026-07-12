import { useMemo, useState } from "react";
import { Clock3, Grid3X3, Menu, Sparkles, Trash2, X } from "lucide-react";
import { AdvancedSettingsDrawer } from "./image-generator/AdvancedSettingsDrawer";
import { GeneratedResultsGrid } from "./image-generator/GeneratedResultsGrid";
import { ImageGeneratorSidebar } from "./image-generator/ImageGeneratorSidebar";
import { PromptComposer } from "./image-generator/PromptComposer";
import { ResultActions } from "./image-generator/ResultActions";
import { useImageGenerator } from "../hooks/useImageGenerator";
import type { GeneratedImage, QuickPrompt } from "../types/imageGenerator";
import "./image-generator/imageGenerator.css";

const quickPrompts: QuickPrompt[] = [
  { id: "restaurant", label: "Restaurant Flyer", prompt: "Create a premium restaurant flyer with dark black and gold styling, food photography, restaurant name, offer text, address, and booking call-to-action." },
  { id: "school", label: "School Poster", prompt: "Create a modern school admission poster with blue and orange colors, student image, admission year, facilities, contact number, and enroll-now call-to-action." },
  { id: "product", label: "Product Advertisement", prompt: "Create a luxury product advertisement with a dark cinematic background, premium lighting, product highlights, price, and shop-now button." },
  { id: "social", label: "Social Media Post", prompt: "Create a bold social media launch post with modern typography, a strong focal image, brand colors, and a clear call-to-action." },
  { id: "luxury", label: "Luxury Brand Poster", prompt: "Create an elegant luxury brand poster with black and gold styling, editorial typography, premium lighting, and refined product composition." },
  { id: "more", label: "More Prompts", prompt: "Create a professional promotional design with balanced typography, premium imagery, strong branding, and a clear call-to-action." },
];

const toolPrompts: Record<string, string> = {
  "Image to Image": "Transform the uploaded reference into a polished, brand-ready visual while preserving its main subject and composition.",
  "Prompt Enhancer": "Enhance this idea into a detailed professional prompt with composition, lighting, typography, colors, and brand direction.",
  "Poster Maker": "Create a professional promotional poster with a bold headline, strong visual hierarchy, and clear call-to-action.",
  "Pamphlet Designer": "Create a polished business pamphlet with headline, services, benefits, contact details, and call-to-action.",
  "Flyer Maker": "Create a high-impact marketing flyer with a compelling offer, premium imagery, and contact information.",
  "Banner Maker": "Create a wide promotional banner with concise copy, strong branding, and a prominent call-to-action.",
  "Logo Generator": "Create a distinctive modern logo mark with clean geometry, memorable symbolism, and professional brand colors.",
  "Business Card": "Create a premium business card with logo, name, role, contact details, and balanced spacing.",
  "Social Media Post": "Create a scroll-stopping social media post with bold typography, brand colors, and clear call-to-action.",
  "Product Advertisement": "Create a premium product advertisement with cinematic lighting, benefits, price, and shop-now call-to-action.",
  "YouTube Thumbnail": "Create a high-contrast YouTube thumbnail with a strong focal subject and large readable headline.",
  "Invitation Card": "Create an elegant invitation card with event title, date, time, venue, and RSVP details.",
  "Certificate Maker": "Create a formal certificate with recipient name, achievement, date, signatures, and premium border styling.",
  "Menu Card Designer": "Create a refined restaurant menu with clear categories, item names, prices, and elegant typography.",
  "Background Remover": "Remove the background from the uploaded reference image and preserve clean subject edges.",
  "Object Remover": "Remove the unwanted object from the uploaded reference and reconstruct the background naturally.",
  "Image Enhancer": "Enhance the uploaded image with improved sharpness, contrast, color balance, and natural detail.",
  "Image Upscaler": "Upscale the uploaded image while preserving texture, clean edges, and realistic details.",
  "Resize & Crop": "Resize and crop the uploaded image into a balanced, professional composition.",
  "Background Generator": "Generate a premium background matching the uploaded subject, lighting, and brand palette.",
  "Color Correction": "Correct exposure, white balance, contrast, and colors for a polished professional finish.",
  "Face Retouch": "Apply subtle natural face retouching while preserving identity, texture, and realistic skin detail.",
  "Brand Kit": "Create a cohesive brand visual using the configured logo, colors, typography, and design language.",
  "Templates": "Create a reusable professional marketing template with editable content and clear visual hierarchy.",
};

type Toast = { message: string; type: "success" | "error" | "info" };

export function ProjectsView() {
  const generator = useImageGenerator();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTool, setActiveTool] = useState("AI Image Generator");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [preview, setPreview] = useState<GeneratedImage | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const selected = useMemo(() => generator.images.find((image) => image.id === generator.selectedId) ?? null, [generator.images, generator.selectedId]);

  const notify = (message: string, type: Toast["type"] = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const runGeneration = async (overridePrompt?: string) => {
    try {
      await generator.generate(overridePrompt);
      notify("Images generated successfully.");
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : "Image generation failed.", "error");
    }
  };

  const selectTool = (tool: string) => {
    setActiveTool(tool);
    setSidebarOpen(false);
    if (tool === "AI Image Generator") {
      document.querySelector<HTMLTextAreaElement>(".ig-composer textarea")?.focus();
      return;
    }
    if (tool === "Settings") {
      setAdvancedOpen(true);
      return;
    }
    if (tool === "Help & Support") {
      notify("Open Help & Support from the main navigation for FAQs and support tickets.", "info");
      return;
    }
    if (["Recent Generations", "Generation History", "Saved Designs"].includes(tool)) {
      generator.setLayout("list");
      notify(`${generator.images.length} available designs are shown in history view.`, "info");
      return;
    }
    if (toolPrompts[tool]) generator.setPrompt(toolPrompts[tool]);
    window.setTimeout(() => document.querySelector<HTMLTextAreaElement>(".ig-composer textarea")?.focus(), 0);
    notify(`${tool} is ready. Add details${tool.includes("Image") || tool.includes("Remover") ? " and upload a reference if needed" : ""}.`, "info");
  };

  const handleAction = (action: string) => {
    if (!selected) return notify("Select a generated result first.", "error");
    if (action === "Save Project") {
      const saved = JSON.parse(localStorage.getItem("brick-maker-generated-projects") ?? "[]") as GeneratedImage[];
      localStorage.setItem("brick-maker-generated-projects", JSON.stringify([selected, ...saved.filter((item) => item.id !== selected.id)]));
      return notify("Design saved to your local projects.");
    }
    if (action === "Print") {
      window.print();
      return;
    }
    if (action === "Download") {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200"><defs><linearGradient id="g"><stop stop-color="${selected.palette[0]}"/><stop offset=".65" stop-color="${selected.palette[2]}"/><stop offset="1" stop-color="${selected.palette[1]}"/></linearGradient></defs><rect width="1200" height="1200" fill="url(#g)"/><text x="70" y="570" fill="white" font-family="Arial" font-size="86" font-weight="700">${selected.title.replace(/[<>&]/g, "")}</text><text x="74" y="640" fill="${selected.palette[1]}" font-family="Arial" font-size="28">BRICK-MAKER STUDIO</text></svg>`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      link.download = `${selected.title.toLowerCase().replace(/\s+/g, "-")}.svg`;
      link.click();
      URL.revokeObjectURL(link.href);
      return notify("Design downloaded.");
    }
    if (action === "Regenerate" || action === "Variations") {
      void runGeneration(action === "Variations" ? `${selected.prompt} Create a fresh visual variation.` : selected.prompt);
      return notify(`${action} started.`, "info");
    }
    if (action === "Edit") {
      generator.setPrompt(selected.prompt);
      document.querySelector<HTMLTextAreaElement>(".ig-composer textarea")?.focus();
      return notify("Selected design prompt loaded for editing.", "info");
    }
  };

  return (
    <div className="ig-page">
      <button className="ig-tools-toggle" onClick={() => setSidebarOpen(true)}><Menu size={17} /> Tools</button>
      <ImageGeneratorSidebar open={sidebarOpen} activeTool={activeTool} onOpen={() => setSidebarOpen(true)} onClose={() => setSidebarOpen(false)} onSelect={selectTool} />
      <main className="ig-workspace">
        <header className="ig-page-header">
          <div><Sparkles size={26} /><span><h1>AI Image Generator</h1><p>Create professional images, advertisements, posters, and brand visuals using a simple prompt.</p></span></div>
          <nav><button onClick={() => { generator.setLayout("list"); notify(`${generator.images.length} generated designs shown in history view.`, "info"); }}><Clock3 size={15} /> View Generation History</button><button className="danger" onClick={() => { if (window.confirm("Clear all generated results from this session?")) { generator.setImages([]); notify("Results cleared.", "info"); } }}><Trash2 size={15} /> Clear Results</button></nav>
        </header>

        <section className="ig-quick">
          <h2>QUICK PROMPTS</h2>
          <div>{quickPrompts.map((item) => <button key={item.id} onClick={() => generator.setPrompt(item.prompt)}><Grid3X3 size={14} />{item.label}</button>)}</div>
        </section>

        {generator.images.length ? (
          <GeneratedResultsGrid images={generator.images} selectedId={generator.selectedId} layout={generator.layout} onLayout={generator.setLayout} onSelect={generator.setSelectedId} onFavorite={generator.toggleFavorite} onPreview={setPreview} onMenu={(image) => { generator.setSelectedId(image.id); notify(`Selected ${image.title}. Use the actions below to continue.`, "info"); }} />
        ) : (
          <section className="ig-empty"><Sparkles /><h2>Your generated designs will appear here</h2><p>Describe your idea below and create your first professional visual.</p><button onClick={() => document.querySelector<HTMLTextAreaElement>(".ig-composer textarea")?.focus()}>Generate your first image</button></section>
        )}

        {generator.images.length > 0 && <ResultActions onAction={handleAction} />}
        <PromptComposer prompt={generator.prompt} onPrompt={generator.setPrompt} generating={generator.isGenerating} onGenerate={() => { void runGeneration(); }} settings={generator.settings} onSettings={generator.setSettings} referenceImage={generator.referenceImage} onReferenceImage={generator.setReferenceImage} onAdvanced={() => setAdvancedOpen(true)} notify={notify} />
      </main>

      <AdvancedSettingsDrawer open={advancedOpen} settings={generator.settings} onChange={generator.setSettings} onClose={() => setAdvancedOpen(false)} />
      {preview && <div className="ig-preview" role="dialog" aria-modal="true" aria-label="Generated image preview"><button onClick={() => setPreview(null)} aria-label="Close preview"><X /></button><div style={{ background: `linear-gradient(145deg, ${preview.palette.join(",")})` }}><span>BRICK-MAKER STUDIO</span><strong>{preview.title}</strong><p>{preview.prompt}</p></div></div>}
      {toast && <div className={`ig-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
