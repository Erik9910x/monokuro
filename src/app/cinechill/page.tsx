'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Film,
  Play,
  ExternalLink,
  Lock,
  Unlock,
  Sparkles,
  Maximize2,
  Tv,
  VolumeX,
  CloudRain,
  Flame,
  Sliders,
  Timer,
  Clapperboard,
  Coffee,
} from 'lucide-react';
import { useTimerStore } from '@/lib/store/timerStore';
import { getTodayStudyStats, TodayStudyStats } from '@/lib/storage';
import { playCompletionChime } from '@/lib/timer/audio';

// ===== CURATED IN-APP CHILL CINEMA (PHƯƠNG ÁN A) =====
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

// ===== CURATED NETFLIX WATCHLIST (PHƯƠNG ÁN B) =====
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
  const { status: timerStatus, startedAt, mode } = useTimerStore();

  // Study time & unlock state
  const [studyStats, setStudyStats] = useState<TodayStudyStats>({
    totalSeconds: 0,
    totalFormatted: '0m 00s',
    targetSeconds: 1800,
    progressPercent: 0,
    isUnlocked: false,
    sessionsCount: 0,
  });
  const [demoBypass, setDemoBypass] = useState(true); // Default ON for immediate evaluation
  const [activeTab, setActiveTab] = useState<'optionA' | 'optionB'>('optionA');

  // Option A (In-App Cinema) state
  const [selectedVideo, setSelectedVideo] = useState<CuratedVideo>(CURATED_CINEMA[0]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [currentPlayUrl, setCurrentPlayUrl] = useState(`https://www.youtube.com/embed/${CURATED_CINEMA[0].youtubeId}?autoplay=1&rel=0&modestbranding=1`);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [isTheaterExpanded, setIsTheaterExpanded] = useState(false);

  // Option B (Netflix Pop-out) state
  const [netflixCustomUrl, setNetflixCustomUrl] = useState('');
  const [popoutSize, setPopoutSize] = useState<'S' | 'M' | 'L'>('M');
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(30);
  const [isBreakTimerActive, setIsBreakTimerActive] = useState(false);
  const [breakRemainingSeconds, setBreakRemainingSeconds] = useState(30 * 60);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'fireplace'>('none');

  // Load study stats from IndexedDB
  const refreshStats = async () => {
    const stats = await getTodayStudyStats(30);
    // If timer is currently running in focus mode, add live elapsed seconds
    if (timerStatus === 'running' && mode === 'focus' && startedAt) {
      const liveElapsedSecs = Math.floor((Date.now() - startedAt) / 1000);
      const combinedSecs = stats.totalSeconds + liveElapsedSecs;
      const combinedProgress = Math.min(100, Math.round((combinedSecs / 1800) * 100));
      setStudyStats({
        ...stats,
        totalSeconds: combinedSecs,
        totalFormatted: `${Math.floor(combinedSecs / 60)}m ${(combinedSecs % 60).toString().padStart(2, '0')}s`,
        progressPercent: combinedProgress,
        isUnlocked: combinedSecs >= 1800,
      });
    } else {
      setStudyStats(stats);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 3000);
    return () => clearInterval(interval);
  }, [timerStatus, startedAt, mode]);

  // Break Timer Countdown for Option B
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

  // Option A URL Resolver
  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;

    const target = customUrlInput.trim();
    // Parse YouTube ID if applicable
    const ytMatch = target.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      setCurrentPlayUrl(`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`);
    } else {
      setCurrentPlayUrl(target);
    }
  };

  // Option B Launch Netflix Frameless Mini Pop-out
  const handleLaunchNetflix = (urlToLaunch?: string) => {
    const targetUrl = urlToLaunch || netflixCustomUrl.trim() || 'https://www.netflix.com/browse';

    // Dimensions
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

    // Start break timer
    setBreakRemainingSeconds(breakDurationMinutes * 60);
    setIsBreakTimerActive(true);
  };

  const isAccessAllowed = demoBypass || studyStats.isUnlocked;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col bg-[#050505] text-[#f4f4f5] px-4 py-6 sm:px-6 lg:px-8">
      {/* Background Cinematic Monochrome Glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
        <div className="h-[600px] w-[800px] rounded-full bg-white/[0.015] blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-6xl w-full mx-auto space-y-6">
        {/* ===== TOP BANNER: 30-MIN STUDY LOCK STATUS & DEMO BYPASS ===== */}
        <div className="liquid-glass-card rounded-2xl p-4 sm:p-5 border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Clapperboard className="h-3.5 w-3.5 text-zinc-300" />
                MODULE 03 / CINECHILL REWARD ROOM
              </span>

              {isAccessAllowed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Unlock className="h-3 w-3" />
                  {demoBypass ? 'DEMO TEST: ĐANG MỞ KHÓA' : 'ĐÃ MỞ KHÓA HÔM NAY'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Lock className="h-3 w-3" />
                  ĐANG KHÓA (CẦN 30 PHÚT HỌC)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-light font-mono text-white tracking-tight">
                CINE<span className="font-semibold text-zinc-400">CHILL</span>
              </h1>
              <span className="text-zinc-600">|</span>
              <p className="text-xs sm:text-sm text-zinc-400">
                Không gian rạp phim thư giãn tự thưởng sau giờ học tập trung cao độ.
              </p>
            </div>

            {/* Study Progress Bar */}
            <div className="space-y-1.5 pt-1 max-w-md">
              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                <span>Hôm nay: <strong className="text-white">{studyStats.totalFormatted}</strong> / 30m 00s</span>
                <span className="text-zinc-500">{studyStats.progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-zinc-400 to-white transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, studyStats.progressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-end lg:self-center">
            {/* Demo Toggle Button */}
            <button
              onClick={() => setDemoBypass(!demoBypass)}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-2 border ${
                demoBypass
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
              title="Bật/Tắt chế độ Demo để kiểm tra giao diện mở và khóa"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>TEST DEMO: {demoBypass ? 'ĐANG BẬT (Bypass)' : 'ĐANG TẮT (Khóa thật)'}</span>
            </button>

            <Link
              href="/focusx"
              className="px-3 py-2 rounded-xl text-xs font-mono bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Timer className="h-3.5 w-3.5" />
              <span>TÍCH LŨY GIỜ HỌC</span>
            </Link>
          </div>
        </div>

        {/* ===== LOCKED SCREEN (WHEN NOT DEMO AND < 30 MINS) ===== */}
        {!isAccessAllowed ? (
          <div className="liquid-glass-card rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto border-white/10 mt-10">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400">
              <Lock className="h-8 w-8 text-amber-400/80 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-mono font-medium text-white">Rạp Phim CineChill Đang Khóa</h2>
              <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Để giữ tinh thần tập trung trọn vẹn, phòng chiếu CineChill sẽ tự động mở khóa ngay khi bạn hoàn thành{' '}
                <strong className="text-white">30 phút học tập trong ngày</strong> tại FocusX hoặc Split Session.
              </p>
            </div>

            {/* Live Progress Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 max-w-sm mx-auto space-y-2 font-mono">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Tiến độ hiện tại:</span>
                <span className="text-amber-400 font-semibold">{studyStats.totalFormatted} / 30m</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${studyStats.progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 pt-1">
                Còn thiếu {Math.max(0, 30 - Math.floor(studyStats.totalSeconds / 60))} phút nữa để mở khóa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/focusx"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                VÀO FOCUSX HỌC NGAY
              </Link>

              <button
                onClick={() => setDemoBypass(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 font-mono text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Mở Bằng Chế Độ Test Demo →
              </button>
            </div>
          </div>
        ) : (
          /* ===== UNLOCKED CINEMA THEATER (DUAL MODE A & B) ===== */
          <div className="space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl max-w-xl mx-auto font-mono text-xs">
              <button
                onClick={() => setActiveTab('optionA')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'optionA'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Tv className="h-4 w-4" />
                <span>PHƯƠNG ÁN A: XEM TRONG WEB</span>
              </button>

              <button
                onClick={() => setActiveTab('optionB')}
                className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'optionB'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Film className="h-4 w-4" />
                <span>PHƯƠNG ÁN B: NETFLIX MINI THEATER</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* TAB CONTENT: PHƯƠNG ÁN A (IN-APP CINEMA)                  */}
            {/* ======================================================== */}
            {activeTab === 'optionA' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Method Overview Pill */}
                <div className="liquid-pill rounded-xl p-3.5 text-xs font-mono text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PHƯƠNG ÁN A: Gọn 100% trong 1 tab, trình phát rạp phim Monokuro Noir với Ambient Glow.</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <span>Tùy chỉnh: Đèn rạp chiếu · Phóng to khung</span>
                  </div>
                </div>

                {/* Theater Deck */}
                <div
                  className={`relative mx-auto transition-all duration-300 ${
                    isTheaterExpanded ? 'max-w-full' : 'max-w-5xl'
                  }`}
                >
                  {/* Ambient Glow Light behind Video */}
                  {ambientGlow && (
                    <div className="pointer-events-none absolute -inset-4 bg-white/[0.04] blur-2xl rounded-3xl transition-opacity duration-500" />
                  )}

                  <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                    {/* Video Player Frame */}
                    <div className="relative w-full aspect-video bg-zinc-950">
                      <iframe
                        src={currentPlayUrl}
                        title="CineChill Theater Player"
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
                          className={`px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                            ambientGlow
                              ? 'bg-white/10 border-white/20 text-white'
                              : 'border-white/5 text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Hiệu ứng quầng sáng rạp chiếu"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span className="hidden sm:inline">Đèn Rạp</span>
                        </button>

                        {/* Expand Theater Width */}
                        <button
                          onClick={() => setIsTheaterExpanded(!isTheaterExpanded)}
                          className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 text-zinc-300 transition-colors flex items-center gap-1.5"
                          title="Mở rộng khung rạp chiếu"
                        >
                          <Maximize2 className="h-3 w-3" />
                          <span className="hidden sm:inline">{isTheaterExpanded ? 'Thu Hẹp' : 'Mở Rộng'}</span>
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
                    className="px-4 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-medium hover:bg-zinc-200 transition-colors shrink-0"
                  >
                    PHÁT NGAY
                  </button>
                </form>

                {/* Curated Film Catalog */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-mono font-medium text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-zinc-400" />
                      DANH MỤC PHIM CHILL THƯ GIÃN TUYỂN CHỌN
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
                            setCurrentPlayUrl(`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`);
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
            {/* TAB CONTENT: PHƯƠNG ÁN B (NETFLIX MINI-THEATER)           */}
            {/* ======================================================== */}
            {activeTab === 'optionB' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Method Overview Pill */}
                <div className="liquid-pill rounded-xl p-3.5 text-xs font-mono text-zinc-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span>PHƯƠNG ÁN B: Xem trực tiếp trên Netflix chính chủ của bạn (Chuẩn 4K, 0% quảng cáo).</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <span>Pop-out không viền + Đếm giờ giải lao Monokuro</span>
                  </div>
                </div>

                {/* Netflix Controller Deck */}
                <div className="liquid-glass-card rounded-2xl p-6 border-white/10 space-y-6 max-w-4xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="space-y-1">
                      <h3 className="text-base font-mono font-medium text-white flex items-center gap-2">
                        <Clapperboard className="h-4 w-4 text-red-500" />
                        BẢNG ĐIỀU KHIỂN RẠP PHIM NETFLIX CHÍNH CHỦ
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Đăng nhập tài khoản của bạn 1 lần duy nhất trên trình duyệt. Monokuro sẽ mở cửa sổ rạp phim thu nhỏ không viền và kiểm soát giờ giải lao cho bạn.
                      </p>
                    </div>

                    <a
                      href="https://www.netflix.com/login"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-mono bg-white/[0.04] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Kiểm Tra Đăng Nhập Netflix
                    </a>
                  </div>

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
                            className={`p-2.5 rounded-xl border text-left transition-all ${
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
                            className={`p-2.5 rounded-xl border text-left transition-all ${
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
                            className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all ${
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
                        KHỞI CHIẾU NETFLIX & BẬT ĐẾM GIỜ NGHỈ
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
                          MỞ PHIM TRÊN MINI THEATER
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
