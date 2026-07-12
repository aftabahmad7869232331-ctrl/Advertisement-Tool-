import {
  BadgeHelp, Boxes, Brush, Clock3, CloudUpload, Coins, Crop, Eraser, FileImage,
  FolderClock, Frame, Image, Images, LayoutTemplate, Menu, Palette, PenTool,
  ScanFace, Settings, Sparkles, WandSparkles, X,
} from "lucide-react";

const groups = [
  ["AI IMAGE TOOLS", [[Sparkles, "AI Image Generator"], [Images, "Image to Image"], [WandSparkles, "Prompt Enhancer"]]],
  ["DESIGN & CREATIVE TOOLS", [[Frame, "Poster Maker"], [FileImage, "Pamphlet Designer"], [PenTool, "Flyer Maker"], [Image, "Banner Maker"], [Brush, "Logo Generator"], [LayoutTemplate, "Business Card"], [Palette, "Social Media Post"], [Boxes, "Product Advertisement"], [Frame, "YouTube Thumbnail"], [FileImage, "Invitation Card"], [LayoutTemplate, "Certificate Maker"], [Menu, "Menu Card Designer"]]],
  ["IMAGE EDITING TOOLS", [[Eraser, "Background Remover"], [WandSparkles, "Object Remover"], [Sparkles, "Image Enhancer"], [Images, "Image Upscaler"], [Crop, "Resize & Crop"], [Palette, "Background Generator"], [Brush, "Color Correction"], [ScanFace, "Face Retouch"]]],
  ["BRAND & ASSETS", [[Palette, "Brand Kit"], [CloudUpload, "Upload Assets"], [LayoutTemplate, "Templates"], [Images, "Saved Designs"]]],
  ["HISTORY & MANAGEMENT", [[Clock3, "Recent Generations"], [FolderClock, "Generation History"], [Boxes, "Storage"], [Coins, "Credits"]]],
] as const;

export function ImageGeneratorSidebar({ open, activeTool, onOpen, onClose, onSelect }: {
  open: boolean;
  activeTool: string;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (tool: string) => void;
}) {
  return (
    <>
      {open && <button className="ig-sidebar-backdrop" aria-label="Close tools" onClick={onClose} />}
      <aside className={`ig-sidebar ${open ? "is-open" : ""}`} aria-label="Image generator tools">
        <div className="ig-sidebar-title"><span>TOOLS</span><button onClick={onClose} aria-label="Close sidebar"><X size={17} /></button></div>
        <div className="ig-sidebar-scroll">
          {groups.map(([title, items]) => (
            <section className="ig-tool-group" key={title}>
              <h2>{title}</h2>
              <div className="ig-tool-list">
                {items.map(([Icon, label], index) => (
                  <button
                    className={activeTool === label ? "is-active" : ""}
                    key={label}
                    onClick={() => onSelect(label)}
                  >
                    <Icon size={14} /><span>{label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
          <div className="ig-sidebar-actions">
            <button onClick={() => onSelect("Settings")}><Settings size={14} /><span>Settings</span></button>
            <button onClick={() => onSelect("Help & Support")}><BadgeHelp size={14} /><span>Help & Support</span></button>
          </div>
        </div>
        <div className="ig-online"><i /> <strong>ONLINE</strong><span>All systems operational</span></div>
      </aside>
      <button className="ig-mobile-tools" onClick={onOpen}><Menu size={17} /> Tools</button>
    </>
  );
}
