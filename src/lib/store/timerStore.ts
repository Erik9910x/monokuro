// Monokuro FocusX Timer Store & Engine
// Compliant with SPEC.md §6.2 (FOCUS-001 through FOCUS-010)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveTimerSession } from '@/lib/storage';
import { playCompletionChime } from '@/lib/timer/audio';

export type TimerMode = 'focus' | 'break';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type FocusLayoutMode = 'pure' | 'music' | 'karaoke';

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  durationMs: number; // configured total duration for this session
  startedAt: number | null;
  deadlineAt: number | null; // wall-clock deadline
  pausedRemainingMs: number | null;
  completedAt: number | null;
  focusLayout: FocusLayoutMode;
  isFocusModeActive: boolean; // distraction-free mode

  // Actions
  setDurationMinutes: (minutes: number) => void;
  setMode: (mode: TimerMode) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
  setFocusLayout: (layout: FocusLayoutMode) => void;
  toggleFocusMode: (active?: boolean) => void;
  getRemainingMs: () => number;
}

const DEFAULT_FOCUS_MS = 25 * 60 * 1000;
const DEFAULT_BREAK_MS = 5 * 60 * 1000;

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: 'focus',
      status: 'idle',
      durationMs: DEFAULT_FOCUS_MS,
      startedAt: null,
      deadlineAt: null,
      pausedRemainingMs: null,
      completedAt: null,
      focusLayout: 'pure',
      isFocusModeActive: false,

      getRemainingMs: () => {
        const { status, deadlineAt, pausedRemainingMs, durationMs } = get();
        if (status === 'idle') return durationMs;
        if (status === 'paused') return pausedRemainingMs ?? durationMs;
        if (status === 'completed') return 0;
        if (status === 'running' && deadlineAt) {
          return Math.max(0, deadlineAt - Date.now());
        }
        return durationMs;
      },

      setDurationMinutes: (minutes: number) => {
        const clampedMinutes = Math.max(1, Math.min(240, minutes));
        const ms = clampedMinutes * 60 * 1000;
        set({
          durationMs: ms,
          status: 'idle',
          startedAt: null,
          deadlineAt: null,
          pausedRemainingMs: null,
          completedAt: null,
        });
      },

      setMode: (mode: TimerMode) => {
        const ms = mode === 'focus' ? DEFAULT_FOCUS_MS : DEFAULT_BREAK_MS;
        set({
          mode,
          durationMs: ms,
          status: 'idle',
          startedAt: null,
          deadlineAt: null,
          pausedRemainingMs: null,
          completedAt: null,
        });
      },

      start: () => {
        const now = Date.now();
        const { durationMs, mode } = get();
        const deadline = now + durationMs;

        set({
          status: 'running',
          startedAt: now,
          deadlineAt: deadline,
          pausedRemainingMs: null,
          completedAt: null,
        });

        // Record in IndexedDB asynchronously
        saveTimerSession({
          id: `session_${now}`,
          mode,
          status: 'running',
          durationMs,
          startedAt: now,
          deadlineAt: deadline,
          pausedRemainingMs: null,
          completedAt: null,
          createdAt: now,
          updatedAt: now,
        }).catch(console.error);
      },

      pause: () => {
        const { status, deadlineAt } = get();
        if (status !== 'running' || !deadlineAt) return;

        const remaining = Math.max(0, deadlineAt - Date.now());
        set({
          status: 'paused',
          pausedRemainingMs: remaining,
          deadlineAt: null,
        });
      },

      resume: () => {
        const { status, pausedRemainingMs, durationMs } = get();
        if (status !== 'paused') return;

        const now = Date.now();
        const remaining = pausedRemainingMs ?? durationMs;
        set({
          status: 'running',
          deadlineAt: now + remaining,
          pausedRemainingMs: null,
        });
      },

      reset: () => {
        set({
          status: 'idle',
          startedAt: null,
          deadlineAt: null,
          pausedRemainingMs: null,
          completedAt: null,
        });
      },

      tick: () => {
        const { status, deadlineAt, durationMs, mode, startedAt } = get();
        if (status !== 'running' || !deadlineAt) return;

        const remaining = deadlineAt - Date.now();
        if (remaining <= 0) {
          const now = Date.now();
          set({
            status: 'completed',
            completedAt: now,
            deadlineAt: null,
            pausedRemainingMs: 0,
          });

          // Play Web Audio chime
          playCompletionChime();

          // Persist completed state to IndexedDB
          saveTimerSession({
            id: `session_${startedAt || now}`,
            mode,
            status: 'completed',
            durationMs,
            startedAt,
            deadlineAt: null,
            pausedRemainingMs: 0,
            completedAt: now,
            createdAt: startedAt || now,
            updatedAt: now,
          }).catch(console.error);
        }
      },

      setFocusLayout: (layout: FocusLayoutMode) => set({ focusLayout: layout }),

      toggleFocusMode: (active?: boolean) =>
        set((s) => ({ isFocusModeActive: active !== undefined ? active : !s.isFocusModeActive })),
    }),
    {
      name: 'monokuro_focusx_store_v1',
      partialize: (state) => ({
        mode: state.mode,
        status: state.status,
        durationMs: state.durationMs,
        startedAt: state.startedAt,
        deadlineAt: state.deadlineAt,
        pausedRemainingMs: state.pausedRemainingMs,
        completedAt: state.completedAt,
        focusLayout: state.focusLayout,
      }),
    }
  )
);
