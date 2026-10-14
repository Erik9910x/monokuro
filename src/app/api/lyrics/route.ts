// Monokuro LRCLIB Synced Lyrics Proxy
// Server-side fetch to supply proper User-Agent required by LRCLIB

import { NextRequest, NextResponse } from 'next/server';

const LRCLIB_UA = 'MonokuroStudy/1.0 (https://monokuro.study)';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trackName = searchParams.get('track');
  const artistName = searchParams.get('artist');
  const albumName = searchParams.get('album');
  const duration = searchParams.get('duration');

  if (!trackName || !artistName) {
    return NextResponse.json({ error: 'Missing track or artist parameter' }, { status: 400 });
  }

  try {
    // 1. Exact match with album + duration
    if (albumName && duration) {
      const exactUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}&album_name=${encodeURIComponent(albumName)}&duration=${duration}`;
      const exactRes = await fetch(exactUrl, { headers: { 'User-Agent': LRCLIB_UA } });
      if (exactRes.ok) {
        const data = await exactRes.json();
        if (data && (data.syncedLyrics || data.plainLyrics)) {
          return NextResponse.json(data);
        }
      }
    }

    // 2. Exact match without album
    const getUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
    const getRes = await fetch(getUrl, { headers: { 'User-Agent': LRCLIB_UA } });
    if (getRes.ok) {
      const data = await getRes.json();
      if (data && (data.syncedLyrics || data.plainLyrics)) {
        return NextResponse.json(data);
      }
    }

    // 3. Search query fallback
    const searchUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
    const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': LRCLIB_UA } });
    if (searchRes.ok) {
      const results = await searchRes.json();
      if (Array.isArray(results) && results.length > 0) {
        const synced = results.find((r: { syncedLyrics?: string }) => Boolean(r.syncedLyrics));
        if (synced) return NextResponse.json(synced);
        if (results[0].plainLyrics) return NextResponse.json(results[0]);
      }
    }

    // 4. Fuzzy search
    const fuzzyUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(trackName + ' ' + artistName)}`;
    const fuzzyRes = await fetch(fuzzyUrl, { headers: { 'User-Agent': LRCLIB_UA } });
    if (fuzzyRes.ok) {
      const results = await fuzzyRes.json();
      if (Array.isArray(results) && results.length > 0) {
        const synced = results.find((r: { syncedLyrics?: string }) => Boolean(r.syncedLyrics));
        if (synced) return NextResponse.json(synced);
        if (results[0].plainLyrics) return NextResponse.json(results[0]);
      }
    }

    return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
  } catch (error) {
    console.error('LRCLIB proxy error:', error);
    return NextResponse.json({ error: 'Failed to retrieve lyrics' }, { status: 500 });
  }
}
