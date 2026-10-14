'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Bookmark as BookmarkIcon,
  FileText,
  MessageSquare,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Maximize2,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle,
  Shield,
  HelpCircle,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { useWorkspaceStore, WorkspaceSideTab, WorkspaceLayout } from '@/lib/store/workspaceStore';
import { parseTranscriptAuto, msToTimeString } from '@/lib/transcript/parser';

export default function FrameWhisperPage() {
  const {
    currentVideoId,
    videoTitle,
    canonicalUrl,
    currentTimeMs,
    targetSeekTimeMs,
    clearTargetSeek,
    loadVideo,
    setCurrentTime,
    seekTo,
    layout,
    setLayout,
    activeSideTab,
    setActiveSideTab,
    transcriptSegments,
    transcriptSource,
    setTranscript,
    clearTranscript,
    notes,
    addNote,
    updateNote,
    deleteNote,
    bookmarks,
    addBookmark,
    deleteBookmark,
    chatMessages,
    addChatMessage,
    clearChat,
    hasAIConsent,
    setAIConsent,
    aiConsentModalOpen,
    openAIConsentModal,
    aiLoading,
    setAILoading,
  } = useWorkspaceStore();

  // Inputs
  const [urlInput, setUrlInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [bmTitleInput, setBmTitleInput] = useState('');
  const [transcriptPasteInput, setTranscriptPasteInput] = useState('');
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);
  const [transcriptFilter, setTranscriptFilter] = useState('');
  const [chatQuestion, setChatQuestion] = useState('');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Handle URL Load
  const handleLoadVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    loadVideo(urlInput.trim());
    setUrlInput('');
  };

  // Add bookmark at current timestamp
  const handleAddBookmarkNow = () => {
    addBookmark(currentTimeMs, bmTitleInput.trim() || undefined);
    setBmTitleInput('');
  };

  // Add note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addNote(noteInput.trim());
    setNoteInput('');
  };

  // Seek iframe via postMessage YouTube API
  const handleSeekPlayer = (timeMs: number) => {
    seekTo(timeMs);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const seconds = timeMs / 1000;
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true],
        }),
        '*'
      );
    }
  };

  // Handle Transcript File Upload (.srt, .vtt, .txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const { format, segments } = parseTranscriptAuto(content, file.name);
        setTranscript(segments, 'subtitle-file');
        setTranscriptModalOpen(false);
      }
    };
    reader.readAsText(file);
  };

  // Handle Manual Transcript Paste
  const handlePasteSubmit = () => {
    if (!transcriptPasteInput.trim()) return;
    const { segments } = parseTranscriptAuto(transcriptPasteInput.trim());
    setTranscript(segments, 'manual-text');
    setTranscriptPasteInput('');
    setTranscriptModalOpen(false);
  };

  // Trigger AI Question or Summary
  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatQuestion.trim()) return;

    if (!hasAIConsent) {
      openAIConsentModal(true);
      return;
    }

    const q = chatQuestion.trim();
    setChatQuestion('');
    addChatMessage({ role: 'user', content: q });
    setAILoading(true);

    try {
      const res = await fetch('/api/ai/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: currentVideoId,
          question: q,
          segments: transcriptSegments,
          consentVersion: 'cloud-ai-v1',
        }),
      });

      const data = await res.json();
      if (data.answer) {
        addChatMessage({
          role: 'assistant',
          content: data.answer,
          sourceSegmentIds: data.sourceSegmentIds,
        });
      } else {
        addChatMessage({
          role: 'assistant',
          content: `Error: ${data.error || 'Failed to generate answer'}`,
        });
      }
    } catch (err) {
      addChatMessage({
        role: 'assistant',
        content: 'Network error communicating with AI study assistant.',
      });
    } finally {
      setAILoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!hasAIConsent) {
      openAIConsentModal(true);
      return;
    }

    if (transcriptSegments.length === 0) {
      alert('Please load or paste a transcript first to summarize.');
      return;
    }

    addChatMessage({ role: 'user', content: 'Generate a comprehensive study summary of this lecture.' });
    setAILoading(true);

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: currentVideoId,
          segments: transcriptSegments,
          consentVersion: 'cloud-ai-v1',
        }),
      });

      const data = await res.json();
      if (data.summary) {
        addChatMessage({
          role: 'assistant',
          content: data.summary,
          sourceSegmentIds: data.sourceSegmentIds,
        });
      }
    } catch (err) {
      addChatMessage({
        role: 'assistant',
        content: 'Failed to summarize transcript.',
      });
    } finally {
      setAILoading(false);
    }
  };

  // Filtered transcript cues
  const filteredSegments = transcriptSegments.filter((s) =>
    s.text.toLowerCase().includes(transcriptFilter.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* TOP HEADER: Module Title & YouTube URL Loader */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
              MODULE 03
            </span>
            <span className="text-zinc-600">/</span>
            <span className="font-mono text-xs text-zinc-300">FRAMEWHISPER</span>
          </div>
          <h1 className="text-2xl font-light font-mono text-white">Video Study Workspace</h1>
        </div>

        {/* Video URL Input */}
        <form onSubmit={handleLoadVideo} className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste YouTube study video / lecture URL..."
              className="w-full rounded-full border border-white/10 bg-white/[0.03] pl-9 pr-4 py-2 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="liquid-pill px-4 py-2 rounded-full font-mono text-xs text-white shrink-0"
          >
            LOAD VIDEO
          </button>
        </form>
      </div>

      {/* WORKSPACE LAYOUT: Video on Left (7 cols), Study Panels on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: YOUTUBE PLAYER & TIMESTAMPS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* IFrame Container with 16:9 Aspect Ratio */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${currentVideoId}?enablejsapi=1`}
              title={videoTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Metadata & Quick Controls */}
          <div className="liquid-glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">{videoTitle}</h2>
              <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 mt-0.5">
                <span>ID: {currentVideoId}</span>
                <span>•</span>
                <span>TIME: {msToTimeString(currentTimeMs)}</span>
              </div>
            </div>

            {/* Quick Bookmark Creator */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={bmTitleInput}
                onChange={(e) => setBmTitleInput(e.target.value)}
                placeholder="Bookmark label..."
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none w-32"
              />
              <button
                onClick={handleAddBookmarkNow}
                className="liquid-pill flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs text-white shrink-0"
                title="Mark timestamp"
              >
                <BookmarkIcon className="h-3 w-3" />
                <span>MARK</span>
              </button>
            </div>
          </div>

          {/* BOOKMARKS LIST */}
          {bookmarks.length > 0 && (
            <div className="liquid-glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
                  Timestamp Bookmarks ({bookmarks.length})
                </span>
                <span className="font-mono text-[10px] text-zinc-500">CLICK TO JUMP</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 hover:border-white/30 transition-all"
                  >
                    <button
                      onClick={() => handleSeekPlayer(bm.timeMs)}
                      className="flex items-center gap-1.5 font-mono text-xs text-zinc-200 group-hover:text-white"
                    >
                      <span className="text-zinc-500 font-semibold">
                        [{msToTimeString(bm.timeMs)}]
                      </span>
                      <span>{bm.title || 'Untitled Mark'}</span>
                    </button>
                    <button
                      onClick={() => deleteBookmark(bm.id)}
                      className="text-zinc-600 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STUDY TABS (Notes, Transcript, AI Assistant) (5 cols) */}
        <div className="lg:col-span-5 liquid-glass-card rounded-2xl flex flex-col h-[620px] overflow-hidden">
          {/* Sub-Tabs Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSideTab('notes')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs tracking-wider transition-all ${
                  activeSideTab === 'notes'
                    ? 'liquid-pill text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="h-3 w-3" />
                <span>NOTES ({notes.length})</span>
              </button>
              <button
                onClick={() => setActiveSideTab('transcript')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs tracking-wider transition-all ${
                  activeSideTab === 'transcript'
                    ? 'liquid-pill text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Search className="h-3 w-3" />
                <span>TRANSCRIPT</span>
              </button>
              <button
                onClick={() => setActiveSideTab('ai')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs tracking-wider transition-all ${
                  activeSideTab === 'ai'
                    ? 'liquid-pill text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>AI TUTOR</span>
              </button>
            </div>
          </div>

          {/* TAB 1: LOCAL NOTES */}
          {activeSideTab === 'notes' && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-4">
              {/* Note Creator Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Type lecture notes, concepts, formulas... (Autosaves locally)"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-white focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                  <span>AUTOSAVED TO INDEXEDDB</span>
                  <button
                    type="submit"
                    className="liquid-pill px-3 py-1 rounded-lg text-white"
                  >
                    ADD NOTE
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl border border-white/5 bg-white/[0.02] text-left space-y-2"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                      <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                      <button
                        onClick={() => deleteNote(n.id)}
                        className="text-zinc-600 hover:text-rose-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap text-xs text-zinc-200 leading-relaxed">
                      {n.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TRANSCRIPT VIEWER & INGESTION */}
          {activeSideTab === 'transcript' && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-3">
              {/* Import / Action Toolbar */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setTranscriptModalOpen(true)}
                  className="liquid-pill flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs text-white"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>IMPORT .SRT / .VTT / TEXT</span>
                </button>
                {transcriptSegments.length > 0 && (
                  <button
                    onClick={clearTranscript}
                    className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Search Filter */}
              {transcriptSegments.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={transcriptFilter}
                    onChange={(e) => setTranscriptFilter(e.target.value)}
                    placeholder="Search in transcript cues..."
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-1.5 font-mono text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Segments Display */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-left">
                {filteredSegments.length > 0 ? (
                  filteredSegments.map((seg) => (
                    <div
                      key={seg.id}
                      onClick={() => seg.startMs && handleSeekPlayer(seg.startMs)}
                      className="p-2.5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/[0.03] cursor-pointer transition-all space-y-1"
                    >
                      {seg.startMs !== null && (
                        <span className="font-mono text-[10px] text-zinc-500 font-semibold">
                          [{msToTimeString(seg.startMs)}]
                        </span>
                      )}
                      <p className="text-xs text-zinc-300 leading-relaxed">{seg.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center font-mono text-xs text-zinc-500 space-y-3 p-6 text-center">
                    <p>NO TRANSCRIPT LOADED</p>
                    <p className="text-[11px] text-zinc-600">
                      Import a subtitle file (.srt, .vtt) or paste text to enable timestamp seeking
                      and AI assistance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AI STUDY TUTOR */}
          {activeSideTab === 'ai' && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-3">
              {/* Quick Actions (Summarize) */}
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                <button
                  onClick={handleSummarize}
                  disabled={aiLoading}
                  className="liquid-pill flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs text-white"
                >
                  <Sparkles className="h-3 w-3 text-zinc-300" />
                  <span>SUMMARIZE LECTURE</span>
                </button>
                {chatMessages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300"
                  >
                    CLEAR CHAT
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left">
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'border-white/20 bg-white/[0.06] text-white ml-6'
                          : 'border-white/5 bg-white/[0.02] text-zinc-300 mr-4'
                      }`}
                    >
                      <div className="font-mono text-[10px] text-zinc-500 mb-1">
                        {msg.role === 'user' ? 'YOU' : 'MONOKURO AI'}
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center font-mono text-xs text-zinc-500 space-y-2 text-center p-6">
                    <Sparkles className="h-6 w-6 text-zinc-700" />
                    <p>ASK QUESTIONS ABOUT THIS VIDEO</p>
                    <p className="text-[11px] text-zinc-600">
                      Grounded in transcript excerpts. No full-library cloud upload.
                    </p>
                  </div>
                )}
                {aiLoading && (
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-mono text-zinc-400 animate-pulse">
                    ANALYZING TRANSCRIPT CONTEXT...
                  </div>
                )}
              </div>

              {/* Question Input */}
              <form onSubmit={handleAskAI} className="flex gap-2">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ask a question about the video..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="liquid-pill px-4 py-2 rounded-xl font-mono text-xs text-white"
                >
                  ASK
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* TRANSCRIPT IMPORT MODAL */}
      {transcriptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="liquid-glass-card rounded-2xl p-6 max-w-lg w-full space-y-4 text-left">
            <h3 className="text-sm font-mono font-medium text-white">
              IMPORT TRANSCRIPT OR SUBTITLES
            </h3>
            <p className="text-xs text-zinc-400">
              Upload a .srt, .vtt, or .txt file, or paste transcript text below. All timestamps are
              parsed locally in your browser.
            </p>

            {/* File Upload Button */}
            <div className="border border-dashed border-white/20 rounded-xl p-4 text-center hover:border-white/40 transition-colors">
              <input
                type="file"
                accept=".srt,.vtt,.txt"
                onChange={handleFileUpload}
                id="file-upload"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer font-mono text-xs text-zinc-300 hover:text-white flex flex-col items-center gap-1"
              >
                <Upload className="h-5 w-5 text-zinc-400" />
                <span>CHOOSE .SRT, .VTT, OR .TXT FILE</span>
              </label>
            </div>

            {/* Or Paste */}
            <div className="space-y-2">
              <span className="font-mono text-[11px] text-zinc-500">OR PASTE TRANSCRIPT TEXT:</span>
              <textarea
                value={transcriptPasteInput}
                onChange={(e) => setTranscriptPasteInput(e.target.value)}
                placeholder="Paste full transcript with or without timestamps..."
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 font-mono text-xs text-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 font-mono text-xs">
              <button
                onClick={() => setTranscriptModalOpen(false)}
                className="px-3 py-1.5 text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handlePasteSubmit}
                className="liquid-pill px-4 py-1.5 rounded-full text-white"
              >
                PARSE & IMPORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY CONSENT MODAL FOR CLOUD AI (SPEC.md PRIV-003) */}
      {aiConsentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="liquid-glass-card rounded-2xl p-6 max-w-md w-full space-y-4 text-left">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-white" />
              <h3 className="text-sm font-mono font-medium text-white">
                CLOUD AI PRIVACY DISCLOSURE
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Monokuro processes all notes and bookmarks exclusively on your device. When you ask
              the AI assistant a question or request a summary,{' '}
              <strong className="text-white">only the relevant transcript excerpts</strong> and your
              question are sent to the configured AI provider.
            </p>
            <ul className="text-[11px] text-zinc-400 list-disc list-inside space-y-1 font-mono">
              <li>No user profile or identity is tracked.</li>
              <li>Your personal notes are never transmitted.</li>
              <li>You can revoke consent anytime in Settings.</li>
            </ul>

            <div className="flex items-center justify-end gap-3 font-mono text-xs pt-2">
              <button
                onClick={() => openAIConsentModal(false)}
                className="px-3 py-1.5 text-zinc-400 hover:text-white"
              >
                DECLINE
              </button>
              <button
                onClick={() => setAIConsent(true)}
                className="liquid-pill px-5 py-2 rounded-full text-white"
              >
                ACCEPT & CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
