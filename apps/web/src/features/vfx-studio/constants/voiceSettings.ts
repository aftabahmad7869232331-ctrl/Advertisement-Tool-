// ============================================================
// VOICE SETTINGS & DEFAULTS
// ============================================================

import type { Voice, VoiceSettings, VoiceStyle, VoiceGender } from '../types/voice.types';

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceId: 'en-US-Standard-A',
  speed: 1.0,
  pitch: 0,
  volume: 1.0,
  stability: 0.75,
  clarity: 0.75,
  style: 0.5,
};

export const VOICE_SPEED_OPTIONS = [
  { value: 0.5,  label: '0.5x (Very Slow)' },
  { value: 0.75, label: '0.75x (Slow)' },
  { value: 1.0,  label: '1.0x (Normal)' },
  { value: 1.25, label: '1.25x (Fast)' },
  { value: 1.5,  label: '1.5x (Faster)' },
  { value: 2.0,  label: '2.0x (Very Fast)' },
];

export const VOICE_STYLES: { value: VoiceStyle; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Clear, formal tone for business content' },
  { value: 'casual',       label: 'Casual',       description: 'Relaxed, conversational tone' },
  { value: 'energetic',    label: 'Energetic',    description: 'High energy for ads and promos' },
  { value: 'calm',         label: 'Calm',         description: 'Soothing tone for meditation/wellness' },
  { value: 'dramatic',     label: 'Dramatic',     description: 'Expressive for storytelling' },
  { value: 'friendly',     label: 'Friendly',     description: 'Warm and approachable tone' },
];

// ----------------------------------------------------------
// VOICE GENERATION FOR ALL 30 LANGUAGES
// ----------------------------------------------------------
// Pehle sirf 6 languages (en, hi, es, fr, de, ja) ke liye hardcoded
// voices the — baaki languages select karne par voice list khaali
// reh jaati thi ya purani (English) voice stale select rehti thi.
// Ab Google Cloud TTS standard naming convention follow karke har
// voice-supported language ke liye ek male + ek female voice
// generate karte hain, taaki language change karte hi sahi-language
// voices turant available ho.
// ----------------------------------------------------------
import { SUPPORTED_LANGUAGES } from './languages';

// BCP-47 region tag har language ke liye (Google TTS locale format,
// e.g. hi -> hi-IN, zh -> cmn-CN). Voice id isi se banta hai.
const TTS_LOCALE: Record<string, string> = {
  en: 'en-US', hi: 'hi-IN', zh: 'cmn-CN', es: 'es-ES', ar: 'ar-XA',
  fr: 'fr-FR', ru: 'ru-RU', pt: 'pt-BR', de: 'de-DE', ja: 'ja-JP',
  ko: 'ko-KR', it: 'it-IT', tr: 'tr-TR', pl: 'pl-PL', nl: 'nl-NL',
  sv: 'sv-SE', no: 'nb-NO', da: 'da-DK', el: 'el-GR', id: 'id-ID',
  th: 'th-TH', vi: 'vi-VN',
};

// Har language ke liye ek local-sounding male/female naam (UI me
// dikhega), taaki sirf "Voice 1 / Voice 2" jaisa generic na lage.
const VOICE_NAMES: Record<string, [string, string]> = {
  en: ['Alex', 'Sarah'], hi: ['Rahul', 'Priya'], zh: ['Wei', 'Mei'],
  es: ['Carlos', 'Isabella'], ar: ['Omar', 'Layla'], fr: ['Louis', 'Sophie'],
  ru: ['Dmitri', 'Anastasia'], pt: ['João', 'Camila'], de: ['Klaus', 'Greta'],
  ja: ['Haruto', 'Yuki'], ko: ['Minjun', 'Jiwoo'], it: ['Marco', 'Giulia'],
  tr: ['Emir', 'Elif'], pl: ['Jakub', 'Zofia'], nl: ['Daan', 'Eva'],
  sv: ['Erik', 'Astrid'], no: ['Lars', 'Ingrid'], da: ['Mads', 'Freja'],
  el: ['Nikos', 'Eleni'], id: ['Budi', 'Sari'], th: ['Somchai', 'Suda'],
  vi: ['Minh', 'Linh'],
};

function buildVoicesForLanguage(code: string, languageName: string): Voice[] {
  const locale = TTS_LOCALE[code] ?? `${code}-${code.toUpperCase()}`;
  const [maleName, femaleName] = VOICE_NAMES[code] ?? ['Voice A', 'Voice B'];
  return [
    {
      id: `${locale}-Standard-A`, name: maleName, gender: 'male',
      style: 'professional', language: languageName, languageCode: locale,
      provider: 'google', isPremium: false, tags: [code, 'standard'],
    },
    {
      id: `${locale}-Standard-B`, name: femaleName, gender: 'female',
      style: 'friendly', language: languageName, languageCode: locale,
      provider: 'google', isPremium: false, tags: [code, 'standard'],
    },
    {
      id: `${locale}-Neural-A`, name: `${femaleName} (Neural)`, gender: 'female',
      style: 'professional', language: languageName, languageCode: locale,
      provider: 'google', isPremium: true, tags: [code, 'neural', 'premium'],
    },
  ];
}

export const SAMPLE_VOICES: Voice[] = SUPPORTED_LANGUAGES
  .filter(l => l.voiceSupported)
  .flatMap(l => buildVoicesForLanguage(l.code, l.name));

export function getVoicesForLanguage(code: string): Voice[] {
  const locale = TTS_LOCALE[code];
  if (!locale) return [];
  return SAMPLE_VOICES.filter(v => v.languageCode === locale);
}

export const PREVIEW_TEXT_SAMPLES: Record<string, string> = {
  en: 'Welcome to the Video Studio. Create stunning videos with AI-powered voice generation.',
  hi: 'वीडियो स्टूडियो में आपका स्वागत है। AI की मदद से शानदार वीडियो बनाएं।',
  zh: '欢迎来到视频工作室。使用 AI 语音生成功能制作精美的视频。',
  es: 'Bienvenido al Video Studio. Crea videos impresionantes con voz generada por IA.',
  ar: 'مرحباً بكم في استوديو الفيديو. أنشئ مقاطع فيديو رائعة بالصوت المولّد بالذكاء الاصطناعي.',
  fr: 'Bienvenue dans le Video Studio. Créez des vidéos époustouflantes avec la voix IA.',
  ru: 'Добро пожаловать в Video Studio. Создавайте потрясающие видео с озвучкой на основе ИИ.',
  pt: 'Bem-vindo ao Video Studio. Crie vídeos incríveis com vozes geradas por IA.',
  de: 'Willkommen im Video Studio. Erstellen Sie beeindruckende Videos mit KI-Stimme.',
  ja: 'ビデオスタジオへようこそ。AI音声で素晴らしいビデオを作成しましょう。',
  ko: '비디오 스튜디오에 오신 것을 환영합니다. AI 음성으로 멋진 비디오를 만들어보세요.',
  it: 'Benvenuto in Video Studio. Crea video straordinari con voci generate dall\'IA.',
  tr: "Video Studio'ya hoş geldiniz. Yapay zeka destekli sesle harika videolar oluşturun.",
  pl: 'Witamy w Video Studio. Twórz oszałamiające filmy z głosem generowanym przez SI.',
  nl: 'Welkom bij Video Studio. Maak prachtige video\'s met AI-gegenereerde stem.',
  sv: 'Välkommen till Video Studio. Skapa fantastiska videor med AI-genererad röst.',
  no: 'Velkommen til Video Studio. Lag fantastiske videoer med AI-generert stemme.',
  da: 'Velkommen til Video Studio. Skab fantastiske videoer med AI-genereret stemme.',
  el: 'Καλώς ήρθατε στο Video Studio. Δημιουργήστε εκπληκτικά βίντεο με φωνή AI.',
  id: 'Selamat datang di Video Studio. Buat video menakjubkan dengan suara hasil AI.',
  th: 'ยินดีต้อนรับสู่ Video Studio สร้างวิดีโอที่น่าทึ่งด้วยเสียงที่สร้างจาก AI',
  vi: 'Chào mừng đến với Video Studio. Tạo video tuyệt đẹp với giọng nói do AI tạo ra.',
  // Niche languages jinke liye voice support nahi hai (caption-only) —
  // text yahan rakha hai taaki future me voice add karna easy ho.
  fi: 'Tervetuloa Video Studioon. Luo upeita videoita tekoälyn äänellä.',
  cs: 'Vítejte ve Video Studiu. Vytvářejte úžasná videa s hlasem generovaným AI.',
  ro: 'Bine ați venit la Video Studio. Creați videoclipuri uimitoare cu voce generată de AI.',
  hu: 'Üdvözlünk a Video Studióban. Készíts lenyűgöző videókat AI által generált hanggal.',
  uk: 'Ласкаво просимо до Video Studio. Створюйте чудові відео з голосом, згенерованим ШІ.',
  ms: 'Selamat datang ke Video Studio. Cipta video menakjubkan dengan suara janaan AI.',
  fa: 'به استودیوی ویدیو خوش آمدید. ویدیوهای خیره‌کننده با صدای تولید شده توسط هوش مصنوعی بسازید.',
  ur: 'ویڈیو اسٹوڈیو میں خوش آمدید۔ AI سے تیار کردہ آواز کے ساتھ شاندار ویڈیوز بنائیں۔',
};
