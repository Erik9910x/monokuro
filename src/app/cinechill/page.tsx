'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Film,
  Play,
  ExternalLink,
  Lock,
  Unlock,
  Sparkles,
  Maximize2,
  Minimize2,
  Tv,
  VolumeX,
  CloudRain,
  Flame,
  Sliders,
  Timer,
  Clapperboard,
  Coffee,
  ShieldCheck,
  UserCheck,
  Monitor,
  CheckCircle2,
  Target,
  Edit3,
  X,
} from 'lucide-react';
import { useTimerStore } from '@/lib/store/timerStore';
import { getCompletedStudySecondsToday } from '@/lib/storage';
import { playCompletionChime } from '@/lib/timer/audio';

// ===== CURATED IN-APP CHILL CINEMA (VIBETUBE) =====
interface CuratedVideo {
  id: string;
  title: string;
  category: string;
  duration: string;
  youtubeId: string;
  thumbnail: string;
  description: string;
}

const CURATED_CINEMA: CuratedVideo[] = [
  {
    id: 'ghibli-ambient',
    title: 'Studio Ghibli 4K Scenic Atmosphere',
    category: 'Anime Scenic Chill',
    duration: '1h 30m',
    youtubeId: 'WJq43Wsh0I8',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    description: 'Bầu không khí nông thôn thanh bình và kỳ ảo qua các thước phim biểu tượng của Studio Ghibli.',
  },
  {
    id: 'shinkai-weather',
    title: 'Makoto Shinkai Visual Scenery 4K',
    category: 'Cinematic Mood',
    duration: '45m',
    youtubeId: 'q76bMs-NwRk',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    description: 'Thế giới mưa rơi, ánh nắng lung linh và bầu trời Tokyo siêu thực phong cách 5cm/s và Your Name.',
  },
  {
    id: 'cyberpunk-tokyo',
    title: 'Blade Runner Tokyo Rainy Night Walk',
    category: 'Cyberpunk Noir',
    duration: '1h 00m',
    youtubeId: 'sFzT1fFvUu8',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
    description: 'Dạo bước dưới mưa đêm Shinjuku ngập tràn ánh đèn neon mờ ảo, cảm giác tĩnh lặng và sâu lắng.',
  },
  {
    id: 'interstellar-space',
    title: 'Cosmic Journey & Deep Ambient Space 4K',
    category: 'Sci-Fi Calm',
    duration: '2h 15m',
    youtubeId: '1zNwgI3w_n0',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    description: 'Du hành giữa các vì sao, hố đen và vũ trụ bao la với âm hưởng tối giản thư giãn tuyệt đối.',
  },
  {
    id: 'rainy-kyoto-cafe',
    title: 'Cozy Rainy Café in Ancient Kyoto',
    category: 'Nature & Coffee',
    duration: '1h 10m',
    youtubeId: 'eZe4QnHArCE',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    description: 'Tiếng mưa rơi nhẹ bên hiên quán cà phê gỗ truyền thống Nhật Bản, xoa dịu tâm trí sau giờ học.',
  },
];

// ===== CURATED NETFLIX WATCHLIST (FLIXOUT) =====
interface NetflixItem {
  id: string;
  title: string;
  year: string;
  genre: string;
  duration: string;
  netflixUrl: string;
  thumbnail: string;
  synopsis: string;
}

const NETFLIX_RECOMMENDATIONS: NetflixItem[] = [
  {
    id: 'arcane',
    title: 'Arcane: League of Legends',
    year: '2021-2024',
    genre: 'Animation / Sci-Fi / Drama',
    duration: '40m / tập',
    netflixUrl: 'https://www.netflix.com/title/81435684',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    synopsis: 'Kiệt tác hoạt hình đoạt giải Emmy về sự đối đầu giữa thành phố tương lai Piltover và thế giới ngầm Zaun.',
  },
  {
    id: 'spirited-away',
    title: 'Spirited Away (Vùng Đất Linh Hồn)',
    year: '2001',
    genre: 'Ghibli Anime / Fantasy',
    duration: '2h 05m',
    netflixUrl: 'https://www.netflix.com/title/60023642',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    synopsis: 'Cuộc phiêu lưu vào thế giới thần linh của cô bé Chihiro, hình ảnh và âm nhạc sâu lắng kinh điển.',
  },
  {
    id: 'cyberpunk-edgerunners',
    title: 'Cyberpunk: Edgerunners',
    year: '2022',
    genre: 'Anime / Action / Cyberpunk',
    duration: '25m / tập',
    netflixUrl: 'https://www.netflix.com/title/81054853',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80',
    synopsis: 'Câu chuyện cuồng nhiệt và nghẹn ngào tại Night City của chàng trai David Martinez và Lucy.',
  },
  {
    id: 'our-planet',
    title: 'Our Planet (Hành Tinh Của Chúng Ta)',
    year: '2019-2023',
    genre: 'Documentary 4K / Nature',
    duration: '50m / tập',
    netflixUrl: 'https://www.netflix.com/title/80049832',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    synopsis: 'Những khung hình thiên nhiên hoang dã siêu sắc nét 4K HDR lột tả vẻ đẹp choáng ngợp của Trái Đất.',
  },
  {
    id: 'stranger-things',
    title: 'Stranger Things',
    year: '2016-2025',
    genre: 'Sci-Fi / Mystery / 80s Vibe',
    duration: '50m / tập',
    netflixUrl: 'https://www.netflix.com/title/80057281',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    synopsis: 'Thị trấn Hawkins thập niên 80 cùng những hiện tượng siêu nhiên huyền bí và tình bạn chân thành.',
  },
];

export default function CineChillPage() {
  const { status: timerStatus, startedAt, durationMs, pausedRemainingMs, mode } = useTimerStore();

  // Goal of the Day & study time state
  const [goalMinutes, setGoalMinutes] = useState<number>(30);
  const goalMinutesRef = useRef<number>(30);
  const [customGoalModalOpen, setCustomGoalModalOpen] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('');

  const [totalStudiedSecs, setTotalStudiedSecs] = useState(0);
  const [studiedFormatted, setStudiedFormatted] = useState('0m 00s');
  const [countdownRemainingSecs, setCountdownRemainingSecs] = useState(1800); // in seconds
  const [countdownDisplay, setCountdownDisplay] = useState('30:00');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [demoBypass, setDemoBypass] = useState(false); // Default false: true lock state
  const [activeTab, setActiveTab] = useState<'vibetube' | 'flixout'>('vibetube');

  // Base past seconds from IndexedDB
  const basePastSecondsRef = useRef<number>(0);

  // VibeTube (In-App Cinema) state
  const [selectedVideo, setSelectedVideo] = useState<CuratedVideo>(CURATED_CINEMA[0]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [currentPlayUrl, setCurrentPlayUrl] = useState(
    `https://www.youtube.com/embed/${CURATED_CINEMA[0].youtubeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`
  );
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [isF11Fullscreen, setIsF11Fullscreen] = useState(false);
  const theaterDeckRef = useRef<HTMLDivElement | null>(null);

  // FlixOut (Netflix Pop-out) state
  const [netflixProfileName, setNetflixProfileName] = useState('Monokuro Member');
  const [netflixEmail, setNetflixEmail] = useState('');
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [netflixCustomUrl, setNetflixCustomUrl] = useState('');
  const [popoutSize, setPopoutSize] = useState<'S' | 'M' | 'L'>('M');
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(30);
  const [isBreakTimerActive, setIsBreakTimerActive] = useState(false);
  const [breakRemainingSeconds, setBreakRemainingSeconds] = useState(30 * 60);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'fireplace'>('none');

  // Load account & Goal of the Day from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('monokuro_netflix_profile');
      if (savedProfile) setNetflixProfileName(savedProfile);
      const savedEmail = localStorage.getItem('monokuro_netflix_email');
      if (savedEmail) setNetflixEmail(savedEmail);

      const savedGoal = localStorage.getItem('monokuro_cinechill_goal_minutes');
      if (savedGoal) {
        const parsed = parseInt(savedGoal, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 240) {
          setGoalMinutes(parsed);
          goalMinutesRef.current = parsed;
        }
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

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('monokuro_netflix_profile', netflixProfileName.trim() || 'Monokuro Member');
      localStorage.setItem('monokuro_netflix_email', netflixEmail.trim());
    }
    setIsEditingAccount(false);
  };

  // Continuous real-time countdown & study time ticker (runs every 200ms)
  useEffect(() => {
    // 1. Fetch completed sessions from IndexedDB
    const refreshBasePastSeconds = () => {
      const activeStartedAt = useTimerStore.getState().startedAt;
      getCompletedStudySecondsToday(activeStartedAt).then((secs) => {
        basePastSecondsRef.current = secs;
      });
    };

    refreshBasePastSeconds();

    // Re-verify past completed sessions from IndexedDB every 2.5s
    const dbSyncInterval = setInterval(refreshBasePastSeconds, 2500);

    // 2. High-precision live ticker (200ms)
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

      // Format countdown display (mm:ss or hh:mm:ss if >= 60m)
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

      // Format total studied display
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

  // Break Timer Countdown for FlixOut
  useEffect(() => {
    if (!isBreakTimerActive) return;

    const timer = setInterval(() => {
      setBreakRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsBreakTimerActive(false);
          playCompletionChime();
          alert('⏰ Hết giờ giải lao CineChill! Hãy trở lại bàn học để duy trì chuỗi tập trung bạn nhé!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreakTimerActive]);

  // VibeTube URL Resolver
  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    let target = customUrlInput.trim();
    const ytMatch = target.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      setCurrentPlayUrl(
        `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`
      );
    } else {
      setCurrentPlayUrl(target);
    }
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

  // FlixOut Launch Netflix Frameless Mini Pop-out
  const handleLaunchNetflix = (urlToLaunch?: string) => {
    const targetUrl = urlToLaunch || netflixCustomUrl.trim() || 'https://www.netflix.com/browse';

    const sizes = {
      S: { w: 800, h: 480 },
      M: { w: 1040, h: 600 },
      L: { w: 1280, h: 740 },
    };
    const { w, h } = sizes[popoutSize];
    const left = Math.max(50, window.screen.width - w - 60);
    const top = 60;

    window.open(
      targetUrl,
      'netflix_cinechill_theater',
      `width=${w},height=${h},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );

    setBreakRemainingSeconds(breakDurationMinutes * 60);
    setIsBreakTimerActive(true);
  };

  const isAccessAllowed = demoBypass || isUnlocked;

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
                MODULE 03 / CINECHILL REWARD ROOM
              </span>

              {isAccessAllowed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Unlock className="h-3 w-3" />
                  {demoBypass ? 'DEMO TEST: ĐANG MỞ KHÓA' : 'ĐÃ ĐỦ ĐIỀU KIỆN (MỞ KHÓA)'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Lock className="h-3 w-3" />
                  ĐANG KHÓA (CẦN {goalMinutes} PHÚT HỌC)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-light font-mono text-white tracking-tight">
                CINE<span className="font-semibold text-zinc-400">CHILL</span>
              </h1>
              <span className="text-zinc-600">|</span>
              <p className="text-xs sm:text-sm text-zinc-400">
                Phòng chiếu phim thư giãn thưởng cho phiên làm việc & học tập kỷ luật.
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

            {/* Demo Toggle Button */}
            <button
              onClick={() => setDemoBypass(!demoBypass)}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                demoBypass
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>TEST DEMO: {demoBypass ? 'BẬT (Mở khóa)' : 'TẮT (Khóa thật)'}</span>
            </button>

            <Link
              href="/focusx"
              className="px-3.5 py-2 rounded-xl text-xs font-mono bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm font-semibold"
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
          {/* ONLY IN-PAGE FROSTED GLASS LOCKED OVERLAY (NO FULLSCREEN MODAL POPUP) */}
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
                  Trình phát phim VibeTube và FlixOut đã bị khóa. Hãy học đủ {goalMinutes} phút để kích hoạt toàn bộ rạp chiếu.
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
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <Link
                  href="/focusx"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <Timer className="h-3.5 w-3.5" />
                  <span>VÀO FOCUSX HỌC NGAY</span>
                </Link>

                <button
                  onClick={() => setDemoBypass(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/15 text-zinc-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
                >
                  Bật Demo Test Để Trải Nghiệm →
                </button>
              </div>
            </div>
          )}

          {/* Actual Cinema Decks */}
          <div className={!isAccessAllowed ? 'pointer-events-none opacity-30 select-none' : 'space-y-6'}>
            {/* Mode Switcher Tabs (VibeTube vs FlixOut) */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl max-w-xl mx-auto font-mono text-xs">
              <button
                onClick={() => setActiveTab('vibetube')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'vibetube'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Tv className="h-4 w-4" />
                <span>VIBETUBE (IN-WEB)</span>
              </button>

              <button
                onClick={() => setActiveTab('flixout')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'flixout'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Film className="h-4 w-4" />
                <span>FLIXOUT (NETFLIX POP-OUT)</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* TAB CONTENT: VIBETUBE (IN-APP CINEMA + ANTI-ADS + F11)   */}
            {/* ======================================================== */}
            {activeTab === 'vibetube' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Method Overview Pill with Anti-Ads & F11 Notice */}
                <div className="liquid-pill rounded-xl p-3.5 text-xs font-mono text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">VibeTube:</span>
                    <span>Trình chiếu gọn 100% trong web Monokuro với chuẩn hình ảnh sắc nét.</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      ANTI-ADS ACTIVE (0% QUẢNG CÁO)
                    </span>

                    <button
                      onClick={toggleF11Mode}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] transition-colors cursor-pointer"
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      <span>{isF11Fullscreen ? 'THOÁT F11' : 'FULL F11 MODE'}</span>
                    </button>
                  </div>
                </div>

                {/* Theater Deck */}
                <div ref={theaterDeckRef} className="relative mx-auto max-w-5xl transition-all duration-300">
                  {/* Ambient Glow Light behind Video */}
                  {ambientGlow && (
                    <div className="pointer-events-none absolute -inset-4 bg-white/[0.04] blur-2xl rounded-3xl transition-opacity duration-500" />
                  )}

                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                    {/* Video Player Frame */}
                    <div className="relative w-full aspect-video bg-zinc-950">
                      <iframe
                        src={currentPlayUrl}
                        title="VibeTube Cinema Player"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>

                    {/* Integrated Theater Bar Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#0a0a0a] border-t border-white/10 text-xs font-mono text-zinc-400">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
                          <Film className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          {selectedVideo ? selectedVideo.title : 'Tùy Chỉnh Stream'}
                        </span>
                        <span className="text-zinc-600 hidden sm:inline">|</span>
                        <span className="text-zinc-500 hidden sm:inline">{selectedVideo?.duration}</span>
                      </div>

                      <div className="flex items-center gap-2">
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

                        {/* Full F11 Mode Button */}
                        <button
                          onClick={toggleF11Mode}
                          className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Chế độ toàn màn hình điện ảnh (F11)"
                        >
                          {isF11Fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                          <span className="hidden sm:inline">{isF11Fullscreen ? 'Thu Nhỏ' : 'F11 Rạp Phim'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Video / YouTube Input */}
                <form onSubmit={handleLoadCustomUrl} className="flex gap-2 max-w-2xl mx-auto">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="Dán link phim YouTube hoặc video stream (mp4/m3u8)..."
                      className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-semibold hover:bg-zinc-200 transition-colors shrink-0 cursor-pointer"
                  >
                    PHÁT NGAY
                  </button>
                </form>

                {/* Curated Film Catalog */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-mono font-medium text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-zinc-400" />
                      DANH MỤC PHIM VIBETUBE CHILL THƯ GIÃN TUYỂN CHỌN
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono">Bấm vào để chiếu ngay</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CURATED_CINEMA.map((video) => {
                      const isPlaying = selectedVideo?.id === video.id;
                      return (
                        <div
                          key={video.id}
                          onClick={() => {
                            setSelectedVideo(video);
                            setCurrentPlayUrl(
                              `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`
                            );
                          }}
                          className={`group cursor-pointer rounded-2xl p-3 border transition-all duration-200 ${
                            isPlaying
                              ? 'bg-white/[0.08] border-white/40 shadow-lg'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-900">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white">
                              {video.duration}
                            </span>
                            {isPlaying && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-white text-black font-semibold flex items-center gap-1 shadow">
                                <Play className="h-2.5 w-2.5 fill-current" />
                                ĐANG CHIẾU
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                              {video.category}
                            </div>
                            <h4 className="text-xs font-mono font-medium text-white group-hover:text-zinc-200 line-clamp-1">
                              {video.title}
                            </h4>
                            <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                              {video.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB CONTENT: FLIXOUT (NETFLIX POP-OUT + ACC VAULT)       */}
            {/* ======================================================== */}
            {activeTab === 'flixout' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Method Overview Pill */}
                <div className="liquid-pill rounded-xl p-3.5 text-xs font-mono text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-semibold text-white">FlixOut:</span>
                    <span>Rạp phim Netflix mini pop-out không viền, đồng bộ cookie và kiểm soát giờ giải lao.</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <span>Độ phân giải: 4K/HDR gốc · Phụ đề chính chủ</span>
                  </div>
                </div>

                {/* Linked Netflix Account Vault Card */}
                <div className="liquid-glass-card rounded-2xl p-5 border-white/10 max-w-4xl mx-auto space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-red-600/10 text-red-400 flex items-center justify-center border border-red-600/20">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-mono font-medium text-white flex items-center gap-2">
                          HỒ SƠ TÀI KHOẢN NETFLIX ĐÃ LIÊN KẾT
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            ● ĐÃ SẴN SÀNG
                          </span>
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Profile: <strong className="text-white">{netflixProfileName}</strong>{' '}
                          {netflixEmail ? `(${netflixEmail})` : '(Tài khoản trình duyệt)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingAccount(!isEditingAccount)}
                        className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        {isEditingAccount ? 'Đóng Chỉnh Sửa' : 'Cập Nhật Hồ Sơ'}
                      </button>

                      <a
                        href="https://www.netflix.com/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 hover:border-white/20 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Đăng Nhập Netflix
                      </a>
                    </div>
                  </div>

                  {/* Edit Account Form */}
                  {isEditingAccount && (
                    <form onSubmit={handleSaveAccount} className="p-4 bg-white/[0.02] rounded-xl border border-white/10 space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-zinc-400">Tên Profile người xem:</label>
                          <input
                            type="text"
                            value={netflixProfileName}
                            onChange={(e) => setNetflixProfileName(e.target.value)}
                            placeholder="Ví dụ: Monokuro VIP"
                            className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-zinc-400">Email ghi nhớ (tùy chọn):</label>
                          <input
                            type="email"
                            value={netflixEmail}
                            onChange={(e) => setNetflixEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        Lưu Thông Tin Profile
                      </button>
                    </form>
                  )}
                </div>

                {/* FlixOut Controller Deck */}
                <div className="liquid-glass-card rounded-2xl p-6 border-white/10 space-y-6 max-w-4xl mx-auto">
                  {/* Settings Grid: Window Size & Break Timer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                    {/* Window Size Selection */}
                    <div className="space-y-2">
                      <label className="text-zinc-400 font-medium block">
                        1. KÍCH THƯỚC CỬA SỔ MINI THEATER:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'S', label: 'Nhỏ (800x480)', desc: 'Góc màn hình' },
                          { key: 'M', label: 'Vừa (1040x600)', desc: 'Rạp tiêu chuẩn' },
                          { key: 'L', label: 'Lớn (1280x740)', desc: 'Gần full screen' },
                        ].map((sz) => (
                          <button
                            key={sz.key}
                            onClick={() => setPopoutSize(sz.key as any)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              popoutSize === sz.key
                                ? 'bg-white text-black font-semibold border-white'
                                : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className="text-xs font-bold">{sz.key}</div>
                            <div className="text-[10px] opacity-80">{sz.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Break Timer Duration */}
                    <div className="space-y-2">
                      <label className="text-zinc-400 font-medium block">
                        2. THỜI GIAN GIẢI LAO TRƯỚC KHI QUAY LẠI HỌC:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { minutes: 15, label: '15 Phút', desc: 'Nghỉ ngắn' },
                          { minutes: 30, label: '30 Phút', desc: '1 hiệp Anime' },
                          { minutes: 45, label: '45 Phút', desc: '1 tập Phim' },
                        ].map((d) => (
                          <button
                            key={d.minutes}
                            onClick={() => {
                              setBreakDurationMinutes(d.minutes);
                              setBreakRemainingSeconds(d.minutes * 60);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              breakDurationMinutes === d.minutes
                                ? 'bg-white text-black font-semibold border-white'
                                : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <div className="text-xs font-bold">{d.label}</div>
                            <div className="text-[10px] opacity-80">{d.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Ambient Soundscape Selection for Room */}
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <label className="text-zinc-400 font-medium block">
                      3. ÂM THANH MÔI TRƯỜNG PHÒNG CHIẾU (TÙY CHỌN):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'none', label: 'Tắt âm môi trường', icon: VolumeX },
                        { key: 'rain', label: 'Mưa rơi tí tách', icon: CloudRain },
                        { key: 'fireplace', label: 'Lò sưởi bập bùng', icon: Flame },
                      ].map((s) => {
                        const Icon = s.icon;
                        return (
                          <button
                            key={s.key}
                            onClick={() => setAmbientSound(s.key as any)}
                            className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                              ambientSound === s.key
                                ? 'bg-white/15 border-white/30 text-white'
                                : 'border-white/5 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Netflix Link Input & Quick Launch */}
                  <div className="space-y-2 pt-2">
                    <label className="text-zinc-400 font-mono text-xs font-medium block">
                      4. NHẬP LINK BÀI HÁT / PHIM TRÊN NETFLIX HOẶC BẤM DANH SÁCH DƯỚI:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={netflixCustomUrl}
                        onChange={(e) => setNetflixCustomUrl(e.target.value)}
                        placeholder="https://www.netflix.com/watch/... hoặc https://www.netflix.com/title/..."
                        className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-all font-mono"
                      />
                      <button
                        onClick={() => handleLaunchNetflix()}
                        className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg cursor-pointer"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        KHỞI CHIẾU FLIXOUT & BẬT ĐẾM GIỜ
                      </button>
                    </div>
                  </div>

                  {/* Active Break Timer Display */}
                  {isBreakTimerActive && (
                    <div className="bg-white/[0.03] border border-white/15 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                          <Coffee className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400">Thời gian nghỉ ngơi thư giãn còn lại:</p>
                          <p className="text-xl font-bold text-white tracking-widest">
                            {Math.floor(breakRemainingSeconds / 60)}:{(breakRemainingSeconds % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsBreakTimerActive(false);
                            setBreakRemainingSeconds(breakDurationMinutes * 60);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Hủy Bộ Đếm
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Netflix Top Curated Movies */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-mono font-medium text-white uppercase tracking-wider flex items-center gap-2">
                      <Clapperboard className="h-4 w-4 text-red-500" />
                      PHIM NETFLIX ĐỀ XUẤT CHO GIỜ NGHỈ
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono">Bấm để mở rạp chiếu 1-Click</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {NETFLIX_RECOMMENDATIONS.map((film) => (
                      <div
                        key={film.id}
                        className="group liquid-glass-card rounded-2xl p-4 border-white/10 hover:border-white/25 transition-all duration-200 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                            <img
                              src={film.thumbnail}
                              alt={film.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-600/90 text-white font-medium">
                              NETFLIX
                            </span>
                            <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-zinc-300">
                              {film.year} · {film.duration}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                              {film.genre}
                            </div>
                            <h4 className="text-sm font-mono font-semibold text-white group-hover:text-zinc-200">
                              {film.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                              {film.synopsis}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleLaunchNetflix(film.netflixUrl)}
                          className="mt-4 w-full py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white text-zinc-200 hover:text-black font-mono text-xs font-medium transition-all flex items-center justify-center gap-1.5 border border-white/10 group-hover:border-white/20 cursor-pointer"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          MỞ PHIM TRÊN FLIXOUT
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
