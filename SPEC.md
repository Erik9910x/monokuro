# STUDY WORKSPACE — PRODUCT & SOFTWARE SPECIFICATION

**Document:** `SPEC.md`  
**Status:** Implementation baseline — research-informed, with explicitly tracked audit limits  
**Revision:** 1.0  
**Research date:** 12 October 2026  
**Deployment target:** Vercel  
**Primary platform:** Responsive web application  
**Working product name:** Study Workspace  
**Modules:** FOCUSX · VIBRAX · FRAMEWHISPER

> **Truthfulness note:** This document is a build-ready specification, not a claim that the product has already been implemented or benchmarked. The accessible VibraX repository files were inspected through GitHub, including `README.md`, `package.json`, `tsconfig.json`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/app/page.tsx`, `src/app/app/layout.tsx`, and `.gitignore`. A complete local checkout, complete directory listing, automated build, runtime test, and full source-level audit were not available in this research pass. Items that depend on uninspected implementation details are marked **VERIFY DURING PHASE 0**.

---

## 1. Executive Summary

Study Workspace is a single, no-account web application for focused study. It unifies three practical workflows:

- **FOCUSX:** a configurable study/rest timer with distraction-minimizing Focus Mode.
- **VIBRAX:** a music player integrated with FocusX, lyrics/karaoke presentation, and link-based music-library import where source permissions and APIs allow it.
- **FRAMEWHISPER:** a YouTube-based study workspace with transcript-backed AI assistance, timestamp bookmarks, notes, and Focus/Cinematic viewing modes.

The product must feel like one coherent workspace, not three separate mini-apps. Its visual language is ultra-minimal: black, white, restrained neutrals, precise typography, purposeful motion, and selective Liquid Glass treatment for a few key controls.

### Product promise

A learner can open the website, begin a study session immediately, optionally play music, study a video, ask questions, mark important timestamps, and keep notes without creating a Study Workspace account.

### Non-negotiable constraints

1. No application account or login flow.
2. No server database for personal learning data.
3. User-created notes, bookmarks, timer state, local session metadata, and saved chat history stay in browser storage by default.
4. External AI calls are opt-in and disclosed. Only the minimum context needed for the requested operation may leave the browser.
5. No ad tracking, hidden analytics, fingerprinting, or unnecessary telemetry.
6. External music playback must respect each provider's current API, account, subscription, attribution, and content rules.
7. Missing transcript access, unsupported browsers, or unavailable API providers must not break the rest of the application.

### Recommended MVP decision

Build a responsive Next.js web app with browser-local persistence, a reliable FocusX timer, a provider-adapter music layer, and a FrameWhisper video workspace. The MVP should support YouTube playback through the official IFrame Player, timestamp bookmarks, notes, transcript import from pasted text or `.srt`/`.vtt`/`.txt`, and a configurable server-side AI provider. Automatic transcript retrieval for arbitrary public YouTube videos is **not** a hard dependency because official caption-download access is permission-gated. Provider-specific music playback is also not to be promised unless it has been tested with the needed access credentials and user permissions.

---

## 2. Product Goals, Non-Goals, and Success Criteria

### 2.1 Goals

- Make starting a study session immediate and low-friction.
- Keep FocusX, VibraX, and FrameWhisper state coherent without creating tightly coupled components.
- Keep user-created data under the user's browser profile and provide export/import.
- Provide honest, actionable states when an external feature is unavailable.
- Work responsively on desktop, tablet, and mobile browsers.
- Support reduced motion, keyboard navigation, semantic markup, and readable contrast.
- Keep deployment simple enough for a single maintainer on Vercel.

### 2.2 Non-goals for MVP

- No cross-device synchronization or cloud backup.
- No user accounts, password recovery, team workspaces, social features, or shared notes.
- No browser extension.
- No unauthorized extraction of audio, captions, page DOM, or provider session cookies.
- No DRM circumvention, stream ripping, or playback emulation that violates source restrictions.
- No requirement that all music services stream their full audio inside this application's own player.
- No automated visual-frame extraction from a cross-origin YouTube iframe.
- No claim that any AI API remains free forever.
- No continuous tracking of focus, microphone, webcam, or browser activity.

### 2.3 Success criteria

MVP is considered successful when:

- A first-time visitor can start a timer without onboarding or login.
- Timer duration remains correct through reloads and background-tab throttling.
- Notes and bookmarks survive reload and browser restart in the same profile.
- The user can export and restore local data from a JSON backup.
- Video playback, note-taking, bookmarks, and manual transcript import still work if the AI provider fails.
- Music-provider limitations are displayed accurately; unsupported tracks are not presented as playing.
- The site builds and deploys on Vercel with secrets held only in server environment variables.
- Automated tests cover critical timer, storage, import-validation, timestamp, and AI-error paths.

---

## 3. Scope and Release Plan

### MVP — Release 1

**Must ship:**

- Common app shell and module navigation.
- Local settings and IndexedDB persistence.
- FocusX timer, custom work/rest durations, restore-on-reload, completion notice, and app-owned Focus Mode.
- VibraX integration boundary, compact player UI, playback controls for sources that are currently supported by repository code and licensing, track/album URL detection, and official embeds/open-in-provider fallback.
- FrameWhisper YouTube iframe, notes, timestamp bookmarks, pasted transcript and `.srt`/`.vtt`/`.txt` ingestion, transcript cleanup/parsing, AI chat and transcript summary through one configured provider.
- Privacy disclosure before transcript/content is sent to a cloud AI provider.
- Local-data export, import, and clear-all workflow.
- Error, loading, empty, unavailable-provider, and offline states.
- Responsive and accessibility checks.

**Conditional in MVP:**

- Automatic transcript retrieval, only if a permitted, stable source can be shown to work for the intended class of videos.
- Full Spotify/Apple Music metadata import and playback, only after provider authentication, quota, account requirements, review rules, and the real current API behavior are verified.
- SoundCloud track/playlist import and playback, only for supported tracks and current API/embed permissions.

### Release 1.1 — Quality and usability

- Refine lyrics display and karaoke timing after a source-specific timing audit.
- More useful study-session summaries and configurable note templates.
- Optional local AI provider adapter where browser support is adequate.
- More robust conflict-free import/export, data-schema migrations, and storage-quota warnings.

### Release 2 — Only after measured demand

- Optional PWA installability and carefully scoped offline shell.
- Advanced video chapter/segment workflows.
- Extra AI providers and opt-in provider selection.
- Additional supported music-provider integrations after policy and access verification.

Do not add cross-device sync unless the product requirement changes: it conflicts with the current local-only/no-server-database constraint.

---

## 4. Users and Primary Journeys

### 4.1 Primary user

A student or independent learner who uses a browser to study, wants a quiet and responsive interface, sometimes studies with music, and learns from online videos. The user does not want to maintain another account or entrust personal notes to a cloud database.

### 4.2 Journey A — Start a focus session

1. Open Study Workspace.
2. Select FOCUSX.
3. Choose 15, 30, 45, 60, 120 minutes or enter a custom duration.
4. Optionally choose a rest duration and Music Focus mode.
5. Start the timer.
6. Switch modules or reload without losing the timer's correct end-time calculation.
7. On completion, see a non-intrusive notification and choose rest, repeat, or stop.

### 4.3 Journey B — Study from a YouTube video

1. Open FRAMEWHISPER and paste a YouTube URL.
2. The application validates the host and video ID and loads the official embedded player.
3. If a permitted transcript is available, the user may load it; otherwise they paste text or import a supported subtitle/text file.
4. The application previews the parsed transcript and timestamps before analysis.
5. The user requests a summary or asks a question and sees a clear notice before content is sent to a cloud AI provider.
6. The user bookmarks a timestamp, writes notes, and jumps between bookmarks.
7. All personal study artifacts autosave locally.

### 4.4 Journey C — Import music

1. Open VIBRAX and paste a provider URL.
2. The app detects the provider and classifies the link as track, album, playlist, or unsupported URL.
3. It attempts only authorized metadata or playback operations.
4. The UI explicitly distinguishes `Metadata loaded`, `Playable here`, `Open in provider`, and `Unavailable`.
5. FocusX may show a compact player or Karaoke Focus layout when lyrics are actually available and permitted.

---

## 5. Information Architecture

### 5.1 Routes

Recommended routes:

- `/` — lightweight launch/home surface, or redirect to the last-used module if that behavior is selected.
- `/focusx` — timer and focus controls.
- `/vibrax` — music workspace.
- `/framewhisper` — video, transcript, AI chat, bookmarks, and notes.
- `/settings` — appearance, motion, audio notifications, storage management, export/import, privacy choices, and provider diagnostics.

Routes are suggestions to validate against the existing app shell. Use a single persistent shell with module-level page boundaries and avoid duplicating navigation/player components per route.

### 5.2 Global shell

- Minimal top-level module switcher.
- Compact persistent mini-player only when it adds value and does not obscure content.
- Global status/toast region for save state and errors.
- Settings and local-data tools.
- No login button, account avatar, user profile page, or fake cloud-sync indicator.

### 5.3 Keyboard interaction

- `Space` may toggle playback only when focus is not inside an editable field and a valid player is active.
- Timer keyboard shortcuts must be discoverable, conflict-free, and configurable or disableable.
- `Escape` closes app-owned overlays and exits app-owned Focus/Cinematic layouts where appropriate.
- The app must not pretend it can reliably capture the browser/system `F11` command. Use Fullscreen API from an explicit user gesture where available.
- Every interactive element must work with keyboard and touch; do not require a mouse.

---

## 6. Functional Requirements

Requirement priority: **P0** = MVP blocker, **P1** = high value, **P2** = future enhancement.

### 6.1 Common app and local data

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| APP-001 | P0 | The application must not require Study Workspace login. | A new visitor can enter all local-only flows without account creation. |
| APP-002 | P0 | Module navigation must preserve independent module state. | Moving between routes does not reset a running timer, notes, or selected video unexpectedly. |
| DATA-001 | P0 | Settings use local storage; structured study data uses IndexedDB. | Data survives reload and reopening the same browser profile. |
| DATA-002 | P0 | Autosave notes/bookmarks/history metadata. | UI shows saving/saved/error status; a failed write is not reported as saved. |
| DATA-003 | P0 | Export all supported local data as versioned JSON. | Export contains a schema version and is downloaded by the browser without server upload. |
| DATA-004 | P0 | Validate imports before applying them. | Invalid/oversized/mismatched JSON is rejected with an understandable error; existing data stays intact. |
| DATA-005 | P0 | Provide clear-all with explicit confirmation. | The user sees scope of deletion and cancels or confirms. |
| DATA-006 | P1 | Detect storage/quota errors and give guidance. | User is told if saving fails or local storage may be near capacity. |
| DATA-007 | P0 | No automatic cloud sync. | No personal learning record is written to server storage or synced unless the user explicitly triggers a disclosed external operation. |
| PRIV-001 | P0 | No nonessential tracking by default. | No analytics/tracking SDK is included without an explicit decision and privacy review. |
| PRIV-002 | P0 | Keep provider secrets server-side. | No secret appears in client bundles, client network responses, logs, or committed files. |
| PRIV-003 | P0 | Disclose cloud AI processing. | The user can understand the payload and provider before a cloud request is first made, and can opt out/use manual tools. |

### 6.2 FOCUSX

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| FOCUS-001 | P0 | Offer presets of 15, 30, 45, 60, and 120 minutes. | Selecting a preset sets the duration before start. |
| FOCUS-002 | P0 | Allow custom work and rest durations. | Inputs are validated against documented lower/upper limits; invalid values cannot start a session. |
| FOCUS-003 | P0 | Support start, pause, resume, reset, and finish actions. | State transitions are deterministic; controls cannot produce multiple simultaneous timers. |
| FOCUS-004 | P0 | Use a wall-clock deadline or equivalent monotonic/time-reference design instead of decrement-only tick logic. | Remaining time is recomputed from timestamps; background throttling does not accumulate drift. |
| FOCUS-005 | P0 | Persist the timer state locally. | After reload, the app restores the session and computes remaining time according to the documented policy. |
| FOCUS-006 | P0 | Define sleep/background behavior. | By default, a running session continues against real elapsed time while the device sleeps; after waking, UI reconciles immediately. If the user paused, it remains paused. |
| FOCUS-007 | P0 | Provide a distraction-minimizing Focus Mode. | Shell/navigation can be hidden while timer stays usable and exits cleanly. |
| FOCUS-008 | P1 | Request true fullscreen only following a user gesture and when supported. | Rejection/unsupported browser leaves Focus Mode functional as an in-page layout. |
| FOCUS-009 | P1 | Notify completion without forcing an interruption. | Visible notification always works; sound is optional and respects browser gesture/autoplay rules. |
| FOCUS-010 | P1 | Provide a small session log if enabled. | Local history is user-controlled, exported, and deletable; no productivity score or psychological inference is generated. |

**Timer state model:** `idle`, `running`, `paused`, `completed`. Store `durationMs`, `startedAt`, `deadlineAt`, `pausedRemainingMs`, `mode` (`focus`/`break`), and schema version. For a running session, calculate `remaining = max(0, deadlineAt - now)`. Re-arm a short display update after visibility/focus events, but do not treat the interval as the source of truth. Persist state transitions; do not write to IndexedDB every animation frame.

### 6.3 VIBRAX

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| VIBRAX-001 | P0 | Audit and reuse existing player/API logic where viable. | Phase 0 produces a code-path inventory and identifies reuse/refactor/replacement with file references. |
| VIBRAX-002 | P0 | Isolate music providers behind adapters. | Each provider implements capabilities, metadata retrieval, playback/embed behavior, error mapping, and provider links. |
| VIBRAX-003 | P0 | Parse and validate supported source URLs. | Invalid hosts, malformed IDs, and unknown URL types are rejected without outbound arbitrary fetches. |
| VIBRAX-004 | P0 | Distinguish metadata import from playable audio. | A track is shown as playable only after a valid playback/embed session or supported playback API confirms it. |
| VIBRAX-005 | P0 | Preserve source attribution and platform-required controls. | Embedded players keep required branding/controls and do not hide provider attribution. |
| VIBRAX-006 | P0 | Provide fallback opening the source in its official app/site. | Unsupported/restricted tracks can be opened externally with one action. |
| VIBRAX-007 | P1 | Import album/playlist tracklists where the source API permits. | Metadata and per-track status are displayed; inaccessible tracklist data is not fabricated. |
| VIBRAX-008 | P1 | Integrate with FOCUSX without duplicating player state. | One playback controller is authoritative; play/pause/skip changes propagate to compact player and focus layout. |
| VIBRAX-009 | P1 | Lyrics/karaoke mode uses real available lyrics and timestamps. | If synced lyrics are missing, the app explains this and falls back to ordinary player view; it does not invent timing. |
| VIBRAX-010 | P1 | Expose `Pure Focus`, `Music Focus`, and `Karaoke Focus`. | The selected mode has deterministic layout behavior and persists locally. |

#### Provider support matrix (MVP position)

| Source | MVP strategy | Important limitation / fallback |
|---|---|---|
| YouTube | Official IFrame Player for video/audio playback; parse supported video/playlist links. | Preserve player requirements; do not extract the underlying audio stream. YouTube embed behavior/playlist access must be tested. |
| Spotify | Parse link/URI; use supported metadata API only when credentials and access conditions are satisfied; official embed/open-in-Spotify fallback. | Do not promise unrestricted Web API access. As of the official February 2026 migration guide, Development Mode has an app-owner Premium requirement and a five-user limit for newly restricted apps; endpoint/field restrictions also apply. Web Playback SDK requires Spotify Premium and user authorization. |
| Apple Music | Parse catalog URL; use Apple Music API/MusicKit only after developer-token and user-authorization setup is validated. Official embed/open-in-Apple-Music fallback. | Developer token and Apple Developer Program eligibility need verification. A valid catalog/tracklist does not itself guarantee in-app playback for every user. |
| SoundCloud | Use official widget/API for eligible tracks/playlists; otherwise open the official source. | API access and stream URL behavior vary by authorization and track permissions. Never download or proxy unauthorized audio. |

**Release gate:** If provider credentials or permissions are not available, the application may still ship URL recognition, saved links, embeds, and outgoing links. It must not label that state as full direct playback. Provider-specific support must be tested on current desktop and mobile browsers.

### 6.4 FRAMEWHISPER

| ID | Priority | Requirement | Acceptance criteria |
|---|---|---|---|
| FRAME-001 | P0 | Accept and validate YouTube video/playlist URLs. | Allowlisted YouTube hosts and extracted IDs are validated; arbitrary external URLs are not fetched by server routes. |
| FRAME-002 | P0 | Display video using official YouTube IFrame Player integration. | Playback controls and player events are handled through documented API, including ready/error state. |
| FRAME-003 | P0 | Accept pasted transcript and `.srt`, `.vtt`, `.txt` files. | Content is parsed into normalized segments with text and optional start/end timestamps. |
| FRAME-004 | P0 | Support local notes independent of AI. | Notes autosave and remain usable when the AI provider or internet is unavailable. |
| FRAME-005 | P0 | Bookmark the current playback timestamp. | Each bookmark stores video ID, time in seconds, optional title/note/labels, and created/updated timestamps. |
| FRAME-006 | P0 | Clicking a bookmark seeks the player. | The player seeks to the stored time and the UI handles player-not-ready state safely. |
| FRAME-007 | P0 | Provide AI summary and question-answering over the transcript. | Requests use a bounded context and return loading/streaming/error/retry states. |
| FRAME-008 | P0 | Obtain explicit consent for external AI processing. | Before the first cloud request, the UI explains what transcript/question content will be sent; the choice is remembered locally and can be changed. |
| FRAME-009 | P0 | Have a manual transcript fallback. | If auto-retrieval is absent, blocked, unauthorized, or fails, other features continue and the user can import text/subtitles. |
| FRAME-010 | P0 | Label answer grounding and timestamps accurately. | The AI may refer to a timestamp only when it can map the claim to actual timestamped transcript segments; otherwise it says no reliable timestamp is available. |
| FRAME-011 | P1 | Focus Mode reduces side panels. | Video and study content remain accessible; no notes or chat state is discarded. |
| FRAME-012 | P1 | Cinematic Mode prioritizes the video. | Side panels can be hidden/expanded and the video position is preserved. |
| FRAME-013 | P1 | Show transcript processing status. | States include `not loaded`, `parsing`, `ready`, `partial`, `failed`, and `manual input required`. |
| FRAME-014 | P1 | Save chat history locally only when user chooses. | History remains local, can be cleared/exported, and is not silently uploaded on the next request. |

#### Transcript retrieval constraint

The official YouTube Data API captions download endpoint is not a general-purpose public-transcript downloader. It is authorization-gated and subject to video/caption permissions. The product must not assume it can download captions for any arbitrary third-party video. Automatic retrieval may be implemented only from a source whose current access rules, reliability, privacy impact, and permitted use have been verified. Unofficial scraping libraries must not be a critical dependency unless their legal/terms and operational risks are explicitly reviewed and accepted.

**Fallback path:** show the video immediately; let users paste transcript or import `.srt`, `.vtt`, or `.txt`; parse locally; then optionally send the minimum transcript segments to the configured AI provider after disclosure. Support video study with no transcript by keeping notes, bookmarks, and normal playback available.

#### Transcript normalization

Normalized segment shape:

```ts
interface TranscriptSegment {
  id: string;
  startMs: number | null;
  endMs: number | null;
  text: string;
}
```

Requirements:

- Parse SRT/VTT cue times to milliseconds.
- Strip markup safely without interpreting subtitle text as HTML.
- Normalize whitespace while preserving meaningful paragraph boundaries.
- Reject unreasonable file sizes and malformed cue sequences with an actionable error.
- Preserve timestamps when valid; never invent timing for plain text.
- Chunk transcript on segment/paragraph boundaries under a configurable character/token limit.
- Associate model citations with segment IDs/timestamp ranges when supported; validate returned references against segments that were actually sent.

### 6.5 AI provider layer

**Primary approach:** one server-side LLM provider configured by the project owner. Groq may be evaluated for a latency-oriented implementation, but exact models, pricing, quota, rate limits, supported structured/streaming behavior, and free-tier availability must be verified immediately before implementation. No guarantee of free or sub-second responses.

**Optional local approach:** Chrome's built-in Prompt API using the current `LanguageModel.availability()` / `LanguageModel.create()` interface when supported. This is an enhancement, not the required AI path. Chrome's published hardware/platform requirements do not include Chrome on Android/iOS and do include constrained desktop hardware/storage conditions; model downloads may be large. Detect availability at runtime and explain readiness/download progress. Do not call old `window.ai.languageModel.create()` examples without verification.

#### AI behavior

- Server route keeps provider credentials in environment variables.
- Validate request schema, transcript character/token ceiling, and question length.
- Use a configured output token ceiling and timeout.
- Support streaming where the selected provider genuinely supports it.
- Cancel in-flight requests when user cancels, changes context, or navigates away.
- Retry transient network/5xx errors at most a small bounded number of times; do not blindly retry 429 or invalid-key errors.
- Provide an understandable response for `429`, quota exhaustion, missing key, timeout, unsupported model, malformed response, and server outage.
- Do not silently fall back from local AI to cloud AI, because that changes the data privacy model. Ask for consent first.
- Never send all notes/history by default. Only include the current video transcript/context and question necessary for the requested answer.
- Treat transcript contents as untrusted text; do not allow embedded instructions in the transcript to override application system instructions or access data outside the provided context.
- The AI does not make an answer seem transcript-grounded unless the retrieved evidence supports it.

#### No-database abuse controls

A public serverless AI endpoint can be abused if it has an owner-paid secret and no per-user authentication. Because the product forbids a user database/account system, the implementation must include layered controls: request-size limits, strict schema validation, a modest per-request token cap, bounded timeouts, provider budgets/alerts where available, Vercel-supported edge/WAF rate controls where available, cache for identical non-sensitive non-user-specific work only if privacy-appropriate, and an admin disable switch. Document that rate-limiting per anonymous visitor is less reliable without durable shared state; do not claim in-memory serverless counters provide reliable global limits. If chosen Vercel plan cannot provide adequate abuse controls, make cloud AI configurable/off by default until those controls are in place.

---

## 7. UI/UX and Design System

### 7.1 Visual direction

- Ultra-minimal black/white palette, with a small neutral scale for hierarchy and states.
- No purple-blue gradients, neon decoration, gratuitous glass, decorative particles, or dashboard card grids.
- Avoid nesting cards inside cards. Use spacing, alignment, typography, and dividers before adding containers.
- Strong readability and quiet visual rhythm; the timer and video content take priority over navigation chrome.
- Use a coherent icon set and avoid mixing emoji icons with system icons in core controls.
- Typography: choose a legible, non-generic pairing only after reviewing the existing app and language needs. Vietnamese diacritics must render correctly. Self-host fonts if practical; if a remote font service is used, disclose the external request in privacy notes and provide a system fallback.

### 7.2 Design-system guidance

Use the principles and commands from [Impeccable](https://github.com/pbakaus/impeccable): establish product truth before visual decisions, document durable design decisions separately, and use audit/critique/polish workflows when a runnable UI exists. Do not state that the skill has been installed unless it actually has been installed in the implementation environment.

Suggested deliverables during implementation are `PRODUCT.md` and `DESIGN.md` alongside this specification if the coding workflow uses Impeccable; these are implementation artifacts and are not required output for this specification-only document.

### 7.3 Motion

- Use short, purpose-driven transitions; normally aim for roughly 120–220 ms for lightweight UI state changes, tuning through user testing.
- Prefer transforms and opacity; avoid layout-thrashing animation loops.
- No animation may block pointer/keyboard interaction.
- Respect `prefers-reduced-motion` globally.
- Disable or reduce continuous motion while a page is hidden or on low-motion settings.
- Use Framer Motion only where it materially improves transitions; CSS transitions are sufficient for many controls.

### 7.4 Liquid Glass decision

**Preferred candidate:** [`@samasante/liquid-glass`](https://github.com/samasante/liquid-glass) as a selective React component, subject to a short proof-of-concept and a final license/version check. Its project documentation describes a headless React lens that refracts live DOM, and notes that the live page-refracting behavior differs by browser; fallback behavior remains necessary. Pin a tested version rather than depending on an unbounded latest release.

**Not selected for primary integration:** [`dashersw/liquid-glass-js`](https://github.com/dashersw/liquid-glass-js). It uses WebGL and html2canvas for page sampling, and its README describes a vanilla JavaScript API while listing React/Vue wrappers and performance/mobile/accessibility work in the roadmap. It may be useful for a focused prototype, but its integration and snapshot-based sampling are a worse fit for a React/Next.js app that prioritizes current live DOM, simple maintenance, and restrained effects.

This is a provisional engineering choice, not a claim that either library has passed a production benchmark. Build a tiny spike before committing the dependency. Use Liquid Glass only on a small number of buttons/controls; standard HTML buttons remain the source of semantics, focus, hit targets, and interaction. If the lens effect fails, the normal button must continue to work.

### 7.5 Responsive layouts

- **Desktop:** persistent compact navigation; FrameWhisper uses video as the primary panel and chat/notes as collapsible side panels. Three-column layout only above a tested width.
- **Tablet:** one primary panel plus a switchable side panel or resizable panels with safe minimum widths.
- **Mobile:** single-column flow; use tabs/sheets for chat and notes. Keep playback and timer controls reachable with touch. Avoid forcing 50:50 karaoke panes when the viewport cannot support readable text; use a stacked layout or user-selectable split orientation.
- Use dynamic viewport-safe sizing for mobile browser chrome and support landscape where appropriate.

### 7.6 Accessibility

Target WCAG 2.2 AA for MVP where practicable, at minimum meeting semantic, keyboard, focus, contrast, reduced-motion, and responsive reflow requirements. Verify contrast numerically, not visually. Do not rely on color alone for error or playback state. Every dialog needs focus management and Escape behavior. Live timer announcements must not cause a screen reader to announce every second; announce meaningful milestones and completion only.

---

## 8. Technical Architecture

### 8.1 Application stack

- Next.js App Router and TypeScript.
- React component architecture.
- Zustand or a similarly simple store only where shared state is required; avoid duplicating persisted and in-memory source-of-truth state.
- Tailwind CSS or another existing consistent styling system, based on the Phase 0 repository decision.
- Framer Motion selectively for purposeful animation.
- IndexedDB (through a small, typed repository layer such as `idb`/Dexie if selected) for structured local records.
- `localStorage` for small settings and feature preferences.
- Vercel Functions for cloud AI proxy and any narrowly scoped provider operations that require secrets.

### 8.2 Existing VibraX audit findings

Files inspected:

- [`README.md`](https://github.com/Erik9910x/vibraxv2/blob/main/README.md)
- [`package.json`](https://github.com/Erik9910x/vibraxv2/blob/main/package.json)
- [`tsconfig.json`](https://github.com/Erik9910x/vibraxv2/blob/main/tsconfig.json)
- [`src/app/page.tsx`](https://github.com/Erik9910x/vibraxv2/blob/main/src/app/page.tsx)
- [`src/app/layout.tsx`](https://github.com/Erik9910x/vibraxv2/blob/main/src/app/layout.tsx)
- [`src/app/app/page.tsx`](https://github.com/Erik9910x/vibraxv2/blob/main/src/app/app/page.tsx)
- [`src/app/app/layout.tsx`](https://github.com/Erik9910x/vibraxv2/blob/main/src/app/app/layout.tsx)
- [`.gitignore`](https://github.com/Erik9910x/vibraxv2/blob/main/.gitignore)

Verified at repository-file level:

- `package.json` identifies a private Next.js app with scripts `dev`, `build`, `start`, and `lint`.
- Declared versions include Next.js `16.2.4`, React/React DOM `19.2.4`, Zustand `^5.0.12`, Framer Motion `^12.38.0`, Tailwind CSS `^4`, and `@supabase/supabase-js` `^2.105.1`.
- `tsconfig.json` enables strict mode and maps `@/*` to `./src/*`.
- `src/app/page.tsx` redirects the root route to `/app`.
- `src/app/app/page.tsx` imports cards, stores, utility functions, and `@/lib/musicapi` methods such as `getTrendingTracks`, `getMoodTracks`, and `searchTracks`.
- `src/app/app/layout.tsx` imports `Sidebar`, `TopBar`, `FloatingPlayer`, Zustand-backed playlist state, and initializes mock playlists. It also injects Google Translate script.
- README describes lyrics line/word modes, click-to-seek, ±15-second seek, global Space play/pause, Framer Motion, Zustand, and an anti-inspection/anti-devtools layer.

Not yet verified:

- The exact internals, API endpoint implementations and licensing/quotas of `src/lib/musicapi`.
- All state/store persistence and hydration behavior.
- Whether lyrics data is truly time-synced or only visually presented for every provider.
- Whether Supabase is actually used at runtime or is an unused dependency.
- Build/lint status, current production behavior, and all components beneath `src/components`.

**Decision:** In Phase 0, clone the repository, run install/build/lint, inventory `src/lib/musicapi`, `src/lib/store`, player components, lyrics data sources, all `.env*` examples (without copying secrets), and dependency use. Extract the reusable player/provider/business logic and rebuild only the shell that must match Study Workspace. Do not import the entire old screen or theme blindly.

**Security clean-up:** Do not preserve code whose objective is to disable DevTools, trap debuggers, or freeze a user's browser. These are not meaningful protection and harm accessibility/debugging and trust. Keep secret protection on the server, validate requests, and obey licensing instead.

**Supabase decision:** Supabase is listed as a package dependency but user-created data must not be stored there. Remove the dependency and any associated configuration only after confirming it is unused or can be replaced without breaking required music/API logic. Do not assume package presence proves that a database is active.

### 8.3 Module boundaries

Suggested structure (adjust after source audit):

```text
src/
  app/
    focusx/
    vibrax/
    framewhisper/
    settings/
    api/
      ai/route.ts
      provider-metadata/route.ts   # only if necessary/authorized
  components/
    app-shell/
    ui/
    player/
    transcript/
    notes/
    bookmarks/
  features/
    focusx/
    vibrax/
    framewhisper/
  lib/
    storage/
    providers/
      ai/
      music/
      transcript/
    validation/
    privacy/
  types/
```

Do not implement a provider endpoint simply because it is shown in this example. Each route must have a documented reason, strict request validation, and an explicit outbound-host allowlist.

### 8.4 State ownership

- **Timer engine:** one shared store/service; page components only subscribe to derived state.
- **Playback controller:** one authoritative state per active playable source; embeds that own their own playback report their state through an adapter.
- **FrameWhisper workspace:** selected video ID, player readiness/current time, parsed transcript, current note, bookmarks, AI request state.
- **Persistence layer:** typed repository APIs such as `get`, `put`, `delete`, `list`, `export`, `import`, with schema versioning and tests.
- **UI-only transient state:** modal visibility, active tab, open sidebar and hover states remain in memory unless there is a user value to persist them.

### 8.5 Data model

All records are stored in IndexedDB unless marked as settings.

```ts
type StudyWorkspaceDB = {
  schemaVersion: number;
  settings: {
    theme: "dark" | "light" | "system";
    reducedMotionOverride: "system" | "reduce" | "full";
    focusDefaultMinutes: number;
    breakDefaultMinutes: number;
    completionSoundEnabled: boolean;
    cloudAIConsentVersion?: string;
  };
  timerSessions: Array<{
    id: string;
    mode: "focus" | "break";
    status: "running" | "paused" | "completed" | "stopped";
    durationMs: number;
    startedAt: number | null;
    deadlineAt: number | null;
    pausedRemainingMs: number | null;
    completedAt: number | null;
    createdAt: number;
    updatedAt: number;
  }>;
  savedMusicLinks: Array<{
    id: string;
    provider: "youtube" | "spotify" | "apple-music" | "soundcloud" | "unknown";
    sourceUrl: string;
    sourceType: "track" | "album" | "playlist" | "video" | "unknown";
    title?: string;
    artist?: string;
    trackIds?: string[];
    createdAt: number;
    updatedAt: number;
  }>;
  studyWorkspaces: Array<{
    id: string;
    videoId: string;
    canonicalUrl: string;
    title?: string;
    transcriptSource: "manual-text" | "subtitle-file" | "authorized-api" | "none";
    transcriptSegments: TranscriptSegment[];
    notes: Array<{ id: string; text: string; bookmarkId?: string; createdAt: number; updatedAt: number }>;
    bookmarks: Array<{ id: string; timeMs: number; title?: string; note?: string; labels?: string[]; createdAt: number; updatedAt: number }>;
    chatMessages?: Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: number; sourceSegmentIds?: string[] }>;
    createdAt: number;
    updatedAt: number;
  }>;
};
```

The code should use validated, separate TypeScript record interfaces rather than treating this illustrative schema as one giant object. Large transcripts should not be duplicated unnecessarily across history/export records. Add `schemaVersion` and migration tests. IndexedDB transactions must complete before reporting persistence success.

### 8.6 Export/import contract

- Export format: UTF-8 JSON with `app`, `exportVersion`, `exportedAt`, and `data` fields.
- No secrets, provider API keys, or access tokens may be included.
- Export should include user-created local notes/bookmarks/settings and user-selected history, with a visible selection if large chat/transcript data could make the file huge.
- Import must validate type, structure, size, and supported versions before modifying data.
- Newer unknown versions must be rejected safely instead of destructively imported.
- Provide replace-all and merge modes only if their conflict behavior is clearly defined; MVP may implement replace-all with a pre-import backup to reduce complexity.

---

## 9. API and Integration Contracts

### 9.1 Server-side AI route

Suggested endpoint: `POST /api/ai/answer` and/or `POST /api/ai/summarize` if separate contracts materially simplify validation. Do not expose a generic arbitrary-provider proxy.

Request shape:

```json
{
  "task": "summarize",
  "videoId": "VIDEO_ID",
  "question": "What are the three main concepts?",
  "segments": [
    { "id": "s1", "startMs": 12000, "endMs": 18500, "text": "Validated transcript excerpt." }
  ],
  "consentVersion": "cloud-ai-v1"
}
```

Response contract should be typed and versioned; if streaming is used, define the event format and terminal/error event explicitly. Validate all client input as untrusted. Never accept a client-supplied endpoint URL or model string that can route requests outside the configured provider.

Environment variables should be documented with exact required/optional status and no real secret values:

- `AI_PROVIDER` — required when cloud AI is enabled.
- `AI_API_KEY` — required for the selected provider; server-only.
- `AI_MODEL` — model ID verified against current provider documentation.
- `AI_MAX_INPUT_CHARS` — server cap.
- `AI_MAX_OUTPUT_TOKENS` — server cap.
- `AI_REQUEST_TIMEOUT_MS` — server timeout.
- `AI_ENABLED` — kill switch.

Names may be normalized during implementation, but they must not use `NEXT_PUBLIC_` for secrets.

### 9.2 YouTube player and video URLs

- Use the official IFrame Player API for embed, current time, ready/error handling, and seeking.
- Accept standard `youtube.com/watch`, `youtu.be`, supported embed URLs, and playlist URLs only where properly parsed.
- Normalize to video IDs; do not request arbitrary URLs from the server.
- Provide clear unavailable states for private, removed, age-restricted, region-restricted, or non-embeddable content.
- No attempt to bypass YouTube restrictions or obtain undocumented cookies/session tokens.

### 9.3 Music URL/provider adapters

Each adapter contract should describe:

```ts
interface MusicProviderAdapter {
  id: "youtube" | "spotify" | "apple-music" | "soundcloud";
  canParse(url: URL): boolean;
  parseUrl(url: URL): ParsedMusicReference | null;
  fetchMetadata(ref: ParsedMusicReference, signal?: AbortSignal): Promise<ProviderMetadataResult>;
  getPlaybackCapability(ref: ParsedMusicReference): PlaybackCapability;
  getOpenInProviderUrl(ref: ParsedMusicReference): string;
}
```

This is a conceptual interface; provider-specific authentication, supported operations, playback semantics, and errors must be implemented separately. Do not require every adapter to implement direct audio playback.

### 9.4 HTTP and payload limits

Vercel documents a 4.5 MB request/response body limit for Functions. Set much smaller application-specific limits for transcript and AI requests; do not send subtitle files as huge base64 JSON. Parse supported files in the browser where practical and submit only bounded text segments. Check current Vercel limits again before implementation because plan/runtime limits may change.

---

## 10. Privacy, Security, and Data Flow

### 10.1 Default data flow

**Stays local:** settings, timer state/history, notes, bookmarks, imported transcript storage, saved music links, and chat history (unless the user initiates a cloud AI request, in which case the selected request payload is sent separately).

**May go to Vercel:** only the specific AI request or authorized metadata lookup initiated by the user, with payload constrained by documented schema. No notes/history upload merely because the app opens.

**May go to third parties:** explicit embedded media requests to YouTube/music providers and AI payload to the selected AI provider after consent. Third-party embeds may process network/browser metadata under their own policies; disclose this plainly and offer to avoid loading embeds before user action where practical.

### 10.2 Security controls

- Validate URL host and ID on both client and server.
- Server-side provider destinations must be fixed in configuration; prevent SSRF through arbitrary URL parameters.
- Sanitize/render AI Markdown safely; do not inject raw HTML from AI, transcript, filenames, or metadata.
- Add size ceilings for notes, subtitle files, transcripts, chat payloads, and import/export files.
- Prevent prototype pollution and unsafe deserialization when importing JSON.
- Keep OAuth access tokens (if an optional music integration ever uses them) out of persistent plain-text storage where feasible; prefer provider-approved flows and minimum scopes. Do not use external browser cookie/session scraping.
- Use secure headers and deploy HTTPS via Vercel.
- Avoid logging transcript and question contents; log high-level error codes only, with request IDs that are not user identifiers.
- Make clear that client-side storage is not encrypted against other people or malware using the same browser account. Local-only is a data-flow choice, not a substitute for device security.

### 10.3 Retention

- Browser-local records remain until the user clears them, browser storage is deleted, or the browser evicts site data. Tell users to export important information.
- Request data sent to cloud AI is not persisted by the app beyond processing unless future requirements explicitly change. Provider-side retention must be checked in the selected provider terms and disclosed accurately; do not promise zero retention unless contract/documentation verifies it.
- No server database is provisioned for personal study data.

### 10.4 Threat model

| Risk | Mitigation | Residual limitation |
|---|---|---|
| Secret leaks into client bundle | Server-only env vars, production bundle check, secret scan | A compromised deployment account can still expose secrets. |
| Public AI endpoint abuse | Caps, timeout, WAF/rate rules if available, budget alert/kill switch | Reliable per-visitor global quotas are harder without shared durable state. |
| Malicious imported subtitle/JSON | Size/type validation, parse as text, safe renderer, schema validation | Browser parser vulnerabilities must still be patched. |
| SSRF via media URL | Host allowlist and ID parsing; no arbitrary fetch | New URL patterns must be reviewed before support. |
| Data loss by user/browser | Export/import, schema migrations, quota warnings | Browser data may still be cleared or evicted. |
| Third-party provider changes | Adapters, explicit errors, fallback to official link | Some integrations may become unavailable or paid. |
| Misleading AI summary | Transcript-grounded prompt, segment references, clear uncertainty | Generative AI may still make mistakes. |

---

## 11. Error Handling and State UX

All async features should have explicit `idle`, `loading`, `success`, and `error` states where applicable. Errors must preserve user input and not erase local data.

| Area | Error case | Required behavior |
|---|---|---|
| IndexedDB | Open, quota, transaction, or write error | Keep editor content in memory; show unsaved warning; retry safely; do not show “Saved”. |
| Timer | Corrupt/incompatible stored timer | Recover to a safe idle state, preserve other data, provide a non-blocking notice. |
| YouTube | Invalid, private, removed, restricted, non-embeddable, or unavailable video | Explain the issue; allow URL correction; do not crash unrelated modules. |
| Transcript | No captions, blocked source, malformed file, unsupported format | Explain options: paste transcript, import SRT/VTT/TXT, or continue with bookmarks/notes only. |
| AI | No configuration/key | Explain that AI is unavailable in this deployment; leave manual study features enabled. |
| AI | 429/quota | Show retry guidance and cooldown if known; don't retry in a tight loop. |
| AI | Timeout/network/5xx | Keep question and transcript; offer retry/cancel; bounded retry only. |
| Music | Authentication or subscription required | Explain the provider requirement and offer its official link/embed. |
| Music | Metadata loaded, playback unsupported | Show tracklist with a distinct “Open in provider” action, not a false Play state. |
| Import | Invalid JSON or unsupported schema | Reject before mutation; preserve existing store. |
| Fullscreen | User denies or browser doesn't support | Keep in-page Focus/Cinematic Mode. |

Error copy should be direct and non-technical by default, with technical details in an optional expandable diagnostic section that never reveals secrets.

---

## 12. Non-Functional Requirements

Initial proposed targets are **acceptance targets, not measured benchmarks**. Validate them on representative desktop and mobile devices; adjust only with evidence.

| Area | Target / rule | Measurement method |
|---|---|---|
| Initial interface | Aim for LCP ≤ 2.5 s on representative mid-tier mobile conditions, excluding third-party media readiness. | Lighthouse/Web Vitals on production deployment. |
| Local interaction | Simple local actions should generally respond within 100 ms when the main thread is not blocked. | Browser performance traces and interaction tests. |
| Animation | Avoid dropped frames on baseline target hardware for core shell transitions; no mandatory continuous animation. | DevTools performance trace, reduced-motion test. |
| Timer | Remaining time reconciles on visibility/focus/resume; no accumulated decrement drift. | Fake-clock/unit tests plus real-device sleep/wake checks. |
| Data | Notes/bookmarks survive refresh and normal browser restart in same profile. | Playwright persistent-context tests and manual checks. |
| Size | Lazy-load FrameWhisper and provider SDKs; avoid loading every SDK on the home route. | Bundle analyzer and network waterfall. |
| Reliability | One provider failure does not crash another module. | Fault injection/integration tests. |
| Accessibility | Target WCAG 2.2 AA behavior for core flows. | Automated audit plus keyboard/screen-reader manual tests. |
| Compatibility | Current stable Chrome, Edge, Firefox, Safari on desktop; current iOS Safari and Android Chrome for web fundamentals. Feature-specific API support may differ. | Browser matrix. |
| Privacy | No nonessential analytics or server-side storage of study artifacts by default. | Dependency scan, network inspection, code review. |

Performance targets exclude third-party iframe media and AI model latency where the application cannot control the provider, but their perceived loading states must still be designed well.

---

## 13. Testing Strategy

### 13.1 Unit tests

- Timer state transitions, deadline calculation, pause/resume/reset/completion, daylight clock changes, corrupted saved state.
- URL parsing/normalization for YouTube, Spotify, Apple Music, SoundCloud, invalid hosts, misleading query strings, malformed IDs.
- Subtitle parsing for SRT/VTT, malformed timestamps, empty files, unicode/Vietnamese, long cues, HTML-like text.
- Local data repository CRUD, migrations, export/import validation, failed transaction handling.
- Provider adapter capability and error mapping.
- AI request schema, context truncation, source-segment ID validation, response parsing.

### 13.2 Integration tests

- IndexedDB autosave → reload → restored notes/bookmarks.
- Timer start → pause → reload → resume; running timer reconciles after hidden-tab time.
- YouTube ready/error events and seeking to bookmark.
- AI route with mocked provider success, 429, timeout, invalid key, malformed response, abort, and oversized input.
- Provider metadata success but playback unavailable state.
- AI outage does not break notes/timer/video playback.

### 13.3 End-to-end tests

1. First visit without login; start a 15-minute timer and enter Focus Mode.
2. Reload while timer is running; verify remaining time is derived from deadline.
3. Paste valid YouTube URL; add bookmark at a known current time; seek back to it.
4. Import SRT and verify cues/timestamps appear correctly.
5. Create/edit a note, reload, and verify persistence.
6. Export JSON, clear local data, import backup, and verify restoration.
7. Disable/fail AI provider and verify manual study workflows still work.
8. Test layout at 360 px, tablet widths, and wide desktop; confirm no horizontal overflow.
9. Keyboard-only navigate core paths and verify focus visibility and dialog behavior.
10. Test reduced-motion mode and browser fullscreen failure fallback.

### 13.4 Manual provider verification

Before release, test each configured provider with real but authorized developer credentials and accounts. Record test date, browser, expected result, actual result, restrictions, and test account requirements without recording any secrets. Test unsupported/restricted content deliberately so fallback behavior is proven.

---

## 14. Acceptance Test Matrix

| Test ID | Requirement | Input/setup | Expected result |
|---|---|---|---|
| TEST-FOCUS-001 | FOCUS-001/003 | Choose 15 min, start, pause, resume, reset | Each transition updates timer correctly; only one active timer exists. |
| TEST-FOCUS-002 | FOCUS-004/006 | Start timer, background tab/device for several minutes | On return, remaining time matches elapsed wall time within test tolerance. |
| TEST-FOCUS-003 | FOCUS-005 | Start then reload | Session restores with accurate remaining time and correct running/paused policy. |
| TEST-DATA-001 | DATA-002 | Edit note and simulate storage write failure | Unsaved state is visible; UI does not claim persistence. |
| TEST-DATA-002 | DATA-003/004 | Export, alter JSON schema/type, import | Valid backup restores; invalid backup is rejected without partial destructive mutation. |
| TEST-FRAME-001 | FRAME-001/002 | Paste valid and invalid YouTube URLs | Valid ID loads official player; invalid URL is rejected clearly. |
| TEST-FRAME-002 | FRAME-003 | Import SRT/VTT/TXT fixtures | Text and valid timestamps are parsed; plain text has no fabricated timestamps. |
| TEST-FRAME-003 | FRAME-005/006 | Bookmark at playback time and select bookmark | Bookmark persists and player seeks to target time when ready. |
| TEST-FRAME-004 | FRAME-008 | Submit AI question before/after consent | Cloud request is blocked until consent; request payload contains only necessary context. |
| TEST-FRAME-005 | FRAME-009 | Force transcript source unavailable | Manual import remains available; notes/bookmarks and video remain usable. |
| TEST-AI-001 | AI provider layer | Mock 429/timeout/500/invalid secret | Correct message shown, request is bounded, no infinite retry, no secret disclosed. |
| TEST-MUSIC-001 | VIBRAX-004/006 | Import track with metadata but no playback permission | Metadata/link is shown, state is “Open in provider” or equivalent, not “Playing”. |
| TEST-MUSIC-002 | VIBRAX-008/010 | Change play state while switching FocusX mode | One authoritative playback state updates all UI surfaces. |
| TEST-UI-001 | UI/UX | Use mobile width and reduce-motion preference | Layout reflows without overflow; nonessential animation reduces/disables. |
| TEST-SEC-001 | SEC controls | Send arbitrary external URL to provider/transcript route | Request rejected; server does not fetch arbitrary host. |
| TEST-SEC-002 | Secret management | Inspect build artifacts and client requests | No provider secret appears in client output or network payload. |

---

## 15. Deployment and Environment Configuration

### 15.1 Vercel deployment

- Deploy through the connected Git repository.
- Build command and output should follow the selected Next.js version and Vercel defaults unless repository inspection proves otherwise.
- Use separate Preview and Production environment variables.
- Run tests/lint/build before production promotion.
- Do not put user learning data in Vercel Blob, KV, Postgres, or external storage under this specification.
- Confirm the current Vercel Function runtime/body/duration limits before enabling large transcript requests.
- Use deployment rollback if critical production checks fail.

### 15.2 Environment variable template

```dotenv
# Cloud AI is explicitly configurable. No real keys belong in this file.
AI_ENABLED=false
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
AI_MAX_INPUT_CHARS=30000
AI_MAX_OUTPUT_TOKENS=1200
AI_REQUEST_TIMEOUT_MS=30000

# Optional provider credentials must be added only if their integration is enabled.
# SPOTIFY_CLIENT_ID=
# SPOTIFY_CLIENT_SECRET=
# APPLE_MUSIC_TEAM_ID=
# APPLE_MUSIC_KEY_ID=
# APPLE_MUSIC_PRIVATE_KEY=
# SOUNDCLOUD_CLIENT_ID=
```

The values are placeholders and starting limits, not proof that a provider supports those exact settings. Tune input/output caps after model/context verification. Prefer avoiding optional music API secrets in MVP unless they unlock a demonstrated required feature. Never prefix secrets with `NEXT_PUBLIC_`.

### 15.3 Release checklist

- [ ] Vercel Preview build is green.
- [ ] Production build and lint pass.
- [ ] Required environment variables are configured and secrets are server-only.
- [ ] Cloud AI can be disabled immediately with a server-side switch.
- [ ] Privacy disclosure matches actual outbound requests and third-party embeds.
- [ ] All core manual study flows work with AI disabled.
- [ ] IndexedDB migrations and export/import pass.
- [ ] Provider capabilities are based on real tests, not mocks alone.
- [ ] No accidental database/analytics integration exists.
- [ ] Keyboard, reduced-motion, responsive, and error-state checks pass.
- [ ] User-facing limitations and local-data deletion/export options are visible.

---

## 16. Implementation Roadmap

### Phase 0 — Repository audit and feasibility proof

**Tasks:** clone/inspect VibraX; run install/build/lint; inventory music APIs, state stores, lyrics sources, player component, and persistence; identify Supabase usage; check licenses/provider terms; build a small Liquid Glass prototype in the target React version; test current provider permissions.  
**Output:** audit table with exact file references, dependency map, risks, and selected reusable modules.  
**Exit criteria:** no unknown critical dependency is being carried into MVP without a written decision.

### Phase 1 — App shell and local persistence

**Tasks:** set up route shell, black/white tokens, components, IndexedDB layer, schema migration, export/import, settings, error/toast pattern, accessibility foundation.  
**Exit criteria:** settings and sample notes survive reload, backup round-trips successfully, and no account/database flow exists.

### Phase 2 — FOCUSX

**Tasks:** timer state machine, deadline calculations, presets/custom input, rest cycles, completion notice, Focus Mode, local session restoration, tests.  
**Exit criteria:** timer tests pass including background-tab drift and reload.

### Phase 3 — VIBRAX integration

**Tasks:** isolate player logic; define provider adapters; integrate compact player and lyrics; support available source URL parsing; implement official embeds/open-provider fallback and accurate states.  
**Exit criteria:** one valid playback source works end-to-end and unsupported cases never show false playback state. Each added provider must pass manual verification.

### Phase 4 — FRAMEWHISPER core

**Tasks:** YouTube IFrame Player, URL parsing, transcript ingestion/parser, timestamp bookmarks, notes, Focus/Cinematic layouts, persistence.  
**Exit criteria:** video, notes, bookmarks, and manual transcript flow work with AI disabled.

### Phase 5 — AI integration

**Tasks:** choose verified provider/model, cloud consent UI, API route, strict validation, safe streaming, token/context caps, timeout/retry/abort, provider error UX, basic abuse controls. Optionally add Chrome Prompt API after it passes browser/locale/hardware tests.  
**Exit criteria:** normal, failure, quota, cancellation, and missing-key tests pass; AI calls send only expected payload.

### Phase 6 — Hardening and polish

**Tasks:** design critique/audit, Liquid Glass fallback checks, browser matrix, mobile layouts, keyboard/accessibility, dependency audit, security review, performance profiling.  
**Exit criteria:** critical accessibility/functional issues are fixed and stated targets are measured.

### Phase 7 — Production release

**Tasks:** Preview and Production configuration, environment variables, final provider checks, privacy copy review, monitoring limited to operational errors, rollback checklist.  
**Exit criteria:** release checklist complete and user-facing limits reflect verified behavior.

---

## 17. Technical Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation / decision |
|---|---|---|---|
| Unavailable or unauthorized public YouTube captions | High | High | Make manual subtitle/text import a first-class feature; optional auto retrieval is separately verified. |
| Spotify API policy/access restrictions | High | High | Metadata/embed/outgoing-link fallback; test owner Premium, app mode, allowlist and endpoint availability before promising full support. |
| Apple Music developer token and user authorization requirements | Medium–High | Medium | Keep integration conditional; use official MusicKit/API; no hard dependency in MVP. |
| SoundCloud API access changes | Medium–High | Medium | Official widget/link fallback; provider adapter isolates change. |
| Public AI proxy abuse/cost | High | Medium–High | Hard caps, budget alerts, kill switch, WAF controls if available; disable cloud AI if protections are insufficient. |
| API free tier changes | Medium–High | High | Configurable provider/model, no free-forever promise, budget guard. |
| Local data eviction/clearing | High | Medium | Export/import, warning, no claim of cloud backup. |
| Liquid Glass compatibility/performance | Medium | Medium | Prototype before adoption, limited use, functional CSS fallback. |
| Existing VibraX code contains tracking/database assumptions | Medium–High | Medium | Phase 0 code audit; remove unused Supabase, Google Translate script, unnecessary external calls as appropriate. |
| Too many SDKs increase load and risk | Medium | High | Lazy-load provider SDKs by route/interaction and defer nonessential integrations. |
| AI hallucinated timestamps/citations | Medium–High | Medium | Validate segment references; distinguish unsupported claims; never invent timestamps. |
| Mobile 50:50 karaoke layout becomes unreadable | Medium | High | Stack/switch layout on narrow screens; optimize for readability over literal split ratio. |

---

## 18. Assumptions and Open Decisions

### Confirmed from product requirements

- Product is a learning-focused web app with FOCUSX, VIBRAX, and FRAMEWHISPER.
- Vercel deployment is required.
- Visual direction is ultra-minimal black and white with light motion and selective Liquid Glass.
- No user account and no server database for personal learning data.
- Local notes/bookmarks and browser persistence are essential.
- Existing VibraX source should be reused where possible.

### Assumptions to test

1. The existing music APIs are reusable under current provider policies and are not tied to database/session behavior that cannot be retained.
2. The product owner is willing to configure one AI provider secret for a shared cloud-AI deployment; if not, cloud AI must remain disabled or use a viable browser-local model only on supported devices.
3. A cloud AI endpoint can be adequately rate-controlled within the chosen Vercel plan without introducing a forbidden user-data database.
4. The first release can deliver robust transcript/manual-subtitle workflows before automatic retrieval across arbitrary YouTube videos.
5. Full album tracklist import/playback on all four music sources may be staged instead of guaranteed on day one.
6. The app can use official provider embeds/outgoing links where direct playback is unavailable.

### Decisions required during Phase 0 (do not ask the end user unless evidence cannot resolve them)

- Exact AI provider and current model ID.
- Whether any automatic transcript source is permitted and robust enough for production.
- Which legacy VibraX components and music providers pass reuse tests.
- Whether music integration needs OAuth, and which provider capabilities are realistic without app users signing into Study Workspace.
- Whether `@samasante/liquid-glass` survives a short prototype on Chrome, Safari, Firefox, and mobile.
- Whether Supabase is unused and removable.
- Exact Vercel plan and available WAF/rate-control features.
- Whether local AI should be deferred until the cloud/manual MVP is stable.

Do not silently resolve a decision based on guesswork. Record the evidence and chosen trade-off in the Phase 0 audit.

---

## 19. Official References

**Research checked: 12 October 2026.** Provider access, versions, quotas, and policies can change; re-check before coding and before release.

### Project repositories

- VibraX repository: https://github.com/Erik9910x/vibraxv2
- VibraX README: https://github.com/Erik9910x/vibraxv2/blob/main/README.md
- VibraX `package.json`: https://github.com/Erik9910x/vibraxv2/blob/main/package.json
- VibraX root redirect: https://github.com/Erik9910x/vibraxv2/blob/main/src/app/page.tsx
- VibraX app route: https://github.com/Erik9910x/vibraxv2/blob/main/src/app/app/page.tsx
- VibraX app layout: https://github.com/Erik9910x/vibraxv2/blob/main/src/app/app/layout.tsx
- Impeccable design skill: https://github.com/pbakaus/impeccable
- Impeccable initialization guidance: https://github.com/pbakaus/impeccable/blob/main/skill/reference/init.md
- Liquid Glass JS (WebGL/vanilla): https://github.com/dashersw/liquid-glass-js
- Sam Asante Liquid Glass (React): https://github.com/samasante/liquid-glass
- Sam Asante npm package: https://www.npmjs.com/package/@samasante/liquid-glass

### AI in Chrome

- Chrome Prompt API: https://developer.chrome.com/docs/ai/prompt-api
- Chrome built-in AI overview: https://developer.chrome.com/docs/ai/built-in

### YouTube

- YouTube Data API captions download: https://developers.google.com/youtube/v3/docs/captions/download
- YouTube IFrame Player API: https://developers.google.com/youtube/iframe_api_reference
- YouTube API overview: https://developers.google.com/youtube/v3

### Spotify

- Spotify Web API: https://developer.spotify.com/documentation/web-api
- February 2026 migration guide: https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
- Quota modes: https://developer.spotify.com/documentation/web-api/concepts/quota-modes
- Web Playback SDK: https://developer.spotify.com/documentation/web-playback-sdk
- Web Playback SDK requirements/tutorial: https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

### Apple Music

- Apple Music API: https://developer.apple.com/documentation/AppleMusicAPI
- Developer token generation: https://developer.apple.com/documentation/AppleMusicAPI/generating-developer-tokens
- MusicKit JS: https://developer.apple.com/documentation/musickitjs

### SoundCloud

- SoundCloud API guide: https://developers.soundcloud.com/docs/api/guide
- SoundCloud API documentation: https://developers.soundcloud.com/docs/api

### Deployment and browser storage

- Vercel Functions: https://vercel.com/docs/functions
- Vercel Function limitations: https://vercel.com/docs/functions/limitations
- IndexedDB API overview: https://developer.mozilla.org/docs/Web/API/IndexedDB_API
- Storage quotas and eviction criteria: https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Fullscreen API: https://developer.mozilla.org/docs/Web/API/Fullscreen_API
- `prefers-reduced-motion`: https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion

---

## 20. Final Definition of Done

The specification is implementation-ready when:

- Each P0 requirement has a stable ID and testable acceptance criteria.
- The boundaries between local-only data and outbound provider requests are explicit.
- The product remains useful if cloud AI, transcript retrieval, or one or more music providers are unavailable.
- The codebase reuse plan is based on actual file-level inspection; remaining audit gaps are not misrepresented as complete.
- API dependencies and access requirements have an owner and verification step.
- UI states cover success, loading, empty, error, unsupported, offline, and reduced-motion behavior.
- The release plan starts with a reliable local-first core and stages uncertain integrations behind capability checks.
- No unsupported promise is made about public YouTube transcripts, Spotify/Apple/SoundCloud playback, permanent free AI, or cross-device persistence.

**This document is the source of truth for the first implementation pass.** If a provider policy, repository detail, or platform constraint conflicts with an aspirational requirement, preserve the user goal while choosing the most reliable compliant fallback, document the trade-off, and update this file before implementation proceeds.
