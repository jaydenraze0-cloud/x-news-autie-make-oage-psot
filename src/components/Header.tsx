import React from 'react';
import {
  RefreshCw,
  Play,
  Pause,
  Bell,
  BellOff,
  Settings,
  FolderArchive,
  Sparkles,
  Activity,
  Send,
  Radio,
  Layers,
  Share2,
  Columns3,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { AppSettings, DraftItem } from '../types';

interface HeaderProps {
  isPolling: boolean;
  onTogglePolling: () => void;
  secondsSinceUpdate: number;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  settings: AppSettings;
  onOpenSettings: () => void;
  drafts: DraftItem[];
  onOpenDrafts: () => void;
  onToggleSound: () => void;
  aiAvailable: boolean;
  onOpenDataViz?: () => void;
  onOpenFeedManager?: () => void;
  activeTab: 'feed' | 'editor' | 'captions';
  onChangeTab: (tab: 'feed' | 'editor' | 'captions') => void;
  storyCount: number;
  isThreeColumnMode: boolean;
  onToggleThreeColumnMode: () => void;
  xTrackedCount?: number;
  onOpenRealtimeIntercepts?: () => void;
  unreadInterceptsCount?: number;
  appMode?: 'wardesk' | 'market';
  onChangeAppMode?: (mode: 'wardesk' | 'market') => void;
}

export const Header: React.FC<HeaderProps> = ({
  isPolling,
  onTogglePolling,
  secondsSinceUpdate,
  onManualRefresh,
  isRefreshing,
  settings,
  onOpenSettings,
  drafts,
  onOpenDrafts,
  onToggleSound,
  aiAvailable,
  onOpenDataViz,
  onOpenFeedManager,
  activeTab,
  onChangeTab,
  storyCount,
  isThreeColumnMode,
  onToggleThreeColumnMode,
  xTrackedCount,
  onOpenRealtimeIntercepts,
  unreadInterceptsCount = 0,
  appMode = 'wardesk',
  onChangeAppMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/95 backdrop-blur-md">
      {/* Top Bar: Brand, Navigation Tabs, and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-5">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/20 bg-black shadow-[0_0_12px_rgba(255,255,255,0.25)]">
            {settings.logoDataUrl ? (
              <img
                src={settings.logoDataUrl}
                alt="Logo"
                className="h-6 w-6 sm:h-7 sm:w-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white text-xs font-black">
                S
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] text-sm sm:text-base">
                STARK-NEWS-X
              </span>
              <span className="rounded bg-white px-1.5 py-0.2 text-[9px] font-black tracking-widest text-black">
                PRO
              </span>
            </div>
            <p className="hidden text-[10px] tracking-wide text-neutral-400 md:block">
              INTELLIGENCE & TRADING DESK
            </p>
          </div>
        </div>

        {/* Primary View Navigation Switcher (War Desk vs Market Terminal) */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-neutral-900/90 p-1">
            <button
              onClick={() => onChangeAppMode?.('wardesk')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black transition ${
                appMode === 'wardesk'
                  ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${appMode === 'wardesk' ? 'text-red-600' : 'text-neutral-500'}`} />
              <span>WAR DESK</span>
            </button>

            <button
              onClick={() => onChangeAppMode?.('market')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-black transition ${
                appMode === 'market'
                  ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                  : 'text-neutral-300 hover:text-cyan-300'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-current" />
              <span>MARKET TERMINAL</span>
              <span className="rounded bg-black/40 px-1 py-0.2 text-[9px] font-mono font-bold">
                TV
              </span>
            </button>
          </div>

          {/* Sub-tabs for War Desk if active */}
          {appMode === 'wardesk' && (
            <nav className="hidden md:flex items-center gap-1 rounded-lg border border-white/15 bg-neutral-950 p-1">
              <button
                onClick={() => onChangeTab('feed')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  activeTab === 'feed'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Radar ({storyCount})</span>
              </button>

              <button
                onClick={() => onChangeTab('editor')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  activeTab === 'editor'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Editor</span>
              </button>

              <button
                onClick={() => onChangeTab('captions')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  activeTab === 'captions'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Publish</span>
              </button>

              {/* Desktop 3-Column Toggle */}
              <button
                onClick={onToggleThreeColumnMode}
                title={isThreeColumnMode ? 'Mode 3-Kolom Aktif (Klik untuk Mode Fokus)' : 'Beralih ke Mode Studio 3-Kolom'}
                className={`hidden xl:flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold border transition ml-0.5 ${
                  isThreeColumnMode
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                    : 'border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                <Columns3 className="h-3.5 w-3.5" />
                <span className="hidden lg:inline text-[10px]">3-Kolom</span>
              </button>
            </nav>
          )}
        </div>

        {/* Global Toolbar & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* LIVE polling badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-neutral-950 px-2.5 py-1 text-[11px]">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isPolling ? 'animate-ping bg-emerald-400' : 'bg-neutral-600'
              }`}
            />
            <span className={`font-bold ${isPolling ? 'text-emerald-300' : 'text-neutral-400'}`}>
              {isPolling ? 'LIVE' : 'PAUSED'}
            </span>
            <span className="text-neutral-500 font-mono text-[10px]">({secondsSinceUpdate}s)</span>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={onTogglePolling}
            title={isPolling ? 'Pause live radar scanning' : 'Resume live scanning'}
            className="flex h-7.5 sm:h-8 items-center justify-center rounded border border-white/20 bg-black px-2 text-xs font-medium text-white transition hover:bg-neutral-900 active:scale-95"
          >
            {isPolling ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>

          {/* Refresh Now */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            title="Scan latest intel wires now"
            className="flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded border border-white/20 bg-black text-white transition hover:bg-neutral-900 disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Alert Sound */}
          <button
            onClick={onToggleSound}
            title={settings.soundEnabled ? 'Breaking alert sound: ON' : 'Breaking alert sound: OFF'}
            className={`flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded border transition active:scale-95 ${
              settings.soundEnabled
                ? 'border-white bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.6)]'
                : 'border-white/20 bg-black text-neutral-400 hover:text-white'
            }`}
          >
            {settings.soundEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
          </button>

          {/* Real-time OSINT Intercepts Button */}
          {onOpenRealtimeIntercepts && (
            <button
              onClick={onOpenRealtimeIntercepts}
              title="Open Real-Time OSINT Intercept Log"
              className="flex h-7.5 sm:h-8 items-center gap-1.5 rounded border border-purple-500/50 bg-purple-950/60 px-2 sm:px-2.5 text-xs font-black text-purple-200 transition hover:bg-purple-900/80 active:scale-95 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
            >
              <Zap className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
              <span className="hidden sm:inline">OSINT Intercept</span>
              {unreadInterceptsCount > 0 && (
                <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                  {unreadInterceptsCount}
                </span>
              )}
            </button>
          )}

          {/* 24h Trends DataViz */}
          {onOpenDataViz && (
            <button
              onClick={onOpenDataViz}
              title="24-Hour War Trends & Statistics"
              className="hidden md:flex h-7.5 sm:h-8 items-center gap-1 rounded border border-amber-400/50 bg-neutral-950 px-2 text-xs font-bold text-amber-300 transition hover:bg-neutral-900 hover:border-amber-400"
            >
              <Activity className="h-3.5 w-3.5 text-amber-400" />
              <span>Trends</span>
            </button>
          )}

          {/* X (Twitter) & Sources Tracker */}
          {onOpenFeedManager && (
            <button
              onClick={onOpenFeedManager}
              title="Manage & Add X (Twitter) Accounts and Radar Feeds"
              className="flex h-7.5 sm:h-8 items-center gap-1.5 rounded border border-white/20 bg-black px-2.5 text-xs font-bold text-white hover:border-white transition active:scale-95 shadow-sm"
            >
              <span className="font-serif font-black text-sm">𝕏</span>
              <span className="hidden sm:inline">X Accounts & Feeds</span>
              {xTrackedCount !== undefined && (
                <span className="rounded bg-white/20 border border-white/30 px-1.5 py-0.2 text-[9px] font-mono font-bold text-white">
                  {xTrackedCount}
                </span>
              )}
            </button>
          )}

          {/* Drafts */}
          <button
            onClick={onOpenDrafts}
            title="Saved Drafts List"
            className="relative flex h-7.5 sm:h-8 items-center gap-1 rounded border border-white/20 bg-black px-2 text-xs font-medium text-white transition hover:bg-neutral-900"
          >
            <FolderArchive className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Drafts</span>
            {drafts.length > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-black">
                {drafts.length}
              </span>
            )}
          </button>

          {/* AI Badge */}
          <div
            className={`hidden xl:flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-bold ${
              aiAvailable
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-white/10 text-neutral-500'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>{aiAvailable ? 'AI READY' : 'TEMPLATE'}</span>
          </div>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Studio Settings"
            className="flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded border border-white/20 bg-black text-white transition hover:bg-neutral-900"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
