// Monokuro (Study Workspace) Core Type Definitions
// Compliant with SPEC.md §6.2, §6.3, §6.4, §8.5

export interface TranscriptSegment {
  id: string;
  startMs: number | null;
  endMs: number | null;
  text: string;
}

export interface Bookmark {
  id: string;
  timeMs: number;
  title?: string;
  note?: string;
  labels?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface NoteItem {
  id: string;
  text: string;
  bookmarkId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  sourceSegmentIds?: string[];
}

export interface StudyWorkspaceRecord {
  id: string;
  videoId: string;
  canonicalUrl: string;
  title?: string;
  transcriptSource: 'manual-text' | 'subtitle-file' | 'authorized-api' | 'none';
  transcriptSegments: TranscriptSegment[];
  notes: NoteItem[];
  bookmarks: Bookmark[];
  chatMessages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface TimerSessionRecord {
  id: string;
  mode: 'focus' | 'break';
  status: 'running' | 'paused' | 'completed' | 'stopped';
  durationMs: number;
  startedAt: number | null;
  deadlineAt: number | null;
  pausedRemainingMs: number | null;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export type MusicProvider = 'youtube' | 'spotify' | 'apple-music' | 'soundcloud' | 'itunes' | 'unknown';
export type MusicSourceType = 'track' | 'album' | 'playlist' | 'video' | 'unknown';
export type PlaybackCapability = 'playable' | 'preview_only' | 'open_external' | 'embed_required' | 'unavailable';

export interface SavedMusicLink {
  id: string;
  provider: MusicProvider;
  sourceUrl: string;
  sourceType: MusicSourceType;
  title?: string;
  artist?: string;
  album?: string;
  coverUrl?: string;
  previewUrl?: string | null;
  capability: PlaybackCapability;
  trackIds?: string[];
  tracks?: any[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceSettings {
  theme: 'dark' | 'light' | 'system';
  reducedMotionOverride: 'system' | 'reduce' | 'full';
  focusDefaultMinutes: number;
  breakDefaultMinutes: number;
  completionSoundEnabled: boolean;
  cloudAIConsentVersion?: string;
}

export interface ExportDataPayload {
  app: 'monokuro';
  exportVersion: number;
  exportedAt: number;
  data: {
    settings: WorkspaceSettings;
    timerSessions: TimerSessionRecord[];
    savedMusicLinks: SavedMusicLink[];
    studyWorkspaces: StudyWorkspaceRecord[];
  };
}
