import { create } from "zustand";
import { translations } from "../locales/translations";

const STORAGE_KEY = "retinatrack_lang";

const getStoredLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ["en", "hi", "or", "hinglish"].includes(saved)) {
      return saved;
    }
  } catch (e) {
    console.error("Language storage error", e);
  }
  return "en";
};

export const availableLanguages = [
  { code: "en", label: "English", nativeName: "English" },
  { code: "hi", label: "Hindi", nativeName: "हिंदी" },
  { code: "or", label: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "hinglish", label: "Hinglish", nativeName: "Hinglish" },
];

const useLanguageStore = create((set, get) => ({
  language: getStoredLanguage(),

  setLanguage: (lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.error("Language storage error", e);
    }
    set({ language: lang });
  },

  t: (key) => {
    const currentLang = get().language || "en";
    const dict = translations[currentLang] || translations.en;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English
    return translations.en[key] || key;
  },
}));

export default useLanguageStore;
