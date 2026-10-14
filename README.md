<div align="center">

# ⛩️ MONOKURO (モノクロ)
### The Minimalist, Zero-Distraction Study & Deep Work Workspace

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![Zero Tracking](https://img.shields.io/badge/Privacy-100%25%20Local-purple?style=for-the-badge)](#-privacy-first-architecture)

<p align="center">
  <b>Monokuro</b> is a unified, no-account digital sanctuary engineered for students, developers, and deep thinkers.<br/>
  Seamlessly combines precision Pomodoro timing, ambient lofi music with synced lyrics, lecture video note-taking, and an earned cinema relaxation reward system.
</p>

[**Live Demo**](http://localhost:3000) • [**Features**](#-core-modules) • [**Architecture**](#-technical-architecture) • [**Getting Started**](#-quick-start) • [**Philosophy**](#-design-philosophy)

---

</div>

## 🌌 Overview

Modern web learning is plagued by friction: account registrations, video ads, subscription paywalls, and tab overload. **Monokuro** replaces this chaos with a singular, high-performance web sanctuary rendered in bespoke Liquid Glass and deep cinematic monochrome (`#050505`).

No sign-up required. No server database tracking your habits. Everything lives securely inside your browser's IndexedDB and localStorage.

---

## 🏛️ Core Modules

```
                    ┌──────────────────────────────────────────────┐
                    │            MONOKURO APP SHELL               │
                    │   (Global Dock • Audio Player • i18n 6L)    │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌──────────────────┬──────────────┴─────┬──────────────────┐
         ▼                  ▼                    ▼                  ▼
   ⏱️ FOCUSX           🎵 VIBRAX           🎬 CINECHILL       📝 FRAMEWHISPER
  Monotask Timer      Ambient Audio       Study-Locked Cinema  Video Notes & AI
  • Pomodoro Cycle    • Synced Karaoke    • 12h Persistent    • Timestamp Marks
  • Web Audio Chimes  • Multi-Platform      Unlock Window     • Transcript Sync
  • Focus Fullscreen  • Draggable PIP     • In-Room YouTube   • AI Summary & QA
```

### 1. ⏱️ FocusX — Monotask Biological Timer
* **Pure Distraction-Free Flow:** Built for Pomodoro, 52/17 sprints, or custom deep-work intervals (1–240 minutes).
* **Web Audio Synthesis:** Biological singing bowl chimes generated in real-time with Web Audio API harmonic oscillators — 0 audio file network latency.
* **Full-Immersion Mode:** Dim ambient distractions and lock into single-task view with keyboard shortcuts (`F11`).
* **Real-time IndexedDB Tracking:** Tracks completed study seconds per day, resilient to page reloads and background tab throttling.

### 2. 🎵 VibraX — Ambient Audio & Synced Karaoke Hub
* **Universal Track Importer:** One-click resolve for links from **Spotify, Apple Music, SoundCloud, and YouTube**. Supports complete albums and playlists up to **50 tracks** simultaneously.
* **Real-time Synced Lyrics:** Dynamic dual-mode lyrics engine (Line-by-line & Word-by-word karaoke synchronization) with smooth autoscroll.
* **Anti-Ads & Filter Shield:** Advanced filtering that strips sponsored promotional videos, noise parodies, and reaction clips to guarantee clean study ambiance.
* **Draggable & Resizable PIP Video:** Floating Picture-in-Picture window with mouse-capture guards, drag-anywhere header, resize handle, and `S / M / L` quick presets.
* **Collapsible Bottom Player Dock:** Minimize the player to a sleek floating mini-pill (`bottom-4 right-4`) while audio continues uninterrupted.

### 3. 🎬 CineChill — Earned Study Relaxation Theater
* **Study-Locked Architecture:** CineChill locks itself automatically until you achieve your daily study target (minimum **10 minutes**).
* **12-Hour Persistent Unlock:** Once your study goal is met, CineChill remains unlocked for **12 consecutive hours** (`monokuro_cinechill_unlocked_until`). Refreshing (F5) or switching tabs will never interrupt your earned break.
* **In-Room VibeTube Discovery Hub:** Direct in-page YouTube search and 1-click curated ambiance streams (4K Anime Scenery, Ghibli Vibe, Rainy Kyoto Café, Cyberpunk Night, Cosmic Deep Ambient, Synthwave Coding).
* **YouTube Premium Vault:** Optional client-side YouTube Premium account linkage for zero ads.

### 4. 📝 FrameWhisper — Lecture & Video Workspace
* **Timestamp Bookmarks:** Capture key insights with synchronized video timestamps. Click any note to jump directly to that exact moment in the video.
* **Transcript-Backed AI Intelligence:** Ask questions and generate structured study summaries from video transcripts.
* **Local Notes Ledger:** Auto-saves your notes and bookmarks locally with instant JSON export and backup capabilities.

### 5. 🪟 Split Session — Parallel Study Space
* **Dual-Pane Monotask:** Run your FocusX timer and video/music concurrently side-by-side on `/focus-session` without needing multi-monitor setups.

---

## 💎 Design Philosophy & Aesthetic

* **Cinematic Monochrome:** Deep OLED blacks (`#050505`), subtle frosted zinc borders, and ambient glow backdrops.
* **Liquid Glass UI:** Modern glassmorphism with backdrop filters, balanced opacity, and tactile micro-interactions.
* **Global Internationalization (i18n):** Complete native support for 6 languages:
  * 🇻🇳 Tiếng Việt (`vi`)
  * 🇺🇸 English (`en`)
  * 🇪🇸 Español (`es`)
  * 🇨🇳 简体中文 (`zh`)
  * 🇹🇭 ภาษาไทย (`th`)
  * 🇰🇷 한국어 (`ko`)
* **Zero Hydration Mismatch:** Robust SSR-safe client state initialization resilient against aggressive third-party browser extensions (Bitdefender, adblockers, translation tools).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16.2.4](https://nextjs.org/) (Turbopack, App Router) |
| **UI Library** | [React 19.2.4](https://react.dev/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/) |
| **Styling** | [TailwindCSS v4](https://tailwindcss.com/) + Custom Liquid Glass Design Tokens |
| **State Management** | [Zustand 5](https://github.com/pmndrs/zustand) (Modular stores: Timer, Player, Workspace, Language) |
| **Client Storage** | [idb 8.0](https://github.com/jakearchibald/idb) (IndexedDB wrapper) & `localStorage` cache |
| **Audio Synthesis** | HTML5 Audio API & Web Audio Oscillator Synth |
| **Video Engine** | YouTube IFrame Player API & Custom SSR Metadata Resolvers |

---

## 🔒 Privacy-First Architecture

1. **No Accounts, No Passwords:** You never need to enter your email or personal credentials to use Monokuro.
2. **100% Client-Side Storage:** Notes, timers, bookmarks, and preferences are stored exclusively on your device.
3. **No Hidden Telemetry:** Zero tracking scripts, zero third-party analytics pixels, zero fingerprinting.
4. **Data Ownership:** One-click JSON backup export and restore anytime in Settings.

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: `v20.x` or higher
* **npm**: `v10.x` or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Erik9910x/monokuro.git

# 2. Enter directory
cd monokuro

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts local Next.js dev server with Turbopack |
| `npm run build` | Builds optimized production bundle with full TypeScript check |
| `npm run start` | Launches production server |
| `npm run backup` | Executes automated snapshot backup script to Git |

---

## 📂 Project Structure

```
monokuro/
├── public/                 # Static assets and icons
├── scripts/                # Automated snapshot backup scripts
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── api/            # API routes (music resolve, lyrics, youtube search)
│   │   ├── cinechill/      # CineChill relaxation theater page
│   │   ├── focus-session/  # Split session parallel workspace
│   │   ├── focusx/         # FocusX Pomodoro study timer page
│   │   ├── framewhisper/   # FrameWhisper video study notes page
│   │   ├── settings/       # Workspace settings & backup/export
│   │   ├── vibrax/         # VibraX music & synced lyrics page
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Dashboard home
│   ├── components/         # Modular React components
│   │   ├── app-shell/      # Top navigation, fullscreen & language selectors
│   │   ├── common/         # Dialogs, buttons, modals
│   │   ├── player/         # GlobalAudioPlayer, BottomPlayerDock, MiniPill
│   │   └── vibrax/         # LyricsViewer, CatalogSearchPanel, ImportModal
│   └── lib/                # Core utilities & state management
│       ├── i18n/           # Internationalization dictionaries (6 languages)
│       ├── music/          # YouTube, Spotify, and Apple Music resolvers
│       ├── storage/        # IndexedDB wrapper (withDB resilience)
│       ├── store/          # Zustand state stores (timer, player, language)
│       └── timer/          # Web Audio oscillator chimes & ticker
├── SPEC.md                 # Product specifications and requirements
├── Todaywork.md            # Daily development changelog and audit trail
└── README.md               # Product introduction and documentation
```

---

## 🤝 Contributing

Contributions, feedback, and suggestions are welcome!
Feel free to open an [Issue](https://github.com/Erik9910x/monokuro/issues) or submit a [Pull Request](https://github.com/Erik9910x/monokuro/pulls).

---

## 📜 License

This project is licensed under the **MIT License**.

<div align="center">
  <sub>Crafted with passion for deep focus and mindful learning.</sub>
</div>
