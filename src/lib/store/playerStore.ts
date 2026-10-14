// Monokuro Authoritative VibraX Music Player Store
// Compliant with debug.md §1 & §1.2 State Machine

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MusicProvider, PlaybackCapability } from '@/types';
import { parseSyncedLyrics, ParsedLyricLine } from '@/lib/lyrics';

export type PlayerStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'unsupported'
  | 'requires-auth'
  | 'requires-provider-player'
  | 'error';

export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string | null; // audio preview or stream URL
  externalUrl: string;
  provider: MusicProvider;
  capability: PlaybackCapability;
  youtubeId?: string;
  embedHtml?: string;
  genre?: 'lofi' | 'piano' | 'classical' | 'ambient' | 'nature';
}

interface PlayerState {
  currentTrack: PlayerTrack | null;
  queue: PlayerTrack[];
  queueIndex: number;
  status: PlayerStatus;
  errorMessage: string | null;
  volume: number;
  progress: number; // in seconds
  duration: number; // in seconds
  isMuted: boolean;
  repeatMode: 'off' | 'all' | 'one';
  lyricsMode: 'line' | 'word';
  isPipVideoOpen: boolean;

  // Synced Lyrics
  lyrics: {
    loading: boolean;
    plain: string | null;
    synced: string | null;
    lines: ParsedLyricLine[];
    error: string | null;
  };

  // User Action Intents
  userIntent: 'play' | 'pause' | null;
  playTrigger: number;

  // Actions
  setTrack: (track: PlayerTrack) => void;
  setQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  requestPlay: () => void;
  requestPause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleLyricsMode: () => void;
  togglePipVideo: () => void;
  setPipVideoOpen: (open: boolean) => void;

  // Engine Event Callbacks (called by GlobalAudioPlayer)
  notifyMediaCanPlay: () => void;
  notifyMediaPlaying: () => void;
  notifyMediaPaused: () => void;
  notifyMediaBuffering: () => void;
  notifyMediaEnded: () => void;
  notifyMediaError: (errorMsg: string) => void;
  notifyTimeUpdate: (currentTime: number, duration?: number) => void;

  fetchLyricsForCurrentTrack: () => Promise<void>;
}

// Curated peaceful study tracks categorized by genre/vibe
export const CURATED_STUDY_TRACKS: PlayerTrack[] = [
  {
    id: 'study_1',
    title: 'Clair de lune (Piano)',
    artist: 'Claude Debussy',
    album: 'Re-Debussy',
    duration: 279,
    coverUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/e9/7d/06/e97d0686-5c74-6da0-9678-daedca3255c7/4538182835241_cov.jpg/600x600bb.jpg',
    audioUrl: null,
    externalUrl: 'https://www.youtube.com/watch?v=X-Xxqt6Xdio',
    provider: 'youtube',
    capability: 'playable',
    youtubeId: 'X-Xxqt6Xdio',
    genre: 'piano',
  },
  {
    id: 'study_2',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    album: 'Essential Classical Masters',
    duration: 204,
    coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&auto=format&fit=crop&q=80',
    audioUrl: null,
    externalUrl: 'https://www.youtube.com/watch?v=S-Xm7s9eGxU',
    provider: 'youtube',
    capability: 'playable',
    youtubeId: 'S-Xm7s9eGxU',
    genre: 'classical',
  },
  {
    id: 'study_3',
    title: 'Nocturne in E-flat Major, Op. 9 No. 2',
    artist: 'Frédéric Chopin',
    album: 'Chopin Nocturnes',
    duration: 270,
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-507127053e14?w=600&auto=format&fit=crop&q=80',
    audioUrl: null,
    externalUrl: 'https://www.youtube.com/watch?v=9E6b3swbnWg',
    provider: 'youtube',
    capability: 'playable',
    youtubeId: '9E6b3swbnWg',
    genre: 'classical',
  },
  {
    id: 'study_4',
    title: 'River Flows in You',
    artist: 'Yiruma',
    album: 'First Love (Repackage)',
    duration: 220,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    audioUrl: null,
    externalUrl: 'https://www.youtube.com/watch?v=7maJOI3QMu0',
    provider: 'youtube',
    capability: 'playable',
    youtubeId: '7maJOI3QMu0',
    genre: 'piano',
  },
  {
    id: 'study_5',
    title: '1 A.M Study Session (Chill Lofi)',
    artist: 'Lofi Girl / ChilledCow',
    album: 'Peaceful Study Sessions',
    duration: 185,
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
    audioUrl: null,
    externalUrl: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
    provider: 'youtube',
    capability: 'playable',
    youtubeId: 'lTRiuFIWV54',
    genre: 'lofi',
  },
  {
    id: 'study_6',
    title: 'Coffee, Rain & Calm Code',
    artist: 'Chillhop Music',
    album: 'Winter Lofi Essentials',
    duration: 195,
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    audioUrl: null,
    externalUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    provider: 'youtube',
    capability: 'playable',
    youtubeId: '5qap5aO4i9A',
    genre: 'lofi',
  },
  {
    id: 'study_7',
    title: 'An Ending (Ascent)',
    artist: 'Brian Eno',
    album: 'Apollo: Atmospheres and Soundtracks',
    duration: 264,
    coverUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
    audioUrl: null,
    externalUrl: 'https://www.youtube.com/watch?v=aKw5mbcE7VY',
    provider: 'youtube',
    capability: 'playable',
    youtubeId: 'aKw5mbcE7VY',
    genre: 'ambient',
  },
  {
    id: 'study_8',
    title: 'Gentle Night Rainfall on Window',
    artist: 'Zen Nature Acoustics',
    album: 'Deep Soundscapes for Reading',
    duration: 300,
    coverUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    audioUrl: null,
    externalUrl: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
    provider: 'youtube',
    capability: 'playable',
    youtubeId: 'mPZkdNFkNps',
    genre: 'nature',
  },
];

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: CURATED_STUDY_TRACKS[0],
      queue: CURATED_STUDY_TRACKS,
      queueIndex: 0,
      status: 'idle',
      errorMessage: null,
      volume: 80,
      progress: 0,
      duration: 279,
      isMuted: false,
      repeatMode: 'all',
      lyricsMode: 'word',
      isPipVideoOpen: false,
      userIntent: null,
      playTrigger: 0,

      lyrics: {
        loading: false,
        plain: null,
        synced: null,
        lines: [],
        error: null,
      },

      playTrack: (rawTrack: PlayerTrack, optionalQueue?: PlayerTrack[]) => {
        const track: PlayerTrack = {
          ...rawTrack,
          audioUrl: rawTrack.audioUrl || (rawTrack as any).previewUrl || null,
        };

        const current = get().currentTrack;
        const isSameTrack = current && (current.id === track.id || (current.title === track.title && current.artist === track.artist));

        // If clicking the current track (Replay / Play)
        if (isSameTrack) {
          set({
            status: 'loading',
            userIntent: 'play',
            progress: 0,
            playTrigger: Date.now(),
            errorMessage: null,
          });
          return;
        }

        // Maintain the album / playlist queue if available
        const existingQueue = get().queue;
        let newQueue = optionalQueue && optionalQueue.length > 0 ? optionalQueue : existingQueue;
        let foundIdx = newQueue.findIndex((t) => t.id === track.id);

        if (foundIdx === -1 && (!optionalQueue || optionalQueue.length === 0)) {
          // Track not found in existing queue, create single queue
          newQueue = [track];
          foundIdx = 0;
        }

        set({
          currentTrack: track,
          queue: newQueue,
          queueIndex: Math.max(0, foundIdx),
          status: 'loading',
          errorMessage: null,
          progress: 0,
          duration: track.duration || 0,
          userIntent: 'play',
          playTrigger: Date.now(),
        });

        get().fetchLyricsForCurrentTrack();

        // Background resolve full-length YouTube stream if needed
        if (!track.youtubeId && !track.audioUrl) {
          fetch(`/api/music/match-youtube?q=${encodeURIComponent(`${track.artist} ${track.title}`)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.youtubeId) {
                const curr = get().currentTrack;
                if (curr && curr.id === track.id) {
                  set({
                    currentTrack: {
                      ...curr,
                      youtubeId: data.youtubeId,
                      capability: 'playable',
                    },
                    playTrigger: Date.now(),
                    errorMessage: null,
                  });
                }
              } else if (track.capability === 'open_external') {
                set({
                  status: 'requires-provider-player',
                  errorMessage: `In-app streaming is restricted for this track. Use the official ${track.provider.toUpperCase()} link to listen.`,
                  userIntent: null,
                });
              }
            })
            .catch(() => {});
        }
      },

      playQueue: (tracks: PlayerTrack[], startIndex = 0) => {
        if (!tracks || tracks.length === 0) return;
        const clampedIndex = Math.max(0, Math.min(startIndex, tracks.length - 1));
        const target = tracks[clampedIndex] || tracks[0];
        const resolvedTarget: PlayerTrack = {
          ...target,
          audioUrl: target.audioUrl || (target as any).previewUrl || null,
        };

        set({
          queue: tracks,
          queueIndex: clampedIndex,
          currentTrack: resolvedTarget,
          status: 'loading',
          errorMessage: null,
          progress: 0,
          duration: resolvedTarget.duration || 0,
          userIntent: 'play',
          playTrigger: Date.now(),
        });

        get().fetchLyricsForCurrentTrack();

        if (!resolvedTarget.youtubeId && !resolvedTarget.audioUrl) {
          fetch(`/api/music/match-youtube?q=${encodeURIComponent(`${resolvedTarget.artist} ${resolvedTarget.title}`)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.youtubeId) {
                const curr = get().currentTrack;
                if (curr && curr.id === resolvedTarget.id) {
                  set({
                    currentTrack: {
                      ...curr,
                      youtubeId: data.youtubeId,
                      capability: 'playable',
                    },
                    playTrigger: Date.now(),
                    errorMessage: null,
                  });
                }
              }
            })
            .catch(() => {});
        }
      },

      setTrack: (rawTrack: PlayerTrack) => {
        get().playTrack(rawTrack);
      },

      setQueue: (tracks: PlayerTrack[], startIndex = 0) => {
        get().playQueue(tracks, startIndex);
      },

      requestPlay: () => {
        const { currentTrack } = get();
        if (!currentTrack) return;

        if (currentTrack.capability === 'open_external' && !currentTrack.audioUrl && !currentTrack.youtubeId) {
          set({
            status: 'requires-provider-player',
            errorMessage: `This track requires the official ${currentTrack.provider.toUpperCase()} player.`,
            userIntent: null,
          });
          return;
        }

        set({ userIntent: 'play', status: 'loading', playTrigger: Date.now(), errorMessage: null });
      },

      requestPause: () => {
        set({ userIntent: 'pause' });
      },

      togglePlay: () => {
        const { status, userIntent } = get();
        if (status === 'playing' || userIntent === 'play') {
          get().requestPause();
        } else {
          get().requestPlay();
        }
      },

      next: () => {
        const { queue, queueIndex, repeatMode } = get();
        if (queue.length === 0) return;

        let nextIdx = queueIndex + 1;
        if (nextIdx >= queue.length) {
          if (repeatMode === 'off') {
            set({ status: 'ended', userIntent: 'pause', progress: 0 });
            return;
          }
          nextIdx = 0;
        }

        const nextTrack = queue[nextIdx];
        set({
          queueIndex: nextIdx,
          currentTrack: nextTrack,
          progress: 0,
          duration: nextTrack.duration || 0,
          status: 'loading',
          errorMessage: null,
          userIntent: 'play',
          playTrigger: Date.now(),
        });
        get().fetchLyricsForCurrentTrack();

        if (!nextTrack.youtubeId && !nextTrack.audioUrl) {
          fetch(`/api/music/match-youtube?q=${encodeURIComponent(`${nextTrack.artist} ${nextTrack.title}`)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.youtubeId) {
                const curr = get().currentTrack;
                if (curr && curr.id === nextTrack.id) {
                  set({
                    currentTrack: {
                      ...curr,
                      youtubeId: data.youtubeId,
                      capability: 'playable',
                    },
                    playTrigger: Date.now(),
                    errorMessage: null,
                  });
                }
              }
            })
            .catch(() => {});
        }
      },

      previous: () => {
        const { queue, queueIndex, progress } = get();
        if (progress > 3) {
          set({ progress: 0, playTrigger: Date.now() });
          return;
        }
        if (queue.length === 0) return;

        const prevIdx = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
        const prevTrack = queue[prevIdx];
        set({
          queueIndex: prevIdx,
          currentTrack: prevTrack,
          progress: 0,
          duration: prevTrack.duration || 0,
          status: 'loading',
          errorMessage: null,
          userIntent: 'play',
          playTrigger: Date.now(),
        });
        get().fetchLyricsForCurrentTrack();

        if (!prevTrack.youtubeId && !prevTrack.audioUrl) {
          fetch(`/api/music/match-youtube?q=${encodeURIComponent(`${prevTrack.artist} ${prevTrack.title}`)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.youtubeId) {
                const curr = get().currentTrack;
                if (curr && curr.id === prevTrack.id) {
                  set({
                    currentTrack: {
                      ...curr,
                      youtubeId: data.youtubeId,
                      capability: 'playable',
                    },
                    playTrigger: Date.now(),
                    errorMessage: null,
                  });
                }
              }
            })
            .catch(() => {});
        }
      },

      seek: (seconds: number) => {
        set({ progress: seconds });
      },

      setVolume: (v: number) => set({ volume: v, isMuted: false }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      toggleRepeat: () => {
        const current = get().repeatMode;
        const nextMode = current === 'off' ? 'all' : current === 'all' ? 'one' : 'off';
        set({ repeatMode: nextMode });
      },

      toggleLyricsMode: () => {
        set((s) => ({ lyricsMode: s.lyricsMode === 'line' ? 'word' : 'line' }));
      },

      togglePipVideo: () => {
        set((s) => ({ isPipVideoOpen: !s.isPipVideoOpen }));
      },

      setPipVideoOpen: (open: boolean) => {
        set({ isPipVideoOpen: open });
      },

      // Engine Event Callbacks
      notifyMediaCanPlay: () => {
        const { status, userIntent } = get();
        if (status === 'loading') {
          set({ status: userIntent === 'play' ? 'loading' : 'ready' });
        }
      },

      notifyMediaPlaying: () => {
        set({ status: 'playing', errorMessage: null, userIntent: 'play' });
      },

      notifyMediaPaused: () => {
        const { status } = get();
        if (status !== 'ended' && status !== 'error') {
          set({ status: 'paused', userIntent: 'pause' });
        }
      },

      notifyMediaBuffering: () => {
        set({ status: 'buffering' });
      },

      notifyMediaEnded: () => {
        const { repeatMode } = get();
        if (repeatMode === 'one') {
          set({ progress: 0, userIntent: 'play' });
        } else {
          get().next();
        }
      },

      notifyMediaError: (errorMsg: string) => {
        set({
          status: 'error',
          errorMessage: errorMsg,
          userIntent: 'pause',
        });
      },

      notifyTimeUpdate: (currentTime: number, duration?: number) => {
        // Block stale time updates while a new track is loading so time strictly stays at 0:00
        const { status } = get();
        if (status === 'loading') return;

        set((s) => ({
          progress: currentTime,
          duration: duration && duration > 0 ? duration : s.duration,
        }));
      },

      fetchLyricsForCurrentTrack: async () => {
        const { currentTrack } = get();
        if (!currentTrack) return;

        set({
          lyrics: {
            loading: true,
            plain: null,
            synced: null,
            lines: [],
            error: null,
          },
        });

        try {
          const url = `/api/lyrics?track=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(
            currentTrack.artist
          )}&duration=${currentTrack.duration}`;
          const res = await fetch(url);

          if (!res.ok) {
            set({
              lyrics: {
                loading: false,
                plain: null,
                synced: null,
                lines: [],
                error: 'No synchronized lyrics found for this track.',
              },
            });
            return;
          }

          const data = await res.json();
          const parsedLines = data.syncedLyrics ? parseSyncedLyrics(data.syncedLyrics) : [];

          set({
            lyrics: {
              loading: false,
              plain: data.plainLyrics || null,
              synced: data.syncedLyrics || null,
              lines: parsedLines,
              error: null,
            },
          });
        } catch (err) {
          set({
            lyrics: {
              loading: false,
              plain: null,
              synced: null,
              lines: [],
              error: 'Lyrics lookup failed.',
            },
          });
        }
      },
    }),
    {
      name: 'monokuro_player_store_v2',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        lyricsMode: state.lyricsMode,
      }),
    }
  )
);
