'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '@/lib/store/languageStore';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/i18n';

export default function LanguageSelector() {
  const { language, setLanguage, isHydrated } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const activeLang = isHydrated ? language : 'vi';
  const currentMeta = SUPPORTED_LANGUAGES.find((l) => l.code === activeLang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div suppressHydrationWarning className="relative" ref={dropdownRef}>
      <button
        suppressHydrationWarning
        onClick={() => setIsOpen(!isOpen)}
        className="liquid-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
        aria-label="Select Language"
        title="Select Language"
      >
        <Globe className="h-3.5 w-3.5 text-zinc-400" />
        <span suppressHydrationWarning>{currentMeta.flag}</span>
        <span suppressHydrationWarning className="hidden sm:inline uppercase">{currentMeta.code}</span>
        <ChevronDown className="h-3 w-3 text-zinc-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#09090b]/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 space-y-0.5">
          {SUPPORTED_LANGUAGES.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setLanguage(item.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-mono transition-colors ${
                item.code === language
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{item.flag}</span>
                <span>{item.nativeName}</span>
              </div>
              <span className="text-[10px] text-zinc-500 uppercase">{item.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
