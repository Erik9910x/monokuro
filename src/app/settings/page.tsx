'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Trash2,
  HardDrive,
  Shield,
  Volume2,
  Clock,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Languages,
} from 'lucide-react';
import {
  exportAllData,
  importAllData,
  clearAllLocalData,
  getStoredSettings,
  saveStoredSettings,
} from '@/lib/storage';
import { WorkspaceSettings } from '@/types';
import { playCompletionChime } from '@/lib/timer/audio';
import { useLanguageStore } from '@/lib/store/languageStore';
import LanguageSelector from '@/components/common/LanguageSelector';

export default function SettingsPage() {
  const { t } = useLanguageStore();
  const [settings, setSettings] = useState<WorkspaceSettings>(getStoredSettings());
  const [notification, setNotification] = useState<{ text: string; error?: boolean } | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<string>('Estimating...');
  const [clearModalOpen, setClearModalOpen] = useState(false);

  useEffect(() => {
    // Check storage estimate
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        const usageMb = ((est.usage || 0) / (1024 * 1024)).toFixed(2);
        const quotaMb = ((est.quota || 0) / (1024 * 1024)).toFixed(0);
        setStorageEstimate(`${usageMb} MB used of ${quotaMb} MB available`);
      }).catch(() => {
        setStorageEstimate('Storage API unavailable');
      });
    }
  }, []);

  const handleUpdateSettings = (partial: Partial<WorkspaceSettings>) => {
    const updated = saveStoredSettings(partial);
    setSettings(updated);
    setNotification({ text: 'Settings updated successfully' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle Export Backup
  const handleExportBackup = async () => {
    try {
      const payload = await exportAllData();
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `monokuro_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setNotification({ text: 'Backup JSON downloaded successfully' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ text: 'Failed to generate backup export', error: true });
    }
  };

  // Handle Import Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const res = await importAllData(parsed);

        if (res.success) {
          setNotification({ text: res.message });
          setSettings(getStoredSettings());
        } else {
          setNotification({ text: res.message, error: true });
        }
      } catch (err) {
        setNotification({ text: 'Invalid JSON backup file', error: true });
      }
    };
    reader.readAsText(file);
  };

  // Handle Clear Local Data
  const handleClearAll = async () => {
    await clearAllLocalData();
    setClearModalOpen(false);
    setSettings(getStoredSettings());
    setNotification({ text: 'All local study data and notes have been cleared' });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* HEADER */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            SETTINGS & DATA
          </span>
          <span className="text-zinc-600">/</span>
          <span className="font-mono text-xs text-zinc-300">MONOKURO</span>
        </div>
        <h1 className="text-2xl font-light font-mono text-white">Local Workspace Settings</h1>
      </div>

      {notification && (
        <div
          className={`rounded-xl p-3 text-xs font-mono flex items-center gap-2 ${
            notification.error
              ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
              : 'border border-white/20 bg-white/[0.04] text-white'
          }`}
        >
          {notification.error ? (
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          ) : (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* SECTION 0: LANGUAGE SELECTION & AD-FREE STREAMING SHIELD */}
      <div className="liquid-glass-card rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h2 className="text-sm font-mono font-medium text-white flex items-center gap-2">
              <Languages className="h-4 w-4 text-zinc-300" />
              <span>{t('settings_language')}</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Select your preferred language interface (Tiếng Việt, English, Español, 中文, ภาษาไทย, 한국어).
            </p>
          </div>
          <div className="shrink-0">
            <LanguageSelector />
          </div>
        </div>

        {/* Global Anti-Ad & No-Cookie Shield Status */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-mono text-xs font-semibold text-emerald-300 tracking-wider">
                {t('settings_ad_free_status')}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              YouTube runs in isolated <code className="text-zinc-300 bg-white/10 px-1 rounded">youtube-nocookie</code> privacy mode (overlay ads, tracking cookies, and annotations disabled). Spotify and all platforms play via pure direct audio streams.
            </p>
          </div>
          <span className="shrink-0 font-mono text-[10px] rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 text-center">
            ACTIVE SHIELD
          </span>
        </div>
      </div>

      {/* SECTION 1: TIMER PREFERENCES */}
      <div className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-mono font-medium text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-zinc-400" />
          <span>FOCUSX TIMER DEFAULTS</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400">
              Default Focus Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="240"
              value={settings.focusDefaultMinutes}
              onChange={(e) =>
                handleUpdateSettings({ focusDefaultMinutes: parseInt(e.target.value, 10) || 25 })
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400">
              Default Rest Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.breakDefaultMinutes}
              onChange={(e) =>
                handleUpdateSettings({ breakDefaultMinutes: parseInt(e.target.value, 10) || 5 })
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-mono text-zinc-300">Completion Audio Chime</span>
          </div>
          <button
            onClick={() => {
              const next = !settings.completionSoundEnabled;
              handleUpdateSettings({ completionSoundEnabled: next });
              if (next) playCompletionChime();
            }}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
              settings.completionSoundEnabled
                ? 'bg-white text-black font-semibold'
                : 'border border-white/20 text-zinc-400'
            }`}
          >
            {settings.completionSoundEnabled ? 'ENABLED' : 'MUTED'}
          </button>
        </div>
      </div>

      {/* SECTION 2: PRIVACY & CLOUD AI */}
      <div className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-mono font-medium text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-zinc-400" />
          <span>PRIVACY & AI DISCLOSURE</span>
        </h2>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-white">External AI Processing Consent</p>
            <p className="text-[11px] text-zinc-400">
              Allows FrameWhisper to send bounded transcript cues to the configured AI model for
              summaries and Q&A.
            </p>
          </div>
          <button
            onClick={() =>
              handleUpdateSettings({
                cloudAIConsentVersion: settings.cloudAIConsentVersion ? undefined : 'cloud-ai-v1',
              })
            }
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all shrink-0 ml-4 ${
              settings.cloudAIConsentVersion
                ? 'bg-emerald-400 text-black font-semibold'
                : 'border border-white/20 text-zinc-400'
            }`}
          >
            {settings.cloudAIConsentVersion ? 'GRANTED' : 'REVOKED'}
          </button>
        </div>
      </div>

      {/* SECTION 3: BACKUP, EXPORT & RESTORE */}
      <div className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-mono font-medium text-white flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-zinc-400" />
          <span>BROWSER STORAGE & PORTABILITY</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Estimated IndexedDB status: <span className="text-white font-mono">{storageEstimate}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportBackup}
            className="liquid-pill flex items-center justify-center gap-2 rounded-xl p-3 font-mono text-xs text-white"
          >
            <Download className="h-4 w-4" />
            <span>EXPORT BACKUP (.JSON)</span>
          </button>

          {/* Import JSON */}
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              id="restore-file"
              className="hidden"
            />
            <label
              htmlFor="restore-file"
              className="liquid-pill flex items-center justify-center gap-2 rounded-xl p-3 font-mono text-xs text-white cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>RESTORE FROM BACKUP</span>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION 4: CLEAR ALL DATA */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-6 space-y-3">
        <h2 className="text-sm font-mono font-medium text-rose-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>DANGER ZONE</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Delete all notes, bookmarks, saved music links, and timer logs stored in this browser
          profile.
        </p>
        <button
          onClick={() => setClearModalOpen(true)}
          className="rounded-xl border border-rose-500/30 px-4 py-2 font-mono text-xs text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          CLEAR ALL LOCAL DATA
        </button>
      </div>

      {/* CONFIRM CLEAR MODAL */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="liquid-glass-card rounded-2xl p-6 max-w-sm w-full space-y-4 text-left">
            <h3 className="text-sm font-mono font-medium text-rose-400">CONFIRM DATA DELETION</h3>
            <p className="text-xs text-zinc-300">
              Are you sure? This will permanently delete all your local notes, saved bookmarks, and
              study history from this browser.
            </p>
            <div className="flex items-center justify-end gap-2 font-mono text-xs pt-2">
              <button
                onClick={() => setClearModalOpen(false)}
                className="px-3 py-1.5 text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handleClearAll}
                className="bg-rose-500 px-4 py-1.5 rounded-lg text-white font-semibold hover:bg-rose-600"
              >
                CONFIRM DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
