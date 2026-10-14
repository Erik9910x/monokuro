import { create } from 'zustand';
import { LanguageCode, translations, TranslationKey } from '@/lib/i18n';

interface LanguageState {
  language: LanguageCode;
  isHydrated: boolean;
  setLanguage: (lang: LanguageCode) => void;
  initLanguage: () => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'vi',
  isHydrated: false,
  setLanguage: (lang: LanguageCode) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'monokuro_lang_v1',
          JSON.stringify({ state: { language: lang }, version: 0 })
        );
      }
    } catch {}
    set({ language: lang, isHydrated: true });
  },
  initLanguage: () => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('monokuro_lang_v1');
        if (raw) {
          let lang: LanguageCode | null = null;
          try {
            const parsed = JSON.parse(raw);
            if (typeof parsed === 'string') lang = parsed as LanguageCode;
            else if (parsed?.state?.language) lang = parsed.state.language;
          } catch {
            lang = raw as LanguageCode;
          }
          if (lang && (translations as any)[lang]) {
            set({ language: lang, isHydrated: true });
            return;
          }
        }
      }
    } catch {}
    set({ isHydrated: true });
  },
  t: (key: TranslationKey): string => {
    const { language, isHydrated } = get();
    // Guarantee 100% deterministic SSR and initial client hydration match!
    const lang = isHydrated ? language : 'vi';
    const dict = (translations as any)[lang] || translations.vi;
    return dict[key] || (translations.vi as any)[key] || key;
  },
}));
