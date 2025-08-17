import { zhTW } from './locales/zh-TW';
import { enUS } from './locales/en-US';
import { jaJP } from './locales/ja-JP';

export type Locale = 'zh-TW' | 'en-US' | 'ja-JP';

export const locales: Record<Locale, any> = {
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
};

export const localeNames: Record<Locale, string> = {
  'zh-TW': '繁體中文',
  'en-US': 'English',
  'ja-JP': '日本語',
};

export const defaultLocale: Locale = 'zh-TW';

export const supportedLocales: Locale[] = ['zh-TW', 'en-US', 'ja-JP'];

export function isValidLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

export function getLocale(locale?: string): Locale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }
  return defaultLocale;
}

export function getTranslations(locale: Locale) {
  return locales[locale] || locales[defaultLocale];
}
