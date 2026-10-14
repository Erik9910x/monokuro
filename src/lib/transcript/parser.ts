// Monokuro Transcript Parser
// Compliant with SPEC.md §6.4 & Normalized TranscriptSegment format

import { TranscriptSegment } from '@/types';

/**
 * Convert timestamp string (HH:MM:SS,mmm or HH:MM:SS.mmm or MM:SS.mmm) to milliseconds
 */
export function timeStringToMs(timeStr: string): number | null {
  const cleanStr = timeStr.trim().replace(',', '.');
  const parts = cleanStr.split(':');

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
    return Math.round((hours * 3600 + minutes * 60 + seconds) * 1000);
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    if (isNaN(minutes) || isNaN(seconds)) return null;
    return Math.round((minutes * 60 + seconds) * 1000);
  }

  return null;
}

/**
 * Convert milliseconds to readable format (MM:SS or HH:MM:SS)
 */
export function msToTimeString(ms: number | null | undefined): string {
  if (ms == null || isNaN(ms)) return '--:--';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Sanitize text: strip subtitle tags (<v Speaker>, <i>, <b>, <c.color>, etc.) safely
 */
export function stripMarkup(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, '') // remove HTML/VTT tags
    .replace(/\{[^}]+\}/g, '') // remove ASS style tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

/**
 * Parse WebVTT subtitle text into normalized TranscriptSegments
 */
export function parseVTT(content: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const normalized = content.replace(/\r\n|\r/g, '\n');
  const lines = normalized.split('\n');

  let currentStart: number | null = null;
  let currentEnd: number | null = null;
  let currentTextLines: string[] = [];
  let index = 1;

  const timeArrowRegex = /((?:\d{1,2}:)?\d{2}:\d{2}[.,]\d{3})\s*-->\s*((?:\d{1,2}:)?\d{2}:\d{2}[.,]\d{3})/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('WEBVTT') || trimmed.startsWith('NOTE')) {
      if (currentTextLines.length > 0 && currentStart !== null) {
        segments.push({
          id: `seg_${index++}`,
          startMs: currentStart,
          endMs: currentEnd,
          text: stripMarkup(currentTextLines.join(' ')),
        });
        currentTextLines = [];
        currentStart = null;
        currentEnd = null;
      }
      continue;
    }

    const match = trimmed.match(timeArrowRegex);
    if (match) {
      if (currentTextLines.length > 0 && currentStart !== null) {
        segments.push({
          id: `seg_${index++}`,
          startMs: currentStart,
          endMs: currentEnd,
          text: stripMarkup(currentTextLines.join(' ')),
        });
        currentTextLines = [];
      }
      currentStart = timeStringToMs(match[1]);
      currentEnd = timeStringToMs(match[2]);
    } else if (currentStart !== null) {
      currentTextLines.push(trimmed);
    }
  }

  if (currentTextLines.length > 0 && currentStart !== null) {
    segments.push({
      id: `seg_${index++}`,
      startMs: currentStart,
      endMs: currentEnd,
      text: stripMarkup(currentTextLines.join(' ')),
    });
  }

  return segments.filter((s) => s.text.length > 0);
}

/**
 * Parse SubRip (.srt) subtitle text into normalized TranscriptSegments
 */
export function parseSRT(content: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const normalized = content.replace(/\r\n|\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);

  const timeArrowRegex = /(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/;
  let index = 1;

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    let timeLineIdx = -1;
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      if (timeArrowRegex.test(lines[i])) {
        timeLineIdx = i;
        break;
      }
    }

    if (timeLineIdx === -1) continue;

    const match = lines[timeLineIdx].match(timeArrowRegex);
    if (!match) continue;

    const startMs = timeStringToMs(match[1]);
    const endMs = timeStringToMs(match[2]);
    const textLines = lines.slice(timeLineIdx + 1);
    const text = stripMarkup(textLines.join(' '));

    if (text) {
      segments.push({
        id: `seg_${index++}`,
        startMs,
        endMs,
        text,
      });
    }
  }

  return segments;
}

/**
 * Parse plain text transcript into readable paragraph/sentence segments without inventing fake timing
 */
export function parsePlainText(content: string): TranscriptSegment[] {
  const normalized = stripMarkup(content);
  const paragraphs = normalized.split(/\n\s*\n/);
  const segments: TranscriptSegment[] = [];

  let index = 1;
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    // Check if paragraph starts with an explicit user timestamp (e.g., "[04:25] Intro to Neural Networks")
    const leadingTimestampMatch = trimmed.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-:]?\s*(.*)$/);
    if (leadingTimestampMatch) {
      const timeMs = timeStringToMs(leadingTimestampMatch[1]);
      segments.push({
        id: `seg_${index++}`,
        startMs: timeMs,
        endMs: null,
        text: leadingTimestampMatch[2].trim() || trimmed,
      });
    } else {
      segments.push({
        id: `seg_${index++}`,
        startMs: null,
        endMs: null,
        text: trimmed,
      });
    }
  }

  return segments;
}

/**
 * Auto-detect format and parse transcript
 */
export function parseTranscriptAuto(content: string, filename?: string): {
  format: 'vtt' | 'srt' | 'text';
  segments: TranscriptSegment[];
} {
  const lowerName = (filename || '').toLowerCase();

  if (lowerName.endsWith('.vtt') || content.trim().startsWith('WEBVTT')) {
    const segments = parseVTT(content);
    return { format: 'vtt', segments };
  }

  if (lowerName.endsWith('.srt') || /-->/.test(content)) {
    const segments = parseSRT(content);
    if (segments.length > 0) {
      return { format: 'srt', segments };
    }
  }

  const segments = parsePlainText(content);
  return { format: 'text', segments };
}
