// Monokuro Music Provider Adapter Architecture
// Compliant with SPEC.md §6.3 & §9.3

import { MusicProvider, MusicSourceType, PlaybackCapability, SavedMusicLink } from '@/types';

export interface ParsedMusicReference {
  provider: MusicProvider;
  sourceType: MusicSourceType;
  id: string;
  originalUrl: string;
  cleanUrl: string;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    artworkUrl?: string;
    previewUrl?: string | null;
  };
}

/**
 * Extract YouTube Video ID from any valid YouTube URL
 */
export function extractYouTubeId(urlStr: string): string | null {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.replace('www.', '');

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.split('/')[2];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
      if (url.pathname.startsWith('/v/')) {
        const id = url.pathname.split('/')[2];
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }
    } else if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse any incoming music link into a typed reference
 */
export function parseMusicUrl(inputUrl: string): ParsedMusicReference | null {
  try {
    let cleanInput = inputUrl.trim();
    if (!cleanInput.startsWith('http://') && !cleanInput.startsWith('https://')) {
      cleanInput = 'https://' + cleanInput;
    }

    const url = new URL(cleanInput);
    const host = url.hostname.replace('www.', '').toLowerCase();

    // 1. YouTube
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      const ytId = extractYouTubeId(cleanInput);
      const isPlaylist = url.searchParams.has('list');

      if (ytId) {
        return {
          provider: 'youtube',
          sourceType: isPlaylist ? 'playlist' : 'track',
          id: ytId,
          originalUrl: inputUrl,
          cleanUrl: `https://www.youtube.com/watch?v=${ytId}`,
          metadata: {
            artworkUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          },
        };
      }
    }

    // 2. Spotify
    if (host === 'open.spotify.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      // Format: /track/:id, /album/:id, /playlist/:id
      const type = parts[0] as MusicSourceType;
      const id = parts[1];

      if (id && ['track', 'album', 'playlist'].includes(type)) {
        return {
          provider: 'spotify',
          sourceType: type,
          id,
          originalUrl: inputUrl,
          cleanUrl: `https://open.spotify.com/${type}/${id}`,
        };
      }
    }

    // 3. Apple Music
    if (host === 'music.apple.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      // e.g. /us/album/title/id or /song/id
      const hasSongQuery = url.searchParams.get('i');
      const id = hasSongQuery || parts[parts.length - 1];

      return {
        provider: 'apple-music',
        sourceType: hasSongQuery ? 'track' : 'album',
        id: id || 'unknown',
        originalUrl: inputUrl,
        cleanUrl: url.origin + url.pathname,
      };
    }

    // 4. SoundCloud
    if (host === 'soundcloud.com' || host === 'm.soundcloud.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return {
          provider: 'soundcloud',
          sourceType: parts.includes('sets') ? 'playlist' : 'track',
          id: parts.join('/'),
          originalUrl: inputUrl,
          cleanUrl: `https://soundcloud.com/${parts.join('/')}`,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Determine honest playback capability per SPEC.md VIBRAX-004
 */
export function getPlaybackCapability(ref: ParsedMusicReference): PlaybackCapability {
  switch (ref.provider) {
    case 'youtube':
      return 'playable'; // Playable directly in our embedded YouTube player
    case 'itunes':
      return 'playable'; // 30s preview playable in browser Audio
    case 'spotify':
      return 'open_external'; // Transparently redirect to Spotify per Feb 2026 Developer API restrictions
    case 'apple-music':
      return 'open_external'; // Open in Apple Music unless iTunes preview found
    case 'soundcloud':
      return 'open_external'; // Widget / open external
    default:
      return 'unavailable';
  }
}

/**
 * Convert parsed reference into persistent SavedMusicLink record
 */
export function createSavedMusicLink(ref: ParsedMusicReference, customTitle?: string): SavedMusicLink {
  const capability = getPlaybackCapability(ref);
  return {
    id: `music_${ref.provider}_${ref.id}_${Date.now()}`,
    provider: ref.provider,
    sourceUrl: ref.cleanUrl,
    sourceType: ref.sourceType,
    title: customTitle || ref.metadata?.title || `${ref.provider.toUpperCase()} ${ref.sourceType}`,
    artist: ref.metadata?.artist,
    album: ref.metadata?.album,
    coverUrl: ref.metadata?.artworkUrl,
    previewUrl: ref.metadata?.previewUrl || null,
    capability,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
