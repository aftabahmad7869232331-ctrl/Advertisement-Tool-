// ============================================================
// useLanguage HOOK
// ============================================================

import { useCallback } from 'react';
import { useVideoStudioContext } from '../context/VideoStudioContext';
import { SUPPORTED_LANGUAGES, getLanguageByCode, RTL_LANGUAGES } from '../constants/languages';
import type { Language } from '../constants/languages';

export function useLanguage() {
  const { selectedLanguage, setSelectedLanguage } = useVideoStudioContext();

  const currentLanguage: Language =
    getLanguageByCode(selectedLanguage) ??
    SUPPORTED_LANGUAGES[0]!;

  const isRTL = RTL_LANGUAGES.includes(selectedLanguage);

  const changeLanguage = useCallback((code: string) => {
    const lang = getLanguageByCode(code);
    if (lang) setSelectedLanguage(code);
  }, [setSelectedLanguage]);

  return {
    selectedLanguage,
    currentLanguage,
    isRTL,
    languages: SUPPORTED_LANGUAGES,
    changeLanguage,
  };
}

