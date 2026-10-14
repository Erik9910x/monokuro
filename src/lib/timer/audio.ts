// Monokuro Web Audio API Chime Synthesizer
// Compliant with debug.md §3: Rich 3.5–4.5s multi-stage Zen harmonic bell sequence with once-only guard

import { getStoredSettings } from '@/lib/storage';

let audioCtx: AudioContext | null = null;
let lastChimeTimestamp = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a calming 3-stage Zen harmonic bell progression lasting ~4.0 seconds
 * Compliant with debug.md §3
 */
export function playCompletionChime(): void {
  // Check mute preference
  const settings = getStoredSettings();
  if (settings && settings.completionSoundEnabled === false) {
    return;
  }

  // Prevent duplicate execution within 4 seconds (React Strict Mode / duplicate renders)
  const nowWall = Date.now();
  if (nowWall - lastChimeTimestamp < 4000) {
    return;
  }
  lastChimeTimestamp = nowWall;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t0 = ctx.currentTime;

    // 3-Stage Melodic Zen Bell Progression:
    // Stage 1: 528 Hz (Solfeggio frequency) at 0.0s
    // Stage 2: 660 Hz (Warm harmonic fifth) at 1.0s
    // Stage 3: 440 Hz (Calm fundamental resolution) at 2.0s
    const stages = [
      { delay: 0.0, baseFreq: 528, harmonics: [528, 1056], duration: 2.8 },
      { delay: 1.0, baseFreq: 660, harmonics: [660, 1320], duration: 2.6 },
      { delay: 2.0, baseFreq: 440, harmonics: [440, 880, 1320], duration: 2.8 },
    ];

    stages.forEach((stage) => {
      const stageStart = t0 + stage.delay;

      stage.harmonics.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sine wave for purest acoustic bell resonance
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, stageStart);

        const peakVolume = idx === 0 ? 0.14 : 0.06;
        gain.gain.setValueAtTime(0, stageStart);
        gain.gain.linearRampToValueAtTime(peakVolume, stageStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, stageStart + stage.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(stageStart);
        osc.stop(stageStart + stage.duration + 0.1);
      });
    });
  } catch (err) {
    console.warn('Audio chime playback could not be initiated:', err);
  }
}

/**
 * Play a subtle soft tick sound on user action
 */
export function playSoftClick(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // Ignore audio errors on unprompted clicks
  }
}
