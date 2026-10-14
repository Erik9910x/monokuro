// Monokuro Universal Music Link Resolver API
// Compliant with debug.md §2: Spotify, Apple Music, SoundCloud, and YouTube metadata resolution

import { NextRequest, NextResponse } from 'next/server';
import { searchYouTubeVideoId } from '@/lib/music/youtube';

interface ResolvedTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl?: string | null;
  externalUrl: string;
  provider: 'youtube' | 'spotify' | 'apple-music' | 'soundcloud' | 'itunes' | 'unknown';
  capability: 'playable' | 'preview_only' | 'open_external' | 'embed_required' | 'unavailable';
  youtubeId?: string;
  embedHtml?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl || !rawUrl.trim()) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let cleanInput = rawUrl.trim();
  if (!cleanInput.startsWith('http://') && !cleanInput.startsWith('https://')) {
    cleanInput = 'https://' + cleanInput;
  }

  try {
    const parsedUrl = new URL(cleanInput);
    const host = parsedUrl.hostname.replace('www.', '').toLowerCase();

    // 1. APPLE MUSIC RESOLUTION
    if (host === 'music.apple.com') {
      return await resolveAppleMusic(parsedUrl, cleanInput);
    }

    // 2. SPOTIFY RESOLUTION
    if (host === 'open.spotify.com') {
      return await resolveSpotify(parsedUrl, cleanInput);
    }

    // 3. SOUNDCLOUD RESOLUTION (supports soundcloud.com, m.soundcloud.com, on.soundcloud.com, soundcloud.app.goo.gl)
    if (
      host === 'soundcloud.com' ||
      host === 'm.soundcloud.com' ||
      host === 'on.soundcloud.com' ||
      host === 'soundcloud.app.goo.gl'
    ) {
      if (host === 'on.soundcloud.com' || host === 'soundcloud.app.goo.gl') {
        try {
          const res = await fetch(cleanInput, {
            redirect: 'follow',
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });
          if (res.url && res.url !== cleanInput) {
            cleanInput = res.url;
            const expandedUrl = new URL(res.url);
            return await resolveSoundCloud(expandedUrl, cleanInput);
          }
        } catch (e) {
          console.warn('Failed to expand SoundCloud shortlink:', e);
        }
      }
      return await resolveSoundCloud(parsedUrl, cleanInput);
    }

    // 4. YOUTUBE RESOLUTION
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      return await resolveYouTube(parsedUrl, cleanInput);
    }

    return NextResponse.json(
      {
        error: 'Unsupported provider host. Supported services: Apple Music, Spotify, SoundCloud, YouTube.',
        status: 'unsupported-link',
      },
      { status: 400 }
    );
  } catch (err) {
    console.error('URL parse or resolve error:', err);
    return NextResponse.json(
      { error: 'Failed to process media URL: ' + (err as Error).message, status: 'error' },
      { status: 500 }
    );
  }
}

/**
 * Resolve Apple Music via iTunes Catalog Lookup API
 */
async function resolveAppleMusic(url: URL, originalUrl: string) {
  // Pattern 1: /album/:albumName/:albumId?i=:trackId
  // Pattern 2: /song/:songId
  const songQueryId = url.searchParams.get('i');
  const pathParts = url.pathname.split('/').filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];

  const targetId = songQueryId || (/^\d+$/.test(lastPart) ? lastPart : null);

  if (!targetId) {
    return NextResponse.json(
      { error: 'Could not extract Apple Music song or album ID from URL', status: 'unsupported-link' },
      { status: 400 }
    );
  }

  try {
    // If song ID, lookup song directly (up to 50 tracks for albums)
    const itunesUrl = `https://itunes.apple.com/lookup?id=${targetId}&entity=song&limit=50`;
    const res = await fetch(itunesUrl, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return NextResponse.json({ error: 'iTunes API responded with error', status: 'network-error' }, { status: 502 });
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      // Return metadata-only fallback
      return NextResponse.json({
        success: true,
        provider: 'apple-music',
        sourceType: songQueryId ? 'track' : 'album',
        title: 'Apple Music Item',
        artist: 'Unknown Artist',
        album: 'Apple Music',
        tracks: [
          {
            id: `am_${targetId}`,
            title: 'Apple Music Item',
            artist: 'Apple Music',
            album: 'Apple Music',
            duration: 0,
            coverUrl: '',
            audioUrl: null,
            externalUrl: originalUrl,
            provider: 'apple-music',
            capability: 'open_external',
          },
        ],
        externalUrl: originalUrl,
      });
    }

    const isAlbum = data.results.length > 1 && data.results[0].wrapperType === 'collection';
    const mainItem = data.results[0];

    const tracks: ResolvedTrack[] = (isAlbum ? data.results.slice(1, 51) : data.results).map((r: any) => {
      const highResArt = r.artworkUrl100
        ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
        : '';

      return {
        id: `am_${r.trackId || targetId}`,
        title: r.trackName || r.collectionName || 'Track',
        artist: r.artistName || 'Apple Music Artist',
        album: r.collectionName || 'Album',
        duration: Math.round((r.trackTimeMillis || 30000) / 1000),
        coverUrl: highResArt,
        audioUrl: r.previewUrl || null,
        externalUrl: r.trackViewUrl || originalUrl,
        provider: 'apple-music',
        capability: r.previewUrl ? 'preview_only' : 'open_external',
      };
    });

    if (tracks.length > 0) {
      try {
        const ytId = await searchYouTubeVideoId(`${tracks[0].artist} ${tracks[0].title}`);
        if (ytId) {
          tracks[0].youtubeId = ytId;
          tracks[0].capability = 'playable';
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      provider: 'apple-music',
      sourceType: isAlbum ? 'album' : 'track',
      title: mainItem.collectionName || mainItem.trackName,
      artist: mainItem.artistName,
      album: mainItem.collectionName,
      artworkUrl: mainItem.artworkUrl100?.replace('100x100bb.jpg', '600x600bb.jpg'),
      tracks,
      externalUrl: originalUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to query Apple Music catalog', status: 'network-error' }, { status: 500 });
  }
}

/**
 * Resolve Spotify via official oEmbed + iTunes preview fallback
 */
async function resolveSpotify(url: URL, originalUrl: string) {
  try {
    let trackTitle = 'Spotify Track';
    let artist = 'Spotify Artist';
    let thumbnail = '';
    let previewAudio: string | null = null;
    let durationSec = 180;
    let tracks: ResolvedTrack[] = [];

    // Attempt 1: Fetch Spotify Embed page to extract genuine NextData
    try {
      const embedUrl = `https://open.spotify.com/embed${url.pathname}`;
      const embedRes = await fetch(embedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (embedRes.ok) {
        const html = await embedRes.text();
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
        if (nextDataMatch) {
          const parsed = JSON.parse(nextDataMatch[1]);
          const entity = parsed.props?.pageProps?.state?.data?.entity;

          if (entity) {
            // Track entity
            if (entity.type === 'track') {
              trackTitle = entity.name || entity.title || trackTitle;
              artist = entity.artists?.[0]?.name || artist;
              thumbnail = entity.visualIdentity?.image?.[0]?.url || thumbnail;
              previewAudio = entity.audioPreview?.url || null;
              durationSec = Math.round((entity.duration || 180000) / 1000);

              const singleTrack: ResolvedTrack = {
                id: `sp_${entity.id || Date.now()}`,
                title: trackTitle,
                artist,
                album: 'Spotify Single',
                duration: durationSec,
                coverUrl: thumbnail,
                audioUrl: previewAudio,
                externalUrl: originalUrl,
                provider: 'spotify',
                capability: previewAudio ? 'preview_only' : 'open_external',
              };

              // Query clean YouTube official audio
              try {
                const ytId = await searchYouTubeVideoId(`${artist} ${trackTitle}`);
                if (ytId) {
                  singleTrack.youtubeId = ytId;
                  singleTrack.capability = 'playable';
                }
              } catch {}

              tracks.push(singleTrack);
            }
            // Album or Playlist entity with trackList
            else if (entity.trackList && Array.isArray(entity.trackList)) {
              trackTitle = entity.name || 'Spotify Collection';
              artist = entity.artists?.[0]?.name || entity.trackList[0]?.subtitle || 'Spotify Artist';
              thumbnail = entity.visualIdentity?.image?.[0]?.url || thumbnail;

              for (const [idx, item] of entity.trackList.slice(0, 50).entries()) {
                const itemTitle = item.title || item.name || 'Track ' + (idx + 1);
                const itemArtist = item.subtitle || artist;
                const itemPreview = item.audioPreview?.url || null;
                const itemDur = Math.round((item.duration || 180000) / 1000);

                const itemTrack: ResolvedTrack = {
                  id: `sp_${item.uid || idx}_${Date.now()}`,
                  title: itemTitle,
                  artist: itemArtist,
                  album: trackTitle,
                  duration: itemDur,
                  coverUrl: thumbnail,
                  audioUrl: itemPreview,
                  externalUrl: originalUrl,
                  provider: 'spotify',
                  capability: itemPreview ? 'preview_only' : 'open_external',
                };

                // Query official YouTube video for first 3 tracks
                if (idx < 3) {
                  try {
                    const ytId = await searchYouTubeVideoId(`${itemArtist} ${itemTitle}`);
                    if (ytId) {
                      itemTrack.youtubeId = ytId;
                      itemTrack.capability = 'playable';
                    }
                  } catch {}
                }

                tracks.push(itemTrack);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Spotify embed extraction error, using fallback:', e);
    }

    // Attempt 2: Fallback to oEmbed if embed page yielded no tracks
    if (tracks.length === 0) {
      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(originalUrl)}`;
      const res = await fetch(oembedUrl);

      if (!res.ok) {
        return NextResponse.json(
          { error: 'Spotify item not found or oEmbed restricted', status: 'not-found' },
          { status: 404 }
        );
      }

      const oembed = await res.json();
      trackTitle = oembed.title || 'Spotify Track';
      thumbnail = oembed.thumbnail_url || thumbnail;

      if (trackTitle.includes(' - ')) {
        const parts = trackTitle.split(' - ');
        artist = parts[0].trim();
        trackTitle = parts.slice(1).join(' - ').trim();
      }

      // Try finding preview on iTunes
      try {
        const itunesSearch = `https://itunes.apple.com/search?term=${encodeURIComponent(
          `${artist} ${trackTitle}`
        )}&entity=song&limit=1`;
        const itunesRes = await fetch(itunesSearch);
        if (itunesRes.ok) {
          const itunesData = await itunesRes.json();
          if (itunesData.results?.[0]?.previewUrl) {
            previewAudio = itunesData.results[0].previewUrl;
            durationSec = Math.round((itunesData.results[0].trackTimeMillis || 180000) / 1000);
          }
        }
      } catch {}

      const fallbackTrack: ResolvedTrack = {
        id: `sp_${Date.now()}`,
        title: trackTitle,
        artist,
        album: 'Spotify Stream',
        duration: durationSec,
        coverUrl: thumbnail,
        audioUrl: previewAudio,
        externalUrl: originalUrl,
        provider: 'spotify',
        capability: previewAudio ? 'preview_only' : 'open_external',
      };

      try {
        const ytId = await searchYouTubeVideoId(`${artist} ${trackTitle}`);
        if (ytId) {
          fallbackTrack.youtubeId = ytId;
          fallbackTrack.capability = 'playable';
        }
      } catch {}

      tracks.push(fallbackTrack);
    }

    return NextResponse.json({
      success: true,
      provider: 'spotify',
      sourceType: url.pathname.includes('/album/')
        ? 'album'
        : url.pathname.includes('/playlist/')
        ? 'playlist'
        : 'track',
      title: trackTitle,
      artist,
      artworkUrl: thumbnail,
      tracks,
      externalUrl: originalUrl,
      hasMatchedPreview: Boolean(tracks[0]?.audioUrl),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to query Spotify metadata', status: 'network-error' }, { status: 500 });
  }
}

/**
 * Resolve SoundCloud via official oEmbed
 */
async function resolveSoundCloud(url: URL, originalUrl: string) {
  try {
    const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(originalUrl)}&format=json`;
    const res = await fetch(oembedUrl);

    if (!res.ok) {
      return NextResponse.json({ error: 'SoundCloud track not found or private', status: 'not-found' }, { status: 404 });
    }

    const oembed = await res.json();
    const title = oembed.title || 'SoundCloud Track';
    const artist = oembed.author_name || 'SoundCloud Creator';
    const thumbnail = oembed.thumbnail_url || '';

    const resolved: ResolvedTrack = {
      id: `sc_${Date.now()}`,
      title,
      artist,
      album: 'SoundCloud',
      duration: 180,
      coverUrl: thumbnail,
      audioUrl: null,
      externalUrl: originalUrl,
      provider: 'soundcloud',
      capability: 'open_external',
      embedHtml: oembed.html,
    };

    try {
      const ytId = await searchYouTubeVideoId(`${artist} ${title}`);
      if (ytId) {
        resolved.youtubeId = ytId;
        resolved.capability = 'playable';
      }
    } catch {}

    return NextResponse.json({
      success: true,
      provider: 'soundcloud',
      sourceType: url.pathname.includes('/sets/') ? 'playlist' : 'track',
      title,
      artist,
      artworkUrl: thumbnail,
      tracks: [resolved],
      externalUrl: originalUrl,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to query SoundCloud metadata', status: 'network-error' }, { status: 500 });
  }
}

/**
 * Resolve YouTube via official oEmbed + ID extraction
 */
async function resolveYouTube(url: URL, originalUrl: string) {
  let ytId: string | null = null;
  const host = url.hostname.replace('www.', '').toLowerCase();

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    ytId = url.searchParams.get('v');
    if (!ytId && url.pathname.startsWith('/embed/')) {
      ytId = url.pathname.split('/')[2];
    }
  } else if (host === 'youtu.be') {
    ytId = url.pathname.slice(1).split('/')[0];
  }

  if (!ytId || !/^[a-zA-Z0-9_-]{11}$/.test(ytId)) {
    return NextResponse.json({ error: 'Invalid YouTube Video ID', status: 'unsupported-link' }, { status: 400 });
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`;
    const res = await fetch(oembedUrl);

    let title = `YouTube Video (${ytId})`;
    let author = 'YouTube Channel';

    if (res.ok) {
      const data = await res.json();
      title = data.title || title;
      author = data.author_name || author;
    }

    const thumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    const resolved: ResolvedTrack = {
      id: `yt_${ytId}`,
      title,
      artist: author,
      album: 'YouTube',
      duration: 300,
      coverUrl: thumbnail,
      audioUrl: null,
      externalUrl: `https://www.youtube.com/watch?v=${ytId}`,
      provider: 'youtube',
      capability: 'playable',
      youtubeId: ytId,
    };

    return NextResponse.json({
      success: true,
      provider: 'youtube',
      sourceType: 'track',
      title,
      artist: author,
      artworkUrl: thumbnail,
      tracks: [resolved],
      externalUrl: `https://www.youtube.com/watch?v=${ytId}`,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to query YouTube metadata', status: 'network-error' }, { status: 500 });
  }
}
