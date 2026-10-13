import React, { useState, useMemo } from 'react';
import {
  NewsStory,
  IncidentTimelineUpdate,
  TimelineUpdateType,
} from '../types';
import {
  formatTimelineTimestamp,
  TIMELINE_TYPE_CONFIG,
  getStoryIncidentTimeline,
} from '../utils/incidentTimeline';
import {
  detectMilitaryTracking,
  MOVEMENT_TYPE_META,
} from '../utils/militaryTracker';
import {
  SENTIMENT_CATEGORY_META,
  THREAT_LEVEL_META,
  analyzeStorySentiment,
} from '../utils/sentimentAnalyzer';
import { ConflictSparkline } from './ConflictSparkline';
import {
  Clock,
  Radio,
  ExternalLink,
  ChevronRight,
  Shield,
  Swords,
  Layers,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Flame,
  Search,
  Sparkles,
  RefreshCw,
  GitBranch,
  ArrowDown,
  CornerDownRight,
  SlidersHorizontal,
} from 'lucide-react';

export type WarTheaterId =
  | 'UKRAINE_RUSSIA'
  | 'IRAN_USA'
  | 'SAUDI_YEMEN'
  | 'ISRAEL_GAZA'
  | 'ISRAEL_LEBANON'
  | 'RED_SEA_YEMEN'
  | 'SYRIA_IRAQ'
  | 'TAIWAN_CHINA'
  | 'NATO_RUSSIA'
  | 'SUDAN_CONFLICT'
  | 'KOREA_PENINSULA'
  | 'ALL_THEATERS';

export interface WarTheaterOption {
  id: WarTheaterId;
  label: string;
  shortLabel: string;
  flag: string;
  conflictKey: string;
  accentColor: string;
  threatLevel: 'EXTREME' | 'CRITICAL' | 'ELEVATED' | 'GLOBAL';
  forcesSummary: string;
  hotspots: string;
  description: string;
}

export const WAR_THEATERS: WarTheaterOption[] = [
  {
    id: 'UKRAINE_RUSSIA',
    label: 'Ukraina vs Rusia',
    shortLabel: 'Ukraina - Rusia',
    flag: '🇺🇦 🇷🇺',
    conflictKey: 'Russia-Ukraine',
    accentColor: '#ef4444',
    threatLevel: 'EXTREME',
    forcesSummary: 'AFU (ZSU) vs Angkatan Bersenjata Rusia (VSRF / VDV)',
    hotspots: 'Poros Pokrovsk, Kursk, Kharkiv, Kupiansk, Donbas & Laut Hitam',
    description: 'Pertempuran parit garis depan, salvo drone tempur FPV/Shahed, serta serangan rudal jelajah dan balistik.',
  },
  {
    id: 'IRAN_USA',
    label: 'Iran vs USA (Amerika Serikat)',
    shortLabel: 'Iran - USA',
    flag: '🇮🇷 🇺🇸',
    conflictKey: 'Iran-USA',
    accentColor: '#dc2626',
    threatLevel: 'EXTREME',
    forcesSummary: 'IRGC (Garda Revolusi) & Pasukan Rudal vs US CENTCOM & Armada Laut AS',
    hotspots: 'Pangkalan Militer Ain al-Asad & Al-Tanf, Selat Hormuz & Teluk Persia',
    description: 'Ancaman salvo rudal balistik jarak jauh Kheibar Shekan, patroli armada kapal induk AS, serta penangkalan nuklir.',
  },
  {
    id: 'SAUDI_YEMEN',
    label: 'Arab Saudi vs Milisi Yaman (Houthi)',
    shortLabel: 'Arab Saudi - Yaman',
    flag: '🇸🇦 🇾🇪',
    conflictKey: 'Saudi-Yemen',
    accentColor: '#16a34a',
    threatLevel: 'CRITICAL',
    forcesSummary: 'Koalisi Militer Arab Saudi (RSLF) vs Gerakan Ansar Allah Yaman',
    hotspots: 'Sektor Perbatasan Najran, Jizan, Asir, Pelabuhan Hodeidah & Saada',
    description: 'Serangan drone kamikaze Samad-3 & proyektil balistik lintas perbatasan terhadap instalasi energi dan pangkalan militer.',
  },
  {
    id: 'ISRAEL_GAZA',
    label: 'Israel vs Gaza (Hamas / Al-Qassam)',
    shortLabel: 'Israel - Gaza',
    flag: '🇮🇱 🇵🇸',
    conflictKey: 'Israel-Gaza',
    accentColor: '#ea580c',
    threatLevel: 'EXTREME',
    forcesSummary: 'Militer Israel (IDF) vs Brigade Izzuddin Al-Qassam & Saraya Al-Quds',
    hotspots: 'Gaza Utara, Jabalia, Rafah, Khan Younis & Koridor Netzarim',
    description: 'Operasi manuver darat divisi lapis baja IDF, pertempuran terowongan bawah tanah, dan tembakan roket pertahanan.',
  },
  {
    id: 'ISRAEL_LEBANON',
    label: 'Israel vs Lebanon (Hezbollah)',
    shortLabel: 'Israel - Lebanon',
    flag: '🇮🇱 🇱🇧',
    conflictKey: 'Israel-Lebanon',
    accentColor: '#ca8a04',
    threatLevel: 'CRITICAL',
    forcesSummary: 'IDF Komando Utara vs Pasukan Khusus Radwan Hezbollah',
    hotspots: 'Perbatasan Garis Biru, Beirut Dahiyeh, Lembah Bekaa & Sungai Litani',
    description: 'Salvo rudal berat Fadi, serangan udara presisi bunker, dan penyusupan pasukan infanteri di perimeter selatan.',
  },
  {
    id: 'RED_SEA_YEMEN',
    label: 'Laut Merah & Bab al-Mandeb',
    shortLabel: 'Laut Merah & Houthi',
    flag: '🇾🇪 ⚓',
    conflictKey: 'Bab al-Mandeb / Red Sea',
    accentColor: '#0891b2',
    threatLevel: 'CRITICAL',
    forcesSummary: 'Angkatan Bersenjata Yaman (Ansar Allah) vs US Navy, UKMTO & Sekutu',
    hotspots: 'Selat Bab al-Mandeb, Teluk Aden & Koridor Pelayaran Mokha',
    description: 'Serangan rudal balistik anti-kapal (ASBM), drone perahu tanpa awak (USV), serta pencegatan kapal perusak Aegis.',
  },
  {
    id: 'SYRIA_IRAQ',
    label: 'Front Suriah & Irak',
    shortLabel: 'Suriah - Irak',
    flag: '🇸🇾 🇮🇶',
    conflictKey: 'Syria-Iraq',
    accentColor: '#9333ea',
    threatLevel: 'ELEVATED',
    forcesSummary: 'Milisi Perlawanan Islam Irak & Suriah vs Pangkalan Militer Koalisi AS',
    hotspots: 'Pangkalan Al-Tanf, Deir ez-Zor, Al-Bukamal & Dataran Tinggi Golan',
    description: 'Serangan drone bunuh diri ke garnisun militer, koridor suplai senjata, dan pencegatan sistem pertahanan udara.',
  },
  {
    id: 'TAIWAN_CHINA',
    label: 'Selat Taiwan & Laut China Selatan',
    shortLabel: 'Taiwan - China',
    flag: '🇹🇼 🇨🇳',
    conflictKey: 'China-Taiwan',
    accentColor: '#2563eb',
    threatLevel: 'ELEVATED',
    forcesSummary: 'Tentara Pembebasan Rakyat (PLA) vs Militer Taiwan & US INDOPACOM',
    hotspots: 'Garis Tengah Selat Taiwan, ADIZ, Atol Karang Laut China Selatan',
    description: 'Latihan blokade maritim militer gabungan, sortie jet tempur siluman J-20, serta patroli kebebasan navigasi armada AS.',
  },
  {
    id: 'NATO_RUSSIA',
    label: 'NATO vs Rusia & Geopolitik Strategis',
    shortLabel: 'NATO - Rusia',
    flag: '🌐 🇷🇺',
    conflictKey: 'NATO-Russia',
    accentColor: '#4f46e5',
    threatLevel: 'CRITICAL',
    forcesSummary: 'Aliansi Pertahanan NATO & Pentagon vs Komando Pasukan Nuklir Rusia',
    hotspots: 'Sayap Timur Baltik, Arktik, Silo Rudal Balistik Antar-Benua (ICBM)',
    description: 'Pengerahan persenjataan berat sekutu, simulasi pertahanan nuklir, dan paket sanksi logistik industri pertahanan.',
  },
  {
    id: 'SUDAN_CONFLICT',
    label: 'Perang Saudara Sudan (SAF vs Milisi RSF)',
    shortLabel: 'Perang Sudan',
    flag: '🇸🇩 ⚔️',
    conflictKey: 'Sudan',
    accentColor: '#e11d48',
    threatLevel: 'CRITICAL',
    forcesSummary: 'Angkatan Bersenjata Sudan (SAF) vs Rapid Support Forces (RSF)',
    hotspots: 'Khartoum, El Fasher, Darfur Utara, Al Jazirah & Port Sudan',
    description: 'Baku tembak artileri berat perkotaan, pengepungan pos garnisiun militer, dan serangan konvoi kendaraan lapis baja.',
  },
  {
    id: 'KOREA_PENINSULA',
    label: 'Semenanjung Korea (Korut ICBM vs AS & Korsel)',
    shortLabel: 'Korea Utara - AS',
    flag: '🇰🇵 🇰🇷',
    conflictKey: 'North Korea',
    accentColor: '#8b5cf6',
    threatLevel: 'CRITICAL',
    forcesSummary: 'Tentara Rakyat Korea (KPA) Rudal Strategis vs US Forces Korea & Korsel',
    hotspots: 'Garis Demarkasi DMZ, Laut Timur / Jepang, Silo Rudal Bawah Tanah Pyongyang',
    description: 'Uji tembak rudal balistik antar-benua hipersonik Hwasong, kesiapan hulu ledak nuklir taktis, serta latihan armada militer.',
  },
  {
    id: 'ALL_THEATERS',
    label: 'Semua Front Tempur Aktif',
    shortLabel: 'Semua Front',
    flag: '🌐 📡',
    conflictKey: 'ALL',
    accentColor: '#38bdf8',
    threatLevel: 'GLOBAL',
    forcesSummary: 'Seluruh Front Pertempuran & Gesekan Militer Global',
    hotspots: 'Pemantauan Radar Multi-Teater Menyeluruh',
    description: 'Alur kronologi terpusat dari seluruh front pertempuran aktif yang dipantau satelit dan radar intelijen.',
  },
];

interface WarTheaterTimelineColumnProps {
  stories: NewsStory[];
  selectedStoryId: string | null;
  onSelectStory: (story: NewsStory) => void;
  onOpenStoryDetail?: (story: NewsStory) => void;
  onOpenEditorForStory?: (story: NewsStory) => void;
  onOpenCaptionsForStory?: (story: NewsStory) => void;
  initialTheater?: WarTheaterId;
  initialSearchQuery?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export const WarTheaterTimelineColumn: React.FC<WarTheaterTimelineColumnProps> = ({
  stories,
  selectedStoryId,
  onSelectStory,
  onOpenStoryDetail,
  onOpenEditorForStory,
  onOpenCaptionsForStory,
  initialTheater = 'UKRAINE_RUSSIA',
  initialSearchQuery = '',
  onRefresh,
  isRefreshing = false,
  className = '',
}) => {
  const [activeTheater, setActiveTheater] = useState<WarTheaterId>(initialTheater);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [expandedSubTimelines, setExpandedSubTimelines] = useState<Set<string>>(new Set());
  const [copiedStoryId, setCopiedStoryId] = useState<string | null>(null);

  const currentTheaterConfig = useMemo(() => {
    return WAR_THEATERS.find((t) => t.id === activeTheater) || WAR_THEATERS[0];
  }, [activeTheater]);

  // Helper to match a story against a specific theater
  const matchStoryToTheater = (story: NewsStory, theaterId: WarTheaterId): boolean => {
    const text = `${story.title} ${story.summary} ${story.conflict} ${story.source}`.toLowerCase();
    
    if (theaterId === 'ALL_THEATERS') return true;

    if (theaterId === 'UKRAINE_RUSSIA') {
      return (
        story.conflict === 'Russia-Ukraine' ||
        story.locationTag === 'Ukraine' ||
        story.locationTag === 'Russia' ||
        /ukraine|russia|kursk|pokrovsk|kharkiv|donbas|kyiv|zsu|belgorod|kpszsu|operativnozsu|deepstate|milinfolive|rybar/i.test(text)
      );
    }

    if (theaterId === 'IRAN_USA') {
      return (
        story.conflict === 'Iran vs USA' ||
        story.conflict === 'Israel-Iran / Iran' ||
        /iran\s?(vs|-|\/)\s?(usa|us|u\.s\.)/i.test(text) ||
        (/iran|tehran|irgc|khamenei|isfahan/i.test(text) && /usa|u\.s\.|us |centcom|pentagon|american|biden|trump|b-2|carrier|strikes|persian gulf/i.test(text)) ||
        (/centcom/i.test(text) && /iran|irgc|tehran/i.test(text)) ||
        (/persian gulf|teluk persia/i.test(text) && /missile|ballistic|carrier/i.test(text)) ||
        (/iran/i.test(text) && !/ukraine|russia/i.test(text) && /sanction|nuclear|drone|missile/i.test(text))
      );
    }

    if (theaterId === 'SAUDI_YEMEN') {
      return (
        story.conflict === 'Arab Saudi vs Milisi Yaman' ||
        story.conflict === 'Saudi-Yemen' ||
        /saudi\s?(vs|-|\/)\s?(yemen|houthi)/i.test(text) ||
        (/saudi|riyadh|najran|jizan|asir|سعودي|الرياض/i.test(text) && /yemen|houthi|ansarallah|اليمن|حوثي|صنعاء/i.test(text)) ||
        /saudi\s?coalition|koalisi arab|arab saudi/i.test(text) ||
        (story.locationTag === 'Red Sea & Yemen' && /saudi|riyadh|najran|jizan/i.test(text))
      );
    }

    if (theaterId === 'ISRAEL_GAZA') {
      return (
        story.conflict === 'Israel-Gaza' ||
        /gaza|hamas|qassam|rafah|khan younis|netzarim|palestin|غزة|حماس/i.test(text)
      );
    }

    if (theaterId === 'ISRAEL_LEBANON') {
      return (
        story.conflict === 'Lebanon / Hezbollah' ||
        /lebanon|hezbollah|beirut|dahiyeh|litani|bekaa|nasrallah|لبنان|حزب الله/i.test(text)
      );
    }

    if (theaterId === 'RED_SEA_YEMEN') {
      return (
        story.conflict === 'Bab al-Mandeb / Red Sea' ||
        story.locationTag === 'Red Sea & Yemen' ||
        /red sea|bab al-mandeb|bab el-mandeb|gulf of aden|houthi|ansarallah|ukmto|tanker|carrier|destroyer/i.test(text)
      );
    }

    if (theaterId === 'SYRIA_IRAQ') {
      return (
        story.conflict === 'Syria' ||
        /syria|damascus|aleppo|idlib|golan|al-tanf|deir ez-zor|iraq|baghdad|ain al-asad|al-asad/i.test(text)
      );
    }

    if (theaterId === 'TAIWAN_CHINA') {
      return (
        story.conflict === 'China-Taiwan' ||
        /taiwan|taipei|pla|south china sea|taiwan strait|strait of taiwan/i.test(text)
      );
    }

    if (theaterId === 'NATO_RUSSIA') {
      return (
        story.conflict === 'War Geopolitics' ||
        /nato|pentagon|baltic|nuclear drill|strategic nuclear|icbm|sanctions on russia|arms package|defense pact/i.test(text)
      );
    }

    if (theaterId === 'SUDAN_CONFLICT') {
      return (
        story.conflict === 'Sudan' ||
        /sudan|rsf|rapid support forces|khartoum|darfur|el fasher|burhan|hemeti|السودان/i.test(text)
      );
    }

    if (theaterId === 'KOREA_PENINSULA') {
      return (
        story.conflict === 'North Korea' ||
        /north korea|pyongyang|kim jong|dprk|icbm|korea strait|seoul|dmz|hwasong/i.test(text)
      );
    }

    return true;
  };

  // Precompute count for each theater card
  const theaterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of WAR_THEATERS) {
      counts[t.id] = stories.filter((s) => matchStoryToTheater(s, t.id)).length;
    }
    return counts;
  }, [stories]);

  // Filter stories belonging to active theater and search term
  const theaterStories = useMemo(() => {
    return stories.filter((story) => {
      // 1. Keyword search overrides theater if provided
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const full = `${story.title} ${story.summary} ${story.source} ${story.conflict} ${story.locationTag || ''}`.toLowerCase();
        if (!full.includes(q)) return false;
        return true;
      }

      // 2. Otherwise match selected active theater
      return matchStoryToTheater(story, activeTheater);
    });
  }, [stories, activeTheater, searchQuery]);

  const toggleSubTimeline = (storyId: string) => {
    setExpandedSubTimelines((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });
  };

  const handleCopyStoryTimeline = (story: NewsStory) => {
    const time = formatTimelineTimestamp(story.pubTimestamp || story.pubDate);
    const updates = (story.timelineUpdates || getStoryIncidentTimeline(story))
      .map((u) => `  [${u.type}] ${u.timestamp}: ${u.description}`)
      .join('\n');
    const text = `[TIMELINE NEWS: ${story.conflict || currentTheaterConfig.label}]\n${story.title}\nWaktu: ${time}\nSumber: ${story.source}\n\nRingkasan:\n${story.summary}\n\nKronologi Perkembangan:\n${updates}`;

    navigator.clipboard.writeText(text);
    setCopiedStoryId(story.id);
    setTimeout(() => setCopiedStoryId(null), 2000);
  };

  return (
    <div className={`flex flex-col h-full bg-black text-white ${className}`}>
      {/* Scrollable Container containing the entire Tree Architecture from user diagram */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 scrollbar-thin scrollbar-thumb-neutral-800">
        
        {/* ========================================================================= */}
        {/* SECTION 1: DAFTAR CARD KONFLIK AKTIF DUNIA (Interactive Cards Grid)       */}
        {/* ========================================================================= */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                <span>Card Konflik Sedang Terjadi</span>
                <span className="rounded bg-red-600/20 border border-red-500/40 px-1.5 py-0.2 text-[9px] text-red-300">
                  {WAR_THEATERS.length} Teater
                </span>
              </h2>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              Pilih salah satu card konflik di bawah
            </span>
          </div>

          {/* Grid of Interactive Conflict Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {WAR_THEATERS.map((theater) => {
              const isActive = activeTheater === theater.id && !searchQuery.trim();
              const count = theaterCounts[theater.id] || 0;
              return (
                <div
                  key={theater.id}
                  onClick={() => {
                    setActiveTheater(theater.id);
                    setSearchQuery('');
                  }}
                  className={`cursor-pointer rounded-xl border p-3 transition-all duration-150 select-none relative group ${
                    isActive
                      ? 'border-red-500 bg-gradient-to-br from-red-950/70 via-neutral-900 to-black shadow-[0_0_18px_rgba(239,68,68,0.4)] ring-1 ring-red-400'
                      : 'border-white/10 bg-neutral-950/90 hover:border-white/30 hover:bg-neutral-900/60'
                  }`}
                >
                  {/* Top row: Flag + Label + Threat pill */}
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{theater.flag}</span>
                      <span className="font-extrabold text-xs text-white leading-tight truncate">
                        {theater.label}
                      </span>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[8.5px] font-black uppercase font-mono shrink-0 border ${
                        theater.threatLevel === 'EXTREME'
                          ? 'bg-red-950/90 border-red-500/80 text-red-300 shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                          : theater.threatLevel === 'CRITICAL'
                          ? 'bg-amber-950/90 border-amber-500/80 text-amber-300'
                          : theater.threatLevel === 'GLOBAL'
                          ? 'bg-white/10 border-white/40 text-white'
                          : 'bg-blue-950/90 border-blue-500/80 text-blue-300'
                      }`}
                    >
                      {theater.threatLevel}
                    </span>
                  </div>

                  {/* Opposing Forces summary */}
                  <p className="text-[10px] text-neutral-400 line-clamp-1 font-mono">
                    ⚔️ {theater.forcesSummary}
                  </p>

                  {/* Hotspots perimeter */}
                  <p className="text-[9.5px] text-neutral-500 line-clamp-1 font-sans mt-0.5">
                    📍 {theater.hotspots}
                  </p>

                  {/* Card bottom: Live Count + Sparkline + Active state */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-1.5 text-[10px]">
                    <span className="font-bold text-neutral-300 flex items-center gap-1">
                      <Radio className={`h-2.5 w-2.5 ${isActive ? 'text-red-400 animate-pulse' : 'text-neutral-500'}`} />
                      <span>{count} Berita Terlacak</span>
                    </span>
                    <ConflictSparkline
                      stories={stories}
                      label={theater.shortLabel}
                      width={32}
                      height={10}
                      color={theater.accentColor}
                      variant="badge"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: ROOT BOX (Diagram: "Ukirne rusia" / Tema Terpilih)             */}
        {/* ========================================================================= */}
        <div className="relative max-w-xl">
          <div className="rounded-2xl border-2 border-red-500/90 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black p-4 sm:p-5 shadow-[0_0_24px_rgba(239,68,68,0.3)] transition hover:border-red-400">
            {/* Top row: Topic Title + Status */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl">{currentTheaterConfig.flag}</span>
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-wider text-white uppercase flex items-center gap-2">
                    <span>
                      {searchQuery.trim() ? `Pencarian: "${searchQuery}"` : currentTheaterConfig.label}
                    </span>
                  </h1>
                  <p className="text-[11px] text-neutral-400">
                    Tema Aktif: <strong className="text-red-400">{currentTheaterConfig.forcesSummary}</strong> • <span className="text-neutral-200 font-semibold">{theaterStories.length} Berita (Tidak Terbatas)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="flex items-center gap-1 rounded bg-red-600/20 border border-red-500/50 px-2 py-0.5 text-[10px] font-mono font-bold text-red-300">
                  <Radio className="h-3 w-3 animate-pulse text-red-400" />
                  <span>LIVE RADAR</span>
                </span>
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="rounded p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition disabled:opacity-50"
                    title="Segarkan data feed"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Live Search Input inside Root Box */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dalam tema ini atau ketik tema baru (misal: iran, saudi, ukraine, gaza, drone)..."
                className="w-full rounded-lg border border-white/20 bg-black/90 py-2 pl-9 pr-20 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300 hover:text-white font-bold"
                >
                  ✕ Hapus
                </button>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BRANCHING PIPE CONNECTOR (Diagram: Horizontal line to vertical spine)      */}
          {/* ========================================================================= */}
          <div className="relative pl-10 sm:pl-12 pt-3 pb-2">
            {/* Corner elbow line flowing from Root Card down and right to the vertical stem */}
            <div className="absolute left-6 sm:left-7 top-0 bottom-0 w-8 sm:w-10 pointer-events-none">
              <svg className="w-full h-full overflow-visible" xmlns="http://www.w3.org/2000/svg">
                {/* Horizontal branch off root card */}
                <path
                  d="M 0,0 L 0,20 Q 0,32 12,32 L 28,32"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Badge label at junction matching user diagram: "timelie news" */}
            <div className="ml-5 sm:ml-6 inline-flex items-center gap-2 rounded-full border-2 border-red-500 bg-black px-3.5 py-1 shadow-[0_0_14px_rgba(239,68,68,0.6)]">
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,1)] animate-ping" />
              <span className="text-xs font-black tracking-widest text-white uppercase font-mono">
                TIMELINE NEWS
              </span>
              <span className="rounded bg-red-950/80 px-1.5 py-0.2 text-[10px] font-mono text-red-300 font-bold border border-red-500/40">
                {theaterStories.length} Berita (Tidak Terbatas)
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: CONTINUOUS VERTICAL TIMELINE SPINE & NEWS NODES ("[ news ]")    */}
        {/* ========================================================================= */}
        <div className="relative pl-8 sm:pl-10 mt-2">
          {/* The main unbroken vertical spine line running continuously downwards */}
          <div className="absolute left-[18px] sm:left-[22px] top-0 bottom-4 w-[3px] bg-gradient-to-b from-red-500 via-red-600 to-red-950/80 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />

          {theaterStories.length === 0 ? (
            <div className="my-8 rounded-xl border border-dashed border-white/20 bg-neutral-950 p-8 text-center space-y-3">
              <Radio className="mx-auto h-8 w-8 text-neutral-600 animate-pulse" />
              <p className="text-sm font-bold text-neutral-300">
                No intelligence stories match theme "{searchQuery || currentTheaterConfig.shortLabel}"
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Select one of the active conflict theater cards above to explore chronological dispatches.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTheater('UKRAINE_RUSSIA');
                }}
                className="mt-2 rounded bg-white px-3 py-1.5 text-xs font-black text-black hover:bg-neutral-200 transition"
              >
                Reset to Ukraine vs Russia
              </button>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-7">
              {theaterStories.map((story, index) => {
                const isSelected = selectedStoryId === story.id;
                const tracking = story.militaryTracking || detectMilitaryTracking(story);
                const mvMeta = tracking ? MOVEMENT_TYPE_META[tracking.movementType] : null;
                const sentiment = story.sentiment || analyzeStorySentiment(story);
                const threatMeta = THREAT_LEVEL_META[sentiment.threatLevel];
                const isSubExpanded = expandedSubTimelines.has(story.id);

                // Determine primary badge type
                let updateType: TimelineUpdateType = 'Update';
                if (story.isBreaking || sentiment.threatLevel === 'EXTREME') updateType = 'Escalation';
                else if (story.isNewAttack) updateType = 'Alert';
                else if (story.isOsint) updateType = 'Investigation';

                const meta = TIMELINE_TYPE_CONFIG[updateType] || TIMELINE_TYPE_CONFIG.Update;
                const formattedTime = formatTimelineTimestamp(story.pubTimestamp || story.pubDate);
                const subUpdates = story.timelineUpdates || getStoryIncidentTimeline(story);

                return (
                  <div
                    key={`${story.id}-${index}`}
                    onClick={() => onSelectStory(story)}
                    className="relative group cursor-pointer"
                  >
                    {/* Node on the spine: Circular Dot + Horizontal Connector into News Box */}
                    <div className="absolute -left-[30px] sm:-left-[34px] top-6 flex items-center pointer-events-none">
                      {/* Circular Glowing Marker Dot on the Spine */}
                      <div
                        className="h-4 w-4 rounded-full border-2 border-black transition-transform duration-150 group-hover:scale-125 shrink-0"
                        style={{
                          backgroundColor: meta.dotColor,
                          boxShadow: `0 0 10px ${meta.dotColor}`,
                        }}
                      />
                      {/* Horizontal connector line linking spine directly into news box */}
                      <div className="w-3.5 sm:w-4.5 h-[2px] bg-red-500/70" />
                    </div>

                    {/* Timestamp & Type Badge above the News Box */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wide border ${meta.badgeBg} ${meta.border} ${meta.textColor}`}
                      >
                        {updateType}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium">
                        {formattedTime}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        • {story.relativeTime || 'Just now'}
                      </span>
                      {story.isUltraFresh && (
                        <span className="rounded bg-emerald-500/20 border border-emerald-400/50 px-1.5 py-0.2 text-[9px] font-black text-emerald-300 animate-pulse">
                          ⚡ FRESH DISPATCH
                        </span>
                      )}
                    </div>

                    {/* ============================================================= */}
                    {/* THE EMBEDDED NEWS BOX ("[ news ]")                            */}
                    {/* ============================================================= */}
                    <div
                      className={`rounded-2xl border-2 transition-all duration-150 p-4 sm:p-5 bg-neutral-950/95 shadow-xl backdrop-blur-md ${
                        isSelected
                          ? 'border-white ring-2 ring-white/30 bg-neutral-900/95 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                          : 'border-white/10 hover:border-red-500/60 hover:bg-neutral-900/70 hover:shadow-[0_0_18px_rgba(239,68,68,0.25)]'
                      }`}
                    >
                      {/* Headline & Media Thumbnail Layout */}
                      <div className="flex gap-3.5">
                        <div className="flex-1 min-w-0">
                          {/* Conflict & Source metadata */}
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono mb-1">
                            <span className="text-red-400 font-bold uppercase">{story.conflict}</span>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{story.source}</span>
                          </div>

                          {/* Main News Headline */}
                          <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-3 group-hover:text-red-200 transition">
                            {story.title}
                          </h3>
                        </div>

                        {/* Image Thumbnail */}
                        {story.imageUrl && (
                          <div className="relative shrink-0 h-20 w-24 sm:h-24 sm:w-32 rounded-xl overflow-hidden border border-white/15 bg-neutral-900 shadow-sm">
                            <img
                              src={story.imageUrl}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                          </div>
                        )}
                      </div>

                      {/* Briefing summary paragraph */}
                      <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-3 font-normal selection:bg-red-900/60">
                        {story.summary || story.title}
                      </p>

                      {/* Tactical Military Tracking Chips inside News Card */}
                      {tracking && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2.5 text-[9.5px]">
                          {tracking.forces.map((f) => (
                            <span
                              key={f}
                              className="inline-flex items-center gap-1 rounded bg-blue-950/80 border border-blue-500/50 px-2 py-0.5 font-bold text-blue-200"
                            >
                              <Shield className="h-2.5 w-2.5 text-blue-400" />
                              <span>{f}</span>
                            </span>
                          ))}
                          {tracking.militias.map((m) => (
                            <span
                              key={m}
                              className="inline-flex items-center gap-1 rounded bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 font-bold text-emerald-200"
                            >
                              <Swords className="h-2.5 w-2.5 text-emerald-400" />
                              <span>{m}</span>
                            </span>
                          ))}
                          {mvMeta && (
                            <span
                              className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-bold ${mvMeta.bg} ${mvMeta.border} ${mvMeta.color}`}
                            >
                              <span>{mvMeta.icon}</span>
                              <span>{mvMeta.label}</span>
                            </span>
                          )}
                          {tracking.sector && (
                            <span className="text-[9px] text-neutral-400 font-mono ml-auto">
                              📍 {tracking.sector}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Sub-Incident Chronological Timeline inside Node */}
                      <div className="mt-3.5 border-t border-white/10 pt-2.5">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubTimeline(story.id);
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 hover:text-red-300 transition"
                          >
                            <Clock className="h-3 w-3" />
                            <span>Kronologi Insiden ({subUpdates.length} Tahap)</span>
                            {isSubExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyStoryTimeline(story);
                              }}
                              className="flex items-center gap-1 rounded bg-neutral-900 border border-white/15 px-2 py-0.5 text-[10px] text-neutral-300 hover:text-white transition"
                              title="Salin kronologi ini"
                            >
                              {copiedStoryId === story.id ? (
                                <>
                                  <Check className="h-2.5 w-2.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Disalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-2.5 w-2.5" />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Sub-Timeline Stages */}
                        {isSubExpanded && (
                          <div className="mt-2.5 pl-4 space-y-2 border-l border-red-500/40 text-xs animate-in fade-in duration-150">
                            {subUpdates.map((sub, sIdx) => (
                              <div key={sub.id || sIdx} className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold text-red-400 uppercase">
                                    [{sub.type}]
                                  </span>
                                  <span className="text-[10px] text-neutral-400">
                                    {sub.timestamp}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-300 leading-relaxed">
                                  {sub.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timeline Node Action Buttons */}
                      <div className="mt-3.5 flex items-center justify-between border-t border-white/10 pt-3 text-[10px]">
                        <div className="flex items-center gap-2">
                          {story.link && (
                            <a
                              href={story.link}
                              target="_blank"
                              rel="noreferrer noopener"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-neutral-400 hover:text-white transition"
                              title="Buka sumber asli di tab baru"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="hidden sm:inline">Sumber Asli</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenStoryDetail) onOpenStoryDetail(story);
                              else onSelectStory(story);
                            }}
                            className="flex items-center gap-1 rounded border border-white/20 bg-neutral-900 px-2.5 py-1 font-bold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
                          >
                            <span>📖 Detail</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onOpenEditorForStory) onOpenEditorForStory(story);
                              else onSelectStory(story);
                            }}
                            className="flex items-center gap-1 rounded bg-white px-3 py-1 font-black text-black hover:bg-neutral-200 transition shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                          >
                            <Layers className="h-3 w-3" />
                            <span>🎨 Studio 1080p</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Endless indicator at bottom of vertical spine */}
          {theaterStories.length > 0 && (
            <div className="relative mt-8 mb-4 pl-0 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-black/90 px-4 py-1.5 text-xs text-neutral-400 shadow-md">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span>End of monitored stream • {theaterStories.length} chronological reports logged (Endless feed)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarTheaterTimelineColumn;
