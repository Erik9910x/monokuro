// Monokuro YouTube Matcher for Full-Length Playback
// Resolves any song title + artist to its full-length YouTube stream

import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeVideoId } from '@/lib/music/youtube';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const videoId = await searchYouTubeVideoId(q.trim());

    if (videoId) {
      return NextResponse.json({
        success: true,
        youtubeId: videoId,
        streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }

    return NextResponse.json({ error: 'No YouTube match found' }, { status: 404 });
  } catch (err) {
    console.error('YouTube match error:', err);
    return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 500 });
  }
}
