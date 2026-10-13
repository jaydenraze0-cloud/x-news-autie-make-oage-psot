import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Radio,
  Send,
  HelpCircle,
} from 'lucide-react';
import { MarketAsset, MarketSentimentSignal, NewsStory } from '../../types';

interface AiTradingAgentPanelProps {
  currentAsset: MarketAsset;
  recentStories: NewsStory[];
  onShowToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export const AiTradingAgentPanel: React.FC<AiTradingAgentPanelProps> = ({
  currentAsset,
  recentStories,
  onShowToast,
}) => {
  const [signal, setSignal] = useState<MarketSentimentSignal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [isSimulatingCustom, setIsSimulatingCustom] = useState(false);

  const fetchTradingSignal = async (query?: string) => {
    setIsLoading(true);
    if (query) setIsSimulatingCustom(true);
    try {
      const relevantNews = recentStories.slice(0, 12).map((s) => ({
        id: s.id,
        title: s.title,
        summary: s.summary,
        source: s.source,
        conflict: s.conflict,
        eventType: s.eventType,
        isBreaking: s.isBreaking,
      }));

      const res = await fetch('/api/ai/market-sentiment-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: currentAsset.symbol,
          assetName: currentAsset.name,
          assetCategory: currentAsset.category,
          recentNews: relevantNews,
          userQuery: query || undefined,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setSignal(data);
        onShowToast(
          `Sinyal kuantitatif ${currentAsset.displaySymbol} diperbarui oleh ${data.provider}!`,
          'success'
        );
      }
    } catch (err: any) {
      console.warn('AI trading signal error:', err);
      onShowToast('Gagal memuat sinyal AI: ' + (err?.message || 'Koneksi error'), 'error');
    } finally {
      setIsLoading(false);
      setIsSimulatingCustom(false);
    }
  };

  // Re-fetch automatically when selected asset changes
  useEffect(() => {
    fetchTradingSignal();
  }, [currentAsset.symbol]);

  const handleScenarioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    fetchTradingSignal(customQuery.trim());
    setCustomQuery('');
  };

  const getSignalBadgeStyle = (sig?: string) => {
    switch (sig) {
      case 'STRONG_BUY':
        return 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] border-emerald-400';
      case 'BUY':
        return 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'STRONG_SELL':
        return 'bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] border-red-400';
      case 'SELL':
        return 'bg-red-600/30 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div className="flex h-full flex-col bg-neutral-950 text-xs overflow-y-auto">
      {/* Top Header Bar */}
      <div className="border-b border-white/10 p-3.5 space-y-2 shrink-0 bg-black">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            <h3 className="font-extrabold tracking-wider text-white">AI QUANT SENTIMENT AGENT</h3>
          </div>
          <button
            onClick={() => fetchTradingSignal()}
            disabled={isLoading}
            className="flex items-center gap-1 rounded border border-white/20 bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-neutral-200 transition hover:bg-white hover:text-black disabled:opacity-40"
            title="Pindai ulang berita terkini dan perbarui sinyal"
          >
            <RefreshCw className={`h-2.5 w-2.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isLoading ? 'Scanning...' : 'Scan Radar'}</span>
          </button>
        </div>

        {/* Active Asset Info Pill */}
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="font-bold text-white tracking-wide">{currentAsset.displaySymbol}</span>
          <span className="text-neutral-400">{currentAsset.category}</span>
          <span className="text-[10px] text-amber-400 font-bold">
            Sensitivitas: {currentAsset.geopoliticalSensitivity}
          </span>
        </div>
      </div>

      <div className="p-3.5 space-y-4 flex-1">
        {/* 1. SIGNAL & CONFIDENCE HERO CARD */}
        <div className="rounded-lg border border-white/10 bg-black p-3 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Bias & Arah Sinyal
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {signal?.provider || 'Gemini 3.8 Flash Neural Engine'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div
              className={`flex items-center gap-2 rounded px-3 py-1.5 border font-mono font-black text-sm tracking-widest ${getSignalBadgeStyle(
                signal?.signal
              )}`}
            >
              {signal?.signal === 'STRONG_BUY' || signal?.signal === 'BUY' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : signal?.signal === 'STRONG_SELL' || signal?.signal === 'SELL' ? (
                <ArrowDownRight className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              <span>{signal?.signal || 'ANALYZING...'}</span>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-neutral-400">Confidence Score</div>
              <div className="font-mono text-base font-extrabold text-white">
                {signal?.confidence ?? 85}%
              </div>
            </div>
          </div>

          {/* Confidence Meter Bar */}
          <div className="space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-900 border border-white/5">
              <div
                className={`h-full transition-all duration-300 ${
                  (signal?.confidence || 80) >= 85
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${signal?.confidence || 80}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-neutral-500">
              <span>Timeframe: <strong>{signal?.timeframe || 'INTRADAY'}</strong></span>
              <span>Level Risiko: <strong className="text-amber-400">{signal?.riskLevel || 'HIGH'}</strong></span>
            </div>
          </div>
        </div>

        {/* 2. QUANTITATIVE PRICE LEVELS (ENTRY / TP / SL / SUPPORT / RESISTANCE) */}
        <div className="rounded-lg border border-white/10 bg-black p-3 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-300">
            <span className="flex items-center gap-1.5 text-white">
              <Target className="h-3 w-3 text-cyan-400" />
              <span>Level Eksekusi Kuantitatif</span>
            </span>
            <span className="font-mono text-cyan-400">
              RRR: {signal?.technicalLevels.riskRewardRatio || '1 : 2.5'}
            </span>
          </div>

          {/* Target Entry */}
          <div className="rounded border border-cyan-500/30 bg-cyan-950/20 p-2 flex items-center justify-between font-mono">
            <span className="text-[10px] text-cyan-300 font-bold">🎯 TARGET ENTRY ZONE</span>
            <span className="font-extrabold text-white text-xs">
              {signal?.technicalLevels.entryZone || '$2,648.00 - $2,654.00'}
            </span>
          </div>

          {/* TP1 & TP2 */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="rounded border border-emerald-500/30 bg-emerald-950/20 p-2 space-y-0.5">
              <div className="text-[9px] text-emerald-400 font-bold">TAKE PROFIT 1 (TP1)</div>
              <div className="font-bold text-white">{signal?.technicalLevels.takeProfit1 || '$2,670.00'}</div>
            </div>
            <div className="rounded border border-emerald-500/30 bg-emerald-950/20 p-2 space-y-0.5">
              <div className="text-[9px] text-emerald-300 font-bold">TAKE PROFIT 2 (TP2)</div>
              <div className="font-bold text-white">{signal?.technicalLevels.takeProfit2 || '$2,695.00'}</div>
            </div>
          </div>

          {/* Stop Loss & Invalidation */}
          <div className="rounded border border-red-500/30 bg-red-950/20 p-2 flex items-center justify-between font-mono text-[11px]">
            <span className="text-[9px] text-red-400 font-bold flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" />
              <span>INVALIDATION STOP LOSS (SL)</span>
            </span>
            <span className="font-bold text-red-200">
              {signal?.technicalLevels.stopLoss || '$2,632.00'}
            </span>
          </div>

          {/* Support & Resistance Grid */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px] pt-1 border-t border-white/5">
            <div className="space-y-1">
              <div className="text-neutral-500 font-bold">SUPPORT KEY ZONES</div>
              <div className="text-neutral-300">S1: <strong>{signal?.technicalLevels.support1 || '-'}</strong></div>
              <div className="text-neutral-400">S2: <strong>{signal?.technicalLevels.support2 || '-'}</strong></div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-neutral-500 font-bold">RESISTANCE KEY ZONES</div>
              <div className="text-neutral-300">R1: <strong>{signal?.technicalLevels.resistance1 || '-'}</strong></div>
              <div className="text-neutral-400">R2: <strong>{signal?.technicalLevels.resistance2 || '-'}</strong></div>
            </div>
          </div>
        </div>

        {/* 3. BREAKING NEWS CATALYST & SENTIMENT ANALYSIS */}
        <div className="rounded-lg border border-white/10 bg-neutral-900/40 p-3 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-white text-[10px] uppercase">
            <Radio className="h-3 w-3 text-red-500" />
            <span>Katalis Sentimen Berita Radar</span>
          </div>

          <p className="text-[11px] font-semibold text-neutral-200 leading-relaxed bg-black/60 p-2.5 rounded border border-white/5">
            {signal?.catalystSummary ||
              'Menganalisis korelasi kinetik terkini antara pangkalan tempur, jalur laut, dan pergerakan harga...'}
          </p>

          <div className="text-[10px] text-neutral-400 leading-relaxed space-y-1">
            <span className="font-bold text-neutral-300">Dampak Aliran Orderbook:</span>
            <p className="italic">
              {signal?.newsImpactAnalysis ||
                'Ketidakstabilan geopolitik meningkatkan premi likuiditas safe-haven dan pengetatan pasokan fisik.'}
            </p>
          </div>
        </div>

        {/* 4. INTERACTIVE SCENARIO SIMULATOR ("Ask Agent") */}
        <div className="rounded-lg border border-white/10 bg-black p-3 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-white">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Simulasi Skenario Geopolitik</span>
            </span>
            <span className="text-[9px] text-neutral-500 font-mono">Custom Prediction</span>
          </div>

          <form onSubmit={handleScenarioSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Contoh: Jika terjadi blokade Selat Hormuz..."
              className="flex-1 rounded border border-white/20 bg-neutral-950 px-2.5 py-1.5 text-[11px] text-white placeholder-neutral-500 focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSimulatingCustom || !customQuery.trim()}
              className="rounded bg-white px-3 py-1.5 text-[11px] font-black text-black transition hover:bg-neutral-200 disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>

          {/* Quick Scenario Chips */}
          <div className="flex flex-wrap gap-1 text-[9px]">
            <button
              type="button"
              onClick={() => fetchTradingSignal('Eskalasi serangan rudal ke kilang minyak dan depot logistik')}
              disabled={isLoading}
              className="rounded border border-white/10 bg-neutral-900 px-2 py-0.5 text-neutral-300 hover:border-white hover:text-white transition"
            >
              💥 Serangan Kilang
            </button>
            <button
              type="button"
              onClick={() => fetchTradingSignal('Blokade rute tanker di Selat Bab al-Mandeb dan Laut Merah')}
              disabled={isLoading}
              className="rounded border border-white/10 bg-neutral-900 px-2 py-0.5 text-neutral-300 hover:border-white hover:text-white transition"
            >
              ⚓ Blokade Maritim
            </button>
            <button
              type="button"
              onClick={() => fetchTradingSignal('Sinyal gencatan senjata dan de-eskalasi mendadak')}
              disabled={isLoading}
              className="rounded border border-white/10 bg-neutral-900 px-2 py-0.5 text-neutral-300 hover:border-white hover:text-white transition"
            >
              🕊️ Gencatan Senjata
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
