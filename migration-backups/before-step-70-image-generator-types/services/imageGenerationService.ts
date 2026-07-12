import type { GenerateImagesInput, GeneratedImage } from "../types/imageGenerator";

const palettes: Array<[string, string, string]> = [
  ["#100b08", "#c38734", "#3c160c"],
  ["#071d3f", "#f4a719", "#e9f2ff"],
  ["#09090b", "#c99a53", "#24242a"],
  ["#101114", "#d9b56e", "#33343a"],
];

export async function generateImages(input: GenerateImagesInput): Promise<GeneratedImage[]> {
  const response = await fetch("/api/image-generator/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: input.prompt, ...input.settings }),
  });
  const payload = await response.json() as {
    images?: Array<{ id: string; imageUrl?: string }>;
    error?: string;
  };
  if (!response.ok) throw new Error(payload.error || "Image generation failed.");
  return (payload.images || []).map((result, index) => ({
    id: result.id,
    title: input.prompt.split(/[,.]/)[0].slice(0, 34) || "Untitled design",
    prompt: input.prompt,
    createdAt: new Date().toISOString(),
    palette: palettes[index % palettes.length],
    status: "ready",
    favorite: false,
    imageUrl: result.imageUrl,
  }));
}
