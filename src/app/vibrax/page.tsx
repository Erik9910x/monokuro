'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Link as LinkIcon,
  ExternalLink,
  Music,
  Trash2,
  CheckCircle,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  Tv,
} from 'lucide-react';
import { usePlayerStore, PlayerTrack } from '@/lib/store/playerStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { saveMusicLink, listMusicLinks, deleteMusicLink } from '@/lib/storage';
import { SavedMusicLink } from '@/types';
import { msToTimeString } from '@/lib/transcript/parser';
import KaraokeLyricsView from '@/components/vibrax/KaraokeLyricsView';
import CatalogSearchPanel from '@/components/vibrax/CatalogSearchPanel';

export default function VibraXPage() {
  const { t } = useLanguageStore();
  const {
    currentTrack,
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
    lyrics,
    playTrack,
    playQueue,
    isPipVideoOpen,
    togglePipVideo,
  } = usePlayerStore();

  // Search & Import state
  const [urlInput, setUrlInput] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvingSavedId, setResolvingSavedId] = useState<string | null>(null);
  const [resolveResult, setResolveResult] = useState<any | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [savedLinks, setSavedLinks] = useState<SavedMusicLink[]>([]);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'search' | 'library' | 'import-result'>('search');

  // Load saved music links from IndexedDB
  useEffect(() => {
    listMusicLinks().then(setSavedLinks).catch(console.error);
  }, []);

  // Universal Playback Handler for any Saved Library Item (Song / Album)
  const handlePlaySavedLink = async (link: SavedMusicLink) => {
    // 1. If this saved item has cached album/playlist tracks (e.g. 15 tracks)
    if (link.tracks && link.tracks.length > 0) {
      playQueue(link.tracks, 0);
      return;
    }

    // 2. Direct YouTube video URL
    const ytMatch = link.sourceUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      playTrack({
        id: link.id,
        title: link.title || 'Saved YouTube Track',
        artist: link.artist || 'YouTube',
        album: link.album || 'Saved Library',
        duration: 180,
        coverUrl: link.coverUrl || `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
        audioUrl: '',
        youtubeId: ytMatch[1],
        externalUrl: link.sourceUrl,
        provider: 'youtube',
        capability: 'playable',
      });
      return;
    }

    // 3. Direct Preview Audio
    if (link.previewUrl) {
      playTrack({
        id: link.id,
        title: link.title || 'Saved Track',
        artist: link.artist || 'Unknown',
        album: link.album || 'Single',
        duration: 30,
        coverUrl: link.coverUrl || '',
        audioUrl: link.previewUrl,
        externalUrl: link.sourceUrl,
        provider: link.provider,
        capability: 'preview_only',
      });
      return;
    }

    // 4. Resolve via API dynamically to retrieve full album / playlist tracklist
    setResolvingSavedId(link.id);
    try {
      const res = await fetch(`/api/music/resolve?url=${encodeURIComponent(link.sourceUrl)}`);
      const data = await res.json();
      if (data.success && data.tracks && data.tracks.length > 0) {
        // Cache tracks on the saved link record for instant queue next time
        const updatedRecord = { ...link, tracks: data.tracks };
        saveMusicLink(updatedRecord).catch(console.error);
        setSavedLinks((prev) => prev.map((l) => (l.id === link.id ? updatedRecord : l)));

        // PLAY FULL ALBUM QUEUE (All 15 tracks, next/previous enabled)
        playQueue(data.tracks, 0);
        return;
      }
    } catch (err) {
      console.warn('Direct resolve for saved link failed:', err);
    } finally {
      setResolvingSavedId(null);
    }

    // 5. Fallback search by title
    if (link.title) {
      try {
        const query = `${link.title} ${link.artist || ''}`.trim();
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success && data.tracks && data.tracks.length > 0) {
          playTrack(data.tracks[0]);
          return;
        }
      } catch {}
    }

    // 6. Ultimate fallback
    playTrack({
      id: link.id,
      title: link.title || 'Saved Item',
      artist: link.artist || 'Unknown',
      album: link.album || 'Saved',
      duration: 180,
      coverUrl: link.coverUrl || '',
      audioUrl: '',
      externalUrl: link.sourceUrl,
      provider: link.provider,
      capability: 'playable',
    });
  };

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading' || status === 'buffering';

  // Handle URL Resolve & Import (debug.md §2)
  const handleResolveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsResolving(true);
    setResolveResult(null);
    setImportStatusMessage(null);

    try {
      const res = await fetch(`/api/music/resolve?url=${encodeURIComponent(urlInput.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setImportStatusMessage(data.error || 'Could not resolve media metadata.');
        return;
      }

      setResolveResult(data);
      setActiveTab('import-result');

      // Auto-save the link to IndexedDB
      const mainTrack = data.tracks?.[0];
      const savedLinkRecord: SavedMusicLink = {
        id: `link_${Date.now()}`,
        provider: data.provider,
        sourceUrl: data.externalUrl || urlInput.trim(),
        sourceType: data.sourceType || 'track',
        title: data.title || mainTrack?.title || 'Imported Music Item',
        artist: data.artist || mainTrack?.artist,
        album: data.album,
        coverUrl: data.artworkUrl || mainTrack?.coverUrl,
        previewUrl: mainTrack?.audioUrl || null,
        capability: mainTrack?.capability || 'open_external',
        tracks: data.tracks || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await saveMusicLink(savedLinkRecord);
      setSavedLinks((prev) => [savedLinkRecord, ...prev]);
      setUrlInput('');
      setImportStatusMessage(`Imported ${data.provider.toUpperCase()} (${data.tracks?.length || 1} tracks) successfully!`);
    } catch (err) {
      setImportStatusMessage('Network error communicating with link resolver.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleDeleteSavedLink = async (id: string) => {
    await deleteMusicLink(id);
    setSavedLinks((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* TOP HEADER: Module Title & URL Import */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              MODULE 02
            </span>
            <span className="text-zinc-600">/</span>
            <span className="font-mono text-xs text-zinc-300">VIBRAX</span>
          </div>
          <h1 className="text-2xl font-light font-mono text-white">{t('vibrax_title')}</h1>
        </div>

        {/* Universal Music Link Importer (debug.md §2) */}
        <form onSubmit={handleResolveUrl} className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t('vibrax_input_placeholder')}
              className="w-full rounded-full border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-white focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isResolving}
            className="liquid-pill px-5 py-2 rounded-full font-mono text-xs text-white shrink-0 flex items-center gap-1.5"
          >
            {isResolving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isResolving ? t('vibrax_btn_resolving') : t('vibrax_btn_import')}</span>
          </button>
        </form>
      </div>

      {importStatusMessage && (
        <div className="rounded-xl border border-white/20 bg-white/[0.04] p-3 text-xs font-mono text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{importStatusMessage}</span>
          </div>
          <button
            onClick={() => setImportStatusMessage(null)}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE: Player on Left, Lyrics / Search on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* LEFT COLUMN: ACTIVE TRACK & CONTROLS (5 cols) */}
        <div className="lg:col-span-5 liquid-glass-card rounded-2xl p-6 space-y-6">
          {/* Cover Art */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center shadow-lg">
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : currentTrack?.youtubeId ? (
              <img
                src={`https://img.youtube.com/vi/${currentTrack.youtubeId}/hqdefault.jpg`}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="h-16 w-16 text-zinc-700" />
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white truncate">
                  {currentTrack?.title || 'No Track Selected'}
                </h2>
                {currentTrack && (
                  <span className="shrink-0 rounded border border-white/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-zinc-300">
                    {currentTrack.provider}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate mt-1 font-mono">
                {currentTrack?.artist || 'Unknown Artist'} · <span className="text-zinc-500">{currentTrack?.album}</span>
              </p>
            </div>
            {currentTrack?.externalUrl && currentTrack.externalUrl !== '#' && (
              <a
                href={currentTrack.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open on ${currentTrack.provider.toUpperCase()}`}
                className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Playback Capability Badge */}
          {currentTrack && (
            <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Capability:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">
                  {currentTrack.youtubeId
                    ? '● Full Track (YouTube)'
                    : currentTrack.capability === 'playable'
                    ? '● In-App Playable'
                    : currentTrack.capability === 'preview_only'
                    ? '● 30s Audio Preview'
                    : '↗ Open in Provider App'}
                </span>
                {currentTrack.youtubeId && (
                  <button
                    onClick={togglePipVideo}
                    title={isPipVideoOpen ? 'Hide Video' : 'Open Video Window (PIP)'}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <Tv className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scrub Bar & Timers */}
          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max={duration > 0 ? duration : 100}
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
              <span>{msToTimeString(progress * 1000)}</span>
              <span>{msToTimeString(duration * 1000)}</span>
            </div>
          </div>

          {/* Player Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleRepeat}
              title={
                repeatMode === 'one'
                  ? 'Replay 1 bài liên tục (Đang bật)'
                  : repeatMode === 'all'
                  ? 'Lặp lại danh sách (Bấm để bật Replay 1 bài)'
                  : 'Không lặp lại'
              }
              className={`p-2 transition-colors relative ${
                repeatMode === 'one'
                  ? 'text-emerald-400 font-bold'
                  : repeatMode !== 'off'
                  ? 'text-white'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              {repeatMode === 'one' && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={previous}
              title={progress > 1 ? 'Replay bài này từ 0:00' : 'Bài trước đó'}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={togglePlay}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-black" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 fill-black" />
              ) : (
                <Play className="h-5 w-5 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              title="Next Track"
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            <button
              onClick={toggleLyricsMode}
              title={`Karaoke Lyrics Glow Mode: ${lyricsMode}`}
              className={`p-2 rounded font-mono text-[10px] border transition-colors ${
                lyricsMode === 'word'
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/10 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {lyricsMode.toUpperCase()}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="font-mono text-[10px] text-zinc-500 w-8 text-right">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: LYRICS, SEARCH, IMPORT RESULTS, SAVED (7 cols) */}
        <div className="lg:col-span-7 liquid-glass-card rounded-2xl flex flex-col h-[600px] overflow-hidden">
          {/* Sub-Tabs Switcher */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'search'
                    ? 'liquid-pill text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🎵</span>
                <span>{t('vibrax_tab_search')}</span>
              </button>
              <button
                onClick={() => setActiveTab('lyrics')}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'lyrics'
                    ? 'liquid-pill text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🎤</span>
                <span>{t('vibrax_tab_lyrics')}</span>
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs tracking-wider transition-all flex items-center gap-1.5 ${
                  activeTab === 'library'
                    ? 'liquid-pill text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>💾</span>
                <span>{t('vibrax_tab_library')}</span>
                <span className="text-[10px] opacity-75">({savedLinks.length})</span>
              </button>
              {resolveResult && (
                <button
                  onClick={() => setActiveTab('import-result')}
                  className={`px-3.5 py-1.5 rounded-full font-mono text-xs tracking-wider transition-all flex items-center gap-1.5 ${
                    activeTab === 'import-result'
                      ? 'liquid-pill text-emerald-300 border-emerald-500/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>📥</span>
                  <span>{t('vibrax_tab_import_result')}</span>
                  <span className="text-[10px] opacity-75">({resolveResult.tracks?.length || 1})</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: SYNCED LYRICS WITH GLOW (debug.md §5) */}
          {activeTab === 'lyrics' && (
            <KaraokeLyricsView
              lyrics={lyrics}
              progress={progress}
              lyricsMode={lyricsMode}
              onSeek={seek}
            />
          )}

          {/* TAB 2: CATALOG SEARCH WITH RECENT SEARCHES (debug.md §6) */}
          {activeTab === 'search' && <CatalogSearchPanel />}

          {/* TAB 3: IMPORT RESULT INSPECTION & PLAYBACK (debug.md §2) */}
          {activeTab === 'import-result' && resolveResult && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                {resolveResult.artworkUrl ? (
                  <img
                    src={resolveResult.artworkUrl}
                    alt={resolveResult.title}
                    className="h-16 w-16 rounded-lg object-cover border border-white/15"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Music className="h-8 w-8 text-zinc-600" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase rounded border border-white/20 px-1.5 py-0.5 text-zinc-300">
                      {resolveResult.provider}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {resolveResult.sourceType}
                    </span>
                    {resolveResult.tracks?.length > 1 && (
                      <span className="font-mono text-[10px] text-zinc-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                        {resolveResult.tracks.length} BÀI
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">
                    {resolveResult.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono truncate">
                    {resolveResult.artist}
                  </p>
                  {resolveResult.tracks?.length > 0 && (
                    <div className="mt-2.5">
                      <button
                        onClick={() => playQueue(resolveResult.tracks, 0)}
                        className="liquid-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
                      >
                        <Play className="h-3 w-3 fill-white" />
                        <span>CHƠI TOÀN BỘ ALBUM ({resolveResult.tracks.length} BÀI)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                    Danh Sách Bài Hát ({resolveResult.tracks?.length || 0} bài)
                  </p>
                </div>
                {resolveResult.tracks?.map((track: PlayerTrack, index: number) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isPlayingThis = isCurrent && status === 'playing';

                  return (
                    <div
                      key={track.id || index}
                      onClick={() => playQueue(resolveResult.tracks, index)}
                      className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-white/30 bg-white/[0.08] shadow-sm'
                          : 'border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <span className="font-mono text-xs text-zinc-500 w-5 text-right shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-medium truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                              {track.title}
                            </p>
                            {isPlayingThis && (
                              <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                <Volume2 className="h-3 w-3 animate-pulse" />
                                <span>PLAYING</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 font-mono truncate">{track.artist}</p>
                          <span className="font-mono text-[10px] text-zinc-500 mt-0.5 inline-block">
                            {track.capability === 'preview_only'
                              ? '● Playable 30s Preview'
                              : track.capability === 'playable'
                              ? '● In-App Playable'
                              : '↗ Open in Provider'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playQueue(resolveResult.tracks, index);
                          }}
                          className="liquid-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs text-white shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          <Play className="h-3 w-3 fill-white" />
                          <span>PLAY</span>
                        </button>
                        {track.externalUrl && (
                          <a
                            href={track.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-white"
                            title="Open in provider"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SAVED LIBRARY */}
          {activeTab === 'library' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {savedLinks.length > 0 ? (
                savedLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] text-left hover:border-white/15 transition-all"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] uppercase rounded border border-white/15 px-1.5 py-0.5 text-zinc-300">
                          {link.provider}
                        </span>
                        {link.tracks && link.tracks.length > 1 && (
                          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            ALBUM ({link.tracks.length} BÀI)
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-zinc-500">
                          {link.capability === 'preview_only'
                            ? '● Preview Available'
                            : link.capability === 'playable'
                            ? '● Playable Here'
                            : '↗ Open in Provider'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white truncate">{link.title}</p>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">
                        {link.sourceUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handlePlaySavedLink(link)}
                        disabled={resolvingSavedId === link.id}
                        className="liquid-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs text-white shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        title={t('vibrax_play_saved')}
                      >
                        {resolvingSavedId === link.id ? (
                          <Loader2 className="h-3 w-3 animate-spin text-white" />
                        ) : (
                          <Play className="h-3 w-3 fill-white" />
                        )}
                        <span>{t('vibrax_play_saved')}</span>
                      </button>
                      <a
                        href={link.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white transition-colors"
                        title="Open Source Link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteSavedLink(link.id)}
                        className="p-1.5 rounded-lg border border-white/10 text-zinc-500 hover:text-rose-400 transition-colors"
                        title={t('vibrax_delete_saved')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center font-mono text-xs text-zinc-500 space-y-2">
                  <p>{t('vibrax_saved_empty')}</p>
                  <p className="text-[11px] text-zinc-600">
                    Paste any link at the top to bookmark and categorize it.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
