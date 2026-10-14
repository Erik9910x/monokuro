'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  ExternalLink,
  Lock,
  Unlock,
  Sparkles,
  Maximize2,
  Minimize2,
  Tv,
  Timer,
  Clapperboard,
  Target,
  Edit3,
  X,
  Search,
  Loader2,
  Crown,
  CheckCircle2,
  Film,
  Eye,
  Clock,
} from 'lucide-react';
import { useTimerStore } from '@/lib/store/timerStore';
import { getCompletedStudySecondsToday } from '@/lib/storage';
import { YouTubeVideoItem } from '@/lib/music/youtube';

// Quick Vibe categories for 1-click discovery
const QUICK_VIBE_CATEGORIES = [
  { label: 'Anime 4K Scenery', query: 'anime scenic chill 4k atmosphere' },
  { label: 'Studio Ghibli Vibe', query: 'studio ghibli relaxing ambient 4k' },
  { label: 'Mưa & Cà Phê 4K', query: 'cozy rain coffee shop ambiance 4k' },
  { label: 'Tokyo Cyberpunk Night', query: 'tokyo rainy night walk 4k ambient' },
  { label: 'Vũ Trụ & Deep Space', query: 'deep ambient space cosmic journey 4k' },
  { label: 'Lofi Girl Live 24/7', query: 'lofi hip hop radio beats to relax study' },
  { label: 'Coding Session Chill', query: 'synthwave coding ambient study' },
  { label: 'Thiên Nhiên & Núi Rừng', query: 'nature 4k relaxing scenery peaceful' },
];

// Fallback initial videos if offline or initial state
const FALLBACK_INITIAL_VIDEOS: YouTubeVideoItem[] = [
  {
    id: 'WJq43Wsh0I8',
    title: 'Studio Ghibli 4K Scenic Atmosphere & Peaceful Countryside',
    channel: 'Ghibli Vibes',
    duration: '1:30:15',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    views: '2.4M lượt xem',
    publishedTime: '1 năm trước',
  },
  {
    id: 'q76bMs-NwRk',
    title: 'Makoto Shinkai Visual Scenery 4K (Your Name / 5cm per second)',
    channel: 'Cinematic Moods',
    duration: '45:20',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    views: '1.8M lượt xem',
    publishedTime: '2 năm trước',
  },
  {
    id: 'sFzT1fFvUu8',
    title: 'Blade Runner Tokyo Rainy Night Walk in Shinjuku Neon 4K',
    channel: 'Nomadic Ambience',
    duration: '1:00:00',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    views: '4.1M lượt xem',
    publishedTime: '11 tháng trước',
  },
  {
    id: '1zNwgI3w_n0',
    title: 'Cosmic Journey & Deep Ambient Space (Interstellar Atmosphere) 4K',
    channel: 'Space Ambience',
    duration: '2:15:40',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    views: '3.2M lượt xem',
    publishedTime: '8 tháng trước',
  },
  {
    id: 'eZe4QnHArCE',
    title: 'Cozy Rainy Café in Ancient Kyoto with Soft Gentle Piano',
    channel: 'Calm Nature Café',
    duration: '1:10:00',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    views: '950K lượt xem',
    publishedTime: '5 tháng trước',
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to (Live Stream)',
    channel: 'Lofi Girl',
    duration: 'Live',
    thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
    views: '24K đang xem',
    publishedTime: 'Đang phát trực tiếp',
  },
];

export default function CineChillPage() {
  const { status: timerStatus } = useTimerStore();

  // Goal of the Day & Study Time State
  const [goalMinutes, setGoalMinutes] = useState<number>(30);
  const goalMinutesRef = useRef<number>(30);
  const [customGoalModalOpen, setCustomGoalModalOpen] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('');

  const [totalStudiedSecs, setTotalStudiedSecs] = useState(0);
  const [studiedFormatted, setStudiedFormatted] = useState('0m 00s');
  const [countdownRemainingSecs, setCountdownRemainingSecs] = useState(1800);
  const [countdownDisplay, setCountdownDisplay] = useState('30:00');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Base past seconds from IndexedDB
  const basePastSecondsRef = useRef<number>(0);

  // Active Video Playback State
  const [currentVideoId, setCurrentVideoId] = useState<string>('WJq43Wsh0I8');
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>(
    'Studio Ghibli 4K Scenic Atmosphere & Peaceful Countryside'
  );
  const [currentVideoChannel, setCurrentVideoChannel] = useState<string>('Ghibli Vibes');
  const [currentVideoDuration, setCurrentVideoDuration] = useState<string>('1:30:15');

  // Video Player Settings
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [isF11Fullscreen, setIsF11Fullscreen] = useState(false);
  const theaterDeckRef = useRef<HTMLDivElement | null>(null);

  // In-Room Direct YouTube Discovery & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<YouTubeVideoItem[]>(FALLBACK_INITIAL_VIDEOS);
  const [activeCategory, setActiveCategory] = useState<string>('Anime 4K Scenery');

  // YouTube Premium Account Vault State
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [premiumEmail, setPremiumEmail] = useState('');
  const [premiumToken, setPremiumToken] = useState('');
  const [antiAdsActive, setAntiAdsActive] = useState(true);
  const [isPremiumSaved, setIsPremiumSaved] = useState(false);

  // Load account & Goal of the Day from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGoal = localStorage.getItem('monokuro_cinechill_goal_minutes');
      if (savedGoal) {
        const parsed = parseInt(savedGoal, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 240) {
          setGoalMinutes(parsed);
          goalMinutesRef.current = parsed;
        }
      }

      const savedVault = localStorage.getItem('monokuro_yt_premium_vault');
      if (savedVault) {
        try {
          const parsed = JSON.parse(savedVault);
          if (parsed.email) {
            setPremiumEmail(parsed.email);
            setPremiumToken(parsed.token || '');
            setAntiAdsActive(parsed.antiAds ?? true);
            setIsPremiumSaved(true);
          }
        } catch {}
      }
    }
  }, []);

  const handleSetGoalMinutes = (mins: number) => {
    const clamped = Math.max(1, Math.min(240, mins));
    setGoalMinutes(clamped);
    goalMinutesRef.current = clamped;
    if (typeof window !== 'undefined') {
      localStorage.setItem('monokuro_cinechill_goal_minutes', String(clamped));
    }
  };

  const handleApplyCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customGoalInput.trim(), 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 240) {
      handleSetGoalMinutes(parsed);
      setCustomGoalModalOpen(false);
    }
  };

  // Save YouTube Premium Account
  const handleSavePremiumVault = (e: React.FormEvent) => {
    e.preventDefault();
    const email = premiumEmail.trim();
    if (!email) {
      setIsPremiumSaved(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('monokuro_yt_premium_vault');
      }
      setPremiumModalOpen(false);
      return;
    }

    const payload = {
      email,
      token: premiumToken.trim(),
      antiAds: antiAdsActive,
      updatedAt: Date.now(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('monokuro_yt_premium_vault', JSON.stringify(payload));
    }
    setIsPremiumSaved(true);
    setPremiumModalOpen(false);
  };

  // Continuous real-time countdown & study time ticker (runs every 200ms)
  useEffect(() => {
    const refreshBasePastSeconds = () => {
      const activeStartedAt = useTimerStore.getState().startedAt;
      getCompletedStudySecondsToday(activeStartedAt).then((secs) => {
        basePastSecondsRef.current = secs;
      });
    };

    refreshBasePastSeconds();
    const dbSyncInterval = setInterval(refreshBasePastSeconds, 2500);

    const timerInterval = setInterval(() => {
      const storeState = useTimerStore.getState();
      const currentMode = storeState.mode;
      const currentStatus = storeState.status;
      const currentDeadline = storeState.deadlineAt;
      const currentDuration = storeState.durationMs;
      const currentPausedRemaining = storeState.pausedRemainingMs;

      let liveCurrentSessionSecs = 0;
      if (currentMode === 'focus') {
        if (currentStatus === 'running' && currentDeadline) {
          const remainingMs = Math.max(0, currentDeadline - Date.now());
          liveCurrentSessionSecs = Math.max(0, Math.floor((currentDuration - remainingMs) / 1000));
        } else if (currentStatus === 'paused' && currentPausedRemaining !== null) {
          liveCurrentSessionSecs = Math.max(0, Math.floor((currentDuration - currentPausedRemaining) / 1000));
        }
      }

      const totalSecs = basePastSecondsRef.current + liveCurrentSessionSecs;
      const currentGoalMins = goalMinutesRef.current || 30;
      const TARGET_SECS = currentGoalMins * 60;
      const remainingSecs = Math.max(0, TARGET_SECS - totalSecs);
      const progress = Math.min(100, Math.round((totalSecs / TARGET_SECS) * 100));
      const unlocked = totalSecs >= TARGET_SECS;

      setTotalStudiedSecs(totalSecs);
      setCountdownRemainingSecs(remainingSecs);
      setProgressPercent(progress);
      setIsUnlocked(unlocked);

      const countdownHours = Math.floor(remainingSecs / 3600);
      const countdownMins = Math.floor((remainingSecs % 3600) / 60);
      const countdownSecs = remainingSecs % 60;
      if (countdownHours > 0) {
        setCountdownDisplay(
          `${countdownHours.toString().padStart(2, '0')}:${countdownMins
            .toString()
            .padStart(2, '0')}:${countdownSecs.toString().padStart(2, '0')}`
        );
      } else {
        setCountdownDisplay(
          `${countdownMins.toString().padStart(2, '0')}:${countdownSecs.toString().padStart(2, '0')}`
        );
      }

      const studiedHours = Math.floor(totalSecs / 3600);
      const studiedMins = Math.floor((totalSecs % 3600) / 60);
      const studiedRemainingSecs = totalSecs % 60;
      if (studiedHours > 0) {
        setStudiedFormatted(`${studiedHours}h ${studiedMins}m ${studiedRemainingSecs.toString().padStart(2, '0')}s`);
      } else {
        setStudiedFormatted(`${studiedMins}m ${studiedRemainingSecs.toString().padStart(2, '0')}s`);
      }
    }, 200);

    return () => {
      clearInterval(timerInterval);
      clearInterval(dbSyncInterval);
    };
  }, []);

  // Execute Direct In-Room YouTube Search
  const executeSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    // Check if user pasted a direct YouTube URL or raw 11-char video ID
    const ytMatch = q.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch || (/^[\w-]{11}$/.test(q) && !q.includes(' '))) {
      const vidId = ytMatch ? ytMatch[1] : q;
      setCurrentVideoId(vidId);
      setCurrentVideoTitle(`YouTube Stream (${vidId})`);
      setCurrentVideoChannel('YouTube Direct Stream');
      setCurrentVideoDuration('Direct HD');
      setSearchQuery('');
      theaterDeckRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}&limit=18`);
      const data = await res.json();
      if (data.success && data.results && data.results.length > 0) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.warn('In-room YouTube search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform initial search on mount so the user has fresh live YouTube videos
  useEffect(() => {
    executeSearch('anime scenic chill 4k atmosphere');
  }, []);

  const handleSelectCategory = (cat: { label: string; query: string }) => {
    setActiveCategory(cat.label);
    setSearchQuery(cat.label);
    executeSearch(cat.query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveCategory('');
      executeSearch(searchQuery);
    }
  };

  const handlePlayVideo = (video: YouTubeVideoItem) => {
    setCurrentVideoId(video.id);
    setCurrentVideoTitle(video.title);
    setCurrentVideoChannel(video.channel);
    setCurrentVideoDuration(video.duration);
    theaterDeckRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Full F11 Mode Native Fullscreen Handler
  const toggleF11Mode = () => {
    if (!document.fullscreenElement) {
      if (theaterDeckRef.current?.requestFullscreen) {
        theaterDeckRef.current.requestFullscreen().then(() => setIsF11Fullscreen(true)).catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsF11Fullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsF11Fullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Strict Lock Evaluation: Only opens when goal minutes are reached
  const isAccessAllowed = isUnlocked;
  const currentEmbedUrl = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col bg-[#050505] text-[#f4f4f5] px-4 py-6 sm:px-6 lg:px-8">
      {/* Background Cinematic Monochrome Glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[600px] w-[800px] rounded-full bg-white/[0.015] blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto space-y-6">
        {/* Top Control Header with Live Countdown & Status */}
        <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Clapperboard className="h-3.5 w-3.5 text-zinc-300" />
                MODULE 03 / CINECHILL VIBETUBE
              </span>

              {isAccessAllowed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Unlock className="h-3 w-3" />
                  ĐÃ ĐỦ ĐIỀU KIỆN (MỞ KHÓA)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Lock className="h-3 w-3" />
                  ĐANG KHÓA (CẦN {goalMinutes} PHÚT HỌC)
                </span>
              )}

              {/* YouTube Premium Status Pill / Button */}
              <button
                onClick={() => setPremiumModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium transition-colors cursor-pointer border ${
                  isPremiumSaved
                    ? 'bg-amber-400/10 text-amber-300 border-amber-400/30 hover:bg-amber-400/20'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
                title="Cắm tài khoản YouTube Premium của bạn vào Monokuro"
              >
                <Crown className={`h-3 w-3 ${isPremiumSaved ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                <span>
                  {isPremiumSaved ? `PREMIUM: ${premiumEmail.split('@')[0]}` : 'CẮM TÀI KHOẢN YTB PREMIUM'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-light font-mono text-white tracking-tight">
                CINE<span className="font-semibold text-zinc-400">CHILL</span>
                <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                  VIBETUBE PORT
                </span>
              </h1>
              <span className="text-zinc-600">|</span>
              <p className="text-xs sm:text-sm text-zinc-400">
                Tìm kiếm và xem phim YouTube trực tiếp trong Monokuro không cần copy link rườm rà.
              </p>
            </div>

            {/* Continuous Real-time Progress Bar & Study Time */}
            <div className="space-y-1.5 pt-1 max-w-md">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>
                  Thời gian học hôm nay: <strong className="text-white">{studiedFormatted}</strong> / {goalMinutes}m 00s
                </span>
                <span className="text-zinc-500">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-zinc-400 to-white transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            </div>

            {/* Goal of the Day Selector Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="text-zinc-500 uppercase flex items-center gap-1 text-[10px]">
                <Target className="h-3 w-3 text-amber-400" />
                MỤC TIÊU MỞ KHÓA:
              </span>
              <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleSetGoalMinutes(m)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                      goalMinutes === m
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
                <button
                  onClick={() => {
                    setCustomGoalInput(String(goalMinutes));
                    setCustomGoalModalOpen(true);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors flex items-center gap-1 cursor-pointer ${
                    ![15, 30, 45, 60].includes(goalMinutes)
                      ? 'bg-amber-400 text-black font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Chỉnh mục tiêu tùy chỉnh"
                >
                  <Edit3 className="h-2.5 w-2.5" />
                  <span>{![15, 30, 45, 60].includes(goalMinutes) ? `${goalMinutes}m` : 'Tùy chỉnh'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Countdown Box & Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-end lg:self-center">
            {/* Live Countdown Counter Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 font-mono shadow-sm">
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1 justify-end">
                  <span className={`h-1.5 w-1.5 rounded-full ${timerStatus === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isAccessAllowed ? 'MỤC TIÊU HỌC' : 'ĐẾM NGƯỢC MỞ KHÓA'}
                </span>
                <span className="text-base font-bold text-white tracking-widest">
                  {isAccessAllowed ? '00:00 (HOÀN TẤT)' : countdownDisplay}
                </span>
              </div>
            </div>

            <Link
              href="/focusx"
              className="px-4 py-2.5 rounded-xl text-xs font-mono bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm font-semibold"
            >
              <Timer className="h-3.5 w-3.5" />
              <span>VÀO HỌC BẤM GIỜ</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CINEMA CONTAINER WITH IN-PAGE FROSTED GLASS LOCKED OVERLAY                */}
        {/* ========================================================================= */}
        <div className="relative">
          {/* ONLY IN-PAGE FROSTED GLASS LOCKED OVERLAY */}
          {!isAccessAllowed && (
            <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4 border border-white/10">
              <div className="h-16 w-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-amber-300 shadow-xl">
                <Lock className="h-8 w-8 animate-pulse" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-xl font-mono font-medium text-white tracking-tight">
                  Chế Độ Xem Thử Giao Diện Đang Khóa
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Rạp phim VibeTube đã bị khóa. Hãy học đủ {goalMinutes} phút trong ngày để kích hoạt toàn bộ rạp chiếu.
                </p>
              </div>

              {/* Real-time Countdown Display on the Locked Card */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 max-w-sm w-full mx-auto font-mono text-center space-y-1 shadow-inner">
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${timerStatus === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>ĐẾM NGƯỢC THỜI GIAN CÒN LẠI ĐỂ MỞ KHÓA</span>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-widest py-1">
                  {countdownDisplay}
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 pt-1 border-t border-white/5">
                  <span>Hôm nay: {studiedFormatted}</span>
                  <span className="text-amber-300">
                    {timerStatus === 'running'
                      ? '● Đang đếm lùi theo FocusX'
                      : timerStatus === 'paused'
                      ? '⏸️ FocusX đang tạm dừng'
                      : '○ Bấm học để đếm lùi'}
                  </span>
                </div>
              </div>

              {/* Quick Goal Selector on Locked Card */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-xs text-zinc-400">
                <span className="text-[11px] text-zinc-500">Mục tiêu hôm nay:</span>
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleSetGoalMinutes(m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors border cursor-pointer ${
                      goalMinutes === m
                        ? 'bg-amber-400 text-black border-amber-400 font-bold'
                        : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
                <button
                  onClick={() => {
                    setCustomGoalInput(String(goalMinutes));
                    setCustomGoalModalOpen(true);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-colors border cursor-pointer flex items-center gap-1 ${
                    ![15, 30, 45, 60].includes(goalMinutes)
                      ? 'bg-amber-400 text-black border-amber-400 font-bold'
                      : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Edit3 className="h-3 w-3" />
                  <span>{![15, 30, 45, 60].includes(goalMinutes) ? `${goalMinutes}m` : 'Tùy chỉnh'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center pt-2">
                <Link
                  href="/focusx"
                  className="px-6 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <Timer className="h-3.5 w-3.5" />
                  <span>VÀO FOCUSX HỌC NGAY</span>
                </Link>
              </div>
            </div>
          )}

          {/* Actual VibeTube Theater Deck */}
          <div className={!isAccessAllowed ? 'pointer-events-none opacity-30 select-none' : 'space-y-6'}>
            
            {/* ======================================================== */}
            {/* 1. REMARKABLE IN-ROOM YOUTUBE SEARCH HUB (PLACED ON TOP) */}
            {/* ======================================================== */}
            <div className="liquid-glass-card rounded-2xl p-5 border border-white/20 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_10px_35px_rgba(0,0,0,0.6)] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>VIBETUBE SEARCH & DISCOVERY HUB</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        DIRECT YOUTUBE
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Tìm bất kỳ phim, video, ambiance hoặc dán link/ID YouTube xem ngay không cần mở tab ngoài.
                    </p>
                  </div>
                </div>
              </div>

              {/* Remarkable Search Form Input */}
              <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm phim, cảnh mưa anime, nhạc lofi, vũ trụ, khoa học hoặc dán link YouTube..."
                    className="w-full h-12 rounded-xl bg-black/50 border border-white/20 pl-11 pr-10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:bg-black/70 transition-all font-mono shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
                      title="Xóa tìm kiếm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-12 px-6 rounded-xl bg-white text-black font-mono text-xs sm:text-sm font-bold hover:bg-zinc-200 transition-all shrink-0 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Search className="h-4 w-4 text-black" />}
                  <span>{isSearching ? 'ĐANG TÌM...' : 'TÌM YOUTUBE'}</span>
                </button>
              </form>

              {/* Quick Vibe Exploration Pills */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>GỢI Ý CHỦ ĐỀ CHILL NHANH (1-CLICK DISCOVERY):</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
                  {QUICK_VIBE_CATEGORIES.map((cat) => {
                    const isSelected = activeCategory === cat.label;
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-mono transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-white text-black font-bold shadow-sm'
                            : 'border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:border-white/30'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 2. THEATER VIDEO FRAME DECK                              */}
            {/* ======================================================== */}
            <div ref={theaterDeckRef} className="relative mx-auto max-w-5xl transition-all duration-300">
              {/* Ambient Glow Light behind Video */}
              {ambientGlow && (
                <div className="pointer-events-none absolute -inset-4 bg-white/[0.04] blur-2xl rounded-3xl transition-opacity duration-500" />
              )}

              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                {/* Video Player Frame */}
                <div className="relative w-full aspect-video bg-zinc-950">
                  <iframe
                    src={currentEmbedUrl}
                    title="VibeTube Cinema Player"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Integrated Theater Bar Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0a0a0a] border-t border-white/10 text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-white font-medium flex items-center gap-1.5 truncate max-w-md">
                      <Film className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      {currentVideoTitle}
                    </span>
                    <span className="text-zinc-600 hidden sm:inline">|</span>
                    <span className="text-zinc-400 text-[11px] hidden sm:inline truncate">{currentVideoChannel}</span>
                    <span className="text-zinc-600 hidden sm:inline">|</span>
                    <span className="text-zinc-500 text-[11px] hidden sm:inline">{currentVideoDuration}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Ambient Glow Toggle */}
                    <button
                      onClick={() => setAmbientGlow(!ambientGlow)}
                      className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        ambientGlow
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'border-white/5 text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Hiệu ứng quầng sáng rạp chiếu"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span className="hidden sm:inline">Đèn Rạp</span>
                    </button>

                    {/* External Link */}
                    <a
                      href={`https://www.youtube.com/watch?v=${currentVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                      title="Mở trên YouTube"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="hidden sm:inline">YouTube</span>
                    </a>

                    {/* Full F11 Mode Button */}
                    <button
                      onClick={toggleF11Mode}
                      className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Chế độ toàn màn hình điện ảnh (F11)"
                    >
                      {isF11Fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                      <span className="hidden sm:inline">{isF11Fullscreen ? 'Thu Nhỏ' : 'F11 Rạp'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 3. VIDEO SEARCH RESULTS (WITH VIEWS & LATEST PUSH TIME)  */}
            {/* ======================================================== */}
            <div className="liquid-glass-card rounded-2xl p-5 border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-mono text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">
                    KẾT QUẢ VIDEO TRỰC TUYẾN ({searchResults.length})
                  </h3>
                </div>
                {isSearching ? (
                  <span className="text-[11px] font-mono text-amber-300 animate-pulse flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Đang tìm video mới nhất trên YouTube...
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-zinc-500">
                    Bấm bất kỳ video nào để chiếu ngay trên màn hình lớn
                  </span>
                )}
              </div>

              {/* Video Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {searchResults.map((video) => {
                  const isPlaying = currentVideoId === video.id;
                  return (
                    <div
                      key={video.id}
                      onClick={() => handlePlayVideo(video)}
                      className={`group cursor-pointer rounded-2xl p-3 border transition-all duration-200 flex flex-col justify-between ${
                        isPlaying
                          ? 'bg-white/[0.08] border-white/40 shadow-lg'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          
                          {/* Duration Badge */}
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white border border-white/10">
                            {video.duration}
                          </span>

                          {/* Playing Status Badge */}
                          {isPlaying && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-white text-black font-semibold flex items-center gap-1 shadow">
                              <Play className="h-2.5 w-2.5 fill-current" />
                              ĐANG CHIẾU
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-xs font-mono font-medium text-white group-hover:text-zinc-200 line-clamp-2 leading-snug">
                            {video.title}
                          </h4>

                          <p className="text-[11px] text-zinc-400 font-mono truncate">
                            {video.channel}
                          </p>

                          {/* Views Count and Latest Push Time (Required) */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] text-zinc-400 border-t border-white/5">
                            {video.views && (
                              <span className="flex items-center gap-1 text-zinc-300">
                                <Eye className="h-3 w-3 text-zinc-500" />
                                <span>{video.views}</span>
                              </span>
                            )}

                            {video.publishedTime && (
                              <span className="flex items-center gap-1 text-zinc-400">
                                <Clock className="h-3 w-3 text-zinc-500" />
                                <span>{video.publishedTime}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="button"
                          className={`w-full py-1.5 px-3 rounded-xl font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            isPlaying
                              ? 'bg-white text-black font-bold'
                              : 'bg-white/5 text-zinc-300 group-hover:bg-white group-hover:text-black'
                          }`}
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>{isPlaying ? 'ĐANG PHÁT TRÊN RẠP' : 'CHIẾU NGAY'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* YOUTUBE PREMIUM ACCOUNT VAULT MODAL                      */}
      {/* ======================================================== */}
      {premiumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-card rounded-2xl max-w-md w-full p-6 border-white/15 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-400 fill-amber-400" />
                <h3 className="font-mono text-sm font-semibold text-white">Cổng Tài Khoản YouTube Premium</h3>
              </div>
              <button
                onClick={() => setPremiumModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-amber-400/5 border border-amber-400/20 p-3 text-xs font-mono text-amber-300/90 leading-relaxed">
              💡 Cắm tài khoản YouTube Premium của bạn vào đây. Monokuro sẽ ưu tiên luồng stream không quảng cáo (Zero Ads), giữ trọn vẹn chất lượng video 4K sắc nét nhất.
            </div>

            <form onSubmit={handleSavePremiumVault} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 block">Tài khoản Google / Email YouTube Premium:</label>
                <input
                  type="email"
                  value={premiumEmail}
                  onChange={(e) => setPremiumEmail(e.target.value)}
                  placeholder="vip.user@gmail.com"
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 block">Mật khẩu hoặc Cookie / Auth Token (Tùy chọn):</label>
                <input
                  type="password"
                  value={premiumToken}
                  onChange={(e) => setPremiumToken(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-3.5 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={antiAdsActive}
                  onChange={(e) => setAntiAdsActive(e.target.checked)}
                  className="rounded border-white/20 accent-amber-400"
                />
                <span className="text-zinc-300">Tự động kích hoạt Anti-Ads & Stream tốc độ cao</span>
              </label>

              {isPremiumSaved && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đã ghi nhớ tài khoản Premium ({premiumEmail}) trong hệ thống Monokuro.</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPremiumModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold transition-colors shadow cursor-pointer"
                >
                  {premiumEmail.trim() ? 'Lưu Tài Khoản Premium' : 'Xóa / Ngắt Kết Nối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Goal Modal */}
      {customGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-card rounded-2xl max-w-sm w-full p-6 border-white/15 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-400" />
                <h3 className="font-mono text-sm font-semibold text-white">Chỉnh Mục Tiêu Mở Khóa</h3>
              </div>
              <button
                onClick={() => setCustomGoalModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleApplyCustomGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">
                  Số phút cần học hôm nay (1 - 240 phút):
                </label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  autoFocus
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  placeholder="Ví dụ: 30"
                  className="w-full rounded-xl bg-white/[0.05] border border-white/15 px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCustomGoalModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold transition-colors shadow cursor-pointer"
                >
                  Lưu Mục Tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
