'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Film, ArrowRight } from 'lucide-react';

export default function FrameWhisperRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/cinechill');
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
        <Film className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-mono text-white">Đang chuyển tiếp sang CineChill...</h2>
      <p className="text-sm text-zinc-400">
        Tính năng FrameWhisper đã được nâng cấp thành rạp phim thư giãn CineChill.
      </p>
      <Link
        href="/cinechill"
        className="px-4 py-2 rounded-xl bg-white text-black font-mono text-xs font-medium hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
      >
        <span>Vào CineChill Ngay</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
