// Monokuro Direct YouTube Video Search API
// Powers the in-room VibeTube discovery and search without opening youtube.com

import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeVideos } from '@/lib/music/youtube';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '16', 10);

  if (!q || !q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchYouTubeVideos(q.trim(), Math.min(limit, 30));
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('YouTube search route error:', error);
    return NextResponse.json({ success: false, error: 'Search failed', results: [] }, { status: 500 });
  }
}
