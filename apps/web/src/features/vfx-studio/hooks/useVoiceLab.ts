// ============================================================
// useVoiceLab HOOK
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { useVideoStudioContext } from '../context/VideoStudioContext';
import { voiceGenerationService } from '../services/voiceGeneration.service';
import { SAMPLE_VOICES, PREVIEW_TEXT_SAMPLES } from '../constants/voiceSettings';
import type { Voice, VoiceSettings, ClonedVoice } from '../types/voice.types';

function clonedToVoice(cv: ClonedVoice): Voice {
  return {
    id: cv.providerVoiceId,
    name: `🎙️ ${cv.name}`,
    gender: 'neutral',
    style: 'casual',
    language: 'Cloned',
    languageCode: '',       // koi bhi language ke saath match ho jaaye
    provider: cv.provider as Voice['provider'],
    isPremium: false,
    tags: ['cloned'],
  };
}

export function useVoiceLab() {
  const { voiceLabState, updateVoiceLab, selectedLanguage } = useVideoStudioContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [voices, setVoices] = useState<Voice[]>(SAMPLE_VOICES);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [cloning, setCloning] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const prevLanguageRef = useRef(selectedLanguage);

  const refreshClonedVoices = useCallback(async () => {
    try {
      const list = await voiceGenerationService.listClonedVoices();
      setClonedVoices(list);
    } catch {
      // Silent — ELEVENLABS_API_KEY configure nahi hoga to yeh list khaali rahegi
    }
  }, []);

  useEffect(() => { refreshClonedVoices(); }, [refreshClonedVoices]);

  const cloneVoice = useCallback(async (name: string, sampleFiles: File[]) => {
    setCloning(true); setCloneError(null);
    try {
      await voiceGenerationService.cloneVoice(name, sampleFiles);
      await refreshClonedVoices();
    } catch (err) {
      setCloneError(err instanceof Error ? err.message : 'Voice cloning failed.');
    } finally {
      setCloning(false);
    }
  }, [refreshClonedVoices]);

  const deleteClonedVoice = useCallback(async (id: string) => {
    await voiceGenerationService.deleteClonedVoice(id);
    await refreshClonedVoices();
  }, [refreshClonedVoices]);

  useEffect(() => {
    const filtered = SAMPLE_VOICES.filter(v =>
      v.languageCode.toLowerCase().startsWith(selectedLanguage.toLowerCase())
    );
    const languageChanged = prevLanguageRef.current !== selectedLanguage;
    const fallback = SAMPLE_VOICES.filter(v => v.languageCode.startsWith('en'));
    const baseVoices = filtered.length > 0 ? filtered : fallback;
    // Cloned voices kisi bhi language ke saath kaam karte hain (ElevenLabs
    // multilingual model), isliye ye har language filter mein dikhte hain.
    const nextVoices = [...baseVoices, ...clonedVoices.map(clonedToVoice)];
    setVoices(nextVoices);

    // BUG FIX: pehle selectedLanguage badalne par voiceLabState.selectedVoice
    // purani language ka hi reh jaata tha (e.g. English voice selected rehta
    // tha jab tak Hindi pick ki gayi) — isliye "Preview Voice" dabane par
    // galat-language audio generate hota tha (voice id aur language mismatch).
    // Ab language change hote hi nayi language ka pehla voice auto-select
    // hota hai, aur preview text bhi us language ke default dialogue par
    // reset ho jaata hai (jab tak user ne khud kuch type na kiya ho).
    if (languageChanged) {
      const stillValid = voiceLabState.selectedVoice
        ? nextVoices.some(v => v.id === voiceLabState.selectedVoice!.id)
        : false;

      if (!stillValid) {
        updateVoiceLab({
          selectedVoice: nextVoices[0] ?? null,
          previewText: '',
          generatedAudioUrl: null,
          error: null,
        });
      }
      prevLanguageRef.current = selectedLanguage;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, clonedVoices]);

  const selectVoice = useCallback((voice: Voice) => {
    updateVoiceLab({ selectedVoice: voice });
  }, [updateVoiceLab]);

  const updateSettings = useCallback((settings: Partial<VoiceSettings>) => {
    updateVoiceLab({ settings: { ...voiceLabState.settings, ...settings } });
  }, [voiceLabState.settings, updateVoiceLab]);

  const preview = useCallback(async () => {
    if (!voiceLabState.selectedVoice) return;
    const text =
      voiceLabState.previewText ||
      PREVIEW_TEXT_SAMPLES[selectedLanguage] ||
      PREVIEW_TEXT_SAMPLES['en'] ||
      'Preview voice sample';
    updateVoiceLab({ isGenerating: true, error: null });
    try {
      // BUG FIX: pehle yahan context ka 2-letter `selectedLanguage` (e.g. "hi")
      // bheja jaata tha, jabki TTS provider ko poora locale chahiye (e.g.
      // "hi-IN") jo selected voice ke saath match kare. Mismatch hone par
      // provider error deta tha ya galat accent/language bol deta tha.
      const audioUrl = await voiceGenerationService.previewVoice(
        voiceLabState.selectedVoice.id, text, voiceLabState.selectedVoice.languageCode
      );
      updateVoiceLab({ generatedAudioUrl: audioUrl, isGenerating: false });
      playAudio(audioUrl);
    } catch (err) {
      updateVoiceLab({ error: 'Preview failed. Please try again.', isGenerating: false });
    }
  }, [voiceLabState, selectedLanguage, updateVoiceLab]);

  const playAudio = useCallback((url: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onplay  = () => updateVoiceLab({ isPlaying: true });
    audio.onended = () => updateVoiceLab({ isPlaying: false });
    audio.onerror = () => updateVoiceLab({ isPlaying: false });
    audio.play();
  }, [updateVoiceLab]);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    updateVoiceLab({ isPlaying: false });
  }, [updateVoiceLab]);

  return {
    ...voiceLabState,
    voices,
    selectVoice,
    updateSettings,
    preview,
    stopAudio,
    setPreviewText: (text: string) => updateVoiceLab({ previewText: text }),
    // AI Voice Cloning
    clonedVoices,
    cloning,
    cloneError,
    cloneVoice,
    deleteClonedVoice,
  };
}

