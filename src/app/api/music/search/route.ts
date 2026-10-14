// Monokuro Music Search Proxy (iTunes Catalog)
// Provides instant high-quality cover art, audio preview URLs, and metadata without API keys

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  if (!query || !query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=song&limit=${Math.min(limit, 50)}`;
    const res = await fetch(itunesUrl, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'MonokuroStudy/1.0' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Search provider error' }, { status: res.status });
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json({ results: [] });
    }

    const tracks = data.results.map((r: {
      trackId: number;
      trackName: string;
      artistName: string;
      collectionName?: string;
      trackTimeMillis?: number;
      artworkUrl100?: string;
      previewUrl?: string;
      trackViewUrl?: string;
    }) => {
      const highResArt = r.artworkUrl100
        ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
        : '';

      return {
        id: `itunes_${r.trackId}`,
        title: r.trackName,
        artist: r.artistName,
        album: r.collectionName || 'Single',
        duration: Math.round((r.trackTimeMillis || 30000) / 1000),
        coverUrl: highResArt,
        audioUrl: r.previewUrl || null,
        previewUrl: r.previewUrl || null,
        externalUrl: r.trackViewUrl || '#',
        provider: 'itunes',
        capability: r.previewUrl ? 'playable' : 'open_external',
      };
    });

    return NextResponse.json({ results: tracks });
  } catch (error) {
    console.error('Music search proxy error:', error);
    return NextResponse.json({ error: 'Search request failed', results: [] }, { status: 500 });
  }
}
