import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "Bricks Maker Advertisement",
      generatePamphlet: "Generate Pamphlet",
      generateVideo: "Generate Video",
      generating: "Generating…",
    },
  },
  hi: {
    translation: {
      appName: "ब्रिक्स मेकर एडवरटाइजमेंट",
      generatePamphlet: "पैम्फलेट बनाएँ",
      generateVideo: "वीडियो बनाएँ",
      generating: "बनाया जा रहा है…",
    },
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("app.language") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem("app.language", language);
  document.documentElement.lang = language;
});

export default i18n;
