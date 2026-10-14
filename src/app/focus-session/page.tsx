'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Maximize2,
  Music,
  Timer,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  FileText,
} from 'lucide-react';
import { useTimerStore } from '@/lib/store/timerStore';
import { usePlayerStore } from '@/lib/store/playerStore';
import { msToTimeString } from '@/lib/transcript/parser';
import { playCompletionChime, playSoftClick } from '@/lib/timer/audio';
import KaraokeLyricsView from '@/components/vibrax/KaraokeLyricsView';

export default function FocusSessionPage() {
  // FocusX Timer Store
  const {
    mode: timerMode,
    status: timerStatus,
    durationMs: timerDurationMs,
    getRemainingMs,
    setDurationMinutes,
    setMode: setTimerMode,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    reset: resetTimer,
  } = useTimerStore();

  // VibraX Player Store
  const {
    currentTrack,
    status: playerStatus,
    progress: playerProgress,
    duration: playerDuration,
    togglePlay,
    next: nextTrack,
    previous: previousTrack,
    seek: seekTrack,
    repeatMode,
    toggleRepeat,
    lyricsMode,
    toggleLyricsMode,
    lyrics,
  } = usePlayerStore();

  const [displayTime, setDisplayTime] = useState('25:00');
  const [progressPercent, setProgressPercent] = useState(0);
  const [mobileTab, setMobileTab] = useState<'timer' | 'music'>('timer');

  // Timer ticker
  useEffect(() => {
    const update = () => {
      const remaining = getRemainingMs();
      setDisplayTime(msToTimeString(remaining));

      if (timerDurationMs > 0) {
        const elapsed = timerDurationMs - remaining;
        const pct = Math.min(100, Math.max(0, (elapsed / timerDurationMs) * 100));
        setProgressPercent(pct);
      }
    };

    update();
    const interval = setInterval(update, 250);
    return () => clearInterval(interval);
  }, [getRemainingMs, timerDurationMs, timerStatus]);

  const presets = [15, 25, 45, 60];
  const isPlaying = playerStatus === 'playing';

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Session Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              CONCURRENT WORKSPACE
            </span>
            <span className="text-zinc-600">/</span>
            <span className="font-mono text-xs text-zinc-300">SPLIT FOCUS SESSION</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-light font-mono text-white">
            Timer & Music Co-Work
          </h1>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden items-center gap-1 rounded-full border border-white/10 p-1 bg-white/[0.03]">
          <button
            onClick={() => setMobileTab('timer')}
            className={`px-4 py-1 rounded-full font-mono text-xs tracking-wider transition-all ${
              mobileTab === 'timer' ? 'bg-white text-black font-semibold' : 'text-zinc-400'
            }`}
          >
            FOCUSX
          </button>
          <button
            onClick={() => setMobileTab('music')}
            className={`px-4 py-1 rounded-full font-mono text-xs tracking-wider transition-all ${
              mobileTab === 'music' ? 'bg-white text-black font-semibold' : 'text-zinc-400'
            }`}
          >
            VIBRAX
          </button>
        </div>
      </div>

      {/* 50:50 SPLIT PANELS CONTAINER (debug.md §7) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch flex-1">
        {/* LEFT PANEL: FOCUSX TIMER (50% on desktop) */}
        <div
          className={`liquid-glass-card rounded-2xl p-6 flex flex-col items-center justify-between space-y-6 ${
            mobileTab !== 'timer' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 w-full justify-between border-b border-white/5 pb-3">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>Interval State</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTimerMode('focus')}
                className={`px-3 py-1 rounded-full font-mono text-xs transition-all ${
                  timerMode === 'focus' ? 'liquid-pill text-white font-medium' : 'text-zinc-400'
                }`}
              >
                FOCUS
              </button>
              <button
                onClick={() => setTimerMode('break')}
                className={`px-3 py-1 rounded-full font-mono text-xs transition-all ${
                  timerMode === 'break' ? 'liquid-pill text-white font-medium' : 'text-zinc-400'
                }`}
              >
                BREAK
              </button>
            </div>
          </div>

          {/* Circular Timer Visualizer */}
          <div className="relative flex items-center justify-center py-4">
            <svg className="w-56 h-56 sm:w-64 sm:h-64 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-white/[0.05]"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-white transition-all duration-300"
                strokeWidth="3"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-4xl sm:text-5xl font-light tracking-tight text-white select-none">
                {displayTime}
              </span>
              <span className="mt-1 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                {timerStatus === 'running'
                  ? '● RUNNING'
                  : timerStatus === 'paused'
                  ? '❚❚ PAUSED'
                  : timerStatus === 'completed'
                  ? '✓ COMPLETED'
                  : '○ STANDBY'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4">
            {timerStatus === 'idle' && (
              <button
                onClick={() => {
                  playSoftClick();
                  startTimer();
                }}
                className="liquid-pill flex items-center gap-2 rounded-full px-7 py-2.5 font-mono text-xs text-white"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>START</span>
              </button>
            )}

            {timerStatus === 'running' && (
              <button
                onClick={() => {
                  playSoftClick();
                  pauseTimer();
                }}
                className="liquid-pill flex items-center gap-2 rounded-full px-7 py-2.5 font-mono text-xs text-white"
              >
                <Pause className="h-3.5 w-3.5 fill-white" />
                <span>PAUSE</span>
              </button>
            )}

            {timerStatus === 'paused' && (
              <button
                onClick={() => {
                  playSoftClick();
                  resumeTimer();
                }}
                className="liquid-pill flex items-center gap-2 rounded-full px-7 py-2.5 font-mono text-xs text-white"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>RESUME</span>
              </button>
            )}

            {(timerStatus === 'running' || timerStatus === 'paused' || timerStatus === 'completed') && (
              <button
                onClick={() => {
                  playSoftClick();
                  resetTimer();
                }}
                className="liquid-pill h-9 w-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"
                title="Reset timer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={() => playCompletionChime()}
              className="liquid-pill h-9 w-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"
              title="Test Zen completion chime"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/5 w-full justify-center">
            {presets.map((min) => (
              <button
                key={min}
                onClick={() => setDurationMinutes(min)}
                className={`rounded-full px-3 py-1 font-mono text-xs transition-all ${
                  timerDurationMs === min * 60 * 1000
                    ? 'liquid-pill text-white font-medium'
                    : 'border border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {min}M
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: VIBRAX PLAYER & GLOWING LYRICS (50% on desktop) */}
        <div
          className={`liquid-glass-card rounded-2xl p-6 flex flex-col justify-between space-y-4 h-[560px] overflow-hidden ${
            mobileTab !== 'music' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Header Track Info */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              {currentTrack?.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  <Music className="h-4 w-4 text-zinc-500" />
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className="text-xs sm:text-sm font-medium text-white truncate">
                  {currentTrack?.title || 'No Track Playing'}
                </p>
                <p className="text-[11px] text-zinc-400 font-mono truncate">
                  {currentTrack?.artist || 'Ambient Stream'}
                </p>
              </div>
            </div>

            {/* Lyrics Mode Toggle */}
            <button
              onClick={toggleLyricsMode}
              className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase transition-colors shrink-0 ${
                lyricsMode === 'word'
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              GLOW: {lyricsMode}
            </button>
          </div>

          {/* Karaoke Lyrics Area with Glowing Text Treatment (debug.md §5) */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <KaraokeLyricsView
              lyrics={lyrics}
              progress={playerProgress}
              lyricsMode={lyricsMode}
              onSeek={seekTrack}
              className="py-4"
            />
          </div>

          {/* Compact Mini Controls in Split Panel */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-3">
              <button
                onClick={previousTrack}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Previous track"
              >
                <SkipBack className="h-4 w-4" />
              </button>
              <button
                onClick={togglePlay}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-zinc-200 transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 fill-black" /> : <Play className="h-3.5 w-3.5 fill-black ml-0.5" />}
              </button>
              <button
                onClick={nextTrack}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Next track"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <div className="font-mono text-[11px] text-zinc-500">
              <span>{msToTimeString(playerProgress * 1000)}</span>
              <span> / </span>
              <span>{msToTimeString(playerDuration * 1000)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
