export type GenerationStatus = "ready" | "loading" | "error";
export type ResultLayout = "grid" | "list";

export interface GeneratorTool {
  id: string;
  label: string;
  icon: string;
}

export interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
}

export interface GeneratedImage {
  id: string;
  title: string;
  prompt: string;
  createdAt: string;
  palette: [string, string, string];
  status: GenerationStatus;
  favorite: boolean;
  imageUrl?: string;
}

export interface GenerationSettings {
  model: "ChatGPT Image" | "Gemini Image" | "Ocean 4.0" | "Custom Provider";
  aspectRatio: "1:1 Square" | "16:9 Landscape" | "9:16 Portrait" | "4:5 Social" | "A4 Portrait" | "A4 Landscape";
  style: string;
  quality: "Standard" | "High" | "Ultra";
  imageCount: 1 | 2 | 4;
  negativePrompt: string;
  brandColors: string;
  textLanguage: string;
  creativity: number;
  seed: string;
  addLogo: boolean;
  watermark: boolean;
  transparentBackground: boolean;
}

export interface UploadedReferenceImage {
  file: File;
  previewUrl: string;
}

export interface GenerateImagesInput {
  prompt: string;
  settings: GenerationSettings;
  referenceImage: UploadedReferenceImage | null;
}
