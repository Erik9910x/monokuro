'use client';

import React from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  ExternalLink,
  Music,
  Loader2,
  AlertCircle,
  FileText,
  Tv,
  SplitSquareVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePlayerStore } from '@/lib/store/playerStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { msToTimeString } from '@/lib/transcript/parser';

export default function BottomPlayerDock() {
  const { t } = useLanguageStore();
  const {
    currentTrack,
    queue,
    queueIndex,
    status,
    errorMessage,
    progress,
    duration,
    togglePlay,
    next,
    previous,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    repeatMode,
    toggleRepeat,
    lyricsMode,
    toggleLyricsMode,
    isPipVideoOpen,
    togglePipVideo,
  } = usePlayerStore();

  const [isMounted, setIsMounted] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !currentTrack) return null;

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading' || status === 'buffering';
  const isRestricted = status === 'requires-provider-player' || currentTrack.capability === 'open_external';

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  return (
    <>
      <footer
        aria-label="Fixed Audio Player Dock"
        className={`fixed bottom-0 left-0 right-0 z-[9999] w-full border-t border-white/10 bg-[#09090b] text-[#f4f4f5] shadow-[0_-8px_30px_rgba(0,0,0,0.85)] transition-all duration-300 select-none ${
          isCollapsed ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
      {/* Optional Error/Warning Notice Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2 truncate">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          {currentTrack.externalUrl && (
            <a
              href={currentTrack.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[11px] shrink-0 hover:text-white"
            >
              Open on {currentTrack.provider.toUpperCase()} ↗
            </a>
          )}
        </div>
      )}

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 gap-4">
        {/* LEFT SECTION: TRACK INFO (3 cols) */}
        <div className="flex items-center gap-3.5 min-w-0 w-1/4 sm:w-1/3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-900">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-500">
                <Music className="h-5 w-5" />
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-xs sm:text-sm font-medium text-white">{currentTrack.title}</p>
              <span className="shrink-0 rounded border border-white/15 px-1 py-0.2 font-mono text-[9px] uppercase text-zinc-400">
                {currentTrack.provider}
              </span>
              {queue && queue.length > 1 && (
                <span className="shrink-0 rounded border border-emerald-500/30 bg-emerald-500/10 px-1 py-0.2 font-mono text-[9px] text-emerald-400">
                  {queueIndex + 1}/{queue.length}
                </span>
              )}
            </div>
            <p className="truncate text-[11px] sm:text-xs text-zinc-400 font-mono mt-0.5">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* CENTER SECTION: SCRUBBER & PLAYBACK CONTROLS (6 cols) */}
        <div className="flex flex-1 flex-col items-center justify-center max-w-xl">
          {/* Primary Controls */}
          <div className="flex items-center gap-4 sm:gap-6 mb-1.5">
            <button
              onClick={toggleRepeat}
              title={
                repeatMode === 'one'
                  ? 'Replay 1 bài liên tục (Đang bật)'
                  : repeatMode === 'all'
                  ? 'Lặp lại danh sách (Bấm để bật Replay 1 bài)'
                  : 'Không lặp lại'
              }
              aria-label={`Repeat mode: ${repeatMode}`}
              className={`p-1.5 transition-colors relative ${
                repeatMode === 'one'
                  ? 'text-emerald-400 font-bold'
                  : repeatMode === 'all'
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              {repeatMode === 'one' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={previous}
              title={progress > 1 ? 'Replay bài này từ 0:00' : 'Bài trước đó'}
              aria-label="Previous Track or Replay"
              className={`p-1 transition-colors ${
                queue.length > 1 || progress > 1 ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-black hover:bg-zinc-200 transition-transform active:scale-95 shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-black" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 fill-black" />
              ) : (
                <Play className="h-4 w-4 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              title="Next Track"
              aria-label="Next Track"
              className={`p-1 transition-colors ${
                queue.length > 1 ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={toggleLyricsMode}
              title={`Karaoke lyrics mode: ${lyricsMode}`}
              aria-label={`Karaoke lyrics mode: ${lyricsMode}`}
              className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase transition-colors ${
                lyricsMode === 'word'
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {lyricsMode}
            </button>
          </div>

          {/* Scrub Timeline */}
          <div className="flex w-full items-center gap-2.5 font-mono text-[10px] sm:text-[11px] text-zinc-500">
            <span className="w-9 text-right">{msToTimeString(progress * 1000)}</span>
            <input
              type="range"
              min="0"
              max={duration > 0 ? duration : 100}
              value={progress}
              onChange={handleSeekChange}
              aria-label="Audio scrubber"
              className="h-1 flex-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/30 transition-colors"
            />
            <span className="w-9 text-left">{msToTimeString(duration * 1000)}</span>
          </div>
        </div>

        {/* RIGHT SECTION: VOLUME & SECONDARY ACTIONS (3 cols) */}
        <div className="flex items-center justify-end gap-3 w-1/4 sm:w-1/3">
          {/* External Link fallback if restricted */}
          {currentTrack.externalUrl && (
            <a
              href={currentTrack.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Open on ${currentTrack.provider.toUpperCase()}`}
              aria-label={`Open on ${currentTrack.provider.toUpperCase()}`}
              className="hidden md:flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
            >
              <span>{currentTrack.provider.toUpperCase()}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {/* Volume Slider */}
          <div className="hidden sm:flex items-center gap-2 w-28">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseInt(e.target.value, 10))}
              aria-label="Volume slider"
              className="h-1 w-full bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Video PIP Toggle Button */}
          <button
            onClick={togglePipVideo}
            title={t('player_video_pip')}
            aria-label={t('player_video_pip')}
            className={`rounded-md border p-1.5 transition-colors ${
              isPipVideoOpen
                ? 'border-white bg-white/10 text-white'
                : 'border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
            }`}
          >
            <Tv className="h-4 w-4" />
          </button>

          {/* Chia đôi SPLIT SESSION (Concurrent Workspace) */}
          <Link
            href="/focus-session"
            className="rounded-md border border-white/10 p-1.5 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
            title="Chia đôi SPLIT SESSION (Học tập & Nghe nhạc)"
            aria-label="Chia đôi SPLIT SESSION"
          >
            <SplitSquareVertical className="h-4 w-4" />
          </Link>

          {/* Open full VibraX page */}
          <Link
            href="/vibrax"
            className="rounded-md border border-white/10 p-1.5 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
            title={t('player_expand_vibrax')}
            aria-label={t('player_expand_vibrax')}
          >
            <FileText className="h-4 w-4" />
          </Link>

          {/* Hide / Collapse Player Dock */}
          <button
            onClick={() => setIsCollapsed(true)}
            title={t('player_hide_dock')}
            aria-label={t('player_hide_dock')}
            className="rounded-md border border-white/10 p-1.5 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>

    {/* Floating Mini Player Pill when Collapsed */}
    {isCollapsed && (
      <div
        role="region"
        aria-label="Floating Mini Audio Controller"
        className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2.5 sm:gap-3 rounded-full border border-white/15 bg-[#09090b]/95 px-3 py-2 sm:px-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 select-none"
      >
        {/* Mini Track Cover */}
        <div className="relative h-7 w-7 rounded-full overflow-hidden border border-white/20 shrink-0 bg-zinc-900">
          {currentTrack.coverUrl ? (
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`h-full w-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              <Music className="h-3.5 w-3.5" />
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Mini Track Title & Status */}
        <div className="max-w-[110px] sm:max-w-[160px] min-w-0">
          <p className="truncate text-xs font-medium text-white">{currentTrack.title}</p>
          <p className="truncate text-[10px] text-zinc-400 font-mono">
            {isPlaying ? `${msToTimeString(progress * 1000)} / ${msToTimeString(duration * 1000)}` : currentTrack.artist}
          </p>
        </div>

        {/* Mini Play / Pause */}
        <button
          onClick={togglePlay}
          title={isPlaying ? 'Pause' : 'Play'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-zinc-200 transition-transform active:scale-95 shrink-0 shadow-sm"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
          ) : isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-black" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-black ml-0.5" />
          )}
        </button>

        {/* Expand / Show Dock Button */}
        <button
          onClick={() => setIsCollapsed(false)}
          title={t('player_show_dock')}
          aria-label={t('player_show_dock')}
          className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white hover:border-white/30 transition-colors shrink-0"
        >
          <ChevronUp className="h-3.5 w-3.5" />
          <span className="hidden sm:inline font-mono tracking-wider uppercase text-[10px]">{t('player_show_dock')}</span>
        </button>
      </div>
    )}
  </>
);
}
