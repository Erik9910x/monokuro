'use client';

import React from 'react';
import Link from 'next/link';
import { Timer, Music, Tv, Film, SplitSquareVertical, ArrowRight, HardDrive } from 'lucide-react';
import { useTimerStore } from '@/lib/store/timerStore';
import { usePlayerStore } from '@/lib/store/playerStore';

export default function HomePage() {
  const { status: timerStatus } = useTimerStore();
  const { status: playerStatus } = usePlayerStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isPlaying = playerStatus === 'playing';

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Ambient Monochrome Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl w-full text-center space-y-10">
        {/* Title & Philosophy */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>LOCAL-FIRST · ZERO-ACCOUNT · PRIVATE BY DESIGN</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-white font-mono">
            MONO<span className="font-semibold text-zinc-300">KURO</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
            A quiet, distraction-free environment uniting deep work intervals, ambient study music,
            and cinema chill rewards.
          </p>
        </div>

        {/* Primary Workflow Gateway Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* FOCUSX Card */}
          <Link
            href="/focusx"
            className="group liquid-glass-card rounded-2xl p-5 transition-all duration-200 hover:border-white/25 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white group-hover:bg-white group-hover:text-black transition-colors">
                <Timer className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                MOD 01
              </span>
            </div>
            <h2 className="text-base font-mono font-medium text-white mb-2 flex items-center gap-2">
              FOCUSX
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-300" />
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Monotonic wall-clock timer, customizable intervals, distraction-free Focus Mode, and
              Zen chime.
            </p>
            <div className="font-mono text-[11px] text-zinc-500 flex items-center gap-2">
              <span>{isMounted && timerStatus === 'running' ? '● RUNNING' : '○ IDLE'}</span>
            </div>
          </Link>

          {/* SPLIT FOCUS SESSION Card (NEW) */}
          <Link
            href="/focus-session"
            className="group liquid-glass-card rounded-2xl p-5 transition-all duration-200 hover:border-white/25 hover:-translate-y-1 border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black group-hover:bg-zinc-200 transition-colors shadow-sm">
                <SplitSquareVertical className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">
                CO-WORK
              </span>
            </div>
            <h2 className="text-base font-mono font-medium text-white mb-2 flex items-center gap-2">
              SPLIT SESSION
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-300" />
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Concurrent 50:50 workspace combining FocusX timer and VibraX glowing lyrics side by
              side.
            </p>
            <div className="font-mono text-[11px] text-zinc-400 flex items-center gap-2">
              <span>● CONCURRENT</span>
            </div>
          </Link>

          {/* VIBRAX Card */}
          <Link
            href="/vibrax"
            className="group liquid-glass-card rounded-2xl p-5 transition-all duration-200 hover:border-white/25 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white group-hover:bg-white group-hover:text-black transition-colors">
                <Music className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                MOD 02
              </span>
            </div>
            <h2 className="text-base font-mono font-medium text-white mb-2 flex items-center gap-2">
              VIBRAX
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-300" />
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Integrated ambient player with LRCLIB synced lyrics glow, universal link importer, and
              search.
            </p>
            <div className="font-mono text-[11px] text-zinc-500 flex items-center gap-2">
              <span>{isMounted && isPlaying ? '● PLAYING' : '○ READY'}</span>
            </div>
          </Link>

          {/* CINECHILL Card */}
          <Link
            href="/cinechill"
            className="group liquid-glass-card rounded-2xl p-5 transition-all duration-200 hover:border-white/25 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white group-hover:bg-white group-hover:text-black transition-colors">
                <Film className="h-5 w-5" />
              </div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                MOD 03
              </span>
            </div>
            <h2 className="text-base font-mono font-medium text-white mb-2 flex items-center gap-2">
              CINECHILL
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-300" />
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Minimalist cinema reward theater unlocked after 30 minutes of study. In-app chill &amp; Netflix Pop-out.
            </p>
            <div className="font-mono text-[11px] text-zinc-500 flex items-center gap-2">
              <span>● THEATER</span>
            </div>
          </Link>
        </div>

        {/* Local-First Principles Banner */}
        <div className="liquid-pill rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400 text-left">
          <div className="flex items-center gap-3">
            <HardDrive className="h-5 w-5 text-white shrink-0" />
            <div>
              <p className="font-semibold text-white">Browser-Stored Privacy</p>
              <p className="text-[11px] text-zinc-400">
                All notes, bookmarks, and sessions persist in browser IndexedDB. No login or cloud
                database.
              </p>
            </div>
          </div>
          <Link
            href="/settings"
            className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Manage Data & Backups →
          </Link>
        </div>
      </div>
    </div>
  );
}
