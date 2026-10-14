'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Clock, Volume2, Link as LinkIcon, Sparkles } from 'lucide-react';
import { usePlayerStore, PlayerTrack, CURATED_STUDY_TRACKS } from '@/lib/store/playerStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { msToTimeString } from '@/lib/transcript/parser';
import { saveMusicLink } from '@/lib/storage';
import { SavedMusicLink } from '@/types';

const RECENT_SEARCHES_KEY = 'monokuro_recent_searches_v1';
const MAX_RECENT = 12;

type VibeGenre = 'all' | 'lofi' | 'piano' | 'classical' | 'ambient' | 'nature';

export default function CatalogSearchPanel() {
  const { playTrack, playQueue, currentTrack, status } = usePlayerStore();
  const { t } = useLanguageStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<VibeGenre>('all');
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveRecentSearches = (items: string[]) => {
    setRecentSearches(items);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items));
    } catch {}
  };

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const filtered = recentSearches.filter(
      (q) => q.toLowerCase() !== trimmed.toLowerCase()
    );
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
    saveRecentSearches(updated);
  };

  const removeRecentSearch = (queryToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(
      (q) => q.toLowerCase() !== queryToRemove.toLowerCase()
    );
    saveRecentSearches(updated);
  };

  const clearAllRecentSearches = () => {
    saveRecentSearches([]);
  };

  const isLink = /https?:\/\/|spotify\.com|soundcloud\.com|youtube\.com|youtu\.be|apple\.com/.test(searchQuery.trim());

  const executeSearchOrImport = async (queryToRun: string) => {
    const q = queryToRun.trim();
    if (!q) return;

    setIsSearching(true);
    setImportNotification(null);

    // If query is a URL, resolve via link resolver
    if (/https?:\/\/|spotify\.com|soundcloud\.com|youtube\.com|youtu\.be|apple\.com/.test(q)) {
      try {
        const res = await fetch(`/api/music/resolve?url=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.success && data.tracks && data.tracks.length > 0) {
          setSearchResults(data.tracks);
          playQueue(data.tracks, 0);
          addRecentSearch(data.title || q);
          setImportNotification(`✓ ${data.provider.toUpperCase()} (${data.tracks.length} tracks) ready`);

          // Auto-save to local library
          const main = data.tracks[0];
          const record: SavedMusicLink = {
            id: `link_${Date.now()}`,
            provider: data.provider,
            sourceUrl: data.externalUrl || q,
            sourceType: data.sourceType || 'track',
            title: data.title || main.title,
            artist: data.artist || main.artist,
            coverUrl: data.artworkUrl || main.coverUrl,
            previewUrl: main.audioUrl,
            capability: main.capability || 'playable',
            tracks: data.tracks,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          saveMusicLink(record).catch(console.error);
        } else {
          setImportNotification(data.error || 'Could not resolve URL metadata');
        }
      } catch (err) {
        setImportNotification('Error communicating with resolver');
      } finally {
        setIsSearching(false);
      }
      return;
    }

    // Otherwise, text catalog search
    addRecentSearch(q);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(q)}&limit=25`);
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Search request failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearchOrImport(searchQuery);
  };

  const handleSelectRecent = (q: string) => {
    setSearchQuery(q);
    executeSearchOrImport(q);
  };

  const displayedCurated = selectedGenre === 'all'
    ? CURATED_STUDY_TRACKS
    : CURATED_STUDY_TRACKS.filter((t) => t.genre === selectedGenre);

  return (
    <div suppressHydrationWarning className="flex-1 flex flex-col p-4 overflow-hidden space-y-3.5">
      {/* 1. MUSIC APP SMART SEARCH BOX */}
      <form onSubmit={handleFormSubmit} className="relative flex gap-2 items-center">
        <div className="relative flex-1">
          {isLink ? (
            <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
          ) : (
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          )}
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsInputFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('vibrax_search_placeholder')}
            className={`w-full rounded-xl border bg-white/[0.03] pl-10 pr-9 py-2.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-all ${
              isLink
                ? 'border-emerald-500/40 focus:border-emerald-400'
                : 'border-white/10 focus:border-white'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setImportNotification(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-white"
              title="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isSearching || !searchQuery.trim()}
          className="liquid-pill px-4 sm:px-5 py-2.5 rounded-xl font-mono text-xs text-white shrink-0 flex items-center gap-1.5 transition-all shadow-sm"
        >
          {isSearching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isLink ? (
            <LinkIcon className="h-3.5 w-3.5" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
          <span>
            {isSearching
              ? t('vibrax_searching_btn')
              : isLink
              ? t('vibrax_btn_import')
              : t('vibrax_search_btn')}
          </span>
        </button>
      </form>

      {/* IMPORT NOTIFICATION NOTICE */}
      {importNotification && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
          <span>{importNotification}</span>
          <button onClick={() => setImportNotification(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. OPTION PILLS / VIBE GENRE SWITCHER (Just like modern music apps) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setSelectedGenre('all');
            setSearchResults([]);
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all shrink-0 ${
            selectedGenre === 'all' && searchResults.length === 0
              ? 'liquid-pill text-white font-medium shadow-sm'
              : 'border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
          }`}
        >
          {t('vibrax_opt_all')}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedGenre('lofi');
            setSearchResults([]);
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all shrink-0 ${
            selectedGenre === 'lofi' && searchResults.length === 0
              ? 'liquid-pill text-white font-medium shadow-sm'
              : 'border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
          }`}
        >
          {t('vibrax_opt_lofi')}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedGenre('piano');
            setSearchResults([]);
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all shrink-0 ${
            selectedGenre === 'piano' && searchResults.length === 0
              ? 'liquid-pill text-white font-medium shadow-sm'
              : 'border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
          }`}
        >
          {t('vibrax_opt_piano')}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedGenre('classical');
            setSearchResults([]);
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all shrink-0 ${
            selectedGenre === 'classical' && searchResults.length === 0
              ? 'liquid-pill text-white font-medium shadow-sm'
              : 'border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
          }`}
        >
          {t('vibrax_opt_classical')}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedGenre('ambient');
            setSearchResults([]);
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all shrink-0 ${
            selectedGenre === 'ambient' && searchResults.length === 0
              ? 'liquid-pill text-white font-medium shadow-sm'
              : 'border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
          }`}
        >
          {t('vibrax_opt_ambient')}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedGenre('nature');
            setSearchResults([]);
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all shrink-0 ${
            selectedGenre === 'nature' && searchResults.length === 0
              ? 'liquid-pill text-white font-medium shadow-sm'
              : 'border border-white/10 bg-white/[0.02] text-zinc-400 hover:text-white'
          }`}
        >
          {t('vibrax_opt_nature')}
        </button>
      </div>

      {/* RECENT SEARCHES CHIPS */}
      {recentSearches.length > 0 && (!searchQuery.trim() || searchResults.length === 0) && (
        <div className="space-y-1.5 border-b border-white/5 pb-2.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="h-3 w-3" />
              <span>{t('vibrax_recent_searches')}</span>
            </span>
            <button
              onClick={clearAllRecentSearches}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {t('vibrax_clear_all')}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((item) => (
              <span
                key={item}
                onClick={() => handleSelectRecent(item)}
                className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[11px] text-zinc-300 hover:border-white/30 hover:text-white cursor-pointer transition-all"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={(e) => removeRecentSearch(item, e)}
                  aria-label={`Remove recent search: ${item}`}
                  title={`Remove ${item}`}
                  className="rounded-full p-0.5 text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TRACK LISTING (SEARCH RESULTS OR CURATED BY OPTION) */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {searchResults.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              <span>{searchResults.length} RESULTS</span>
              <button
                onClick={() => setSearchResults([])}
                className="hover:text-white text-zinc-400"
              >
                Reset to Curated
              </button>
            </div>
            {searchResults.map((track, index) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && status === 'playing';

              return (
                <div
                  key={track.id}
                  onClick={() => playQueue(searchResults, index)}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-white/30 bg-white/[0.08] shadow-sm'
                      : 'border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="h-11 w-11 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs sm:text-sm font-medium truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                          {track.title}
                        </p>
                        {isPlayingThis && (
                          <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <Volume2 className="h-3 w-3 animate-pulse" />
                            <span>PLAYING</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
                        {track.artist} · <span className="text-zinc-500">{track.album}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-mono text-[11px] ${isCurrent ? 'text-white font-medium' : 'text-zinc-500'}`}>
                      {msToTimeString(track.duration * 1000)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-left">
              <span>{t('vibrax_curated_title')} ({displayedCurated.length})</span>
            </div>
            {displayedCurated.map((track, index) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && status === 'playing';

              return (
                <div
                  key={track.id}
                  onClick={() => playQueue(displayedCurated, index)}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-white/30 bg-white/[0.08] shadow-sm'
                      : 'border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="h-11 w-11 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs sm:text-sm font-medium truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                          {track.title}
                        </p>
                        {isPlayingThis && (
                          <span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <Volume2 className="h-3 w-3 animate-pulse" />
                            <span>PLAYING</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-mono text-[11px] ${isCurrent ? 'text-white font-medium' : 'text-zinc-500'}`}>
                      {msToTimeString(track.duration * 1000)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
