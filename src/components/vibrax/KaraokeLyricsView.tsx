'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { ParsedLyricLine } from '@/lib/lyrics';
import { FileText, Loader2 } from 'lucide-react';

interface KaraokeLyricsViewProps {
  lyrics: {
    loading: boolean;
    plain: string | null;
    synced: string | null;
    lines: ParsedLyricLine[];
    error: string | null;
  };
  progress: number;
  lyricsMode: 'line' | 'word';
  onSeek: (seconds: number) => void;
  className?: string;
}

export default function KaraokeLyricsView({
  lyrics,
  progress,
  lyricsMode,
  onSeek,
  className = '',
}: KaraokeLyricsViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Compute active line index
  const activeIndex = useMemo(() => {
    if (!lyrics.lines || lyrics.lines.length === 0) return -1;
    for (let i = lyrics.lines.length - 1; i >= 0; i--) {
      if (progress >= lyrics.lines[i].time - 0.2) {
        return i;
      }
    }
    return 0;
  }, [lyrics.lines, progress]);

  // Smooth auto-scroll active lyric line to center
  useEffect(() => {
    if (activeIndex >= 0 && containerRef.current) {
      const activeEl = containerRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (lyrics.loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center font-mono text-xs text-zinc-500 gap-2 animate-pulse">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        <span>SYNCHRONIZING LYRICS STREAM...</span>
      </div>
    );
  }

  if (lyrics.lines && lyrics.lines.length > 0) {
    return (
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto px-4 py-8 space-y-6 text-center select-none ${className}`}
      >
        {lyrics.lines.map((line, idx) => {
          const isActive = idx === activeIndex;

          return (
            <div
              key={`lyric_${line.time}_${idx}`}
              data-index={idx}
              data-active={isActive}
              onClick={() => onSeek(line.time)}
              className={`cursor-pointer transition-all duration-200 py-1.5 px-3 rounded-lg ${
                isActive
                  ? 'text-white font-semibold text-lg sm:text-2xl scale-102 drop-shadow-[0_0_18px_rgba(255,255,255,0.7)]'
                  : 'text-zinc-600 hover:text-zinc-400 text-sm sm:text-base opacity-75 hover:opacity-100'
              }`}
            >
              {lyricsMode === 'word' && line.words && isActive ? (
                <span className="inline-flex flex-wrap justify-center gap-1.5">
                  {line.words.map((w, wIdx) => {
                    const isWordActive = progress >= w.startTime && progress <= w.endTime;
                    return (
                      <span
                        key={`word_${wIdx}_${w.startTime}`}
                        className={`transition-all duration-100 ${
                          isWordActive
                            ? 'text-white font-bold drop-shadow-[0_0_24px_rgba(255,255,255,0.95)] underline decoration-white/50'
                            : 'text-zinc-200'
                        }`}
                      >
                        {w.text}
                      </span>
                    );
                  })}
                </span>
              ) : (
                <span>{line.text}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (lyrics.plain) {
    return (
      <div className="flex-1 overflow-y-auto p-6 whitespace-pre-line text-sm text-zinc-300 font-normal leading-relaxed text-center">
        {lyrics.plain}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center font-mono text-xs text-zinc-500 space-y-2 p-6 text-center">
      <FileText className="h-8 w-8 text-zinc-700" />
      <p>NO SYNCHRONIZED LYRICS FOUND</p>
      <p className="text-[11px] text-zinc-600 max-w-xs">
        {lyrics.error || 'Import an Apple Music, Spotify, or YouTube track to load synced LRC lyrics.'}
      </p>
    </div>
  );
}
