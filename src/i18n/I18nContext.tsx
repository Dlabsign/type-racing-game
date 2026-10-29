'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  SupportedLanguage,
  AnyLanguageCode,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  CORE_DICTIONARY,
  normalizeLanguageCode
} from './languages';
import { translateText } from '@/services/translationService';

interface I18nContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: AnyLanguageCode | string) => void;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
  translateDynamic: (text: string, sourceLang?: SupportedLanguage) => Promise<string>;
  isTranslating: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  let result = template;
  for (const [key, val] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
  }
  return result;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        const normalized = normalizeLanguageCode(stored);
        setCurrentLanguageState(normalized);
        document.documentElement.lang = normalized;
        document.documentElement.setAttribute('data-lang', normalized);
      } else {
        document.documentElement.lang = DEFAULT_LANGUAGE;
        document.documentElement.setAttribute('data-lang', DEFAULT_LANGUAGE);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const setLanguage = useCallback((rawLang: AnyLanguageCode | string) => {
    const lang = normalizeLanguageCode(rawLang);
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-lang', lang);
    } catch {}

    // Async DOM node scan for elements annotated with data-i18n
    if (typeof window !== 'undefined') {
      const nodes = document.querySelectorAll<HTMLElement>('[data-i18n]');
      if (nodes.length > 0) {
        setIsTranslating(true);
        nodes.forEach(async (el) => {
          const key = el.getAttribute('data-i18n');
          if (!key) return;

          // Check if key is in dictionary first
          const dictVal = CORE_DICTIONARY[lang]?.[key] || CORE_DICTIONARY.en?.[key];
          if (dictVal) {
            el.classList.add('transition-opacity', 'duration-200', 'opacity-0');
            setTimeout(() => {
              el.textContent = dictVal;
              el.classList.remove('opacity-0');
            }, 100);
            return;
          }

          // Otherwise translate original text
          const sourceText = el.getAttribute('data-original-text') || el.textContent || '';
          if (!el.getAttribute('data-original-text')) {
            el.setAttribute('data-original-text', sourceText);
          }
          const translated = await translateText(sourceText, lang, 'en');
          el.classList.add('transition-opacity', 'duration-200', 'opacity-0');
          setTimeout(() => {
            el.textContent = translated;
            el.classList.remove('opacity-0');
          }, 100);
        });
        setIsTranslating(false);
      }
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>): string => {
      const currentDict = CORE_DICTIONARY[currentLanguage];
      const enDict = CORE_DICTIONARY.en;

      // 1. Look up in current language dictionary
      let template = currentDict?.[key];

      // 2. Fall back to English dictionary
      if (!template && enDict) {
        template = enDict[key];
      }

      // 3. Fall back to supplied fallback text or key itself
      if (!template) {
        template = fallback || key;
      }

      return interpolate(template, params);
    },
    [currentLanguage]
  );

  const translateDynamic = useCallback(
    async (text: string, sourceLang: SupportedLanguage = 'en'): Promise<string> => {
      if (currentLanguage === sourceLang) return text;
      setIsTranslating(true);
      try {
        const result = await translateText(text, currentLanguage, sourceLang);
        return result;
      } finally {
        setIsTranslating(false);
      }
    },
    [currentLanguage]
  );

  const contextValue = useMemo(
    () => ({
      currentLanguage,
      setLanguage,
      t,
      translateDynamic,
      isTranslating
    }),
    [currentLanguage, setLanguage, t, translateDynamic, isTranslating]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Return fallback context if used outside provider (prevents crashes)
    return {
      currentLanguage: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      t: (key: string, fallback?: string, params?: Record<string, string | number>) => {
        const template = CORE_DICTIONARY.en?.[key] || fallback || key;
        return interpolate(template, params);
      },
      translateDynamic: async (text: string) => text,
      isTranslating: false
    };
  }
  return context;
}

