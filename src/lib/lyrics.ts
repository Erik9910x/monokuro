// Monokuro Synced Lyrics Parser (LRC format)
// Supports line-level and word-level timestamps

export interface ParsedLyricWord {
  text: string;
  startTime: number;
  endTime: number;
}

export interface ParsedLyricLine {
  time: number; // in seconds
  text: string;
  words?: ParsedLyricWord[];
  endTime?: number;
}

export function parseSyncedLyrics(syncedLyrics: string): ParsedLyricLine[] {
  if (!syncedLyrics || typeof syncedLyrics !== 'string') return [];

  const lines: ParsedLyricLine[] = [];
  const lineRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  const wordRegex = /<(\d{2}):(\d{2})\.(\d{2,3})>([^<]*)/g;

  const rawLines = syncedLyrics.split('\n');

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    const match = lineRegex.exec(line);

    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = parseInt(match[3].padEnd(3, '0'), 10);
      const time = minutes * 60 + seconds + ms / 1000;
      const content = match[4].trim();

      if (!content) continue;

      const words: ParsedLyricWord[] = [];
      let wordMatch;
      let lastWordEndTime = time;

      wordRegex.lastIndex = 0;
      while ((wordMatch = wordRegex.exec(content)) !== null) {
        const wMin = parseInt(wordMatch[1], 10);
        const wSec = parseInt(wordMatch[2], 10);
        const wMs = parseInt(wordMatch[3].padEnd(3, '0'), 10);
        const wTime = wMin * 60 + wSec + wMs / 1000;
        const wText = wordMatch[4].trim();

        if (wText) {
          words.push({ text: wText, startTime: lastWordEndTime, endTime: wTime });
          lastWordEndTime = wTime;
        }
      }

      // If no word tags, synthesize words for karaoke word-by-word highlight
      if (words.length === 0) {
        const plainText = content.replace(/<[^>]*>/g, '').trim();
        const splitWords = plainText.split(/\s+/).filter(Boolean);

        let nextTime = time + 3.5;
        if (i < rawLines.length - 1) {
          const nextMatch = lineRegex.exec(rawLines[i + 1].trim());
          if (nextMatch) {
            const nMin = parseInt(nextMatch[1], 10);
            const nSec = parseInt(nextMatch[2], 10);
            const nMs = parseInt(nextMatch[3].padEnd(3, '0'), 10);
            nextTime = nMin * 60 + nSec + nMs / 1000;
          }
        }

        const duration = Math.min(5, Math.max(1.5, nextTime - time));
        const wordDuration = duration / Math.max(1, splitWords.length);

        splitWords.forEach((w, wIdx) => {
          words.push({
            text: w,
            startTime: time + wIdx * wordDuration,
            endTime: time + (wIdx + 1) * wordDuration,
          });
        });
      }

      lines.push({
        time,
        text: content.replace(/<[^>]*>/g, '').trim(),
        words,
        endTime: words[words.length - 1]?.endTime || time + 3.5,
      });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}
