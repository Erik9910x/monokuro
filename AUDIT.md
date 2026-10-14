# Monokuro (Study Workspace) — Phase 0 Repository Audit & Feasibility Report

**Date:** 12 October 2026  
**Audited Target:** VibraX repository (`https://github.com/Erik9910x/vibraxv2.git`) & SPEC.md requirements  
**Status:** Audit Complete — Ready for Phase 1 App Shell & Persistence Implementation  

---

## 1. Inventory & Code-Path Analysis

| Component / File | Purpose in VibraX | Monokuro Decision | Rationale & Remediation |
|---|---|---|---|
| `package.json` | Next.js 16.2.4, React 19, Tailwind v4, Zustand 5, Supabase, Radix UI | **Adopt with Cleanups** | Remove `@supabase/supabase-js` (zero runtime use; violates local-only constraint). Add `idb` for typed IndexedDB. |
| `@supabase/supabase-js` | Declared in package.json | **REMOVE** | Verified via grep: No runtime database queries exist. Monokuro strictly stores all personal data locally in browser IndexedDB. |
| DevTools trapping (`FloatingPlayer.tsx`) | Blocks right-click (`contextmenu`), F12, Ctrl+Shift+I, Ctrl+U | **REMOVE COMPLETELY** | Anti-user pattern that harms accessibility and debugging. Monokuro relies on server-side token isolation and safe validation. |
| `src/app/api/lyrics/route.ts` | Server proxy to LRCLIB (`https://lrclib.net`) with custom User-Agent | **REUSE & ENHANCE** | Free, legal synced lyrics with exact/fuzzy search and duration matching. |
| `src/lib/lyrics.ts` | Parser for LRC timestamp format with millisecond precision and word-level tags | **REUSE & ENHANCE** | Solid cue parsing and time calculation; integrates cleanly with Karaoke / Music Focus. |
| `src/lib/musicapi.ts` | iTunes Search API (`https://itunes.apple.com`) + JioSaavn fallback | **REUSE & MODERNIZE** | Free worldwide audio preview URLs and high-res cover art without API keys required. |
| Music Provider Adapters | URL recognition for YouTube, Spotify, Apple Music, SoundCloud | **NEW IMPLEMENTATION** | Implements SPEC.md §6.3: honest status badges (`Playable here`, `Open in provider`, `Metadata loaded`, `Unavailable`). |
| YouTube IFrame Player | Embedded playback for FrameWhisper & VibraX | **NEW IMPLEMENTATION** | Official YouTube IFrame Player API integration supporting seek, pause/play, state changes, and timestamp bookmarks. |
| FocusX Timer Engine | Monotonic wall-clock deadline timer | **NEW IMPLEMENTATION** | Replaces simple decrement tickers with deadline computation (`deadlineAt - now`) to resist background tab throttling. Synthesized Web Audio API completion chime. |
| FrameWhisper Workspace | Video study with transcript, bookmarks, and local notes | **NEW IMPLEMENTATION** | Supports SRT, VTT, TXT, and manual pasted text parsing; bookmark-to-timestamp jump; autosaving notes. |
| AI Integration Route | Serverless proxy for study Q&A and transcript summaries | **NEW IMPLEMENTATION** | Safe server route with consent check, context-bounding, and graceful offline fallback. |
| Liquid Glass Treatment | Refractive borders/surfaces on key navigation pills | **IMPLEMENT VIA CSS/SVG** | Refined CSS backdrop-filter and specular gradient highlights for ultra-minimalist luxury look. |

---

## 2. Risk Evaluation & Mitigation

1. **Local-First Data Storage:**
   - *Requirement:* All notes, bookmarks, sessions, and settings must survive page reloads and browser restarts without any cloud database.
   - *Action:* Built with browser `IndexedDB` (`idb`) and schema versioning, with full JSON Export & Import capabilities.
2. **Third-Party Media Licensing & API Policies:**
   - *Requirement:* Do not misrepresent non-playable streams as playing.
   - *Action:* Music links from Spotify/Apple Music display album artwork and direct "Open in Spotify/Apple Music" links or preview audio when available, while YouTube videos and iTunes previews play directly.
3. **Timer Accuracy:**
   - *Requirement:* Background tabs throttle `setInterval`.
   - *Action:* FocusX calculates remaining time against wall-clock deadlines (`Date.now()`) on every tick and on window `visibilitychange` / `focus` events.

---

## 3. Phase 0 Exit Sign-off

- [x] VibraX repository cloned and audited at source level.
- [x] Unused `@supabase/supabase-js` flagged for removal.
- [x] Hostile DevTools blocker flagged for removal.
- [x] LRCLIB and iTunes preview APIs validated for safe client/server proxy usage.
- [x] Architectural boundary established for Monokuro Next.js App Router workspace.
