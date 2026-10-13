import React, { useState } from 'react';
import {
  Search,
  Maximize2,
  Minimize2,
  TrendingUp,
  Flame,
  Globe,
  Coins,
  DollarSign,
  BarChart3,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { MarketAsset, MarketCategory, NewsStory } from '../../types';
import { POPULAR_MARKET_ASSETS } from './marketAssets';
import { TradingViewTickerTape } from './TradingViewTickerTape';
import { TradingViewChart } from './TradingViewChart';
import { AiTradingAgentPanel } from './AiTradingAgentPanel';

interface MarketTerminalProps {
  recentStories: NewsStory[];
  onShowToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  onReturnToWarDesk?: () => void;
}

export const MarketTerminal: React.FC<MarketTerminalProps> = ({
  recentStories,
  onShowToast,
  onReturnToWarDesk,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(POPULAR_MARKET_ASSETS[0]); // Default Gold XAUUSD
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | 'ALL'>('ALL');
  const [selectedInterval, setSelectedInterval] = useState<string>('60'); // 1h default
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreenChart, setIsFullscreenChart] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'chart' | 'watchlist' | 'agent'>('chart');

  const filteredAssets = POPULAR_MARKET_ASSETS.filter((asset) => {
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.displaySymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const timeframes = [
    { label: '1m', value: '1' },
    { label: '5m', value: '5' },
    { label: '15m', value: '15' },
    { label: '1H', value: '60' },
    { label: '4H', value: '240' },
    { label: '1D', value: 'D' },
    { label: '1W', value: 'W' },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-black text-white font-sans overflow-hidden">
      {/* 1. TOP TICKER TAPE (REAL-TIME GLOBAL PRICES) */}
      <TradingViewTickerTape />

      {/* 2. TERMINAL SUB-HEADER (ASSET SUMMARY & TIMEFRAME SELECTOR) */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-neutral-950 px-3 py-2 text-xs gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-white tracking-wide">
              {selectedAsset.displaySymbol}
            </span>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              {selectedAsset.name}
            </span>
            <span className="rounded bg-neutral-900 border border-white/10 px-1.5 py-0.5 text-[9px] font-mono text-neutral-300">
              {selectedAsset.unit}
            </span>
          </div>
        </div>

        {/* Timeframe selector & Fullscreen toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile view switch */}
          <div className="flex lg:hidden rounded border border-white/10 bg-black p-0.5 text-[10px]">
            <button
              onClick={() => setActiveMobileTab('watchlist')}
              className={`px-2 py-0.5 font-bold rounded ${
                activeMobileTab === 'watchlist' ? 'bg-white text-black' : 'text-neutral-400'
              }`}
            >
              Watchlist
            </button>
            <button
              onClick={() => setActiveMobileTab('chart')}
              className={`px-2 py-0.5 font-bold rounded ${
                activeMobileTab === 'chart' ? 'bg-white text-black' : 'text-neutral-400'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setActiveMobileTab('agent')}
              className={`px-2 py-0.5 font-bold rounded ${
                activeMobileTab === 'agent' ? 'bg-cyan-400 text-black' : 'text-cyan-400'
              }`}
            >
              AI Agent
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 rounded border border-white/10 bg-neutral-900/60 p-0.5">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedInterval(tf.value)}
                className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold transition ${
                  selectedInterval === tf.value
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsFullscreenChart(!isFullscreenChart)}
            className="rounded border border-white/15 bg-neutral-900 p-1 text-neutral-300 hover:text-white transition"
            title={isFullscreenChart ? 'Exit Fullscreen' : 'Expand Chart Fullscreen'}
          >
            {isFullscreenChart ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 3. MAIN TERMINAL WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* COLUMN 1: ASSET WATCHLIST SELECTOR (LEFT SIDEBAR) */}
        <aside
          className={`${
            isFullscreenChart
              ? 'hidden'
              : activeMobileTab === 'watchlist'
              ? 'w-full block'
              : 'hidden lg:block lg:w-72 xl:w-80'
          } shrink-0 border-r border-white/10 bg-black flex flex-col overflow-hidden text-xs`}
        >
          {/* Search & Category Filter */}
          <div className="p-2.5 border-b border-white/10 space-y-2 bg-neutral-950/80">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari simbol (XAU, OIL, BTC, SPX)..."
                className="w-full rounded border border-white/15 bg-black py-1.5 pl-8 pr-3 text-[11px] text-white placeholder-neutral-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Category Segmented Buttons */}
            <div className="grid grid-cols-5 gap-1 text-[9px] font-bold text-center">
              {(['ALL', 'COMMODITIES', 'CRYPTO', 'FOREX', 'INDICES'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded py-1 truncate transition border ${
                    selectedCategory === cat
                      ? 'border-white bg-white text-black'
                      : 'border-white/10 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat === 'COMMODITIES' ? 'Komoditas' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Asset List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset.symbol === asset.symbol;
              return (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setActiveMobileTab('chart');
                  }}
                  className={`w-full text-left p-3 transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-neutral-900 border-l-2 border-cyan-400'
                      : 'hover:bg-neutral-950'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-white text-xs">
                        {asset.displaySymbol}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-500">
                        {asset.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      {asset.name}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        asset.geopoliticalSensitivity === 'EXTREME'
                          ? 'border-red-500/40 text-red-400 bg-red-950/20'
                          : asset.geopoliticalSensitivity === 'HIGH'
                          ? 'border-amber-500/40 text-amber-400 bg-amber-950/20'
                          : 'border-neutral-700 text-neutral-400 bg-neutral-900'
                      }`}
                    >
                      {asset.geopoliticalSensitivity}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* COLUMN 2: INTERACTIVE TRADINGVIEW CHART (CENTER VIEWPORT) */}
        <main
          className={`flex-1 h-full bg-black overflow-hidden ${
            activeMobileTab === 'chart' || isFullscreenChart ? 'block' : 'hidden lg:block'
          }`}
        >
          <TradingViewChart
            symbol={selectedAsset.tvSymbol}
            interval={selectedInterval}
            theme="dark"
            containerId="stark_tradingview_terminal_chart"
          />
        </main>

        {/* COLUMN 3: QUANTITATIVE AI TRADING SENTIMENT AGENT (RIGHT PANEL) */}
        <section
          className={`${
            isFullscreenChart
              ? 'hidden'
              : activeMobileTab === 'agent'
              ? 'w-full block'
              : 'hidden xl:block xl:w-[420px]'
          } shrink-0 border-l border-white/10 h-full overflow-hidden`}
        >
          <AiTradingAgentPanel
            currentAsset={selectedAsset}
            recentStories={recentStories}
            onShowToast={onShowToast}
          />
        </section>
      </div>
    </div>
  );
};
