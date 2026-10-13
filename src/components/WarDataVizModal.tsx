import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';
import { X, TrendingUp, Flame, Globe2, ShieldAlert, BarChart3, Activity, Clock, Zap } from 'lucide-react';
import { NewsStory } from '../types';

interface WarDataVizModalProps {
  isOpen: boolean;
  onClose: () => void;
  stories: NewsStory[];
}

type TabType = 'trend' | 'keywords' | 'leaders';

interface HourBucket {
  hourIndex: number;
  timeLabel: string;
  isoTime: string;
  warCount: number;
  geopoliticalCount: number;
  total: number;
}

interface KeywordStat {
  name: string;
  category: 'War' | 'Geopolitical';
  count: number;
  fill: string;
}

const WAR_KEYWORDS_LIST = [
  { key: 'missile', label: 'Missile / Rocket', fill: '#f43f5e' },
  { key: 'drone', label: 'Drone / UAV', fill: '#fb7185' },
  { key: 'airstrike', label: 'Airstrike / Air Raid', fill: '#e11d48' },
  { key: 'offensive', label: 'Offensive / Incursion', fill: '#be123c' },
  { key: 'shelling', label: 'Shelling / Artillery', fill: '#fda4af' },
  { key: 'air defense', label: 'Air Defense / Patriot', fill: '#f87171' },
];

const GEO_KEYWORDS_LIST = [
  { key: 'sanctions', label: 'Sanctions / Embargo', fill: '#f59e0b' },
  { key: 'ceasefire', label: 'Ceasefire / Truce', fill: '#10b981' },
  { key: 'diplomacy', label: 'Diplomacy / Summit', fill: '#3b82f6' },
  { key: 'defense pact', label: 'Defense Pact / Alliance', fill: '#8b5cf6' },
  { key: 'military aid', label: 'Military Aid / Weapons', fill: '#eab308' },
  { key: 'nuclear', label: 'Nuclear Deterrence', fill: '#ec4899' },
];

export const WarDataVizModal: React.FC<WarDataVizModalProps> = ({ isOpen, onClose, stories }) => {
  const [activeTab, setActiveTab] = useState<TabType>('trend');
  const [windowRange, setWindowRange] = useState<'24h' | '12h' | '6h'>('24h');

  // Compute 24-hour timeline buckets
  const hourlyData = useMemo(() => {
    const now = Date.now();
    const hoursCount = windowRange === '24h' ? 24 : windowRange === '12h' ? 12 : 6;
    const hourMs = 60 * 60 * 1000;

    // Create chronological buckets from (now - hoursCount * 1h) to now
    const buckets: HourBucket[] = [];
    for (let i = hoursCount - 1; i >= 0; i--) {
      const bucketTime = new Date(now - i * hourMs);
      const hoursAgo = i;
      const label =
        hoursAgo === 0
          ? 'Now'
          : hoursAgo % (hoursCount > 12 ? 3 : 1) === 0
          ? `${hoursAgo}h ago`
          : '';

      buckets.push({
        hourIndex: hoursCount - 1 - i,
        timeLabel: label || `${hoursAgo}h`,
        isoTime: bucketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        warCount: 0,
        geopoliticalCount: 0,
        total: 0,
      });
    }

    // Populate counts based on story pubDate and keyword presence
    stories.forEach((story) => {
      const storyTime = new Date(story.pubDate).getTime();
      const diffMs = now - storyTime;
      const diffHours = Math.floor(diffMs / hourMs);

      if (diffHours >= 0 && diffHours < hoursCount) {
        const bucketIndex = hoursCount - 1 - diffHours;
        if (buckets[bucketIndex]) {
          const content = `${story.title} ${story.summary || ''}`.toLowerCase();

          // Check war keywords
          const hasWar =
            story.eventType === 'AIRSTRIKE' ||
            story.eventType === 'MISSILE' ||
            story.eventType === 'DRONE' ||
            story.eventType === 'OFFENSIVE' ||
            story.eventType === 'SHELLING' ||
            story.eventType === 'AIR DEFENSE' ||
            WAR_KEYWORDS_LIST.some((w) => content.includes(w.key));

          // Check geopolitical keywords
          const hasGeo =
            story.conflict === 'War Geopolitics' ||
            story.eventType === 'DIPLOMACY' ||
            story.eventType === 'SANCTIONS' ||
            story.eventType === 'NUCLEAR' ||
            story.eventType === 'CEASEFIRE' ||
            (story.leaders && story.leaders.length > 0) ||
            GEO_KEYWORDS_LIST.some((g) => content.includes(g.key));

          if (hasWar) {
            buckets[bucketIndex].warCount += 1;
          }
          if (hasGeo) {
            buckets[bucketIndex].geopoliticalCount += 1;
          }
          buckets[bucketIndex].total += 1;
        }
      }
    });

    return buckets;
  }, [stories, windowRange]);

  // Compute Keyword Statistics across all 24h stories
  const keywordStats = useMemo(() => {
    const list: KeywordStat[] = [];
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;
    const recentStories = stories.filter((s) => new Date(s.pubDate).getTime() >= cutoff);

    // War keywords
    WAR_KEYWORDS_LIST.forEach((w) => {
      let count = 0;
      recentStories.forEach((s) => {
        const text = `${s.title} ${s.summary || ''}`.toLowerCase();
        if (text.includes(w.key)) count++;
      });
      list.push({
        name: w.label,
        category: 'War',
        count,
        fill: w.fill,
      });
    });

    // Geopolitical keywords
    GEO_KEYWORDS_LIST.forEach((g) => {
      let count = 0;
      recentStories.forEach((s) => {
        const text = `${s.title} ${s.summary || ''}`.toLowerCase();
        if (text.includes(g.key)) count++;
      });
      list.push({
        name: g.label,
        category: 'Geopolitical',
        count,
        fill: g.fill,
      });
    });

    return list.sort((a, b) => b.count - a.count);
  }, [stories]);

  // Compute Leader Mention Statistics
  const leaderStats = useMemo(() => {
    const counts: Record<string, number> = {};
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;
    const recentStories = stories.filter((s) => new Date(s.pubDate).getTime() >= cutoff);

    recentStories.forEach((s) => {
      if (s.leaders && Array.isArray(s.leaders)) {
        s.leaders.forEach((l) => {
          counts[l] = (counts[l] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [stories]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    let totalWar = 0;
    let totalGeo = 0;
    hourlyData.forEach((b) => {
      totalWar += b.warCount;
      totalGeo += b.geopoliticalCount;
    });

    // Find peak hour
    let peakBucket: HourBucket | null = null;
    for (const b of hourlyData) {
      if (!peakBucket || b.total > peakBucket.total) {
        peakBucket = b;
      }
    }

    const peakHourText = peakBucket
      ? `${(peakBucket as HourBucket).isoTime} (${(peakBucket as HourBucket).total} stories)`
      : 'N/A';

    return {
      totalWar,
      totalGeo,
      peakHour: peakHourText,
      ratio: totalGeo > 0 ? (totalWar / totalGeo).toFixed(1) : totalWar.toString(),
    };
  }, [hourlyData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-xl border border-white/20 bg-neutral-950 p-4 sm:p-6 text-white shadow-[0_0_40px_rgba(255,255,255,0.15)] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wider text-white">
                  24-HOUR RADAR FREQUENCY TREND
                </h2>
                <span className="rounded bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black text-amber-300">
                  RECHARTS DATA VIZ
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Hourly frequency velocity of active combat strikes vs geopolitical power diplomacy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/15 p-1 text-neutral-400 hover:border-white hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-3 border-b border-white/10">
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              <Flame className="h-3 w-3" /> War Combat Mentions
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-black text-white">{summaryMetrics.totalWar}</div>
            <div className="text-[10px] text-neutral-400">Strikes, drones, offensives</div>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              <Globe2 className="h-3 w-3" /> Geopolitics Mentions
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-black text-white">{summaryMetrics.totalGeo}</div>
            <div className="text-[10px] text-neutral-400">Leaders, treaties, sanctions</div>
          </div>

          <div className="rounded-lg border border-white/15 bg-neutral-900/80 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
              <Clock className="h-3 w-3 text-white" /> Peak Influx Time
            </div>
            <div className="mt-1 text-sm sm:text-base font-extrabold text-white truncate">{summaryMetrics.peakHour}</div>
            <div className="text-[10px] text-neutral-400">Highest report density</div>
          </div>

          <div className="rounded-lg border border-white/15 bg-neutral-900/80 p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-300 uppercase tracking-wider">
              <Zap className="h-3 w-3 text-amber-400" /> War / Geo Ratio
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-black text-white">{summaryMetrics.ratio}:1</div>
            <div className="text-[10px] text-neutral-400">Combat to diplomacy ratio</div>
          </div>
        </div>

        {/* View Navigation & Time Range Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-white/15">
            <button
              onClick={() => setActiveTab('trend')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'trend'
                  ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Frequency Trend</span>
            </button>
            <button
              onClick={() => setActiveTab('keywords')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'keywords'
                  ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Keyword Velocity</span>
            </button>
            <button
              onClick={() => setActiveTab('leaders')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'leaders'
                  ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Leader Share</span>
            </button>
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-400 text-[11px] mr-1">Timespan:</span>
            {(['6h', '12h', '24h'] as const).map((rng) => (
              <button
                key={rng}
                onClick={() => setWindowRange(rng)}
                className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                  windowRange === rng
                    ? 'border border-amber-400 bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'border border-white/10 bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                {rng}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="flex-1 min-h-[300px] w-full overflow-hidden rounded-xl border border-white/10 bg-black/60 p-3 sm:p-4">
          {activeTab === 'trend' && (
            <div className="h-full w-full flex flex-col">
              <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold text-neutral-300">
                  Hourly Influx Volume ({windowRange} timeline)
                </span>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 font-bold text-rose-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" /> War Combat Strikes
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-amber-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" /> Geopolitics & Powers
                  </span>
                </div>
              </div>
              <div className="flex-1 w-full min-h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="warGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="geoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis
                      dataKey="timeLabel"
                      stroke="#737373"
                      fontSize={10}
                      tickLine={false}
                      axisLine={{ stroke: '#404040' }}
                    />
                    <YAxis
                      stroke="#737373"
                      fontSize={10}
                      tickLine={false}
                      axisLine={{ stroke: '#404040' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0a0a',
                        borderColor: '#404040',
                        borderRadius: '8px',
                        boxShadow: '0 0 15px rgba(0,0,0,0.8)',
                        fontSize: '11px',
                      }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}
                      formatter={(value: any, name: any) => {
                        const label = name === 'warCount' ? 'War & Combat' : 'Geopolitics & Strategy';
                        return [`${value} mentions`, label];
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="warCount"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#warGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="geopoliticalCount"
                      stroke="#fbbf24"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#geoGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="h-full w-full flex flex-col">
              <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold text-neutral-300">
                  Top War & Geopolitical Keywords Frequency (Ranked by 24h reports)
                </span>
                <span className="text-[11px] text-neutral-400">Total detected keywords: {keywordStats.length}</span>
              </div>
              <div className="flex-1 w-full min-h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keywordStats.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                    <XAxis type="number" stroke="#737373" fontSize={10} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#a3a3a3" fontSize={11} tickLine={false} width={130} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0a0a',
                        borderColor: '#404040',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                      formatter={(val: any) => [`${val} occurrences`, 'Frequency']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {keywordStats.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'leaders' && (
            <div className="h-full w-full flex flex-col">
              <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold text-neutral-300">
                  War Leaders & Global Powers Mention Share (24h Influx)
                </span>
                <span className="text-[11px] text-amber-400 font-bold">Key Geopolitical Drivers</span>
              </div>
              {leaderStats.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-xs text-neutral-500">
                  No leader mentions recorded in the current timeframe.
                </div>
              ) : (
                <div className="flex-1 w-full min-h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaderStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#a3a3a3"
                        fontSize={11}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis stroke="#737373" fontSize={10} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a0a',
                          borderColor: '#fbbf24',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                        formatter={(val: any) => [`${val} mentions`, 'Coverage']}
                      />
                      <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]}>
                        {leaderStats.map((_, index) => (
                          <Cell
                            key={`leader-cell-${index}`}
                            fill={index === 0 ? '#fbbf24' : index === 1 ? '#f59e0b' : '#d97706'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500 border-t border-white/5 pt-2">
          <span>Real-time intelligence analytics derived from 12 authenticated defense wire feeds.</span>
          <button
            onClick={onClose}
            className="rounded border border-white/20 bg-neutral-900 px-3 py-1 font-bold text-white hover:bg-neutral-800 transition"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
