import { motion } from "framer-motion";
import {
  ArrowUpRight,
  FileText,
  Image as ImageIcon,
  Layers,
  Play,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import type { ViewType } from "../../types";

const modules = [
  { label: "Create", icon: Wand2, view: "studio" as const },
  { label: "Customize", icon: Layers, view: "flyer" as const },
  { label: "Export", icon: ArrowUpRight, view: "studio" as const },
];

const posters = [
  { className: "bm-poster-back", eyebrow: "Brand launch", title: "Build\nBoldly", meta: "Campaign 01" },
  { className: "bm-poster-mid", eyebrow: "Social creative", title: "Make It\nMatter", meta: "Campaign 02" },
  { className: "bm-poster-front", eyebrow: "Brick-Maker Studio", title: "Create\nWithout\nLimits", meta: "Live preview" },
];

export default function StudioCoreCard({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  return (
    <motion.div
      className="rendering-live-card relative mx-auto aspect-[1.04] w-full max-w-[620px]"
      initial={{ opacity: 0, x: 34, scale: 0.96, filter: "blur(14px)" }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.78, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="rendering-live-card__inner bm-studio-core bm-creative-preview relative flex h-full w-full flex-col overflow-hidden p-6 sm:p-8">
        <div className="bm-studio-aurora" />
        <div className="bm-studio-grid" />
        <div className="bm-preview-floor" />

        <div className="relative z-20 flex items-center justify-between">
          <div className="bm-studio-kicker"><span /> Live Creative Preview</div>
          <div className="bm-preview-status"><i /> Rendering live</div>
        </div>

        <div className="bm-poster-stage relative z-10 flex-1" aria-label="Animated campaign preview">
          <div className="bm-preview-halo" />
          {posters.map((poster, index) => (
            <motion.article
              key={poster.meta}
              className={`bm-preview-poster ${poster.className}`}
              animate={{ y: [0, index === 1 ? -8 : -5, 0] }}
              transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut", delay: index * 0.35 }}
            >
              <span>{poster.eyebrow}</span>
              <strong>{poster.title.split("\n").map((line) => <span key={line}>{line}</span>)}</strong>
              <div><small>{poster.meta}</small><Sparkles size={15} /></div>
            </motion.article>
          ))}
          <motion.div className="bm-preview-chip bm-chip-image" animate={{ y: [0, -7, 0] }} transition={{ duration: 5, repeat: Infinity }}>
            <ImageIcon size={16} /> AI Visual
          </motion.div>
          <motion.div className="bm-preview-chip bm-chip-video" animate={{ y: [0, 7, 0] }} transition={{ duration: 6, repeat: Infinity }}>
            <Play size={15} /> Motion
          </motion.div>
        </div>

        <div className="relative z-20 grid grid-cols-3 gap-3 sm:gap-4">
          {modules.map((item, index) => (
            <motion.button
              key={item.label}
              type="button"
              className="bm-mini-module text-left"
              whileHover={{ y: -6, scale: 1.03 }}
              onClick={() => onNavigate(item.view)}
              aria-label={`${item.label} in studio`}
            >
              <item.icon size={21} />
              <span>{item.label}</span>
              <i>0{index + 1}</i>
            </motion.button>
          ))}
        </div>

        <div className="bm-card-corner bm-card-corner-a"><FileText size={15} /></div>
        <div className="bm-card-corner bm-card-corner-b"><Video size={15} /></div>
      </div>
    </motion.div>
  );
}
