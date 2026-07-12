import { useCallback, useState } from "react";

export interface GeminiSuggestion {
  headline?: string;
  subheading?: string;
  description?: string;
  services?: string;
  offer?: string;
  imagePrompt?: string;
}

interface SuggestionInput {
  businessName: string;
  campaignObjective: string;
  theme: string;
}

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestAdCopy = useCallback(async (input: SuggestionInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/suggest-ad-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gemini request failed.");
      }
      return data as GeminiSuggestion;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Gemini request failed.";
      setError(message);
      throw cause;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { suggestAdCopy, isLoading, error };
}
