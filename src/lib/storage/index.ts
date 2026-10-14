// Monokuro Local-First IndexedDB & localStorage Repository
// Compliant with SPEC.md DATA-001 through DATA-007

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import {
  StudyWorkspaceRecord,
  TimerSessionRecord,
  SavedMusicLink,
  WorkspaceSettings,
  ExportDataPayload
} from '@/types';

interface MonokuroDBSchema extends DBSchema {
  timerSessions: {
    key: string;
    value: TimerSessionRecord;
    indexes: { 'by-date': number };
  };
  savedMusicLinks: {
    key: string;
    value: SavedMusicLink;
    indexes: { 'by-date': number };
  };
  studyWorkspaces: {
    key: string;
    value: StudyWorkspaceRecord;
    indexes: { 'by-video': string; 'by-date': number };
  };
}

const DB_NAME = 'monokuro_study_workspace_db';
const DB_VERSION = 1;
const SETTINGS_KEY = 'monokuro_settings_v1';

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  theme: 'dark',
  reducedMotionOverride: 'system',
  focusDefaultMinutes: 25,
  breakDefaultMinutes: 5,
  completionSoundEnabled: true,
};

let dbInstance: IDBPDatabase<MonokuroDBSchema> | null = null;
let dbOpenPromise: Promise<IDBPDatabase<MonokuroDBSchema>> | null = null;

export async function getDB(): Promise<IDBPDatabase<MonokuroDBSchema>> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only accessible in browser runtime');
  }

  // If we already have an open database connection, verify it's still alive
  if (dbInstance) {
    try {
      // If the database connection is closing or closed, objectStoreNames access or transaction check will fail
      if (!dbInstance.objectStoreNames.contains('timerSessions')) {
        dbInstance = null;
      } else {
        return dbInstance;
      }
    } catch {
      dbInstance = null;
    }
  }

  if (dbOpenPromise) {
    return dbOpenPromise;
  }

  dbOpenPromise = (async () => {
    try {
      const db = await openDB<MonokuroDBSchema>(DB_NAME, DB_VERSION, {
        upgrade(upgradeDb) {
          if (!upgradeDb.objectStoreNames.contains('timerSessions')) {
            const timerStore = upgradeDb.createObjectStore('timerSessions', { keyPath: 'id' });
            timerStore.createIndex('by-date', 'createdAt');
          }
          if (!upgradeDb.objectStoreNames.contains('savedMusicLinks')) {
            const musicStore = upgradeDb.createObjectStore('savedMusicLinks', { keyPath: 'id' });
            musicStore.createIndex('by-date', 'createdAt');
          }
          if (!upgradeDb.objectStoreNames.contains('studyWorkspaces')) {
            const workspaceStore = upgradeDb.createObjectStore('studyWorkspaces', { keyPath: 'id' });
            workspaceStore.createIndex('by-video', 'videoId');
            workspaceStore.createIndex('by-date', 'createdAt');
          }
        },
        blocked() {
          console.warn('IndexedDB upgrade blocked by another connection');
        },
        blocking() {
          if (dbInstance) {
            dbInstance.close();
            dbInstance = null;
          }
        },
        terminated() {
          dbInstance = null;
        },
      });

      db.addEventListener('close', () => {
        dbInstance = null;
        dbOpenPromise = null;
      });

      dbInstance = db;
      return db;
    } finally {
      dbOpenPromise = null;
    }
  })();

  return dbOpenPromise;
}

// Resilient wrapper that catches closing connections and retries once with a clean instance
export async function withDB<T>(op: (db: IDBPDatabase<MonokuroDBSchema>) => Promise<T>): Promise<T> {
  try {
    const db = await getDB();
    return await op(db);
  } catch (err: any) {
    // If connection was closing or closed, reset and retry once
    const isConnClosing =
      err?.name === 'InvalidStateError' ||
      err?.message?.includes('closing') ||
      err?.message?.includes('closed');

    if (isConnClosing) {
      if (dbInstance) {
        try {
          dbInstance.close();
        } catch {}
      }
      dbInstance = null;
      dbOpenPromise = null;
      const freshDb = await getDB();
      return await op(freshDb);
    }
    throw err;
  }
}

// ===== SETTINGS (localStorage + fallback) =====
export function getStoredSettings(): WorkspaceSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to parse settings, using defaults', err);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: Partial<WorkspaceSettings>): WorkspaceSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save settings', err);
    return DEFAULT_SETTINGS;
  }
}

// ===== STUDY WORKSPACE REPOSITORY =====
export async function getWorkspaceByVideoId(videoId: string): Promise<StudyWorkspaceRecord | null> {
  return await withDB(async (db) => {
    const tx = db.transaction('studyWorkspaces', 'readonly');
    const index = tx.store.index('by-video');
    const record = await index.get(videoId);
    return record || null;
  });
}

export async function saveWorkspace(record: StudyWorkspaceRecord): Promise<void> {
  await withDB(async (db) => {
    record.updatedAt = Date.now();
    await db.put('studyWorkspaces', record);
  });
}

export async function listWorkspaces(): Promise<StudyWorkspaceRecord[]> {
  try {
    return await withDB(async (db) => {
      const all = await db.getAll('studyWorkspaces');
      return all.sort((a, b) => b.updatedAt - a.updatedAt);
    });
  } catch (err) {
    console.warn('Failed to list workspaces:', err);
    return [];
  }
}

export async function deleteWorkspace(id: string): Promise<void> {
  await withDB(async (db) => {
    await db.delete('studyWorkspaces', id);
  });
}

// ===== TIMER SESSIONS REPOSITORY =====
export async function saveTimerSession(session: TimerSessionRecord): Promise<void> {
  await withDB(async (db) => {
    await db.put('timerSessions', session);
  });
}

export async function listTimerSessions(limit = 50): Promise<TimerSessionRecord[]> {
  try {
    return await withDB(async (db) => {
      const all = await db.getAll('timerSessions');
      return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
    });
  } catch (err) {
    console.warn('Failed to list timer sessions:', err);
    return [];
  }
}

export async function clearTimerSessions(): Promise<void> {
  await withDB(async (db) => {
    await db.clear('timerSessions');
  });
}

// ===== SAVED MUSIC REPOSITORY =====
export async function saveMusicLink(item: SavedMusicLink): Promise<void> {
  await withDB(async (db) => {
    await db.put('savedMusicLinks', item);
  });
}

export async function listMusicLinks(): Promise<SavedMusicLink[]> {
  try {
    return await withDB(async (db) => {
      const all = await db.getAll('savedMusicLinks');
      return all.sort((a, b) => b.createdAt - a.createdAt);
    });
  } catch (err) {
    console.warn('Failed to query savedMusicLinks from IndexedDB, returning empty array:', err);
    return [];
  }
}

export async function deleteMusicLink(id: string): Promise<void> {
  await withDB(async (db) => {
    await db.delete('savedMusicLinks', id);
  });
}

// ===== BACKUP EXPORT & IMPORT (DATA-003, DATA-004, DATA-005) =====
export async function exportAllData(): Promise<ExportDataPayload> {
  const db = await getDB();
  const settings = getStoredSettings();
  const timerSessions = await db.getAll('timerSessions');
  const savedMusicLinks = await db.getAll('savedMusicLinks');
  const studyWorkspaces = await db.getAll('studyWorkspaces');

  return {
    app: 'monokuro',
    exportVersion: 1,
    exportedAt: Date.now(),
    data: {
      settings,
      timerSessions,
      savedMusicLinks,
      studyWorkspaces,
    },
  };
}

export async function importAllData(payload: unknown): Promise<{ success: boolean; message: string }> {
  if (!payload || typeof payload !== 'object') {
    return { success: false, message: 'Invalid payload: not an object' };
  }

  const p = payload as Partial<ExportDataPayload>;
  if (p.app !== 'monokuro' || typeof p.exportVersion !== 'number') {
    return { success: false, message: 'Incompatible or unrecognized Monokuro backup file' };
  }

  if (!p.data) {
    return { success: false, message: 'Backup contains no data object' };
  }

  const db = await getDB();
  const tx = db.transaction(['timerSessions', 'savedMusicLinks', 'studyWorkspaces'], 'readwrite');

  try {
    if (p.data.settings) {
      saveStoredSettings(p.data.settings);
    }

    if (Array.isArray(p.data.timerSessions)) {
      for (const item of p.data.timerSessions) {
        if (item && item.id) await tx.objectStore('timerSessions').put(item);
      }
    }

    if (Array.isArray(p.data.savedMusicLinks)) {
      for (const item of p.data.savedMusicLinks) {
        if (item && item.id) await tx.objectStore('savedMusicLinks').put(item);
      }
    }

    if (Array.isArray(p.data.studyWorkspaces)) {
      for (const item of p.data.studyWorkspaces) {
        if (item && item.id) await tx.objectStore('studyWorkspaces').put(item);
      }
    }

    await tx.done;
    return { success: true, message: 'All study data restored successfully' };
  } catch (err) {
    return { success: false, message: `Failed to import data: ${(err as Error).message}` };
  }
}

export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['timerSessions', 'savedMusicLinks', 'studyWorkspaces'], 'readwrite');
  await tx.objectStore('timerSessions').clear();
  await tx.objectStore('savedMusicLinks').clear();
  await tx.objectStore('studyWorkspaces').clear();
  await tx.done;

  if (typeof window !== 'undefined') {
    localStorage.removeItem(SETTINGS_KEY);
  }
}

// ===== TODAY STUDY STATS (FOR CINECHILL UNLOCK MECHANIC) =====
export interface TodayStudyStats {
  totalSeconds: number;
  totalFormatted: string;
  targetSeconds: number;
  progressPercent: number;
  isUnlocked: boolean;
  sessionsCount: number;
}

export async function getTodayStudyStats(targetMinutes = 30): Promise<TodayStudyStats> {
  try {
    const sessions = await listTimerSessions(200);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let totalMs = 0;
    let count = 0;

    for (const s of sessions) {
      if (s.mode === 'focus' && s.createdAt >= startOfDay) {
        count++;
        if (s.status === 'completed') {
          totalMs += s.durationMs;
        } else if (s.startedAt) {
          const endTime =
            s.completedAt ||
            (s.pausedRemainingMs !== null && s.pausedRemainingMs !== undefined && s.deadlineAt
              ? s.deadlineAt - s.pausedRemainingMs
              : s.updatedAt);
          const elapsed = Math.max(0, Math.min(s.durationMs, (endTime || s.updatedAt) - s.startedAt));
          totalMs += elapsed;
        }
      }
    }

    const totalSeconds = Math.floor(totalMs / 1000);
    const targetSeconds = targetMinutes * 60;
    const progressPercent = Math.min(100, Math.round((totalSeconds / targetSeconds) * 100));
    const isUnlocked = totalSeconds >= targetSeconds;

    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const totalFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;

    return {
      totalSeconds,
      totalFormatted,
      targetSeconds,
      progressPercent,
      isUnlocked,
      sessionsCount: count,
    };
  } catch (err) {
    console.warn('Failed to calculate today study stats:', err);
    return {
      totalSeconds: 0,
      totalFormatted: '0m 00s',
      targetSeconds: targetMinutes * 60,
      progressPercent: 0,
      isUnlocked: false,
      sessionsCount: 0,
    };
  }
}

export async function getCompletedStudySecondsToday(activeSessionStartedAt?: number | null): Promise<number> {
  try {
    const sessions = await listTimerSessions(200);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let totalMs = 0;
    for (const s of sessions) {
      if (activeSessionStartedAt && s.startedAt === activeSessionStartedAt) {
        continue; // Exclude active session so memory countdown is exact
      }
      if (s.mode === 'focus' && s.createdAt >= startOfDay) {
        if (s.status === 'completed') {
          totalMs += s.durationMs;
        } else if (s.startedAt) {
          const endTime = s.completedAt || s.updatedAt || s.startedAt;
          const elapsed = Math.max(0, Math.min(s.durationMs, endTime - s.startedAt));
          totalMs += elapsed;
        }
      }
    }
    return Math.floor(totalMs / 1000);
  } catch (err) {
    console.warn('Failed to get completed study seconds today:', err);
    return 0;
  }
}
