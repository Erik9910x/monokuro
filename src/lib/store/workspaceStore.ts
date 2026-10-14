// Monokuro FrameWhisper Workspace Store
// Compliant with SPEC.md §6.4 (FRAME-001 through FRAME-014)

import { create } from 'zustand';
import {
  Bookmark,
  ChatMessage,
  NoteItem,
  StudyWorkspaceRecord,
  TranscriptSegment,
} from '@/types';
import {
  getWorkspaceByVideoId,
  saveWorkspace,
  getStoredSettings,
  saveStoredSettings,
} from '@/lib/storage';
import { extractYouTubeId } from '@/lib/providers/music';

export type WorkspaceLayout = 'default' | 'focus' | 'cinematic';
export type WorkspaceSideTab = 'notes' | 'transcript' | 'ai';

interface WorkspaceState {
  currentVideoId: string;
  videoTitle: string;
  canonicalUrl: string;
  currentTimeMs: number;
  playerReady: boolean;
  targetSeekTimeMs: number | null; // seek request trigger

  layout: WorkspaceLayout;
  activeSideTab: WorkspaceSideTab;

  transcriptSegments: TranscriptSegment[];
  transcriptSource: 'manual-text' | 'subtitle-file' | 'authorized-api' | 'none';
  transcriptLoading: boolean;

  notes: NoteItem[];
  bookmarks: Bookmark[];
  chatMessages: ChatMessage[];

  // Privacy & Consent
  hasAIConsent: boolean;
  aiConsentModalOpen: boolean;
  aiLoading: boolean;

  // Actions
  loadVideo: (urlOrId: string, title?: string) => Promise<void>;
  setCurrentTime: (timeSec: number) => void;
  setPlayerReady: (ready: boolean) => void;
  seekTo: (timeMs: number) => void;
  clearTargetSeek: () => void;

  setLayout: (layout: WorkspaceLayout) => void;
  setActiveSideTab: (tab: WorkspaceSideTab) => void;

  setTranscript: (
    segments: TranscriptSegment[],
    source: 'manual-text' | 'subtitle-file' | 'authorized-api'
  ) => void;
  clearTranscript: () => void;

  addBookmark: (timeMs: number, title?: string, note?: string) => void;
  deleteBookmark: (id: string) => void;

  addNote: (text: string, bookmarkId?: string) => void;
  updateNote: (id: string, text: string) => void;
  deleteNote: (id: string) => void;

  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  clearChat: () => void;

  setAIConsent: (granted: boolean) => void;
  openAIConsentModal: (open: boolean) => void;
  setAILoading: (loading: boolean) => void;

  autosaveCurrentWorkspace: () => Promise<void>;
}

const DEFAULT_VIDEO_ID = 'jfKfPfyJRdk'; // Lofi Girl / Chill beats study video

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentVideoId: DEFAULT_VIDEO_ID,
  videoTitle: 'lofi hip hop radio - beats to relax/study to',
  canonicalUrl: `https://www.youtube.com/watch?v=${DEFAULT_VIDEO_ID}`,
  currentTimeMs: 0,
  playerReady: false,
  targetSeekTimeMs: null,

  layout: 'default',
  activeSideTab: 'notes',

  transcriptSegments: [],
  transcriptSource: 'none',
  transcriptLoading: false,

  notes: [
    {
      id: 'note_welcome',
      text: 'Welcome to FrameWhisper Study Workspace.\n\n- Paste any YouTube lecture or study URL above\n- Bookmark key timestamps during playback\n- Import .srt, .vtt, or pasted transcripts to unlock AI summaries & Q&A\n- All notes and bookmarks stay private in your browser IndexedDB.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  bookmarks: [
    {
      id: 'bm_intro',
      timeMs: 0,
      title: 'Session Start',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  chatMessages: [],

  hasAIConsent: Boolean(getStoredSettings().cloudAIConsentVersion),
  aiConsentModalOpen: false,
  aiLoading: false,

  loadVideo: async (urlOrId: string, customTitle?: string) => {
    const videoId = extractYouTubeId(urlOrId) || urlOrId.trim();
    if (!videoId) return;

    // Check if we have an existing saved workspace for this video in IndexedDB
    try {
      const existing = await getWorkspaceByVideoId(videoId);
      if (existing) {
        set({
          currentVideoId: videoId,
          videoTitle: existing.title || customTitle || `YouTube Video (${videoId})`,
          canonicalUrl: existing.canonicalUrl,
          transcriptSegments: existing.transcriptSegments || [],
          transcriptSource: existing.transcriptSource || 'none',
          notes: existing.notes || [],
          bookmarks: existing.bookmarks || [],
          chatMessages: existing.chatMessages || [],
          currentTimeMs: 0,
        });
        return;
      }
    } catch (err) {
      console.warn('Could not retrieve saved workspace:', err);
    }

    // New video session
    const canonical = `https://www.youtube.com/watch?v=${videoId}`;
    set({
      currentVideoId: videoId,
      videoTitle: customTitle || `Study Session: ${videoId}`,
      canonicalUrl: canonical,
      transcriptSegments: [],
      transcriptSource: 'none',
      notes: [],
      bookmarks: [],
      chatMessages: [],
      currentTimeMs: 0,
    });

    get().autosaveCurrentWorkspace();
  },

  setCurrentTime: (timeSec: number) => {
    set({ currentTimeMs: Math.round(timeSec * 1000) });
  },

  setPlayerReady: (ready: boolean) => set({ playerReady: ready }),

  seekTo: (timeMs: number) => {
    set({ targetSeekTimeMs: timeMs, currentTimeMs: timeMs });
  },

  clearTargetSeek: () => set({ targetSeekTimeMs: null }),

  setLayout: (layout: WorkspaceLayout) => set({ layout }),
  setActiveSideTab: (tab: WorkspaceSideTab) => set({ activeSideTab: tab }),

  setTranscript: (segments, source) => {
    set({ transcriptSegments: segments, transcriptSource: source });
    get().autosaveCurrentWorkspace();
  },

  clearTranscript: () => {
    set({ transcriptSegments: [], transcriptSource: 'none' });
    get().autosaveCurrentWorkspace();
  },

  addBookmark: (timeMs: number, title?: string, note?: string) => {
    const newBm: Bookmark = {
      id: `bm_${Date.now()}`,
      timeMs,
      title: title || `Timestamp ${Math.floor(timeMs / 1000)}s`,
      note,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ bookmarks: [...s.bookmarks, newBm].sort((a, b) => a.timeMs - b.timeMs) }));
    get().autosaveCurrentWorkspace();
  },

  deleteBookmark: (id: string) => {
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
    get().autosaveCurrentWorkspace();
  },

  addNote: (text: string, bookmarkId?: string) => {
    const note: NoteItem = {
      id: `note_${Date.now()}`,
      text,
      bookmarkId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ notes: [note, ...s.notes] }));
    get().autosaveCurrentWorkspace();
  },

  updateNote: (id: string, text: string) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, text, updatedAt: Date.now() } : n)),
    }));
    get().autosaveCurrentWorkspace();
  },

  deleteNote: (id: string) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    get().autosaveCurrentWorkspace();
  },

  addChatMessage: (msg) => {
    const chat: ChatMessage = {
      ...msg,
      id: `chat_${Date.now()}`,
      createdAt: Date.now(),
    };
    set((s) => ({ chatMessages: [...s.chatMessages, chat] }));
    get().autosaveCurrentWorkspace();
  },

  clearChat: () => {
    set({ chatMessages: [] });
    get().autosaveCurrentWorkspace();
  },

  setAIConsent: (granted: boolean) => {
    saveStoredSettings({
      cloudAIConsentVersion: granted ? 'cloud-ai-v1' : undefined,
    });
    set({ hasAIConsent: granted, aiConsentModalOpen: false });
  },

  openAIConsentModal: (open: boolean) => set({ aiConsentModalOpen: open }),
  setAILoading: (loading: boolean) => set({ aiLoading: loading }),

  autosaveCurrentWorkspace: async () => {
    const state = get();
    if (!state.currentVideoId) return;

    const record: StudyWorkspaceRecord = {
      id: `ws_${state.currentVideoId}`,
      videoId: state.currentVideoId,
      canonicalUrl: state.canonicalUrl,
      title: state.videoTitle,
      transcriptSource: state.transcriptSource,
      transcriptSegments: state.transcriptSegments,
      notes: state.notes,
      bookmarks: state.bookmarks,
      chatMessages: state.chatMessages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await saveWorkspace(record);
    } catch (err) {
      console.warn('Autosave workspace error:', err);
    }
  },
}));
