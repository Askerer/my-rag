'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useI18n } from '../lib/i18n/context';
import { Locale, localeNames, supportedLocales } from '../lib/i18n/config';

interface LanguageSelectorProps {
  variant?: 'header' | 'settings';
  className?: string;
}

export default function LanguageSelector({ variant = 'header', className = '' }: LanguageSelectorProps) {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉下拉選單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  const buttonClass = variant === 'header' 
    ? `inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors ${className}`
    : `flex items-center justify-between w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`;

  const dropdownClass = variant === 'header'
    ? 'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50'
    : 'absolute left-0 mt-1 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClass}
        aria-label="選擇語言"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 mr-2" />
        <span className={variant === 'header' ? 'hidden sm:inline' : ''}>
          {localeNames[locale]}
        </span>
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={dropdownClass}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            {supportedLocales.map((supportedLocale) => (
              <button
                key={supportedLocale}
                onClick={() => handleLocaleChange(supportedLocale)}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  locale === supportedLocale ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3" role="img" aria-label="flag">
                    {getLocaleFlag(supportedLocale)}
                  </span>
                  <span>{localeNames[supportedLocale]}</span>
                </div>
                {locale === supportedLocale && (
                  <Check className="w-4 h-4 text-purple-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 獲取語言對應的 emoji 旗幟
function getLocaleFlag(locale: Locale): string {
  const flags: Record<Locale, string> = {
    'zh-TW': '🇹🇼',
    'en-US': '🇺🇸',
    'ja-JP': '🇯🇵',
  };
  return flags[locale] || '🌐';
}
