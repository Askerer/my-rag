'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, getLocale, getTranslations } from './config';
import { Translations } from './locales/zh-TW';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

const LOCALE_STORAGE_KEY = 'preferred-locale';

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化語言設定
  useEffect(() => {
    const initializeLocale = () => {
      // 1. 嘗試從 localStorage 讀取保存的語言偏好
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (savedLocale) {
        setLocaleState(getLocale(savedLocale));
        setIsLoading(false);
        return;
      }

      // 2. 嘗試從瀏覽器語言檢測
      const browserLocale = navigator.language;
      const detectedLocale = detectLocaleFromBrowser(browserLocale);
      setLocaleState(detectedLocale);
      setIsLoading(false);
    };

    initializeLocale();
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    
    // 可選：更新 document.documentElement.lang
    document.documentElement.lang = newLocale;
  };

  const t = getTranslations(locale);

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    isLoading,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// 從瀏覽器語言檢測語言偏好
function detectLocaleFromBrowser(browserLocale: string): Locale {
  // 精確匹配
  if (browserLocale === 'zh-TW' || browserLocale === 'zh-Hant') {
    return 'zh-TW';
  }
  if (browserLocale === 'en-US') {
    return 'en-US';
  }
  if (browserLocale === 'ja-JP' || browserLocale === 'ja') {
    return 'ja-JP';
  }

  // 語言族群匹配
  const languageCode = browserLocale.split('-')[0];
  switch (languageCode) {
    case 'zh':
      // 中文默認使用繁體中文
      return 'zh-TW';
    case 'en':
      return 'en-US';
    case 'ja':
      return 'ja-JP';
    default:
      return defaultLocale;
  }
}

// 便利的翻譯函數，支援插值
export function useTranslation() {
  const { t } = useI18n();

  const translate = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: any = t;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // 返回 key 本身作為 fallback
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // 處理插值
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  return { t: translate };
}
