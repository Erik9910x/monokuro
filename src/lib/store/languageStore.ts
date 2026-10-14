import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LanguageCode, translations, TranslationKey } from '@/lib/i18n';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'vi',
      setLanguage: (lang: LanguageCode) => set({ language: lang }),
      t: (key: TranslationKey): string => {
        const lang = get().language;
        const dict = translations[lang] || translations.en;
        return (dict as any)[key] || (translations.en as any)[key] || key;
      },
    }),
    {
      name: 'monokuro_lang_v1',
    }
  )
);
