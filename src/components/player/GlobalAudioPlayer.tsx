'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/lib/store/playerStore';
import { useLanguageStore } from '@/lib/store/languageStore';
import { Minimize2, X, Move } from 'lucide-react';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function GlobalAudioPlayer() {
  const { t } = useLanguageStore();
  const {
    currentTrack,
    userIntent,
    volume,
    isMuted,
    progress,
    status,
    playTrigger,
    isPipVideoOpen,
    setPipVideoOpen,
    notifyMediaCanPlay,
    notifyMediaPlaying,
    notifyMediaPaused,
    notifyMediaBuffering,
    notifyMediaEnded,
    notifyMediaError,
    notifyTimeUpdate,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const timePollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingWatchdogRef = useRef<NodeJS.Timeout | null>(null);

  // PIP Window State: Draggable and Freely Resizable
  const [pipPos, setPipPos] = useState<{ x: number; y: number } | null>(null);
  const [pipSize, setPipSize] = useState<{ width: number; height: number }>({ width: 380, height: 252 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number } | null>(null);

  // Distinct track identity refs
  const currentTrackIdRef = useRef<string | null>(null);
  const lastLoadedAudioSrcRef = useRef<string | null>(null);
  const lastLoadedYtVideoIdRef = useRef<string | null>(null);
  const pendingYtVideoIdRef = useRef<string | null>(null);

  const [ytApiLoaded, setYtApiLoaded] = useState(false);

  // Initialize PIP position and size on open
  useEffect(() => {
    if (isPipVideoOpen && typeof window !== 'undefined') {
      if (!pipPos) {
        const defaultW = Math.min(380, window.innerWidth - 32);
        const defaultH = Math.round((defaultW * 9) / 16) + 38;
        const initialX = Math.max(16, window.innerWidth - defaultW - 24);
        const initialY = Math.max(16, window.innerHeight - defaultH - 96);
        setPipPos({ x: initialX, y: initialY });
        setPipSize({ width: defaultW, height: defaultH });
      }
    }
  }, [isPipVideoOpen, pipPos]);

  // Handle Drag Start
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    setIsDragging(true);
    const curX = pipPos ? pipPos.x : Math.max(16, window.innerWidth - pipSize.width - 24);
    const curY = pipPos ? pipPos.y : Math.max(16, window.innerHeight - pipSize.height - 96);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: curX,
      startY: curY,
    };
  };

  // Handle Resize Start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: pipSize.width,
      startH: pipSize.height,
    };
  };

  // Preset size shortcuts
  const setPresetSize = (w: number) => {
    const clampedW = Math.min(w, window.innerWidth - 32);
    const nextH = Math.round((clampedW * 9) / 16) + 38;
    setPipSize({ width: clampedW, height: nextH });
    if (pipPos) {
      const nextX = Math.min(pipPos.x, window.innerWidth - clampedW - 16);
      const nextY = Math.min(pipPos.y, window.innerHeight - nextH - 16);
      setPipPos({ x: Math.max(8, nextX), y: Math.max(8, nextY) });
    }
  };

  // Global mousemove and mouseup listeners during Drag & Resize
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.mouseX;
        const deltaY = e.clientY - dragStartRef.current.mouseY;
        const nextX = Math.max(8, Math.min(window.innerWidth - pipSize.width - 8, dragStartRef.current.startX + deltaX));
        const nextY = Math.max(8, Math.min(window.innerHeight - pipSize.height - 8, dragStartRef.current.startY + deltaY));
        setPipPos({ x: nextX, y: nextY });
      } else if (isResizing && resizeStartRef.current) {
        const deltaX = e.clientX - resizeStartRef.current.mouseX;
        const deltaY = e.clientY - resizeStartRef.current.mouseY;
        const nextW = Math.max(240, Math.min(window.innerWidth - (pipPos?.x || 0) - 16, resizeStartRef.current.startW + deltaX));
        const nextH = Math.max(160, Math.min(window.innerHeight - (pipPos?.y || 0) - 16, resizeStartRef.current.startH + deltaY));
        setPipSize({ width: nextW, height: nextH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragStartRef.current = null;
      resizeStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, pipSize.width, pipSize.height, pipPos]);

  // 1. Load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      setYtApiLoaded(true);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }

    const prevOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevOnReady) prevOnReady();
      setYtApiLoaded(true);
    };
  }, []);

  // 2. Poll Time for YouTube Player (only runs during active playback)
  const stopTimePolling = useCallback(() => {
    if (timePollIntervalRef.current) {
      clearInterval(timePollIntervalRef.current);
      timePollIntervalRef.current = null;
    }
  }, []);

  const startTimePolling = useCallback(() => {
    stopTimePolling();
    timePollIntervalRef.current = setInterval(() => {
      const player = ytPlayerRef.current;
      if (player && isYtReadyRef.current && typeof player.getCurrentTime === 'function') {
        try {
          const curr = player.getCurrentTime() || 0;
          const dur = player.getDuration() || 0;
          notifyTimeUpdate(curr, dur > 0 ? dur : undefined);
        } catch {}
      }
    }, 250);
  }, [notifyTimeUpdate, stopTimePolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopTimePolling();
      if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
    };
  }, [stopTimePolling]);

  // 3. Track switch detector: Reset timestamps strictly to 0:00 immediately
  useEffect(() => {
    if (!currentTrack) return;

    if (currentTrackIdRef.current !== currentTrack.id) {
      currentTrackIdRef.current = currentTrack.id;

      // Stop old polling immediately
      stopTimePolling();

      // Reset HTML5 audio to 0:00
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Reset YouTube player to 0:00
      if (ytPlayerRef.current && isYtReadyRef.current) {
        try {
          ytPlayerRef.current.seekTo(0, true);
        } catch {}
      }

      // Watchdog: If player stays in 'loading' for > 7 seconds, clear loader
      if (loadingWatchdogRef.current) clearTimeout(loadingWatchdogRef.current);
      loadingWatchdogRef.current = setTimeout(() => {
        const currentStatus = usePlayerStore.getState().status;
        if (currentStatus === 'loading') {
          console.warn('Playback loading timeout exceeded, recovering...');
          if (currentTrack.audioUrl && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          } else {
            notifyMediaError('Track is taking too long to load. Try reselecting or choose another song.');
          }
        }
      }, 7000);
    }
  }, [currentTrack, stopTimePolling, notifyMediaError]);

  // Clear watchdog when playing
  useEffect(() => {
    if (status === 'playing' || status === 'paused' || status === 'ready' || status === 'error') {
      if (loadingWatchdogRef.current) {
        clearTimeout(loadingWatchdogRef.current);
        loadingWatchdogRef.current = null;
      }
    }
  }, [status]);

  // 3.5 Auto-resolve full YouTube stream if track lacks youtubeId (fixes 30s preview cutoff)
  useEffect(() => {
    if (!currentTrack) return;
    if (currentTrack.youtubeId) return;

    let isSubscribed = true;
    const query = `${currentTrack.artist} ${currentTrack.title}`.trim();
    if (!query) return;

    fetch(`/api/music/match-youtube?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isSubscribed) return;
        if (data.youtubeId) {
          const state = usePlayerStore.getState();
          const curr = state.currentTrack;
          if (curr && (curr.id === currentTrack.id || (curr.title === currentTrack.title && curr.artist === currentTrack.artist))) {
            state.setTrack({
              ...curr,
              youtubeId: data.youtubeId,
              capability: 'playable',
            });
          }
        }
      })
      .catch((err) => console.warn('Auto-resolve full YouTube stream failed:', err));

    return () => {
      isSubscribed = false;
    };
  }, [currentTrack]);

  // 4. Initialize YouTube Player instance or load new video
  useEffect(() => {
    if (!ytApiLoaded || !currentTrack?.youtubeId) return;

    const ytId = currentTrack.youtubeId;

    // If player instance is already active
    if (ytPlayerRef.current && isYtReadyRef.current) {
      if (lastLoadedYtVideoIdRef.current !== ytId) {
        lastLoadedYtVideoIdRef.current = ytId;
        // Pause HTML5 audio
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        try {
          if (userIntent === 'play') {
            ytPlayerRef.current.loadVideoById(ytId, 0);
          } else {
            ytPlayerRef.current.cueVideoById(ytId, 0);
          }
        } catch (err) {
          console.warn('YouTube loadVideoById error:', err);
        }
      } else if (userIntent === 'play') {
        try {
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
        } catch (err) {
          console.warn('YouTube playVideo error:', err);
        }
      }
      return;
    }

    // Save pending video ID while player initializes
    pendingYtVideoIdRef.current = ytId;

    // Initialize player instance if not yet instantiated
    const container = document.getElementById('monokuro-yt-player');
    if (!container || !window.YT || !window.YT.Player || ytPlayerRef.current) return;

    try {
      lastLoadedYtVideoIdRef.current = ytId;
      ytPlayerRef.current = new window.YT.Player('monokuro-yt-player', {
        width: '100%',
        height: '100%',
        videoId: ytId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: userIntent === 'play' ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event: any) => {
            isYtReadyRef.current = true;
            event.target.setVolume(isMuted ? 0 : volume);
            const targetId = pendingYtVideoIdRef.current || currentTrack?.youtubeId;
            if (targetId) {
              lastLoadedYtVideoIdRef.current = targetId;
              if (userIntent === 'play') {
                event.target.loadVideoById(targetId, 0);
              } else {
                event.target.cueVideoById(targetId, 0);
              }
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
            if (event.data === 1) {
              notifyMediaPlaying();
              startTimePolling();
            } else if (event.data === 2) {
              notifyMediaPaused();
              stopTimePolling();
            } else if (event.data === 3) {
              notifyMediaBuffering();
            } else if (event.data === 0) {
              stopTimePolling();
              notifyMediaEnded();
            }
          },
          onError: (event: any) => {
            stopTimePolling();
            console.warn('YouTube Player error code:', event.data);
            if (currentTrack?.audioUrl && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.src = currentTrack.audioUrl;
              audioRef.current.play().catch(console.error);
            } else {
              notifyMediaError('Full playback restricted by owner. Click external link to listen.');
            }
          },
        },
      });
    } catch (e) {
      console.error('Failed to instantiate YouTube player:', e);
    }
  }, [
    ytApiLoaded,
    currentTrack,
    userIntent,
    volume,
    isMuted,
    notifyMediaPlaying,
    notifyMediaPaused,
    notifyMediaBuffering,
    notifyMediaEnded,
    notifyMediaError,
    startTimePolling,
    stopTimePolling,
  ]);

  // 5. Handle Audio Playback Intents (HTML5 Audio and YouTube commands)
  useEffect(() => {
    // A) If track uses YouTube
    if (currentTrack?.youtubeId) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (ytPlayerRef.current && isYtReadyRef.current) {
        const ytId = currentTrack.youtubeId;
        try {
          if (userIntent === 'play') {
            if (lastLoadedYtVideoIdRef.current !== ytId) {
              lastLoadedYtVideoIdRef.current = ytId;
              ytPlayerRef.current.loadVideoById(ytId, 0);
            } else {
              ytPlayerRef.current.playVideo();
            }
          } else if (userIntent === 'pause') {
            ytPlayerRef.current.pauseVideo();
          }
        } catch (e) {
          console.warn('YouTube play/pause dispatch error:', e);
        }
      }
      return;
    }

    // B) If track uses HTML5 Audio
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack?.audioUrl) {
      if (!audio.paused) audio.pause();
      return;
    }

    // Source change
    if (lastLoadedAudioSrcRef.current !== currentTrack.audioUrl) {
      lastLoadedAudioSrcRef.current = currentTrack.audioUrl;
      audio.src = currentTrack.audioUrl;
      audio.currentTime = 0;
      audio.load();
    }

    if (userIntent === 'play') {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name === 'NotAllowedError') {
            notifyMediaError('Playback blocked by browser policy. Click Play to start audio.');
          } else if (err.name !== 'AbortError') {
            notifyMediaError('Could not play audio track: ' + err.message);
          }
        });
      }
    } else if (userIntent === 'pause') {
      audio.pause();
    }
  }, [currentTrack, userIntent, playTrigger, notifyMediaError]);

  // 6. Sync Volume & Mute across engines
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }

    if (ytPlayerRef.current && isYtReadyRef.current) {
      try {
        ytPlayerRef.current.setVolume(isMuted ? 0 : volume);
      } catch {}
    }
  }, [volume, isMuted]);

  // 7. Sync Seek Synchronization
  useEffect(() => {
    // Only seek when not in loading state
    if (status === 'loading') return;

    // HTML5
    const audio = audioRef.current;
    if (audio && !currentTrack?.youtubeId && Math.abs(audio.currentTime - progress) > 2) {
      audio.currentTime = progress;
    }

    // YouTube
    if (currentTrack?.youtubeId && ytPlayerRef.current && isYtReadyRef.current) {
      try {
        const curr = ytPlayerRef.current.getCurrentTime() || 0;
        if (Math.abs(curr - progress) > 2) {
          ytPlayerRef.current.seekTo(progress, true);
        }
      } catch {}
    }
  }, [progress, currentTrack, status]);

  // HTML5 Event Callbacks
  const handleCanPlay = () => notifyMediaCanPlay();
  const handlePlaying = () => notifyMediaPlaying();
  const handlePause = () => notifyMediaPaused();
  const handleWaiting = () => notifyMediaBuffering();
  const handleEnded = () => {
    // If it was an audio preview clip (under 40s) but the song is actually longer, upgrade to YouTube!
    if (currentTrack && !currentTrack.youtubeId && currentTrack.duration > 40) {
      const query = `${currentTrack.artist} ${currentTrack.title}`.trim();
      fetch(`/api/music/match-youtube?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.youtubeId) {
            usePlayerStore.getState().setTrack({
              ...currentTrack,
              youtubeId: data.youtubeId,
              capability: 'playable',
            });
            return;
          }
          notifyMediaEnded();
        })
        .catch(() => notifyMediaEnded());
      return;
    }
    notifyMediaEnded();
  };
  const handleError = () => {
    if (currentTrack?.audioUrl && !currentTrack.youtubeId) {
      notifyMediaError('Audio stream failed to load or is unavailable.');
    }
  };
  const handleTimeUpdate = () => {
    if (audioRef.current && !currentTrack?.youtubeId && status !== 'loading') {
      notifyTimeUpdate(audioRef.current.currentTime, audioRef.current.duration);
    }
  };

  return (
    <>
      {/* Persistent Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        preload="auto"
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onPause={handlePause}
        onWaiting={handleWaiting}
        onEnded={handleEnded}
        onError={handleError}
        onTimeUpdate={handleTimeUpdate}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Floating Picture-in-Picture / Video Drawer for YouTube streams */}
      <div
        style={
          isPipVideoOpen && pipPos
            ? {
                left: `${pipPos.x}px`,
                top: `${pipPos.y}px`,
                width: `${pipSize.width}px`,
                height: `${pipSize.height}px`,
              }
            : undefined
        }
        className={`fixed z-[9990] select-none ${
          isDragging || isResizing ? 'transition-none' : 'transition-all duration-150'
        } ${
          isPipVideoOpen
            ? 'rounded-xl border border-white/15 bg-[#09090b]/95 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden flex flex-col'
            : 'fixed -left-[9999px] top-0 w-60 h-36 pointer-events-none'
        }`}
        aria-label="Floating Media Player"
      >
        {isPipVideoOpen && (
          <div
            onMouseDown={handleDragStart}
            title={t('player_pip_drag_hint')}
            className="h-[38px] shrink-0 flex items-center justify-between border-b border-white/10 px-3 bg-black/60 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Move className="h-3 w-3 text-zinc-500 shrink-0" />
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <p className="font-mono text-xs text-white truncate">
                {currentTrack?.title || 'Video Stream'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Preset Size Shortcuts */}
              <div className="flex items-center rounded border border-white/10 bg-white/5 p-0.5 mr-1 font-mono text-[9px]">
                <button
                  type="button"
                  onClick={() => setPresetSize(280)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    pipSize.width <= 320 ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Small (280px)"
                >
                  S
                </button>
                <button
                  type="button"
                  onClick={() => setPresetSize(420)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    pipSize.width > 320 && pipSize.width <= 500 ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Medium (420px)"
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => setPresetSize(600)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    pipSize.width > 500 ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Large (600px)"
                >
                  L
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPipVideoOpen(false)}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                title="Minimize Video"
                aria-label="Minimize Video"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPipVideoOpen(false)}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
                title="Close Video Window"
                aria-label="Close Video Window"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className={`relative flex-1 w-full bg-black overflow-hidden ${!isPipVideoOpen ? 'w-60 h-36' : ''}`}>
          <div id="monokuro-yt-player" className="w-full h-full" />
        </div>

        {/* Free Resize Corner Handle */}
        {isPipVideoOpen && (
          <div
            onMouseDown={handleResizeStart}
            title={t('player_pip_resize_hint')}
            className="absolute bottom-0 right-0 h-6 w-6 cursor-se-resize flex items-end justify-end p-1 z-40 group"
          >
            <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-white/40 group-hover:border-white transition-colors" />
          </div>
        )}

        {/* Transparent blocker during drag/resize to prevent YouTube iframe event absorption */}
        {(isDragging || isResizing) && (
          <div
            className={`absolute inset-0 z-50 bg-transparent ${
              isDragging ? 'cursor-grabbing' : 'cursor-se-resize'
            }`}
          />
        )}
      </div>
    </>
  );
}
