// Monokuro YouTube Matcher Utility
// Resolves track title + artist to full-length YouTube video ID with in-memory caching and fast timeout

const ytCache = new Map<string, string>([
  ['claude debussy clair de lune (piano)', 'X-Xxqt6Xdio'],
  ['erik satie gymnopédie no. 1', 'S-Xm7s9eGxU'],
  ['frédéric chopin nocturne in e-flat major, op. 9 no. 2', '9E6b3swbnWg'],
  ['justin bieber baby', 'kffacxfA7G4'],
]);

export async function searchYouTubeVideoId(query: string): Promise<string | null> {
  if (!query || !query.trim()) return null;

  const cleanQuery = query.trim().toLowerCase();
  if (ytCache.has(cleanQuery)) {
    return ytCache.get(cleanQuery)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery + ' official audio')}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (!res.ok) return null;

    const text = await res.text();

    // 1. Precise ytInitialData extraction (ignores sponsored/promoted ads)
    const jsonMatch = text.match(/var ytInitialData = ({.*?});<\/script>/) || text.match(/ytInitialData\s*=\s*({.+?});/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
        const items = contents?.find((c: any) => c?.itemSectionRenderer?.contents)?.itemSectionRenderer?.contents || [];

        const badTerms = ['reaction', 'parody', 'review', 'teaser', '10 hours', '1 hour', '#shorts', 'meme', 'tik tok'];

        const validVideos = items
          .filter((i: any) => i.videoRenderer && i.videoRenderer.videoId)
          .map((i: any) => {
            const vr = i.videoRenderer;
            const title = vr.title?.runs?.map((r: any) => r.text).join('') || '';
            const channel = vr.ownerText?.runs?.map((r: any) => r.text).join('') || '';
            const duration = vr.lengthText?.simpleText || '';
            return { id: vr.videoId, title, channel, duration };
          })
          .filter((v: any) => {
            const lowerTitle = v.title.toLowerCase();
            return !badTerms.some((bad) => lowerTitle.includes(bad));
          });

        if (validVideos.length > 0) {
          // Priority A: Official Topic Channel (YouTube Music Topic - 0 ads, 0 intro skits)
          const topicVideo = validVideos.find((v: any) => v.channel.endsWith(' - Topic'));
          // Priority B: Explicit "Official Audio" or "HQ Audio"
          const audioVideo = validVideos.find((v: any) => {
            const l = v.title.toLowerCase();
            return l.includes('official audio') || l.includes('hq audio') || l.includes('audio');
          });
          // Priority C: Official Lyric Video
          const lyricVideo = validVideos.find((v: any) => v.title.toLowerCase().includes('lyric'));

          const chosen = topicVideo || audioVideo || lyricVideo || validVideos[0];
          if (chosen && chosen.id) {
            ytCache.set(cleanQuery, chosen.id);
            return chosen.id;
          }
        }
      } catch (e) {
        // Fallback to regex if JSON parse fails
      }
    }

    // Fallback: Pattern extraction
    const match = text.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      const vid = match[1];
      ytCache.set(cleanQuery, vid);
      if (ytCache.size > 200) {
        const firstKey = ytCache.keys().next().value;
        if (firstKey) ytCache.delete(firstKey);
      }
      return vid;
    }

    return null;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn('YouTube search timed out for query:', cleanQuery);
    } else {
      console.error('YouTube search utility error:', err);
    }
    return null;
  }
}
