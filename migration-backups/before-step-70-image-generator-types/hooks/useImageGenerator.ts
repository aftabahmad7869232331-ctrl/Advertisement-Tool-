import { useEffect, useState } from "react";
import { generateImages } from "../services/imageGenerationService";
import type {
  GeneratedImage,
  GenerationSettings,
  ResultLayout,
  UploadedReferenceImage,
} from "../types/imageGenerator";

const initialSettings: GenerationSettings = {
  model: "ChatGPT Image",
  aspectRatio: "1:1 Square",
  style: "Photorealistic",
  quality: "High",
  imageCount: 4,
  negativePrompt: "",
  brandColors: "#27c5f3, #f8b400",
  textLanguage: "English",
  creativity: 70,
  seed: "",
  addLogo: false,
  watermark: false,
  transparentBackground: false,
};

const initialImages: GeneratedImage[] = [
  { id: "royal-spice", title: "Royal Spice", prompt: "Premium restaurant flyer with dark black and gold styling", createdAt: "2026-07-06T09:30:00.000Z", palette: ["#100a07", "#d29a43", "#49180e"], status: "ready", favorite: true },
  { id: "school", title: "Shape Your Future", prompt: "Modern school admission poster with blue and orange colors", createdAt: "2026-07-06T09:27:00.000Z", palette: ["#061e46", "#f0a315", "#eef5ff"], status: "ready", favorite: false },
  { id: "watch", title: "Elevate Your Style", prompt: "Luxury product advertisement with premium cinematic lighting", createdAt: "2026-07-06T09:24:00.000Z", palette: ["#08090a", "#c59a5c", "#292a2c"], status: "ready", favorite: false },
  { id: "fashion", title: "New Arrival", prompt: "Luxury fashion brand poster in black and gold", createdAt: "2026-07-06T09:20:00.000Z", palette: ["#101114", "#d6b675", "#35363b"], status: "ready", favorite: false },
];

export function useImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState(initialImages);
  const [selectedId, setSelectedId] = useState(initialImages[0].id);
  const [layout, setLayout] = useState<ResultLayout>("grid");
  const [settings, setSettings] = useState(initialSettings);
  const [referenceImage, setReferenceImage] = useState<UploadedReferenceImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => () => {
    if (referenceImage) URL.revokeObjectURL(referenceImage.previewUrl);
  }, [referenceImage]);

  const generate = async (overridePrompt?: string) => {
    const nextPrompt = (overridePrompt ?? prompt).trim();
    if (!nextPrompt || isGenerating) return;
    setIsGenerating(true);
    try {
      const results = await generateImages({ prompt: nextPrompt, settings, referenceImage });
      if (!results.length) throw new Error("The provider returned no images.");
      setImages((current) => [...results, ...current]);
      setSelectedId(results[0].id);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (id: string) =>
    setImages((current) => current.map((image) => image.id === id ? { ...image, favorite: !image.favorite } : image));

  return {
    prompt, setPrompt, images, setImages, selectedId, setSelectedId, layout, setLayout,
    settings, setSettings, referenceImage, setReferenceImage, isGenerating, generate, toggleFavorite,
  };
}
