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

const initialImages: GeneratedImage[] = [];

export function useImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState(initialImages);
  const [selectedId, setSelectedId] = useState(initialImages[0]?.id ?? "");
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
      const firstResult = results[0];

      if (!firstResult) {
        throw new Error("The provider returned no images.");
      }

      setImages((current) => [...results, ...current]);
      setSelectedId(firstResult.id);
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

