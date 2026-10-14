'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Timer,
  Music,
  Tv,
  Film,
  Settings,
  Maximize2,
  Minimize2,
  SplitSquareVertical,
} from 'lucide-react';
import { useTimerStore } from '@/lib/store/timerStore';
import { usePlayerStore } from '@/lib/store/playerStore';
import { msToTimeString } from '@/lib/transcript/parser';
import GlobalAudioPlayer from '@/components/player/GlobalAudioPlayer';
import BottomPlayerDock from '@/components/player/BottomPlayerDock';
import LanguageSelector from '@/components/common/LanguageSelector';
import { useLanguageStore } from '@/lib/store/languageStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguageStore();

  // Stores
  const {
    status: timerStatus,
    getRemainingMs,
    tick,
    isFocusModeActive,
    toggleFocusMode,
  } = useTimerStore();

  const { status: playerStatus, togglePlay } = usePlayerStore();

  const [remainingTimeDisplay, setRemainingTimeDisplay] = useState('25:00');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Monotonic wall-clock timer ticker
  useEffect(() => {
    const update = () => {
      tick();
      const ms = getRemainingMs();
      setRemainingTimeDisplay(msToTimeString(ms));
    };

    update();
    const interval = setInterval(update, 250);

    const handleVisibility = () => update();
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [tick, getRemainingMs]);

  // Fullscreen event listener to keep state in sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active && isFocusModeActive) {
        // If user pressed Esc and exited native fullscreen, gracefully sync focus mode
        toggleFocusMode(false);
      }
    };

    const handleFullscreenError = (err: Event) => {
      console.info('Native Fullscreen request rejected or unsupported:', err);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('fullscreenerror', handleFullscreenError);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('fullscreenerror', handleFullscreenError);
    };
  }, [isFocusModeActive, toggleFocusMode]);

  // Handle Focus Mode Toggle with Fullscreen API (debug.md §8)
  const handleToggleFocusMode = useCallback(
    async (activate: boolean) => {
      toggleFocusMode(activate);

      try {
        if (activate) {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen().catch(() => {});
          }
        } else {
          if (document.fullscreenElement && document.exitFullscreen) {
            await document.exitFullscreen().catch(() => {});
          }
        }
      } catch (err) {
        console.info('Fullscreen API not available in this environment, falling back to in-page layout');
      }
    },
    [toggleFocusMode]
  );

  // Global keyboard shortcuts (Space to toggle audio when not in editable elements, Esc to exit Focus Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl && activeEl.getAttribute('contenteditable') === 'true');

      if (e.key === ' ' && !isInput) {
        e.preventDefault();
        togglePlay();
      }

      if (e.key === 'Escape' && isFocusModeActive) {
        handleToggleFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, isFocusModeActive, handleToggleFocusMode]);

  const navItems = [
    {
      name: t('nav_focusx'),
      href: '/focusx',
      icon: Timer,
      badge: isMounted && timerStatus === 'running' ? remainingTimeDisplay : null,
      isActive: pathname.startsWith('/focusx'),
    },
    {
      name: t('nav_split_session'),
      href: '/focus-session',
      icon: SplitSquareVertical,
      badge: null,
      isActive: pathname.startsWith('/focus-session'),
    },
    {
      name: t('nav_vibrax'),
      href: '/vibrax',
      icon: Music,
      badge: isMounted && playerStatus === 'playing' ? t('player_playing') : null,
      isActive: pathname.startsWith('/vibrax'),
    },
    {
      name: t('nav_cinechill'),
      href: '/cinechill',
      icon: Film,
      badge: null,
      isActive: pathname.startsWith('/cinechill') || pathname.startsWith('/framewhisper'),
    },
    {
      name: t('nav_settings'),
      href: '/settings',
      icon: Settings,
      badge: null,
      isActive: pathname.startsWith('/settings'),
    },
  ];

  const showFocusMode = isMounted && isFocusModeActive;

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen flex flex-col bg-[#050505] text-[#f4f4f5] antialiased selection:bg-white selection:text-black"
    >
      {/* ===== GLOBAL AUTHORITATIVE MEDIA ENGINE ===== */}
      <GlobalAudioPlayer />

      {/* ===== GLOBAL HEADER NAVIGATION ===== */}
      {!showFocusMode && (
        <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-xl transition-all duration-200">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="group flex items-center gap-2.5 text-sm font-semibold tracking-wider transition-opacity hover:opacity-80"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-white text-black font-mono text-xs font-black">
                  M
                </div>
                <span className="font-mono text-xs tracking-widest text-zinc-100 uppercase">
                  MONOKURO
                </span>
                <span className="rounded border border-white/10 px-1 py-0.2 font-mono text-[9px] text-zinc-400">
                  STUDY
                </span>
              </Link>
            </div>

            {/* Navigation Switcher Pills */}
            <nav className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-mono tracking-wider transition-all duration-150 ${
                      item.isActive
                        ? 'liquid-pill text-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{item.name}</span>
                    {item.badge && (
                      <span className="ml-0.5 flex h-4 items-center rounded bg-white/10 px-1 text-[10px] font-mono text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Status / Language & Focus Trigger */}
            <div className="flex items-center gap-2">
              <LanguageSelector />

              <button
                onClick={() => handleToggleFocusMode(true)}
                title="Enter Distraction-Free Focus Mode with Fullscreen (Esc to exit)"
                aria-label="Enter Focus Mode"
                className="liquid-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white"
              >
                <Maximize2 className="h-3 w-3" />
                <span className="hidden sm:inline">{t('nav_focus_mode')}</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ===== DISTRACTION-FREE FOCUS MODE FLOATING EXIT BAR ===== */}
      {showFocusMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          <div className="liquid-pill flex items-center gap-3 rounded-full px-4 py-1.5 text-xs font-mono text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{t('nav_focus_mode')}</span>
            <span className="text-zinc-500">|</span>
            <span className="font-semibold text-white">{remainingTimeDisplay}</span>
            <button
              onClick={() => handleToggleFocusMode(false)}
              className="ml-2 flex items-center gap-1 text-zinc-400 hover:text-white"
              aria-label="Exit Focus Mode"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              <span>{t('nav_esc_exit')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT SURFACE (With pb-28 bottom margin for the fixed player dock) ===== */}
      <main className="flex-1 w-full flex flex-col pb-28">{children}</main>

      {/* ===== FIXED BOTTOM PLAYER DOCK (No liquid glass, z-index 9999) ===== */}
      <BottomPlayerDock />
    </div>
  );
}
