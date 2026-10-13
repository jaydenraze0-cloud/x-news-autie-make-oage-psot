import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Trash2,
  Send,
  Plus,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Rss,
  Globe,
  Activity,
  Crosshair,
  Shield,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Twitter,
} from 'lucide-react';
import { FeedMonitor, OSINT_FIVE_PILLARS, OsintPillarType } from '../types';
import {
  buildGoogleNewsUrl,
  DEFAULT_FEED_MONITORS,
  PRESET_TELEGRAM_FEEDS,
  PRESET_OSINT_FEEDS,
  PRESET_X_ACCOUNTS,
  CATALOG_SAMPLE_FEEDS,
  OSINT_PILLAR_PRESET_SOURCES,
  saveCustomFeed,
  removeCustomFeed,
  loadConnectedTelegramGroups,
  saveConnectedTelegramGroups,
} from '../utils/storage';

interface FeedManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedMonitors: FeedMonitor[];
  onUpdateFeedMonitors: (monitors: FeedMonitor[]) => void;
  onRefreshFeeds: () => void;
  initialTab?: TabType;
}

type TabType = 'OSINT_5_PILLARS' | 'X_TWITTER' | 'ALL' | 'TELEGRAM' | 'OSINT' | 'GNEWS_RSS';

export const FeedManagerModal: React.FC<FeedManagerModalProps> = ({
  isOpen,
  onClose,
  feedMonitors,
  onUpdateFeedMonitors,
  onRefreshFeeds,
  initialTab = 'X_TWITTER',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isAdding, setIsAdding] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newType, setNewType] = useState<
    'X_ACCOUNT' | 'TELEGRAM_CHANNEL' | 'OSINT_DESK' | 'GOOGLE_NEWS' | 'WEB_RSS'
  >('X_ACCOUNT');
  const [newName, setNewName] = useState('');
  const [newQueryOrUrl, setNewQueryOrUrl] = useState('');
  const [xRssUrl, setXRssUrl] = useState('');
  const [xHandleInput, setXHandleInput] = useState('');
  const [newCategory, setNewCategory] = useState('Breaking Wire');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [xApiStatus, setXApiStatus] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((d) => {
        setXApiStatus(Boolean(d.xApiEnabled));
      })
      .catch(() => setXApiStatus(false));
  }, []);

  const handleToggleFeed = (id: string) => {
    const updated = feedMonitors.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    onUpdateFeedMonitors(updated);
  };

  const handleDeleteFeed = (id: string) => {
    const target = feedMonitors.find((f) => f.id === id);
    if (target) {
      removeCustomFeed(target.id);
      if (target.queryOrUrl) removeCustomFeed(target.queryOrUrl);
      if (target.url) removeCustomFeed(target.url);
      if (target.xHandle) removeCustomFeed(target.xHandle);
      if (target.type === 'TELEGRAM_CHANNEL' || target.url.includes('t.me/')) {
        const cleanHandle = (target.queryOrUrl || '').replace(/^@/, '').toLowerCase().trim();
        if (cleanHandle) {
          try {
            const currentTg = loadConnectedTelegramGroups();
            saveConnectedTelegramGroups(currentTg.filter((g) => g.handle.toLowerCase() !== cleanHandle));
          } catch {}
        }
      }
    }
    const updated = feedMonitors.filter((f) => f.id !== id);
    onUpdateFeedMonitors(updated);
    setSuccessMsg('Source removed successfully.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleClearAllSources = () => {
    setShowClearConfirm(true);
  };

  const handleExecuteClearAll = () => {
    setShowClearConfirm(false);
    onUpdateFeedMonitors([]);
    setSuccessMsg('All sources cleared. Radar is clean and ready for your custom sources or X accounts.');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleExecuteClearTab = () => {
    setShowClearConfirm(false);
    if (activeTab === 'ALL') {
      onUpdateFeedMonitors([]);
    } else {
      const remaining = feedMonitors.filter((f) => !filteredList.some((item) => item.id === f.id));
      onUpdateFeedMonitors(remaining);
    }
    setSuccessMsg(`Sources for category ${activeTab === 'X_TWITTER' ? 'X Accounts' : activeTab} cleared.`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleRestoreDefaults = () => {
    setShowClearConfirm(false);
    // PRESERVE user custom sources so they never reset!
    const customSources = feedMonitors.filter((f) => f.isCustom);
    const merged = [...customSources];
    for (const d of DEFAULT_FEED_MONITORS) {
      if (!merged.some((m) => m.id === d.id || m.url.toLowerCase() === d.url.toLowerCase())) {
        merged.push(d);
      }
    }
    onUpdateFeedMonitors(merged);
    setSuccessMsg('Default radar preset sources restored (custom sources preserved).');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleInstallAll5Pillars = () => {
    setShowClearConfirm(false);
    // PRESERVE user custom sources so they never reset!
    const customSources = feedMonitors.filter((f) => f.isCustom);
    const allPillarSources: FeedMonitor[] = [...customSources];
    Object.values(OSINT_PILLAR_PRESET_SOURCES).forEach((sources) => {
      sources.forEach((src) => {
        if (!allPillarSources.some((existing) => existing.id === src.id || existing.url === src.url)) {
          allPillarSources.push({ ...src, enabled: true });
        }
      });
    });

    onUpdateFeedMonitors(allPillarSources);
    setSuccessMsg(`Installed ${allPillarSources.length} official sources across the 5 OSINT Pillars (custom sources preserved).`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleInstallPillar = (pillarId: OsintPillarType) => {
    const sourcesToInstall = OSINT_PILLAR_PRESET_SOURCES[pillarId] || [];
    const updated = [...feedMonitors];
    sourcesToInstall.forEach((src) => {
      const idx = updated.findIndex((f) => f.id === src.id || f.url === src.url);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], enabled: true };
      } else {
        updated.push({ ...src, enabled: true });
      }
    });
    onUpdateFeedMonitors(updated);
    const meta = OSINT_FIVE_PILLARS.find((p) => p.id === pillarId);
    setSuccessMsg(`Sources for ${meta?.shortLabel || pillarId} enabled (${sourcesToInstall.length} sources).`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleToggleAll = (enable: boolean) => {
    const updated = feedMonitors.map((f) => ({ ...f, enabled: enable }));
    onUpdateFeedMonitors(updated);
  };

  const handleAddPreset = (preset: FeedMonitor) => {
    const cleanPresetHandle = (preset.xHandle || preset.queryOrUrl || '').replace(/^@/, '').toLowerCase();
    const exists = feedMonitors.some((f) => {
      const fHandle = (f.xHandle || f.queryOrUrl || '').replace(/^@/, '').toLowerCase();
      return (
        f.id === preset.id ||
        (cleanPresetHandle && fHandle === cleanPresetHandle) ||
        f.url.toLowerCase() === preset.url.toLowerCase()
      );
    });

    if (exists) {
      const updated = feedMonitors.map((f) => {
        const fHandle = (f.xHandle || f.queryOrUrl || '').replace(/^@/, '').toLowerCase();
        return f.id === preset.id || (cleanPresetHandle && fHandle === cleanPresetHandle)
          ? { ...f, enabled: true }
          : f;
      });
      onUpdateFeedMonitors(updated);
      setSuccessMsg(`Akun ${preset.name} diaktifkan kembali.`);
      setTimeout(() => setSuccessMsg(''), 2000);
      return;
    }

    onUpdateFeedMonitors([...feedMonitors, { ...preset, enabled: true }]);
    setSuccessMsg(`Berhasil menambahkan ${preset.name}`);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleAddAllXPresets = () => {
    const currentHandles = new Set(
      feedMonitors
        .filter((f) => f.type === 'X_ACCOUNT' || f.xHandle)
        .map((f) => (f.xHandle || f.queryOrUrl).replace(/^@/, '').toLowerCase())
    );
    const toAdd = PRESET_X_ACCOUNTS.filter(
      (p) => !currentHandles.has((p.xHandle || p.queryOrUrl).replace(/^@/, '').toLowerCase())
    );
    if (toAdd.length === 0) {
      setSuccessMsg('Semua preset akun X sudah ada di daftar Anda.');
      setTimeout(() => setSuccessMsg(''), 2000);
      return;
    }
    onUpdateFeedMonitors([...feedMonitors, ...toAdd]);
    setSuccessMsg(`Berhasil menambahkan ${toAdd.length} akun X rekomendasi.`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleSaveNewFeed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Dedicated X_ACCOUNT handler with full Realtime & Handle support
    if (newType === 'X_ACCOUNT') {
      const finalRssUrl = (xRssUrl.trim() || newQueryOrUrl.trim());
      let cleanHandle = (xHandleInput.trim() || '')
        .replace(/^@+/, '')
        .replace(/^https?:\/\/(?:mobile\.)?(?:x|twitter)\.com\//i, '')
        .replace(/\/status\/.*$/, '')
        .replace(/\/.*$/, '')
        .trim();

      // If user pasted a profile or RSS URL but didn't specify handle, extract it
      if (!cleanHandle && finalRssUrl) {
        const match =
          finalRssUrl.match(/(?:x|twitter)\.com\/([a-zA-Z0-9_]+)/i) ||
          finalRssUrl.match(/(?:x|twitter)\/user\/([a-zA-Z0-9_]+)/i) ||
          finalRssUrl.match(/\/([a-zA-Z0-9_]+)\/rss/i);
        if (match && match[1]) cleanHandle = match[1];
      }

      // If user provided a comma-separated list of handles
      if (!finalRssUrl && cleanHandle.includes(',')) {
        const rawHandles = cleanHandle
          .split(/[,;\n\s]+/)
          .map((h) =>
            h
              .trim()
              .replace(/^@+/, '')
              .replace(/^https?:\/\/(?:mobile\.)?(?:x|twitter)\.com\//i, '')
              .replace(/\/.*$/, '')
          )
          .filter(Boolean);

        const newMonitors: FeedMonitor[] = [];
        for (const h of rawHandles) {
          const already = feedMonitors.some(
            (f) =>
              (f.xHandle && f.xHandle.toLowerCase() === h.toLowerCase()) ||
              f.url.toLowerCase().includes(h.toLowerCase())
          );
          if (!already) {
            const customItem: FeedMonitor = {
              id: `feed-x-${h.toLowerCase()}-${Date.now()}`,
              name: `@${h}`,
              type: 'X_ACCOUNT',
              queryOrUrl: `@${h}`,
              url: `https://x.com/${h}`,
              xHandle: h,
              category: newCategory,
              enabled: true,
              isOsint: true,
              isCustom: true,
            };
            saveCustomFeed(customItem);
            newMonitors.push(customItem);
          }
        }
        if (newMonitors.length > 0) {
          onUpdateFeedMonitors([...feedMonitors, ...newMonitors]);
          setSuccessMsg(`Berhasil menambahkan ${newMonitors.length} akun X ke tracker realtime!`);
          setNewName('');
          setNewQueryOrUrl('');
          setXRssUrl('');
          setXHandleInput('');
          setIsAdding(false);
          setTimeout(() => setSuccessMsg(''), 3000);
          return;
        }
      }

      if (!finalRssUrl && !cleanHandle) {
        setErrorMsg('Harap masukkan @handle atau URL profil akun X yang ingin dilacak.');
        return;
      }

      const effectiveUrl =
        finalRssUrl.startsWith('http://') || finalRssUrl.startsWith('https://')
          ? finalRssUrl
          : `https://x.com/${cleanHandle}`;

      const displayName = newName.trim() || (cleanHandle ? `@${cleanHandle}` : 'Akun X');

      const alreadyExists = feedMonitors.some(
        (f) =>
          (cleanHandle && f.xHandle && f.xHandle.toLowerCase() === cleanHandle.toLowerCase()) ||
          f.url.toLowerCase() === effectiveUrl.toLowerCase()
      );

      if (alreadyExists) {
        setErrorMsg('Akun X ini sudah ada di radar pantauan Anda.');
        return;
      }

      const newFeed: FeedMonitor = {
        id: `feed-x-${cleanHandle || Date.now()}-${Date.now()}`,
        name: displayName,
        type: 'X_ACCOUNT',
        queryOrUrl: cleanHandle ? `@${cleanHandle}` : effectiveUrl,
        url: effectiveUrl,
        xHandle: cleanHandle || undefined,
        category: newCategory,
        enabled: true,
        isOsint: true,
        isCustom: true,
      };

      saveCustomFeed(newFeed);
      onUpdateFeedMonitors([...feedMonitors, newFeed]);
      setSuccessMsg(`Berhasil menambahkan akun X @${cleanHandle || displayName} ke pelacak realtime!`);
      setNewName('');
      setNewQueryOrUrl('');
      setXRssUrl('');
      setXHandleInput('');
      setIsAdding(false);
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }

    if (!newQueryOrUrl.trim()) {
      setErrorMsg('Please enter a source URL or search query.');
      return;
    }

    // Other feed types
    let finalUrl = newQueryOrUrl.trim();
    let isOsint = false;
    let computedName = newName.trim() || 'Custom Source';

    const isTelegramInput = newType === 'TELEGRAM_CHANNEL' || newQueryOrUrl.includes('t.me/');
    let telegramCleanHandle = '';
    if (isTelegramInput) {
      telegramCleanHandle = newQueryOrUrl
        .trim()
        .replace(/^@/, '')
        .replace(/^https?:\/\/t\.me\/s\//i, '')
        .replace(/^https?:\/\/t\.me\//i, '')
        .replace(/\/.*$/, '')
        .trim();
      if (!telegramCleanHandle) {
        setErrorMsg('Please enter a valid Telegram channel username (e.g. Alibk3 or https://t.me/Alibk3).');
        return;
      }
      finalUrl = `https://t.me/s/${telegramCleanHandle}`;
      computedName = newName.trim() || `Telegram @${telegramCleanHandle}`;
      isOsint = true;
    } else if (newType === 'OSINT_DESK') {
      isOsint = true;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = buildGoogleNewsUrl(`(${newQueryOrUrl.trim()}) (OSINT OR frontline OR military OR strike)`);
      }
    } else if (newType === 'GOOGLE_NEWS') {
      finalUrl = buildGoogleNewsUrl(newQueryOrUrl);
    } else {
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        setErrorMsg('RSS URL must start with http:// or https://');
        return;
      }
    }

    const newFeed: FeedMonitor = {
      id: `feed-${Date.now()}`,
      name: computedName,
      type: newType,
      queryOrUrl: newQueryOrUrl.trim(),
      url: finalUrl,
      enabled: true,
      isOsint,
      isCustom: true,
    };

    saveCustomFeed(newFeed);

    if (isTelegramInput && telegramCleanHandle) {
      try {
        const currentTgGroups = loadConnectedTelegramGroups();
        if (!currentTgGroups.some((g) => g.handle.toLowerCase() === telegramCleanHandle.toLowerCase())) {
          saveConnectedTelegramGroups([
            ...currentTgGroups,
            {
              id: `tg-custom-${telegramCleanHandle.toLowerCase()}-${Date.now()}`,
              name: computedName,
              handle: telegramCleanHandle,
              theater: 'GLOBAL',
              language: 'en',
              description: `Custom source: ${computedName}`,
              enabled: true,
              isCustom: true,
            },
          ]);
        }
      } catch {}
    }

    onUpdateFeedMonitors([...feedMonitors, newFeed]);
    setSuccessMsg(`Source added successfully: ${computedName}`);
    setNewName('');
    setNewQueryOrUrl('');
    setIsAdding(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Group counts
  const xCount = feedMonitors.filter(
    (f) => f.type === 'X_ACCOUNT' || f.xHandle || f.url.includes('x.com/') || f.url.includes('twitter.com/')
  ).length;
  const tgCount = feedMonitors.filter(
    (f) =>
      (f.type === 'TELEGRAM_CHANNEL' || f.url.includes('t.me/')) &&
      f.type !== 'X_ACCOUNT' &&
      !f.xHandle
  ).length;
  const osintCount = feedMonitors.filter(
    (f) =>
      (f.isOsint || f.type === 'OSINT_DESK') &&
      f.type !== 'TELEGRAM_CHANNEL' &&
      f.type !== 'X_ACCOUNT' &&
      !f.xHandle &&
      !f.url.includes('t.me/')
  ).length;
  const rssCount = feedMonitors.filter(
    (f) =>
      f.type !== 'TELEGRAM_CHANNEL' &&
      f.type !== 'X_ACCOUNT' &&
      !f.xHandle &&
      !f.url.includes('t.me/') &&
      f.type !== 'OSINT_DESK' &&
      !f.isOsint
  ).length;

  const filteredList = useMemo(() => {
    const raw = feedMonitors.filter((feed) => {
      if (activeTab === 'X_TWITTER') {
        return (
          feed.type === 'X_ACCOUNT' ||
          feed.xHandle ||
          feed.url.includes('x.com/') ||
          feed.url.includes('twitter.com/')
        );
      }
      if (activeTab === 'TELEGRAM') {
        return (
          (feed.type === 'TELEGRAM_CHANNEL' || feed.url.includes('t.me/')) &&
          feed.type !== 'X_ACCOUNT' &&
          !feed.xHandle
        );
      }
      if (activeTab === 'OSINT') {
        return (
          (feed.isOsint || feed.type === 'OSINT_DESK') &&
          feed.type !== 'TELEGRAM_CHANNEL' &&
          feed.type !== 'X_ACCOUNT' &&
          !feed.xHandle &&
          !feed.url.includes('t.me/')
        );
      }
      if (activeTab === 'GNEWS_RSS') {
        return (
          feed.type !== 'TELEGRAM_CHANNEL' &&
          feed.type !== 'X_ACCOUNT' &&
          !feed.xHandle &&
          !feed.url.includes('t.me/') &&
          feed.type !== 'OSINT_DESK' &&
          !feed.isOsint
        );
      }
      return true;
    });

    const seenIds = new Set<string>();
    const deduped: FeedMonitor[] = [];
    for (const f of raw) {
      if (f && f.id && !seenIds.has(f.id)) {
        seenIds.add(f.id);
        deduped.push(f);
      }
    }
    return deduped;
  }, [feedMonitors, activeTab]);

  const activeCount = feedMonitors.filter((f) => f.enabled).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-4xl rounded-xl border border-white/20 bg-black p-4 sm:p-6 text-white shadow-[0_0_60px_rgba(255,255,255,0.18)] flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-white text-black font-black text-sm shadow-[0_0_10px_rgba(255,255,255,0.6)]">
              𝕏
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black tracking-widest text-white uppercase">
                  NEWS & X (TWITTER) SOURCE TRACKER
                </h2>
                <span className="rounded bg-white/10 border border-white/20 px-2 py-0.5 text-[9px] font-mono font-bold text-white">
                  CUSTOM MANUAL
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">
                Default sources cleared. Add the X accounts and news sources you want to track independently.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded border border-white/20 text-neutral-400 hover:border-white hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success / Info Notification Banner */}
        {successMsg && (
          <div className="mt-2.5 flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-300 animate-fadeIn">
            <Check className="h-3.5 w-3.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Row */}
        <div className="flex items-center gap-1.5 pt-3 pb-3 border-b border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('OSINT_5_PILLARS')}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-black tracking-wider transition shrink-0 ${
              activeTab === 'OSINT_5_PILLARS'
                ? 'border border-red-500 bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.7)] font-extrabold'
                : 'border border-red-500/40 bg-red-950/40 text-red-300 hover:border-red-400 hover:text-white'
            }`}
          >
            <Shield className="h-3 w-3 text-red-400" />
            <span>5 PILAR OSINT</span>
          </button>

          <button
            onClick={() => setActiveTab('X_TWITTER')}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-black tracking-wider transition ${
              activeTab === 'X_TWITTER'
                ? 'border border-white bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.6)] font-extrabold'
                : 'border border-white/15 bg-neutral-950 text-neutral-300 hover:text-white'
            }`}
          >
            <span className="font-serif font-black">𝕏</span>
            <span>AKUN X ({xCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`rounded px-3 py-1 text-xs font-black tracking-wider transition ${
              activeTab === 'ALL'
                ? 'border border-neutral-300 bg-neutral-200 text-black shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                : 'border border-white/15 bg-neutral-950 text-neutral-400 hover:text-white'
            }`}
          >
            SEMUA SUMBER ({feedMonitors.length})
          </button>

          <button
            onClick={() => setActiveTab('TELEGRAM')}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-black tracking-wider transition ${
              activeTab === 'TELEGRAM'
                ? 'border border-cyan-400 bg-cyan-400 text-black shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                : 'border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 hover:text-white'
            }`}
          >
            <Send className="h-3 w-3" />
            <span>TELEGRAM ({tgCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('OSINT')}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-black tracking-wider transition ${
              activeTab === 'OSINT'
                ? 'border border-purple-400 bg-purple-400 text-black shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                : 'border border-purple-500/30 bg-purple-950/40 text-purple-300 hover:border-purple-400 hover:text-white'
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>OSINT DESKS ({osintCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('GNEWS_RSS')}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-black tracking-wider transition ${
              activeTab === 'GNEWS_RSS'
                ? 'border border-amber-400 bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                : 'border border-white/15 bg-neutral-950 text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="h-3 w-3" />
            <span>GOOGLE NEWS & RSS ({rssCount})</span>
          </button>

          <div className="text-[11px] text-neutral-400 ml-auto hidden sm:block shrink-0">
            {activeCount} active
          </div>
        </div>

        {/* Full-Screen Centered Modal Overlay for Confirmation of Clear All */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
            <div className="relative w-full max-w-md rounded-2xl border-2 border-rose-500/80 bg-neutral-950 p-5 sm:p-6 text-white shadow-[0_0_50px_rgba(244,63,94,0.4)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 shrink-0">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-300">
                    Clear All Radar Sources?
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Removes all {feedMonitors.length} active monitor sources.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-black/60 border border-white/10 p-3 text-xs text-neutral-300 leading-relaxed space-y-1.5">
                <p>
                  After clearing, the timeline radar will be <strong>completely clear of unrelated news</strong>.
                </p>
                <p className="text-neutral-400">
                  You can add your own chosen X accounts or install the 5 OSINT Pillars at any time with 1 click.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteClearAll}
                  className="w-full sm:flex-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white py-2.5 px-4 text-xs font-black transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.6)] cursor-pointer active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Yes, Clear All ({feedMonitors.length})</span>
                </button>
                {activeTab !== 'ALL' && filteredList.length > 0 && filteredList.length < feedMonitors.length && (
                  <button
                    type="button"
                    onClick={handleExecuteClearTab}
                    className="w-full sm:w-auto rounded-lg border border-rose-400/50 bg-neutral-900 hover:bg-neutral-800 text-rose-200 py-2.5 px-3 text-xs font-bold transition cursor-pointer"
                  >
                    This Tab Only ({filteredList.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="w-full sm:w-auto rounded-lg border border-white/20 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white py-2.5 px-4 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Specific Content */}
        {activeTab === 'OSINT_5_PILLARS' ? (
          <div className="space-y-3.5 my-2 overflow-y-auto max-h-[62vh] pr-1">
            {/* 5 Pillars Master Banner */}
            <div className="rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/80 via-black to-neutral-950 p-3 sm:p-4 text-xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1.5 rounded-lg bg-black border border-red-500/30">🛡️</span>
                  <div>
                    <h3 className="font-black text-white text-sm tracking-wide">
                      5 CORE OSINT DEFENSE RADAR PILLARS
                    </h3>
                    <p className="text-[11px] text-neutral-300">
                      Open-source military intelligence standard for verifying missile/drone strikes, satellite BDA imagery, video telemetry, equipment losses, and strategic naval deployments.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInstallAll5Pillars}
                    className="rounded bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.7)] cursor-pointer active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>⚡ Pasang Semua 5 Pilar OSINT (25 Sumber)</span>
                  </button>
                  {feedMonitors.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSources}
                      className="rounded border border-rose-500/40 bg-neutral-950 hover:bg-rose-950/40 text-rose-300 px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Kosongkan Semua</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* The 5 Pillar Cards */}
            <div className="space-y-3">
              {OSINT_FIVE_PILLARS.map((pillar) => {
                const pillarSources = OSINT_PILLAR_PRESET_SOURCES[pillar.id] || [];
                const installedCount = pillarSources.filter((preset) =>
                  feedMonitors.some(
                    (f) =>
                      f.id === preset.id ||
                      (preset.xHandle && f.xHandle?.toLowerCase() === preset.xHandle.toLowerCase()) ||
                      f.url.toLowerCase() === preset.url.toLowerCase()
                  )
                ).length;
                const isAllInstalled = installedCount === pillarSources.length && pillarSources.length > 0;

                return (
                  <div
                    key={`pillar-card-${pillar.id}`}
                    className="rounded-xl border border-white/15 bg-neutral-950 p-3 sm:p-4 space-y-2.5 hover:border-white/30 transition shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1.5 rounded-lg bg-black border border-white/15">
                          {pillar.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-white text-xs sm:text-sm">
                              {pillar.title}
                            </h4>
                            <span className="rounded bg-black border border-white/20 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                              {installedCount}/{pillarSources.length} terpasang
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-300 italic font-medium">
                            {pillar.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleInstallPillar(pillar.id)}
                          className={`rounded px-3 py-1 text-xs font-black transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                            isAllInstalled
                              ? 'border border-emerald-500/50 bg-emerald-950/60 text-emerald-300'
                              : 'bg-white text-black hover:bg-neutral-200 shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                          }`}
                        >
                          {isAllInstalled ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span>✓ Semua Terpasang</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 stroke-[3]" />
                              <span>+ Aktifkan Pilar Ini ({pillarSources.length} Sumber)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {pillar.description}
                    </p>

                    {/* Sources Sub-List for this Pillar */}
                    <div className="rounded-lg bg-black border border-white/10 p-2 space-y-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        SUMBER TERVERIFIKASI {pillar.shortLabel.toUpperCase()}:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {pillarSources.map((src) => {
                          const activeMonitor = feedMonitors.find(
                            (f) =>
                              f.id === src.id ||
                              (src.xHandle && f.xHandle?.toLowerCase() === src.xHandle.toLowerCase()) ||
                              f.url.toLowerCase() === src.url.toLowerCase()
                          );
                          const isInstalled = Boolean(activeMonitor);
                          const isEnabled = activeMonitor ? activeMonitor.enabled : false;

                          return (
                            <div
                              key={`p-src-${src.id}`}
                              className="flex items-center justify-between gap-1.5 rounded border border-white/10 bg-neutral-950/80 px-2.5 py-1.5 text-[11px]"
                            >
                              <div className="min-w-0 flex items-center gap-1.5">
                                <span className="text-[10px] opacity-80">
                                  {src.type === 'X_ACCOUNT'
                                    ? '𝕏'
                                    : src.type === 'TELEGRAM_CHANNEL'
                                    ? '✈️'
                                    : '📡'}
                                </span>
                                <span className="truncate text-white font-medium" title={src.name}>
                                  {src.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                {isInstalled && activeMonitor ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFeed(activeMonitor.id)}
                                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition ${
                                      isEnabled
                                        ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                                        : 'bg-neutral-900 border border-neutral-700 text-neutral-400'
                                    }`}
                                  >
                                    {isEnabled ? 'Aktif' : 'Nonaktif'}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddPreset(src)}
                                    className="rounded border border-cyan-500/50 bg-cyan-950/40 hover:bg-cyan-900 text-cyan-200 px-2 py-0.5 text-[9px] font-bold transition flex items-center gap-0.5"
                                  >
                                    <Plus className="h-2.5 w-2.5" />
                                    <span>Pasang</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'X_TWITTER' ? (
          <>
            {/* Official X API Status & Guidance Callout */}
            <div className="py-2.5 px-3 rounded-lg border border-white/20 bg-neutral-950 my-2 text-xs space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-sm text-white">𝕏</span>
                  <span className="font-bold text-white text-[11px]">STATUS INTEGRASI API RESMI X:</span>
                </div>
                {xApiStatus ? (
                  <span className="rounded bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-400" />
                    API RESMI X AKTIF (Bearer Token Terpasang)
                  </span>
                ) : (
                  <span className="rounded bg-neutral-900 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                    <Globe className="h-3 w-3 text-cyan-400" />
                    RADAR OTOMATIS: MODE RSS & WEB BRIDGE (GRATIS)
                  </span>
                )}
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                {xApiStatus ? (
                  <>Radar terhubung ke endpoint resmi <strong className="text-white">X API v2</strong>. Postingan dari akun X yang Anda lacak diambil langsung dari API resmi Twitter/X.</>
                ) : (
                  <>Untuk menggunakan <strong className="text-white">API Resmi X</strong>, tambahkan <code className="bg-black text-cyan-300 px-1 py-0.5 rounded border border-white/10 font-mono">X_BEARER_TOKEN</code> di variabel lingkungan/secrets server. Jika tanpa kunci API berbayar, radar tetap bekerja otomatis dengan format OpenRSS, RSS.app, atau Google News Wire.</>
                )}
              </p>
            </div>

            <div className="py-2.5 px-3 rounded-lg border border-white/20 bg-gradient-to-r from-neutral-950 via-black to-neutral-950 my-2 text-xs">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                PINTASAN 1-KLIK: AKUN X BREAKING NEWS & INTEL POPULER
              </span>
              <button
                onClick={handleAddAllXPresets}
                className="text-[10px] text-cyan-300 hover:text-white underline font-bold"
              >
                + Tambahkan Semua Rekomendasi
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_X_ACCOUNTS.map((preset) => {
                const isInstalled = feedMonitors.some(
                  (f) =>
                    f.id === preset.id ||
                    (f.xHandle && f.xHandle.toLowerCase() === preset.xHandle?.toLowerCase()) ||
                    f.queryOrUrl.toLowerCase() === preset.queryOrUrl.toLowerCase()
                );
                return (
                  <button
                    key={`preset-x-btn-${preset.id}`}
                    onClick={() => handleAddPreset(preset)}
                    className={`shrink-0 rounded border px-2 py-1 text-[10px] font-bold flex items-center gap-1 transition ${
                      isInstalled
                        ? 'border-white/50 bg-neutral-900 text-white shadow-sm'
                        : 'border-white/20 bg-black text-neutral-300 hover:border-white hover:text-white'
                    }`}
                  >
                    <span className="font-serif">𝕏</span>
                    <span>@{preset.xHandle}</span>
                    {isInstalled ? (
                      <Check className="h-3 w-3 text-emerald-400 ml-0.5" />
                    ) : (
                      <Plus className="h-3 w-3 text-cyan-400 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
          <div className="py-2.5 px-3 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-black to-purple-950/20 my-2 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                PINTASAN 1-KLIK: KANAL TELEGRAM & DESK OSINT RESMI
              </span>
              <span className="text-[10px] text-neutral-400">Klik untuk menambahkan ke daftar Anda</span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_TELEGRAM_FEEDS.slice(0, 10).map((preset) => {
                const isInstalled = feedMonitors.some(
                  (f) =>
                    f.id === preset.id ||
                    f.queryOrUrl.toLowerCase() === preset.queryOrUrl.toLowerCase()
                );
                return (
                  <button
                    key={`preset-tg-btn-${preset.id}`}
                    onClick={() => handleAddPreset(preset)}
                    className={`shrink-0 rounded border px-2 py-1 text-[10px] font-bold flex items-center gap-1 transition ${
                      isInstalled
                        ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300'
                        : 'border-white/20 bg-black text-neutral-300 hover:border-cyan-400 hover:text-white'
                    }`}
                  >
                    <Send className="h-2.5 w-2.5 text-cyan-400" />
                    <span>{preset.name.replace(/ \(.*\)/, '')}</span>
                    {isInstalled ? (
                      <Check className="h-3 w-3 text-emerald-400 ml-0.5" />
                    ) : (
                      <Plus className="h-3 w-3 text-cyan-400 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Header & Add Button (For generic tabs) */}
        {activeTab !== 'OSINT_5_PILLARS' && (
          <>
            <div className="flex items-center justify-between py-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-neutral-300 uppercase">
              {activeTab === 'X_TWITTER'
                ? `TRACKED X ACCOUNTS (${filteredList.length}):`
                : `INSTALLED SOURCES (${filteredList.length}):`}
            </span>
            {feedMonitors.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllSources}
                className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 font-bold ml-2 cursor-pointer transition active:scale-95"
                title="Clear all sources to start fresh"
              >
                <Trash2 className="h-2.5 w-2.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {filteredList.length > 0 && (
              <>
                <button
                  onClick={() => handleToggleAll(true)}
                  className="rounded border border-white/20 bg-black px-2 py-1 text-[10px] font-bold text-neutral-300 hover:text-white hover:border-white transition"
                >
                  Aktifkan Semua
                </button>
                <button
                  onClick={() => handleToggleAll(false)}
                  className="rounded border border-white/20 bg-black px-2 py-1 text-[10px] font-bold text-neutral-400 hover:text-white hover:border-white transition"
                >
                  Jeda Semua
                </button>
              </>
            )}

            <button
              onClick={() => {
                setIsAdding(!isAdding);
                if (!isAdding && activeTab === 'X_TWITTER') {
                  setNewType('X_ACCOUNT');
                }
                setErrorMsg('');
              }}
              className="flex items-center gap-1.5 rounded border border-white bg-white px-3 py-1 text-xs font-black tracking-wide text-black hover:bg-neutral-200 transition shadow-[0_0_10px_rgba(255,255,255,0.4)] active:scale-95"
            >
              <Plus className="h-3 w-3 stroke-[3]" />
              <span>
                {activeTab === 'X_TWITTER' ? '+ TAMBAH AKUN X' : '+ TAMBAH SUMBER'}
              </span>
            </button>
          </div>
        </div>

        {/* Add New Source / Account Form */}
        {isAdding && (
          <form
            onSubmit={handleSaveNewFeed}
            className="mb-3 rounded-lg border border-cyan-400/40 bg-neutral-950 p-3 sm:p-4 space-y-3 animate-fadeIn"
          >
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-cyan-400" />
                {newType === 'X_ACCOUNT'
                  ? 'Konfigurasi Akun X (Twitter) Baru'
                  : 'Konfigurasi Sumber Baru'}
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-neutral-400 hover:text-white text-[11px]"
              >
                Batal
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setNewType('X_ACCOUNT');
                }}
                className={`rounded border py-1.5 px-2 text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                  newType === 'X_ACCOUNT'
                    ? 'border-white bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.6)] font-black'
                    : 'border-white/15 bg-neutral-900 text-neutral-300 hover:text-white'
                }`}
              >
                <span className="font-serif">𝕏</span>
                <span>Akun X (Twitter)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewType('TELEGRAM_CHANNEL');
                  if (!newName) setNewName('Telegram Channel');
                }}
                className={`rounded border py-1.5 px-2 text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  newType === 'TELEGRAM_CHANNEL'
                    ? 'border-cyan-400 bg-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                    : 'border-white/15 bg-neutral-900 text-neutral-300 hover:text-white'
                }`}
              >
                <Send className="h-3 w-3" />
                <span>Telegram</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewType('OSINT_DESK');
                  if (!newName) setNewName('OSINT Desk');
                }}
                className={`rounded border py-1.5 px-2 text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  newType === 'OSINT_DESK'
                    ? 'border-purple-400 bg-purple-400 text-black shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'border-white/15 bg-neutral-900 text-neutral-300 hover:text-white'
                }`}
              >
                <Crosshair className="h-3 w-3" />
                <span>OSINT Desk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewType('GOOGLE_NEWS');
                  if (!newName) setNewName('Google News Monitor');
                }}
                className={`rounded border py-1.5 px-2 text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  newType === 'GOOGLE_NEWS'
                    ? 'border-amber-400 bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    : 'border-white/15 bg-neutral-900 text-neutral-300 hover:text-white'
                }`}
              >
                <Globe className="h-3 w-3" />
                <span>Google News</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewType('WEB_RSS');
                  if (!newName) setNewName('Direct RSS Feed');
                }}
                className={`rounded border py-1.5 px-2 text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  newType === 'WEB_RSS'
                    ? 'border-emerald-400 bg-emerald-400 text-black shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                    : 'border-white/15 bg-neutral-900 text-neutral-300 hover:text-white'
                }`}
              >
                <Rss className="h-3 w-3" />
                <span>RSS Web</span>
              </button>
            </div>

            {/* Input Query / Handle / X RSS */}
            {newType === 'X_ACCOUNT' ? (
              <div className="space-y-3 rounded-lg border border-cyan-500/30 bg-neutral-900/80 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Twitter className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Lacak Akun X (Twitter) Real-Time</span>
                  </span>
                  <span className="rounded bg-cyan-950/80 border border-cyan-400/50 px-1.5 py-0.5 text-[9px] font-mono font-bold text-cyan-300 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    REALTIME LIVE
                  </span>
                </div>

                {/* 1. Handle (@username or link) */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-300 uppercase mb-1">
                    Handle Akun X (@username atau tautan https://x.com/username)
                  </label>
                  <input
                    type="text"
                    value={xHandleInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setXHandleInput(val);
                    }}
                    placeholder="contoh: @DeadlyHand313 atau taha_saleh_taiz atau sentdefender"
                    className="w-full rounded border border-white/20 bg-black px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-neutral-400 leading-relaxed">
                    Sistem melacak postingan/tweet real-time langsung dari akun X dengan stempel waktu detik, foto/video resolusi tinggi, dan deteksi intelijen instan.
                  </p>
                </div>

                {/* 2. Optional custom RSS URL */}
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                    URL Feed RSS Kustom (Opsional — misal: RSS.app)
                  </label>
                  <input
                    type="text"
                    value={xRssUrl}
                    onChange={(e) => setXRssUrl(e.target.value)}
                    placeholder="Opsional: https://rss.app/feeds/xxx.xml (biarkan kosong untuk pelacak langsung)"
                    className="w-full rounded border border-white/10 bg-black/60 px-3 py-1 text-xs text-neutral-300 placeholder-neutral-600 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  {newType === 'TELEGRAM_CHANNEL'
                    ? 'Username Channel Telegram (@handle atau https://t.me/handle)'
                    : newType === 'OSINT_DESK'
                    ? 'URL Feed RSS OSINT atau Kata Kunci Pencarian'
                    : newType === 'GOOGLE_NEWS'
                    ? 'Kata Kunci Pencarian Berita'
                    : 'URL Feed XML RSS'}
                </label>
                <input
                  type="text"
                  value={newQueryOrUrl}
                  onChange={(e) => setNewQueryOrUrl(e.target.value)}
                  placeholder={
                    newType === 'TELEGRAM_CHANNEL'
                      ? 'contoh: @kpszsu atau @operativnoZSU'
                      : newType === 'OSINT_DESK'
                      ? 'contoh: https://www.bellingcat.com/feed/'
                      : newType === 'GOOGLE_NEWS'
                      ? 'contoh: ("Red Sea" OR Houthi) military attack'
                      : 'contoh: https://feeds.bbci.co.uk/news/world/rss.xml'
                  }
                  className="w-full rounded border border-white/20 bg-black px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                />
              </div>
            )}

            {/* Name / Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  Nama Tampilan Label (Opsional)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={
                    newType === 'X_ACCOUNT'
                      ? 'contoh: DB Fast News Wire (kosongkan untuk pakai @handle)'
                      : 'contoh: Nama Desk / Media'
                  }
                  className="w-full rounded border border-white/20 bg-black px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                />
              </div>

              {newType === 'X_ACCOUNT' ? (
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                    Kategori / Tag Intelijen
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded border border-white/20 bg-black px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                  >
                    <option value="Breaking Wire">Breaking Wire & Flash</option>
                    <option value="Finance & Geo">Pasar & Geopolitik</option>
                    <option value="Conflict OSINT">Konflik & Frontline OSINT</option>
                    <option value="Military Intel">Intelijen Militer & Alutsista</option>
                    <option value="Global News">Berita Global & Analisis</option>
                  </select>
                </div>
              ) : null}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded border border-white/20 px-3 py-1 text-xs text-neutral-300 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded bg-white px-4 py-1 text-xs font-black text-black hover:bg-neutral-200 transition shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              >
                Simpan & Lacak Sekarang
              </button>
            </div>
          </form>
        )}

        {/* Empty State Banner (Default is Empty as requested) */}
        {filteredList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-neutral-950/60 p-8 text-center my-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black text-white text-xl font-serif mb-3 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              𝕏
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              {activeTab === 'X_TWITTER'
                ? 'No X Accounts Added Yet'
                : 'Source List Is Empty'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mb-4 leading-relaxed">
              Default radar sources have been cleared. You can manually add your preferred X accounts or news wires to begin monitoring.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => {
                  setNewType('X_ACCOUNT');
                  setIsAdding(true);
                }}
                className="rounded bg-white px-4 py-1.5 text-xs font-black text-black hover:bg-neutral-200 transition shadow-[0_0_12px_rgba(255,255,255,0.5)] flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>+ Add X Account Manually</span>
              </button>
              <button
                onClick={handleAddAllXPresets}
                className="rounded border border-white/20 bg-black px-3.5 py-1.5 text-xs font-bold text-white hover:border-white transition flex items-center gap-1.5"
              >
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>Gunakan Preset Akun X Populer</span>
              </button>
            </div>
          </div>
        ) : (
          /* Feeds List */
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredList.map((feed, idx) => {
              const isEnabled = feed.enabled;
              const isX =
                feed.type === 'X_ACCOUNT' ||
                feed.xHandle ||
                feed.url.includes('x.com/') ||
                feed.url.includes('twitter.com/');
              const isTg =
                (feed.type === 'TELEGRAM_CHANNEL' || feed.url.includes('t.me/')) &&
                !isX;
              const isOsint = (feed.isOsint || feed.type === 'OSINT_DESK') && !isX && !isTg;

              const cleanHandle =
                feed.xHandle ||
                (isX
                  ? feed.queryOrUrl.replace(/^@/, '').replace(/https?:\/\/x\.com\//, '')
                  : '');

              return (
                <div
                  key={`feed-item-${feed.id}-${idx}`}
                  className={`rounded-lg border p-3 transition flex items-center justify-between gap-3 ${
                    isEnabled
                      ? isX
                        ? 'border-white/30 bg-neutral-950/90 hover:border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                        : isTg
                        ? 'border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-400/50'
                        : isOsint
                        ? 'border-purple-500/30 bg-purple-950/20 hover:border-purple-400/50'
                        : 'border-white/15 bg-neutral-950 hover:border-white/30'
                      : 'border-white/5 bg-neutral-950/50 opacity-50'
                  }`}
                >
                  {/* Left info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isX && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white text-black font-serif font-black text-xs">
                          𝕏
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                        {feed.name}
                      </span>

                      {/* Source Type Badge */}
                      {isX && (
                        <span className="flex items-center gap-1 rounded border border-white/30 bg-white/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white">
                          AKUN X
                        </span>
                      )}

                      {feed.category && (
                        <span className="rounded border border-cyan-400/40 bg-cyan-950/60 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                          {feed.category}
                        </span>
                      )}

                      {isTg && (
                        <span className="flex items-center gap-1 rounded border border-cyan-400/60 bg-cyan-950/80 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                          <Send className="h-2.5 w-2.5" />
                          TELEGRAM
                        </span>
                      )}

                      {isOsint && !isTg && !isX && (
                        <span className="flex items-center gap-1 rounded border border-purple-400/60 bg-purple-950/80 px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                          <Activity className="h-2.5 w-2.5" />
                          OSINT DESK
                        </span>
                      )}

                      {!isTg && !isOsint && !isX && (
                        <span className="rounded border border-white/20 bg-neutral-900 px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-neutral-300">
                          {feed.type}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-neutral-400 font-mono truncate flex-wrap">
                      <span>{feed.queryOrUrl}</span>
                      {isX && cleanHandle && (
                        <a
                          href={`https://x.com/${cleanHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-white inline-flex items-center gap-1 ml-1 underline"
                          title="Buka profil X di tab baru"
                        >
                          <span>x.com/{cleanHandle}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                      {isX && feed.url && feed.url.startsWith('http') && (
                        <a
                          href={feed.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 ml-1 text-[10px]"
                          title="Buka URL Feed RSS XML"
                        >
                          <Rss className="h-2.5 w-2.5" />
                          <span className="truncate max-w-[200px]">{feed.url}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* ACTIVE button toggle */}
                    <button
                      onClick={() => handleToggleFeed(feed.id)}
                      title={isEnabled ? 'Klik untuk jeda monitor' : 'Klik untuk aktifkan monitor'}
                      className={`rounded border px-3 py-1 text-[11px] font-black tracking-wider transition ${
                        isEnabled
                          ? isX
                            ? 'border-white bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                            : isTg
                            ? 'border-cyan-400 bg-cyan-400 text-black shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                            : 'border-white/40 bg-black text-white hover:bg-white hover:text-black shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                      }`}
                    >
                      {isEnabled ? 'ACTIVE' : 'PAUSED'}
                    </button>

                    {/* Delete Trash button */}
                    <button
                      onClick={() => handleDeleteFeed(feed.id)}
                      title="Hapus akun dari monitor"
                      className="flex h-7 w-7 items-center justify-center rounded border border-white/10 text-neutral-400 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}

        {/* Modal Footer Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
          <div className="flex items-center gap-3">
            {feedMonitors.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAllSources}
                className="text-neutral-400 hover:text-rose-400 underline text-[11px] transition cursor-pointer flex items-center gap-1 font-semibold"
                title="Clear all sources to reset radar to zero"
              >
                <Trash2 className="h-3 w-3 text-rose-400" />
                <span>Clear All Sources ({feedMonitors.length})</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallAll5Pillars}
                  className="rounded bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Shield className="h-3 w-3" />
                  <span>⚡ Install 5 OSINT Pillars</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  className="text-cyan-400 hover:text-cyan-300 underline text-[11px] transition cursor-pointer flex items-center gap-1 font-semibold"
                  title="Restore default radar presets"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Restore Default Presets</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRefreshFeeds();
                onClose();
              }}
              className="rounded bg-white px-4 py-1.5 text-xs font-black text-black hover:bg-neutral-200 transition shadow-[0_0_12px_rgba(255,255,255,0.4)]"
            >
              Terapkan & Pindai Radar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
