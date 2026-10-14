'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  Minimize2,
  Music,
  Clock,
  Sparkles,
  Settings as SettingsIcon,
  ChevronRight,
} from 'lucide-react';
import { useTimerStore, TimerMode, FocusLayoutMode } from '@/lib/store/timerStore';
import { usePlayerStore } from '@/lib/store/playerStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { msToTimeString } from '@/lib/transcript/parser';
import { playCompletionChime, playSoftClick } from '@/lib/timer/audio';
import { listTimerSessions } from '@/lib/storage';
import { TimerSessionRecord } from '@/types';

export default function FocusXPage() {
  const { t } = useLanguageStore();
  const {
    mode,
    status,
    durationMs,
    getRemainingMs,
    setDurationMinutes,
    setMode,
    start,
    pause,
    resume,
    reset,
    focusLayout,
    setFocusLayout,
    isFocusModeActive,
    toggleFocusMode,
  } = useTimerStore();

  const {
    currentTrack,
    status: playerStatus,
    togglePlay,
    lyrics,
    progress: playerProgress,
  } = usePlayerStore();

  const isPlaying = playerStatus === 'playing';

  const [displayTime, setDisplayTime] = useState('25:00');
  const [progressPercent, setProgressPercent] = useState(0);
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [recentSessions, setRecentSessions] = useState<TimerSessionRecord[]>([]);

  // Update timer display
  useEffect(() => {
    const update = () => {
      const remaining = getRemainingMs();
      setDisplayTime(msToTimeString(remaining));

      if (durationMs > 0) {
        const elapsed = durationMs - remaining;
        const pct = Math.min(100, Math.max(0, (elapsed / durationMs) * 100));
        setProgressPercent(pct);
      }
    };

    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [getRemainingMs, durationMs, status]);

  // Load local sessions
  useEffect(() => {
    listTimerSessions(5).then(setRecentSessions).catch(console.error);
  }, [status]);

  const presets = [15, 30, 45, 60, 120];

  const handleStart = () => {
    playSoftClick();
    start();
  };

  const handlePause = () => {
    playSoftClick();
    pause();
  };

  const handleResume = () => {
    playSoftClick();
    resume();
  };

  const handleReset = () => {
    playSoftClick();
    reset();
  };

  const handleApplyCustomMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutesInput, 10);
    if (!isNaN(val) && val > 0 && val <= 240) {
      setDurationMinutes(val);
      setCustomModalOpen(false);
      setCustomMinutesInput('');
    }
  };

  // Find active lyric line for Karaoke Focus mode
  const activeLyric = lyrics.lines?.find(
    (l) => playerProgress >= l.time && playerProgress < (l.endTime || l.time + 3.5)
  );

  return (
    <div
      suppressHydrationWarning
      className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-8 transition-all duration-300 ${
        isFocusModeActive ? 'py-16' : ''
      }`}
    >
      <div suppressHydrationWarning className="w-full max-w-3xl flex flex-col items-center text-center space-y-8">
        {/* Module Header & Mode Switcher */}
        {!isFocusModeActive && (
          <div suppressHydrationWarning className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setMode('focus')}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all ${
                  mode === 'focus'
                    ? 'liquid-pill text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('focusx_focus_session')}
              </button>
              <button
                onClick={() => setMode('break')}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all ${
                  mode === 'break'
                    ? 'liquid-pill text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('focusx_short_break')}
              </button>
            </div>
          </div>
        )}

        {/* PRIMARY TIMER DISPLAY */}
        <div className="relative flex flex-col items-center justify-center py-6 sm:py-10">
          {/* Subtle Circular Progress Indicator / Ambient Aura */}
          <div className="relative flex items-center justify-center">
            <svg className="w-72 h-72 sm:w-88 sm:h-88 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-white/[0.05]"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-white transition-all duration-300"
                strokeWidth="2.5"
                strokeDasharray="282.74"
                strokeDashoffset={282.74 - (282.74 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl sm:text-7xl font-extralight tracking-tight text-white select-none">
                {displayTime}
              </span>
              <span className="mt-2 font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
                {status === 'running'
                  ? '● IN SESSION'
                  : status === 'paused'
                  ? '❚❚ PAUSED'
                  : status === 'completed'
                  ? '✓ COMPLETED'
                  : '○ STANDBY'}
              </span>
            </div>
          </div>
        </div>

        {/* TIMER CONTROLS */}
        <div className="flex items-center justify-center gap-4">
          {status === 'idle' && (
            <button
              onClick={handleStart}
              className="liquid-pill flex items-center gap-2 rounded-full px-8 py-3 text-sm font-mono tracking-wider text-white hover:border-white/40 shadow-xl"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{t('focusx_start')}</span>
            </button>
          )}

          {status === 'running' && (
            <button
              onClick={handlePause}
              className="liquid-pill flex items-center gap-2 rounded-full px-8 py-3 text-sm font-mono tracking-wider text-white hover:border-white/40 shadow-xl"
            >
              <Pause className="h-4 w-4 fill-white" />
              <span>{t('focusx_pause')}</span>
            </button>
          )}

          {status === 'paused' && (
            <button
              onClick={handleResume}
              className="liquid-pill flex items-center gap-2 rounded-full px-8 py-3 text-sm font-mono tracking-wider text-white hover:border-white/40 shadow-xl"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>{t('focusx_resume')}</span>
            </button>
          )}

          {(status === 'running' || status === 'paused' || status === 'completed') && (
            <button
              onClick={handleReset}
              title={t('focusx_reset')}
              className="liquid-pill flex items-center justify-center h-11 w-11 rounded-full text-zinc-400 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => playCompletionChime()}
            title="Preview Zen Completion Chime"
            className="liquid-pill flex items-center justify-center h-11 w-11 rounded-full text-zinc-400 hover:text-white"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>

        {/* PRESET SELECTORS (When in idle state) */}
        {!isFocusModeActive && status === 'idle' && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {presets.map((min) => {
              const ms = min * 60 * 1000;
              const isSelected = durationMs === ms;
              return (
                <button
                  key={min}
                  onClick={() => setDurationMinutes(min)}
                  className={`rounded-full px-3.5 py-1 text-xs font-mono tracking-wider transition-all ${
                    isSelected
                      ? 'liquid-pill text-white font-medium'
                      : 'border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {min}M
                </button>
              );
            })}
            <button
              onClick={() => setCustomModalOpen(true)}
              className="rounded-full border border-dashed border-white/15 px-3 py-1 text-xs font-mono text-zinc-400 hover:text-white hover:border-white/40 transition-colors"
            >
              + CUSTOM
            </button>
          </div>
        )}

        {/* FOCUS LAYOUT SELECTOR (Pure vs Music vs Karaoke vs Split) */}
        {!isFocusModeActive && (
          <div className="liquid-glass-card rounded-2xl p-4 w-full max-w-xl text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
                Focus Layout Mode
              </span>
              <div className="flex items-center gap-1">
                {(['pure', 'music', 'karaoke'] as FocusLayoutMode[]).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => setFocusLayout(layout)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase transition-all ${
                      focusLayout === layout
                        ? 'bg-white text-black font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
                <a
                  href="/focus-session"
                  className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase text-zinc-300 hover:text-white hover:border-white/30 transition-all flex items-center gap-1"
                >
                  <span>SPLIT 50:50 ↗</span>
                </a>
              </div>
            </div>

            {/* Layout Specific View */}
            {focusLayout === 'music' && currentTrack && (
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="h-9 w-9 rounded-lg object-cover border border-white/10"
                  />
                  <div>
                    <p className="text-xs font-medium text-white">{currentTrack.title}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">{currentTrack.artist}</p>
                  </div>
                </div>
                <button
                  onClick={togglePlay}
                  className="liquid-pill px-3 py-1 rounded-full text-xs font-mono text-white flex items-center gap-1.5"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>
              </div>
            )}

            {focusLayout === 'karaoke' && (
              <div className="border-t border-white/5 pt-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>LIVE SYNCED LYRICS</span>
                  <span>{currentTrack ? currentTrack.title : 'No track'}</span>
                </div>
                <div className="py-2 text-center">
                  <p className="text-sm sm:text-base font-semibold text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.7)] transition-all duration-200">
                    {activeLyric ? activeLyric.text : '♪ (Ambient Music Playing) ♪'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RECENT SESSIONS SUMMARY */}
        {!isFocusModeActive && recentSessions.length > 0 && (
          <div className="w-full max-w-xl text-left space-y-2 pt-4">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              Recent Local Sessions
            </p>
            <div className="divide-y divide-white/5 border-t border-b border-white/5 font-mono text-xs">
              {recentSessions.slice(0, 3).map((s) => (
                <div key={s.id} className="py-2 flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        s.status === 'completed' ? 'bg-emerald-400' : 'bg-zinc-600'
                      }`}
                    />
                    <span className="capitalize">{s.mode}</span> ({Math.round(s.durationMs / 60000)}m)
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CUSTOM DURATION MODAL */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="liquid-glass-card rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-mono font-medium text-white">SET CUSTOM DURATION</h3>
            <p className="text-xs text-zinc-400">
              Enter target focus session duration in minutes (1 to 240 minutes).
            </p>
            <form onSubmit={handleApplyCustomMinutes} className="space-y-4">
              <input
                type="number"
                min="1"
                max="240"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                placeholder="Minutes (e.g. 50)"
                autoFocus
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="liquid-pill px-4 py-1.5 rounded-full text-white"
                >
                  APPLY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
