// ============================================================
// 30 SUPPORTED LANGUAGES
// ============================================================

export interface Language {
  code: string;          // BCP-47 language code
  name: string;          // English name
  nativeName: string;    // Name in native script
  rtl: boolean;          // Right-to-left
  voiceSupported: boolean;
  captionSupported: boolean;
  flag: string;          // emoji flag
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English',    nativeName: 'English',    rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',       rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese',    nativeName: '中文',         rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇨🇳' },
  { code: 'es', name: 'Spanish',    nativeName: 'Español',     rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic',     nativeName: 'العربية',     rtl: true,  voiceSupported: true,  captionSupported: true,  flag: '🇸🇦' },
  { code: 'fr', name: 'French',     nativeName: 'Français',    rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇫🇷' },
  { code: 'ru', name: 'Russian',    nativeName: 'Русский',     rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português',   rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇧🇷' },
  { code: 'de', name: 'German',     nativeName: 'Deutsch',     rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese',   nativeName: '日本語',       rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇯🇵' },
  { code: 'ko', name: 'Korean',     nativeName: '한국어',       rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇰🇷' },
  { code: 'it', name: 'Italian',    nativeName: 'Italiano',    rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish',    nativeName: 'Türkçe',      rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇹🇷' },
  { code: 'pl', name: 'Polish',     nativeName: 'Polski',      rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch',      nativeName: 'Nederlands',  rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish',    nativeName: 'Svenska',     rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian',  nativeName: 'Norsk',       rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇳🇴' },
  { code: 'da', name: 'Danish',     nativeName: 'Dansk',       rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish',    nativeName: 'Suomi',       rtl: false, voiceSupported: false, captionSupported: true,  flag: '🇫🇮' },
  { code: 'el', name: 'Greek',      nativeName: 'Ελληνικά',    rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇬🇷' },
  { code: 'cs', name: 'Czech',      nativeName: 'Čeština',     rtl: false, voiceSupported: false, captionSupported: true,  flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian',   nativeName: 'Română',      rtl: false, voiceSupported: false, captionSupported: true,  flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian',  nativeName: 'Magyar',      rtl: false, voiceSupported: false, captionSupported: true,  flag: '🇭🇺' },
  { code: 'uk', name: 'Ukrainian',  nativeName: 'Українська',  rtl: false, voiceSupported: false, captionSupported: true,  flag: '🇺🇦' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', rtl: false, voiceSupported: true, captionSupported: true, flag: '🇮🇩' },
  { code: 'ms', name: 'Malay',      nativeName: 'Bahasa Melayu',    rtl: false, voiceSupported: false, captionSupported: true, flag: '🇲🇾' },
  { code: 'th', name: 'Thai',       nativeName: 'ภาษาไทย',    rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt',  rtl: false, voiceSupported: true,  captionSupported: true,  flag: '🇻🇳' },
  { code: 'fa', name: 'Persian',    nativeName: 'فارسی',       rtl: true,  voiceSupported: false, captionSupported: true,  flag: '🇮🇷' },
  { code: 'ur', name: 'Urdu',       nativeName: 'اردو',        rtl: true,  voiceSupported: false, captionSupported: true,  flag: '🇵🇰' },
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0]; // English

export const getLanguageByCode = (code: string): Language | undefined =>
  SUPPORTED_LANGUAGES.find(l => l.code === code);

export const getVoiceSupportedLanguages = (): Language[] =>
  SUPPORTED_LANGUAGES.filter(l => l.voiceSupported);

export const getCaptionSupportedLanguages = (): Language[] =>
  SUPPORTED_LANGUAGES.filter(l => l.captionSupported);

export const RTL_LANGUAGES = SUPPORTED_LANGUAGES.filter(l => l.rtl).map(l => l.code);
