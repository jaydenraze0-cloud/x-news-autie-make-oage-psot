import React, { useState, useMemo } from 'react';
import { Search, Flame, ExternalLink, Sparkles, Clock, Globe, ChevronRight, Shield, Crown, Activity, Send, Zap, Crosshair, Radio, AlertCircle, RefreshCw, Image as ImageIcon, MapPin, Filter, X, Swords, Plane, Anchor } from 'lucide-react';
import { NewsStory, ConnectedTelegramGroup, TelegramTheater, LocationTag, IntelligenceType, OsintWarCategory, OSINT_WAR_CATEGORIES, OSINT_FIVE_PILLARS, OsintPillarType } from '../types';
import { ConflictSparkline } from './ConflictSparkline';
import { IncidentTimeline } from './IncidentTimeline';
import { WarTheaterTimelineColumn, WarTheaterId } from './WarTheaterTimelineColumn';
import {
  detectMilitaryTracking,
  MOVEMENT_TYPE_META,
} from '../utils/militaryTracker';
import { loadConnectedTelegramGroups } from '../utils/storage';
import {
  SENTIMENT_CATEGORY_META,
  THREAT_LEVEL_META,
  MSM_PENETRATION_META,
  analyzeStorySentiment,
} from '../utils/sentimentAnalyzer';
import { classifyOsintCategory, buildDefaultOsintData, detectOsintPillar } from '../utils/osintClassifier';

interface LiveFeedProps {
  stories: NewsStory[];
  newStoryIds: Set<string>;
  selectedStoryId: string | null;
  onSelectStory: (story: NewsStory) => void;
  isLoading: boolean;
  onOpenDataViz?: () => void;
  onOpenFeedManager?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  telegramGroups?: ConnectedTelegramGroup[];
  onUpdateTelegramGroups?: (groups: ConnectedTelegramGroup[]) => void;
  onDeleteTelegramGroup?: (group: ConnectedTelegramGroup) => void;
  onRestoreDefaultTelegramGroups?: () => void;
  onConnectCustomTelegramGroup?: (group: ConnectedTelegramGroup) => void;
  onOpenStoryDetail?: (story: NewsStory) => void;
  onOpenEditorForStory?: (story: NewsStory) => void;
  onOpenOsintManager?: (story: NewsStory) => void;
}

export const LOCATION_TAG_LIST: { id: LocationTag; label: string; flag: string; badgeClass: string; activeClass: string }[] = [
  { id: 'ALL', label: 'All Locations', flag: '🌍', badgeClass: 'border-white/20 text-white', activeClass: 'border-white bg-white text-black' },
  { id: 'Ukraine', label: 'Ukraine', flag: '🇺🇦', badgeClass: 'border-yellow-400/40 text-yellow-300 bg-yellow-950/30', activeClass: 'border-yellow-400 bg-yellow-400 text-black font-extrabold shadow-[0_0_10px_rgba(250,204,21,0.6)]' },
  { id: 'Russia', label: 'Russia', flag: '🇷🇺', badgeClass: 'border-red-500/40 text-red-300 bg-red-950/30', activeClass: 'border-red-500 bg-red-500 text-white font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.6)]' },
  { id: 'Middle East', label: 'Middle East', flag: '🇮🇱🇵🇸', badgeClass: 'border-emerald-400/40 text-emerald-300 bg-emerald-950/30', activeClass: 'border-emerald-400 bg-emerald-400 text-black font-extrabold shadow-[0_0_10px_rgba(52,211,153,0.6)]' },
  { id: 'Red Sea & Yemen', label: 'Red Sea & Yemen', flag: '🇾🇪⚓', badgeClass: 'border-cyan-400/40 text-cyan-300 bg-cyan-950/30', activeClass: 'border-cyan-400 bg-cyan-400 text-black font-extrabold shadow-[0_0_10px_rgba(34,211,238,0.6)]' },
  { id: 'Asia-Pacific', label: 'Asia-Pacific', flag: '🌏', badgeClass: 'border-blue-400/40 text-blue-300 bg-blue-950/30', activeClass: 'border-blue-400 bg-blue-400 text-black font-extrabold shadow-[0_0_10px_rgba(96,165,250,0.6)]' },
  { id: 'Global / NATO', label: 'Global / NATO', flag: '🌐', badgeClass: 'border-purple-400/40 text-purple-300 bg-purple-950/30', activeClass: 'border-purple-400 bg-purple-400 text-white font-extrabold shadow-[0_0_10px_rgba(192,132,252,0.6)]' },
];

export const INTEL_TYPE_LIST: { id: IntelligenceType; label: string; icon: string; badgeClass: string; activeClass: string }[] = [
  { id: 'ALL', label: 'All Intel', icon: '📡', badgeClass: 'border-white/20 text-white', activeClass: 'border-white bg-white text-black' },
  { id: 'Kinetic Strike', label: 'Kinetic Strike', icon: '🎯', badgeClass: 'border-red-500/40 text-red-300 bg-red-950/30', activeClass: 'border-red-500 bg-red-500 text-white font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.6)]' },
  { id: 'Air Defense & SIGINT', label: 'Air Defense & SIGINT', icon: '🛡️', badgeClass: 'border-sky-400/40 text-sky-300 bg-sky-950/30', activeClass: 'border-sky-400 bg-sky-400 text-black font-extrabold shadow-[0_0_10px_rgba(56,189,248,0.6)]' },
  { id: 'OSINT & Imagery', label: 'OSINT & Imagery', icon: '🛰️', badgeClass: 'border-purple-400/40 text-purple-300 bg-purple-950/30', activeClass: 'border-purple-400 bg-purple-400 text-white font-extrabold shadow-[0_0_10px_rgba(192,132,252,0.6)]' },
  { id: 'Drone / UAV Recon', label: 'Drone / UAV Recon', icon: '📡', badgeClass: 'border-amber-400/40 text-amber-300 bg-amber-950/30', activeClass: 'border-amber-400 bg-amber-400 text-black font-extrabold shadow-[0_0_10px_rgba(251,191,36,0.6)]' },
  { id: 'Frontline Assault', label: 'Frontline Assault', icon: '⚔️', badgeClass: 'border-orange-500/40 text-orange-300 bg-orange-950/30', activeClass: 'border-orange-500 bg-orange-500 text-white font-extrabold shadow-[0_0_10px_rgba(249,115,22,0.6)]' },
  { id: 'Naval & Maritime', label: 'Naval & Maritime', icon: '⚓', badgeClass: 'border-cyan-400/40 text-cyan-300 bg-cyan-950/30', activeClass: 'border-cyan-400 bg-cyan-400 text-black font-extrabold shadow-[0_0_10px_rgba(34,211,238,0.6)]' },
  { id: 'Strategic & Geopolitics', label: 'Strategic & Geopolitics', icon: '🌐', badgeClass: 'border-emerald-400/40 text-emerald-300 bg-emerald-950/30', activeClass: 'border-emerald-400 bg-emerald-400 text-black font-extrabold shadow-[0_0_10px_rgba(52,211,153,0.6)]' },
  { id: 'Cyber & EW', label: 'Cyber & EW', icon: '💻', badgeClass: 'border-indigo-400/40 text-indigo-300 bg-indigo-950/30', activeClass: 'border-indigo-400 bg-indigo-400 text-white font-extrabold shadow-[0_0_10px_rgba(129,140,248,0.6)]' },
];

export function resolveLocationTag(story: NewsStory): LocationTag {
  if (story.locationTag && story.locationTag !== 'ALL') return story.locationTag;
  const text = `${story.title} ${story.summary} ${story.source} ${story.conflict}`.toLowerCase();

  if (
    text.includes('belgorod') || text.includes('kursk region') || text.includes('kursk oblast') ||
    text.includes('engels') || text.includes('bryansk') || text.includes('voronezh') ||
    text.includes('rostov') || text.includes('ryazan') || text.includes('moscow') ||
    text.includes('белгород') || text.includes('брянск') || text.includes('воронеж') ||
    text.includes('москв') || text.includes('минобороны рф')
  ) {
    return 'Russia';
  }

  if (
    story.conflict === 'Russia-Ukraine' || story.telegramTheater === 'UKRAINIAN' ||
    text.includes('ukraine') || text.includes('kyiv') || text.includes('kharkiv') ||
    text.includes('pokrovsk') || text.includes('donbas') || text.includes('zaporizhzhia') ||
    text.includes('kherson') || text.includes('chasiv yar') || text.includes('zsu') ||
    text.includes('укра') || text.includes('зсу')
  ) {
    return 'Ukraine';
  }

  if (
    story.conflict === 'Bab al-Mandeb / Red Sea' || story.conflict === 'Yemen / Red Sea' ||
    text.includes('yemen') || text.includes('houthi') || text.includes('ansarallah') ||
    text.includes('bab al-mandeb') || text.includes('red sea') || text.includes('aden') ||
    text.includes('ukmto') || text.includes('اليمن') || text.includes('الحوثي')
  ) {
    return 'Red Sea & Yemen';
  }

  if (
    story.conflict === 'Israel-Gaza' || story.conflict === 'Lebanon / Hezbollah' ||
    story.conflict === 'Israel-Iran / Iran' || story.conflict === 'Syria' ||
    text.includes('gaza') || text.includes('israel') || text.includes('lebanon') ||
    text.includes('beirut') || text.includes('hezbollah') || text.includes('idf') ||
    text.includes('hamas') || text.includes('iran') || text.includes('tehran') ||
    text.includes('syria') || text.includes('damascus') || text.includes('غزة') ||
    text.includes('لبنان') || text.includes('حزب الله')
  ) {
    return 'Middle East';
  }

  if (
    story.conflict === 'China-Taiwan' || story.conflict === 'North Korea' || story.conflict === 'Myanmar' ||
    text.includes('taiwan') || text.includes('taipei') || text.includes('south china sea') ||
    text.includes('north korea') || text.includes('pyongyang') || text.includes('kim jong') ||
    text.includes('myanmar') || text.includes('pla')
  ) {
    return 'Asia-Pacific';
  }

  return 'Global / NATO';
}

export function resolveIntelligenceType(story: NewsStory): IntelligenceType {
  if (story.intelligenceType && story.intelligenceType !== 'ALL') return story.intelligenceType;
  const text = `${story.title} ${story.summary} ${story.eventType}`.toLowerCase();

  if (text.includes('electronic warfare') || text.includes('cyber') || text.includes('jamming') || text.includes('c4isr') || text.includes('рэб')) {
    return 'Cyber & EW';
  }
  if (story.eventType === 'DRONE' || text.includes('drone') || text.includes('uav') || text.includes('shahed') || text.includes('fpv') || text.includes('дрон') || text.includes('مسيرة')) {
    return 'Drone / UAV Recon';
  }
  if (story.eventType === 'AIR DEFENSE' || text.includes('air defense') || text.includes('intercept') || text.includes('patriot') || text.includes('iron dome') || text.includes('s-400') || text.includes('s-300') || text.includes('ппо') || text.includes('пво') || text.includes('دفاع جوي')) {
    return 'Air Defense & SIGINT';
  }
  if (story.eventType === 'NAVAL' || text.includes('naval') || text.includes('warship') || text.includes('destroyer') || text.includes('frigate') || text.includes('vessel') || text.includes('ukmto') || text.includes('anti-ship')) {
    return 'Naval & Maritime';
  }
  if (['MISSILE', 'AIRSTRIKE', 'SHELLING'].includes(story.eventType) || text.includes('missile') || text.includes('airstrike') || text.includes('bomb') || text.includes('shelling') || text.includes('artillery') || text.includes('atacms') || text.includes('iskander')) {
    return 'Kinetic Strike';
  }
  if (story.eventType === 'OFFENSIVE' || text.includes('infantry') || text.includes('ground offensive') || text.includes('assault') || text.includes('trench') || text.includes('tanks') || text.includes('incursion') || text.includes('frontline')) {
    return 'Frontline Assault';
  }
  if (['NUCLEAR', 'SANCTIONS', 'DIPLOMACY', 'CEASEFIRE'].includes(story.eventType) || text.includes('summit') || text.includes('treaty') || text.includes('nuclear') || text.includes('sanction') || text.includes('diploma') || text.includes('ceasefire')) {
    return 'Strategic & Geopolitics';
  }
  if (story.isOsint || story.isTelegram || text.includes('satellite') || text.includes('imagery') || text.includes('osint') || text.includes('bellingcat') || text.includes('deepstate') || text.includes('liveuamap')) {
    return 'OSINT & Imagery';
  }

  return 'Kinetic Strike';
}

const CONFLICT_FILTERS = [
  'ALL',
  'Bab al-Mandeb / Red Sea',
  'Russia-Ukraine',
  'Israel-Gaza',
  'Lebanon / Hezbollah',
  'Israel-Iran / Iran',
  'War Geopolitics',
  'Syria',
  'Sudan',
  'Myanmar',
  'China-Taiwan',
  'North Korea',
  'Global Conflicts',
];

const KEY_WAR_LEADERS = [
  'ALL',
  'Houthis / Red Sea',
  'ZSU / General Staff',
  'Zelensky',
  'Trump',
  'Putin',
  'Netanyahu',
  'Kim Jong Un',
  'Xi Jinping',
  'Khamenei / Iran',
  'US / Biden',
  'NATO',
];

const EVENT_FILTERS = [
  'ALL',
  'AIRSTRIKE',
  'MISSILE',
  'DRONE',
  'OFFENSIVE',
  'SHELLING',
  'AIR DEFENSE',
  'NAVAL',
  'CEASEFIRE',
  'NUCLEAR',
  'SANCTIONS',
  'DIPLOMACY',
];

type TimeFilter = 'all' | '30m' | '1h' | '6h' | '24h';
type MacroFilter =
  | 'ALL'
  | 'OSINT_ONLY'
  | 'TIMELINE_TRACKER'
  | 'UNDER_THE_RADAR'
  | 'CRITICAL_ESCALATION'
  | 'X_TWITTER'
  | 'ATTACKS'
  | 'TELEGRAM_OSINT'
  | 'GEOPOLITICS'
  | 'BREAKING';

export const LiveFeed: React.FC<LiveFeedProps> = ({
  stories,
  newStoryIds,
  selectedStoryId,
  onSelectStory,
  isLoading,
  onOpenDataViz,
  onOpenFeedManager,
  onRefresh,
  isRefreshing = false,
  telegramGroups: externalTelegramGroups,
  onUpdateTelegramGroups: externalOnUpdateTelegramGroups,
  onDeleteTelegramGroup,
  onRestoreDefaultTelegramGroups,
  onConnectCustomTelegramGroup,
  onOpenStoryDetail,
  onOpenEditorForStory,
  onOpenOsintManager,
}) => {
  const [internalTelegramGroups, setInternalTelegramGroups] = useState<ConnectedTelegramGroup[]>(() =>
    loadConnectedTelegramGroups()
  );
  const telegramGroups = externalTelegramGroups || internalTelegramGroups;
  const onUpdateTelegramGroups = externalOnUpdateTelegramGroups || setInternalTelegramGroups;

  const [macroFilter, setMacroFilter] = useState<MacroFilter>('ALL');
  const [selectedOsintCategory, setSelectedOsintCategory] = useState<'ALL' | OsintWarCategory>('ALL');
  const [selectedOsintPillar, setSelectedOsintPillar] = useState<'ALL' | OsintPillarType>('ALL');
  const [isOsintOnlyMode, setIsOsintOnlyMode] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationTag>('ALL');
  const [selectedIntelType, setSelectedIntelType] = useState<IntelligenceType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [wireSearchResults, setWireSearchResults] = useState<NewsStory[] | null>(null);
  const [isSearchingWires, setIsSearchingWires] = useState(false);
  const [activeWireQuery, setActiveWireQuery] = useState('');
  const [selectedTheater, setSelectedTheater] = useState<'ALL' | TelegramTheater>('ALL');
  const [selectedGroupHandle, setSelectedGroupHandle] = useState<string | null>(null);
  const [selectedLeader, setSelectedLeader] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [expandedTimelineStoryIds, setExpandedTimelineStoryIds] = useState<Set<string>>(new Set());
  const [feedViewMode, setFeedViewMode] = useState<'cards' | 'timeline_column'>('timeline_column');
  const [activeTheaterForTimeline, setActiveTheaterForTimeline] = useState<WarTheaterId>('UKRAINE_RUSSIA');

  const toggleTimelineStory = (storyId: string) => {
    setExpandedTimelineStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  };

  const getRelativeTime = (isoString: string): string => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return `${Math.max(1, diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleLiveWireSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearchingWires(true);
    setActiveWireQuery(searchQuery.trim());
    try {
      const res = await fetch(`/api/search-wires?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.stories)) {
        setWireSearchResults(data.stories);
      }
    } catch (err) {
      console.debug('Wire search note:', err);
    } finally {
      setIsSearchingWires(false);
    }
  };

  const handleRunWireSearch = async (term: string) => {
    setIsSearchingWires(true);
    setActiveWireQuery(term);
    setSearchQuery(term);
    try {
      const res = await fetch(`/api/search-wires?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.stories)) {
        setWireSearchResults(data.stories);
      }
    } catch (err) {
      console.debug('Wire search note:', err);
    } finally {
      setIsSearchingWires(false);
    }
  };

  const handleClearWireSearch = () => {
    setWireSearchResults(null);
    setActiveWireQuery('');
    setSearchQuery('');
  };

  const activePool = wireSearchResults || stories;

  // Groupings for fast counts and special tickers
  const attackStories = useMemo(() => {
    return activePool.filter(
      (s) =>
        s.isNewAttack ||
        ['AIRSTRIKE', 'MISSILE', 'DRONE', 'SHELLING', 'OFFENSIVE', 'NAVAL'].includes(s.eventType)
    );
  }, [activePool]);

  const geopoliticsStories = useMemo(() => {
    return activePool.filter(
      (s) =>
        s.isGeopolitics ||
        s.conflict === 'War Geopolitics' ||
        (s.leaders && s.leaders.length > 0) ||
        ['NUCLEAR', 'SANCTIONS', 'DIPLOMACY'].includes(s.eventType)
    );
  }, [activePool]);

  const breakingStories = useMemo(() => {
    return activePool.filter((s) => s.isBreaking);
  }, [activePool]);

  const osintStories = useMemo(() => {
    return activePool.filter(
      (s) =>
        s.isTelegram ||
        s.isOsint ||
        Boolean(s.telegramHandle) ||
        /telegram|osint|bellingcat|deepstate|liveuamap|kpszsu|operativnozsu|milinfolive|ansarallah|almayadeen|qudsn|wartranslated|rybar|geoconfirmed|ukmto|isw|naval\s?news/i.test(
          s.source
        ) ||
        /t\.me|bellingcat|geoconfirmed|liveuamap|understandingwar/i.test(s.link)
    );
  }, [activePool]);

  const xStories = useMemo(() => {
    return activePool.filter(
      (s) =>
        s.isX ||
        Boolean(s.xHandle) ||
        s.source?.toLowerCase().includes('x @') ||
        s.link?.includes('x.com/') ||
        s.link?.includes('twitter.com/')
    );
  }, [activePool]);

  // Under-the-radar / non-mainstream OSINT reports
  const underTheRadarStories = useMemo(() => {
    return activePool.filter(
      (s) =>
        s.isUnderTheRadar ||
        s.isTelegram ||
        s.isOsint ||
        s.sentiment?.msmPenetration === 'UNDER_THE_RADAR' ||
        s.sentiment?.msmPenetration === 'EARLY_FIELD_SIGNAL' ||
        !/reuters|apnews|bbc|cnn|aljazeera|nytimes|wsj|washingtonpost/i.test(s.source || '')
    );
  }, [activePool]);

  // Critical escalation & extreme threat alerts
  const criticalEscalationStories = useMemo(() => {
    return activePool.filter(
      (s) =>
        s.sentiment?.category === 'CRITICAL_ESCALATION' ||
        s.sentiment?.threatLevel === 'EXTREME' ||
        (s.sentiment?.threatScore || 0) >= 75
    );
  }, [activePool]);

  // Compute story counts per Telegram theater and handle for the integration module
  const telegramStoryCounts = useMemo(() => {
    const byTheater: Record<string, number> = {
      UKRAINIAN: 0,
      RUSSIAN: 0,
      ARABIC: 0,
      GLOBAL: 0,
    };
    const byHandle: Record<string, number> = {};
    let totalTelegram = 0;

    activePool.forEach((s) => {
      const isTg =
        Boolean(s.isTelegram) ||
        Boolean(s.telegramHandle) ||
        s.source.toLowerCase().includes('telegram') ||
        s.link.includes('t.me/');

      if (isTg) {
        totalTelegram++;
      }

      // Track by handle
      if (s.telegramHandle) {
        const h = s.telegramHandle.toLowerCase();
        byHandle[h] = (byHandle[h] || 0) + 1;
      } else {
        const match = s.source.match(/@([a-zA-Z0-9_]+)/);
        if (match && match[1]) {
          const h = match[1].toLowerCase();
          byHandle[h] = (byHandle[h] || 0) + 1;
        }
      }

      // Track by theater
      if (s.telegramTheater) {
        byTheater[s.telegramTheater] = (byTheater[s.telegramTheater] || 0) + 1;
      } else {
        const text = `${s.source} ${s.title} ${s.summary}`.toLowerCase();
        if (/kpszsu|operativno|deepstate|mysiagin|zsu|ukraine|укра|зсу/.test(text)) {
          byTheater.UKRAINIAN = (byTheater.UKRAINIAN || 0) + 1;
        } else if (/milinfolive|rybar|rozhin|dva_majors|осведомитель|рыбарь/.test(text)) {
          byTheater.RUSSIAN = (byTheater.RUSSIAN || 0) + 1;
        } else if (/ansarallah|almayadeen|qudsn|c_military|houthi|yemen|حوثي|ميادين/.test(text)) {
          byTheater.ARABIC = (byTheater.ARABIC || 0) + 1;
        } else if (/liveuamap|wartranslated|bellingcat|ukmto/.test(text)) {
          byTheater.GLOBAL = (byTheater.GLOBAL || 0) + 1;
        }
      }
    });

    return { byTheater, byHandle, totalTelegram };
  }, [activePool]);

  const latestAttack = useMemo(() => {
    return attackStories[0] || null;
  }, [attackStories]);

  // Compute leader story counts
  const leaderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activePool.forEach((s) => {
      if (s.leaders && Array.isArray(s.leaders)) {
        s.leaders.forEach((l) => {
          counts[l] = (counts[l] || 0) + 1;
        });
      }
    });
    return counts;
  }, [activePool]);

  // Compute story counts per Location Tag
  const locationCounts = useMemo(() => {
    const counts: Record<LocationTag, number> = {
      ALL: activePool.length,
      Ukraine: 0,
      Russia: 0,
      'Middle East': 0,
      'Red Sea & Yemen': 0,
      'Asia-Pacific': 0,
      'Global / NATO': 0,
    };
    activePool.forEach((s) => {
      const loc = resolveLocationTag(s);
      if (counts[loc] !== undefined) {
        counts[loc]++;
      }
    });
    return counts;
  }, [activePool]);

  // Compute story counts per Intelligence Type
  const intelTypeCounts = useMemo(() => {
    const counts: Record<IntelligenceType, number> = {
      ALL: activePool.length,
      'Kinetic Strike': 0,
      'Air Defense & SIGINT': 0,
      'OSINT & Imagery': 0,
      'Drone / UAV Recon': 0,
      'Frontline Assault': 0,
      'Naval & Maritime': 0,
      'Strategic & Geopolitics': 0,
      'Cyber & EW': 0,
    };
    activePool.forEach((s) => {
      const it = resolveIntelligenceType(s);
      if (counts[it] !== undefined) {
        counts[it]++;
      }
    });
    return counts;
  }, [activePool]);

  // Compute story counts per OSINT War Category (8 Primary Categories)
  const osintCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    OSINT_WAR_CATEGORIES.forEach((c) => {
      counts[c.id] = 0;
    });

    activePool.forEach((s) => {
      const isOsint =
        s.isOsint ||
        Boolean(s.osintData) ||
        s.isTelegram ||
        Boolean(s.telegramHandle) ||
        /telegram|osint|bellingcat|deepstate|liveuamap|kpszsu|operativnozsu|milinfolive|ansarallah|almayadeen|qudsn|wartranslated|rybar|geoconfirmed|ukmto|isw|naval\s?news|militarnyi|defence\s?ua/i.test(
          s.source
        ) ||
        /t\.me|bellingcat|geoconfirmed|liveuamap|understandingwar|mil\.in\.ua/i.test(s.link);

      if (isOsint) {
        counts.ALL++;
        const cat = s.osintData?.category || classifyOsintCategory(s);
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      }
    });

    return counts;
  }, [activePool]);

  // Compute story counts per 5 Core OSINT Pillars
  const osintPillarCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: activePool.length };
    OSINT_FIVE_PILLARS.forEach((p) => {
      counts[p.id] = 0;
    });

    activePool.forEach((s) => {
      const p = s.osintPillar || detectOsintPillar(s);
      if (counts[p] !== undefined) {
        counts[p]++;
      }
    });

    return counts;
  }, [activePool]);

  const filteredStories = useMemo(() => {
    const now = Date.now();
    const filtered = activePool.filter((story) => {
      // 5 Core OSINT Pillars Filter
      if (selectedOsintPillar !== 'ALL') {
        const pillar = story.osintPillar || detectOsintPillar(story);
        if (pillar !== selectedOsintPillar) return false;
      }

      // Macro Filter: OSINT ONLY
      if (macroFilter === 'OSINT_ONLY' || isOsintOnlyMode) {
        const isOsint =
          story.isOsint ||
          Boolean(story.osintData) ||
          story.isTelegram ||
          Boolean(story.telegramHandle) ||
          /telegram|osint|bellingcat|deepstate|liveuamap|kpszsu|operativnozsu|milinfolive|ansarallah|almayadeen|qudsn|wartranslated|rybar|geoconfirmed|ukmto|isw|naval\s?news|militarnyi|defence\s?ua/i.test(
            story.source
          ) ||
          /t\.me|bellingcat|geoconfirmed|liveuamap|understandingwar|mil\.in\.ua/i.test(story.link);
        if (!isOsint) return false;
      }

      // Specific OSINT War Category Filter (from 8 official categories)
      if (selectedOsintCategory !== 'ALL') {
        const cat = story.osintData?.category || classifyOsintCategory(story);
        if (cat !== selectedOsintCategory) return false;
      }

      // Macro Filter
      if (macroFilter === 'TIMELINE_TRACKER') {
        const hasUpdates = Boolean((story.timelineUpdates && story.timelineUpdates.length > 0) || story.isBreaking || story.isNewAttack);
        if (!hasUpdates) return false;
      } else if (macroFilter === 'UNDER_THE_RADAR') {
        const isUtR =
          story.isUnderTheRadar ||
          story.isTelegram ||
          story.isOsint ||
          story.sentiment?.msmPenetration === 'UNDER_THE_RADAR' ||
          story.sentiment?.msmPenetration === 'EARLY_FIELD_SIGNAL' ||
          !/reuters|apnews|bbc|cnn|aljazeera|nytimes|wsj|washingtonpost/i.test(story.source || '');
        if (!isUtR) return false;
      } else if (macroFilter === 'CRITICAL_ESCALATION') {
        const isCrit =
          story.sentiment?.category === 'CRITICAL_ESCALATION' ||
          story.sentiment?.threatLevel === 'EXTREME' ||
          (story.sentiment?.threatScore || 0) >= 75;
        if (!isCrit) return false;
      } else if (macroFilter === 'X_TWITTER') {
        const isX =
          story.isX ||
          story.isXTwitter ||
          Boolean(story.xHandle) ||
          story.source?.toLowerCase().includes('x @') ||
          story.link?.includes('x.com/') ||
          story.link?.includes('twitter.com/');
        if (!isX) return false;
      } else if (macroFilter === 'ATTACKS') {
        const isAttack =
          story.isNewAttack ||
          ['AIRSTRIKE', 'MISSILE', 'DRONE', 'SHELLING', 'OFFENSIVE', 'NAVAL'].includes(story.eventType);
        if (!isAttack) return false;
      } else if (macroFilter === 'TELEGRAM_OSINT') {
        const isTgOrOsint =
          story.isTelegram ||
          story.isOsint ||
          Boolean(story.telegramHandle) ||
          /telegram|osint|bellingcat|deepstate|liveuamap|kpszsu|operativnozsu|milinfolive|ansarallah|almayadeen|qudsn|wartranslated|rybar|geoconfirmed|ukmto|isw|naval\s?news/i.test(
            story.source
          ) ||
          /t\.me|bellingcat|geoconfirmed|liveuamap|understandingwar/i.test(story.link);
        if (!isTgOrOsint) return false;
      } else if (macroFilter === 'GEOPOLITICS') {
        const isGeo =
          story.isGeopolitics ||
          story.conflict === 'War Geopolitics' ||
          (story.leaders && story.leaders.length > 0) ||
          ['NUCLEAR', 'SANCTIONS', 'DIPLOMACY'].includes(story.eventType);
        if (!isGeo) return false;
      } else if (macroFilter === 'BREAKING') {
        if (!story.isBreaking) return false;
      }

      // Location Tag Filter (Ukraine, Russia, Middle East, Red Sea & Yemen, etc.)
      if (selectedLocation !== 'ALL') {
        const storyLoc = resolveLocationTag(story);
        if (storyLoc !== selectedLocation) return false;
      }

      // Intelligence Type Filter (Kinetic Strike, Air Defense, OSINT, Drone, etc.)
      if (selectedIntelType !== 'ALL') {
        const storyIntel = resolveIntelligenceType(story);
        if (storyIntel !== selectedIntelType) return false;
      }

      // Real-Time Search Query Filter
      if (searchQuery.trim() && !wireSearchResults) {
        const query = searchQuery.toLowerCase();
        const storyLoc = resolveLocationTag(story).toLowerCase();
        const storyIntel = resolveIntelligenceType(story).toLowerCase();
        const storyOsintCat = (story.osintData?.category || classifyOsintCategory(story)).toLowerCase();
        const matches =
          story.title.toLowerCase().includes(query) ||
          story.summary.toLowerCase().includes(query) ||
          story.source.toLowerCase().includes(query) ||
          story.conflict.toLowerCase().includes(query) ||
          story.eventType.toLowerCase().includes(query) ||
          storyLoc.includes(query) ||
          storyIntel.includes(query) ||
          storyOsintCat.includes(query) ||
          (story.osintData?.coordinates && story.osintData.coordinates.toLowerCase().includes(query)) ||
          (story.osintData?.locationName && story.osintData.locationName.toLowerCase().includes(query)) ||
          (story.osintData?.equipmentIdentified && story.osintData.equipmentIdentified.some((e) => e.toLowerCase().includes(query))) ||
          (story.telegramHandle && story.telegramHandle.toLowerCase().includes(query)) ||
          (story.leaders && story.leaders.some((l) => l.toLowerCase().includes(query)));
        if (!matches) return false;
      }

      if (selectedLeader !== 'ALL') {
        if (!story.leaders || !story.leaders.some((l) => l.toLowerCase().includes(selectedLeader.toLowerCase()))) {
          return false;
        }
      }

      // Telegram Group & Theater Integration Filter (Replaces legacy static conflict reporting)
      if (selectedGroupHandle) {
        const cleanTarget = selectedGroupHandle.toLowerCase();
        const matchesHandle =
          (story.telegramHandle && story.telegramHandle.toLowerCase() === cleanTarget) ||
          story.source.toLowerCase().includes(cleanTarget) ||
          story.link.toLowerCase().includes(cleanTarget) ||
          story.title.toLowerCase().includes(`@${cleanTarget}`) ||
          story.summary.toLowerCase().includes(`@${cleanTarget}`);
        if (!matchesHandle) return false;
      } else if (selectedTheater !== 'ALL') {
        if (selectedTheater === 'UKRAINIAN') {
          const isUkr =
            story.telegramTheater === 'UKRAINIAN' ||
            story.conflict === 'Russia-Ukraine' ||
            /zsu|kpszsu|operativno|deepstate|mysiagin|frontelligence|general\s?staff|укра|зсу|повітрян/i.test(
              `${story.source} ${story.title} ${story.summary}`
            );
          if (!isUkr) return false;
        } else if (selectedTheater === 'RUSSIAN') {
          const isRus =
            story.telegramTheater === 'RUSSIAN' ||
            /milinfolive|rybar|rozhin|colonelcassad|dva_majors|осведомитель|рыбарь|минобороны/i.test(
              `${story.source} ${story.title} ${story.summary}`
            );
          if (!isRus) return false;
        } else if (selectedTheater === 'ARABIC') {
          const isAra =
            story.telegramTheater === 'ARABIC' ||
            story.conflict === 'Bab al-Mandeb / Red Sea' ||
            story.conflict === 'Israel-Gaza' ||
            story.conflict === 'Lebanon / Hezbollah' ||
            story.conflict === 'Yemen / Red Sea' ||
            /ansarallah|almayadeen|qudsn|c_military|houthi|yemen|bab al-mandeb|red sea|حوثي|قسام|ميادين/i.test(
              `${story.source} ${story.title} ${story.summary}`
            );
          if (!isAra) return false;
        } else if (selectedTheater === 'GLOBAL') {
          const isGlobal =
            story.telegramTheater === 'GLOBAL' ||
            story.isTelegram ||
            story.isOsint ||
            /liveuamap|wartranslated|bellingcat|ukmto|isw|geoconfirmed/i.test(
              `${story.source} ${story.title} ${story.summary}`
            );
          if (!isGlobal) return false;
        }
      }

      if (selectedEvent !== 'ALL' && story.eventType !== selectedEvent) {
        return false;
      }
      if (timeFilter !== 'all') {
        const storyTime = new Date(story.pubDate).getTime();
        const diffHours = (now - storyTime) / (1000 * 60 * 60);
        if (timeFilter === '30m' && diffHours > 0.5) return false;
        if (timeFilter === '1h' && diffHours > 1) return false;
        if (timeFilter === '6h' && diffHours > 6) return false;
        if (timeFilter === '24h' && diffHours > 24) return false;
      }
      return true;
    });

    // STRICT CHRONOLOGICAL SORTING: Berita paling baru di-upload selalu di paling atas!
    return [...filtered].sort((a, b) => {
      const timeA = a.pubTimestamp || new Date(a.pubDate).getTime() || 0;
      const timeB = b.pubTimestamp || new Date(b.pubDate).getTime() || 0;
      return timeB - timeA;
    });
  }, [
    activePool,
    macroFilter,
    selectedLocation,
    selectedIntelType,
    searchQuery,
    wireSearchResults,
    selectedTheater,
    selectedGroupHandle,
    selectedLeader,
    selectedEvent,
    timeFilter,
  ]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedLocation !== 'ALL') count++;
    if (selectedIntelType !== 'ALL') count++;
    if (selectedLeader !== 'ALL') count++;
    if (selectedEvent !== 'ALL') count++;
    if (selectedTheater !== 'ALL') count++;
    if (selectedGroupHandle) count++;
    if (timeFilter !== 'all') count++;
    if (macroFilter !== 'ALL') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [
    selectedLocation,
    selectedIntelType,
    selectedLeader,
    selectedEvent,
    selectedTheater,
    selectedGroupHandle,
    timeFilter,
    macroFilter,
    searchQuery,
  ]);

  const handleResetAllFilters = () => {
    setSelectedLocation('ALL');
    setSelectedIntelType('ALL');
    setSelectedOsintCategory('ALL');
    setIsOsintOnlyMode(false);
    setSearchQuery('');
    setSelectedLeader('ALL');
    setSelectedEvent('ALL');
    setSelectedGroupHandle(null);
    setSelectedTheater('ALL');
    setMacroFilter('ALL');
    setTimeFilter('all');
    handleClearWireSearch();
  };

  return (
    <div className="flex h-full flex-col border-r border-white/10 bg-black">
      {/* 1. Header Bar: Title, Count, Refresh, and Shortcuts */}
      <div className="border-b border-white/10 p-3 sm:p-3.5 space-y-2 bg-black shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <h2 className="text-sm font-extrabold tracking-wider text-white">INTELLIGENCE RADAR</h2>
            <span className="rounded bg-neutral-900 border border-white/20 px-2 py-0.5 text-[11px] font-mono font-bold text-white">
              {filteredStories.length} stories
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle: Timeline Column vs Card Mode */}
            <div className="flex items-center rounded-lg border border-white/20 bg-neutral-950 p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setFeedViewMode('timeline_column')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 transition ${
                  feedViewMode === 'timeline_column'
                    ? 'bg-red-600 text-white shadow-sm font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Open War Timeline Column with chronological event tracking"
              >
                <Clock className="h-3 w-3 text-red-300" />
                <span>⏱️ Timeline Column</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedViewMode('cards')}
                className={`flex items-center gap-1 rounded-md px-2 py-1 transition ${
                  feedViewMode === 'cards'
                    ? 'bg-white text-black shadow-sm font-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Display Standard Card Mode"
              >
                <span>📰 Cards</span>
              </button>
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-[11px] font-bold text-black transition hover:bg-neutral-200 disabled:opacity-50 shadow-sm"
                title="Scan latest intel wires now"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Scanning...' : 'Scan'}</span>
              </button>
            )}

            {onOpenDataViz && (
              <button
                onClick={onOpenDataViz}
                title="24H Conflict Trends"
                className="flex items-center gap-1 rounded bg-amber-400/10 border border-amber-400/40 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-400/20 transition"
              >
                <Activity className="h-3 w-3 text-amber-400" />
                <span className="hidden sm:inline">Trends</span>
              </button>
            )}

            {onOpenFeedManager && (
              <button
                onClick={onOpenFeedManager}
                title="Manage Feeds & Intel Sources"
                className="flex items-center gap-1 rounded bg-neutral-900 border border-white/20 px-2 py-1 text-[11px] font-bold text-neutral-300 hover:text-white transition"
              >
                <Send className="h-3 w-3 transform -rotate-12" />
                <span className="hidden sm:inline">Sources</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Quick Search Input */}
        <form onSubmit={handleLiveWireSearch} className="relative flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search intel: Ukraine, Houthis, Gaza, Missiles, B-2, F-35, Red Sea..."
              className="w-full rounded-md border border-white/20 bg-neutral-950 py-1.5 pl-8 pr-16 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearWireSearch}
                className="absolute right-2 top-2 text-[11px] text-neutral-400 hover:text-white font-bold px-1"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearchingWires || !searchQuery.trim()}
            className="flex items-center gap-1 rounded-md border border-white/20 bg-neutral-900 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-neutral-800 disabled:opacity-40 shrink-0"
          >
            {isSearchingWires ? <Activity className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3" />}
            <span className="hidden sm:inline">Scan Web</span>
          </button>
        </form>

        {/* 3. Category Tabs (Segmented Buttons with 24H Sparkline Charts) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <button
            onClick={() => {
              setMacroFilter('ALL');
              setFeedViewMode('cards');
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              macroFilter === 'ALL' && feedViewMode === 'cards'
                ? 'bg-white text-black shadow-sm font-extrabold'
                : 'bg-neutral-950 border border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            <span>All Fronts</span>
            <span className="text-[10px] opacity-75 font-mono">({stories.length})</span>
            <ConflictSparkline
              stories={activePool}
              label="All Fronts"
              width={28}
              height={11}
              color={macroFilter === 'ALL' && feedViewMode === 'cards' ? '#000000' : '#38bdf8'}
              variant="tab"
            />
          </button>

          {/* DEDICATED OSINT WAR NEWS TAB */}
          <button
            onClick={() => {
              setMacroFilter('OSINT_ONLY');
              setIsOsintOnlyMode(true);
              setFeedViewMode('cards');
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              (macroFilter === 'OSINT_ONLY' || isOsintOnlyMode) && feedViewMode === 'cards'
                ? 'bg-purple-600 text-white font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.7)] ring-1 ring-purple-300'
                : 'bg-neutral-950 border border-purple-500/50 text-purple-300 hover:bg-purple-950/40'
            }`}
            title="Filter military OSINT intelligence (Defense radar, geolocated strikes)"
          >
            <Activity className="h-3 w-3 text-purple-300 animate-pulse" />
            <span>⚡ OSINT War News</span>
            <span className="text-[10px] opacity-90 font-mono">({osintCategoryCounts.ALL || 0})</span>
            <ConflictSparkline
              stories={activePool.filter(s => s.isOsint || Boolean(s.osintData) || s.isTelegram)}
              label="OSINT War Radar"
              color={(macroFilter === 'OSINT_ONLY' || isOsintOnlyMode) && feedViewMode === 'cards' ? '#ffffff' : '#c084fc'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          {/* Issue & Incident Timeline Tracker Tab */}
          <button
            onClick={() => {
              setMacroFilter('TIMELINE_TRACKER');
              setActiveTheaterForTimeline('ALL_THEATERS');
              setFeedViewMode('timeline_column');
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'ALL_THEATERS'
                ? 'bg-red-600 text-white font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                : 'bg-neutral-950 border border-red-500/50 text-red-300 hover:bg-red-950/40'
            }`}
            title="Lacak kronologi perkembangan dan timeline bertingkat insiden perang"
          >
            <Clock className="h-3 w-3 text-red-400" />
            <span>⏱️ Issue Timeline</span>
            <span className="text-[10px] opacity-90 font-mono">({activePool.length})</span>
            <ConflictSparkline
              stories={activePool}
              label="Timeline Perkembangan Insiden"
              color={feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'ALL_THEATERS' ? '#ffffff' : '#ef4444'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          {/* DEDICATED IRAN - USA TIMELINE TAB */}
          <button
            onClick={() => {
              setActiveTheaterForTimeline('IRAN_USA');
              setFeedViewMode('timeline_column');
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'IRAN_USA'
                ? 'bg-red-600 text-white font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.7)] ring-1 ring-white/40'
                : 'bg-neutral-950 border border-red-500/40 text-red-300 hover:bg-red-950/40'
            }`}
            title="Open Timeline Column: Iran vs USA (IRGC vs CENTCOM, Strait of Hormuz & Persian Gulf)"
          >
            <span>🇮🇷 🇺🇸</span>
            <span>Iran - USA</span>
            <span className="rounded bg-black/60 px-1 text-[9px] font-mono text-neutral-300">
              {stories.filter(s => {
                const t = `${s.title} ${s.summary || ''} ${s.conflict}`.toLowerCase();
                return s.conflict === 'Iran vs USA' || s.conflict === 'Israel-Iran / Iran' || (/iran/i.test(t) && /usa|us|u\.s\.|centcom|trump|b-2|carrier|strike/i.test(t));
              }).length}
            </span>
            <ConflictSparkline
              stories={stories.filter(s => s.conflict === 'Iran vs USA' || s.conflict === 'Israel-Iran / Iran')}
              label="Iran - USA Front"
              color={feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'IRAN_USA' ? '#ffffff' : '#ef4444'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          {/* DEDICATED SAUDI - YEMEN MILITIA TIMELINE TAB */}
          <button
            onClick={() => {
              setActiveTheaterForTimeline('SAUDI_YEMEN');
              setFeedViewMode('timeline_column');
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'SAUDI_YEMEN'
                ? 'bg-emerald-600 text-white font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.7)] ring-1 ring-white/40'
                : 'bg-neutral-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40'
            }`}
            title="Open Timeline Column: Saudi Arabia vs Yemen Militias (Houthis / Ansar Allah)"
          >
            <span>🇸🇦 🇾🇪</span>
            <span>Saudi - Yemen</span>
            <span className="rounded bg-black/60 px-1 text-[9px] font-mono text-neutral-300">
              {stories.filter(s => {
                const t = `${s.title} ${s.summary || ''} ${s.conflict}`.toLowerCase();
                return s.conflict === 'Arab Saudi vs Milisi Yaman' || s.conflict === 'Saudi-Yemen' || (/saudi|riyadh|najran|jizan/i.test(t) && /yemen|houthi|ansarallah/i.test(t));
              }).length}
            </span>
            <ConflictSparkline
              stories={stories.filter(s => s.conflict === 'Arab Saudi vs Milisi Yaman' || s.conflict === 'Saudi-Yemen')}
              label="Saudi - Yemen Front"
              color={feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'SAUDI_YEMEN' ? '#ffffff' : '#10b981'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          {/* DEDICATED UKRAINE - RUSSIA WAR TIMELINE TAB */}
          <button
            onClick={() => {
              setActiveTheaterForTimeline('UKRAINE_RUSSIA');
              setFeedViewMode('timeline_column');
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'UKRAINE_RUSSIA'
                ? 'bg-red-600 text-white font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.7)] ring-1 ring-white/40'
                : 'bg-neutral-950 border border-red-500/40 text-red-300 hover:bg-red-950/40'
            }`}
            title="Open Timeline Column: Ukraine - Russia War (Chronological combat feed)"
          >
            <span>🇺🇦 🇷🇺</span>
            <span>Ukraine - Russia</span>
            <span className="rounded bg-black/60 px-1 text-[9px] font-mono text-neutral-300">
              {stories.filter(s => (s.conflict === 'Russia-Ukraine' || (s.title + ' ' + (s.summary || '')).toLowerCase().includes('ukraine') || (s.title + ' ' + (s.summary || '')).toLowerCase().includes('russia'))).length}
            </span>
            <ConflictSparkline
              stories={stories.filter(s => s.conflict === 'Russia-Ukraine')}
              label="Ukraine - Russia Front"
              color={feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'UKRAINE_RUSSIA' ? '#ffffff' : '#ef4444'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          {/* DEDICATED ISRAEL - GAZA TIMELINE TAB */}
          <button
            onClick={() => {
              setActiveTheaterForTimeline('ISRAEL_GAZA');
              setFeedViewMode('timeline_column');
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'ISRAEL_GAZA'
                ? 'bg-orange-600 text-white font-extrabold shadow-[0_0_12px_rgba(249,115,22,0.7)] ring-1 ring-white/40'
                : 'bg-neutral-950 border border-orange-500/40 text-orange-300 hover:bg-orange-950/40'
            }`}
            title="Open Timeline Column: Israel - Gaza War"
          >
            <span>🇮🇱 🇵🇸</span>
            <span>Israel - Gaza</span>
            <ConflictSparkline
              stories={stories.filter(s => s.conflict === 'Israel-Gaza')}
              label="Israel - Gaza"
              color={feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'ISRAEL_GAZA' ? '#ffffff' : '#f97316'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          {/* DEDICATED RED SEA & HOUTHI TIMELINE TAB */}
          <button
            onClick={() => {
              setActiveTheaterForTimeline('RED_SEA_YEMEN');
              setFeedViewMode('timeline_column');
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'RED_SEA_YEMEN'
                ? 'bg-cyan-600 text-white font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.7)] ring-1 ring-white/40'
                : 'bg-neutral-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40'
            }`}
            title="Open Timeline Column: Bab al-Mandeb & Red Sea"
          >
            <span>🇾🇪 ⚓</span>
            <span>Red Sea</span>
            <ConflictSparkline
              stories={stories.filter(s => s.conflict === 'Bab al-Mandeb / Red Sea')}
              label="Red Sea"
              color={feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'RED_SEA_YEMEN' ? '#ffffff' : '#06b6d4'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          {/* DEDICATED SUDAN WAR TIMELINE TAB */}
          <button
            onClick={() => {
              setActiveTheaterForTimeline('SUDAN_CONFLICT');
              setFeedViewMode('timeline_column');
            }}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'SUDAN_CONFLICT'
                ? 'bg-rose-600 text-white font-extrabold shadow-[0_0_12px_rgba(225,29,72,0.7)] ring-1 ring-white/40'
                : 'bg-neutral-950 border border-rose-500/40 text-rose-300 hover:bg-rose-950/40'
            }`}
            title="Open Timeline Column: Sudan Conflict (SAF vs RSF)"
          >
            <span>🇸🇩 ⚔️</span>
            <span>Sudan</span>
            <ConflictSparkline
              stories={stories.filter(s => s.conflict === 'Sudan')}
              label="Sudan Conflict"
              color={feedViewMode === 'timeline_column' && activeTheaterForTimeline === 'SUDAN_CONFLICT' ? '#ffffff' : '#e11d48'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          {/* Under-The-Radar / Non-Mainstream OSINT Tab */}
          <button
            onClick={() => setMacroFilter('UNDER_THE_RADAR')}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              macroFilter === 'UNDER_THE_RADAR'
                ? 'bg-purple-600 text-white font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                : 'bg-neutral-950 border border-purple-500/40 text-purple-300 hover:bg-purple-950/40'
            }`}
            title="Laporan intelijen dan sinyal lapangan yang belum di-up media besar"
          >
            <Zap className="h-3 w-3 fill-current text-purple-300" />
            <span>⚡ Non-Media Besar</span>
            <span className="text-[10px] opacity-90 font-mono">({underTheRadarStories.length})</span>
            <ConflictSparkline
              stories={underTheRadarStories}
              label="Non-Media Besar"
              color={macroFilter === 'UNDER_THE_RADAR' ? '#ffffff' : '#c084fc'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          {/* Critical Escalation Tab */}
          <button
            onClick={() => setMacroFilter('CRITICAL_ESCALATION')}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              macroFilter === 'CRITICAL_ESCALATION'
                ? 'bg-red-600 text-white font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.6)]'
                : 'bg-neutral-950 border border-red-500/40 text-red-400 hover:bg-red-950/40'
            }`}
            title="Laporan dengan ancaman eskalasi tempur ekstrem"
          >
            <Flame className="h-3 w-3 fill-current" />
            <span>🚨 Eskalasi Kritis</span>
            <span className="text-[10px] opacity-90 font-mono">({criticalEscalationStories.length})</span>
            <ConflictSparkline
              stories={criticalEscalationStories}
              label="Eskalasi Kritis"
              color={macroFilter === 'CRITICAL_ESCALATION' ? '#ffffff' : '#ef4444'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          <button
            onClick={() => setMacroFilter('X_TWITTER')}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              macroFilter === 'X_TWITTER'
                ? 'bg-white text-black shadow-sm font-extrabold'
                : 'bg-neutral-950 border border-white/20 text-neutral-300 hover:border-white hover:text-white'
            }`}
          >
            <span className="font-serif font-black text-xs">𝕏</span>
            <span>Akun X</span>
            <span className="text-[10px] opacity-80 font-mono">({xStories.length})</span>
            <ConflictSparkline
              stories={xStories}
              label="Akun X Twitter"
              color={macroFilter === 'X_TWITTER' ? '#000000' : '#e2e8f0'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          <button
            onClick={() => setMacroFilter('ATTACKS')}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              macroFilter === 'ATTACKS'
                ? 'bg-red-600 text-white font-extrabold shadow-sm'
                : 'bg-neutral-950 border border-red-500/30 text-red-400 hover:bg-red-950/40'
            }`}
          >
            <Zap className="h-3 w-3 fill-current" />
            <span>Serangan</span>
            <span className="text-[10px] opacity-80 font-mono">({attackStories.length})</span>
            <ConflictSparkline
              stories={attackStories}
              label="Serangan Kinetik"
              color={macroFilter === 'ATTACKS' ? '#ffffff' : '#f87171'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          <button
            onClick={() => setMacroFilter('TELEGRAM_OSINT')}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              macroFilter === 'TELEGRAM_OSINT'
                ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
                : 'bg-neutral-950 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/40'
            }`}
          >
            <Send className="h-3 w-3" />
            <span>OSINT / TG</span>
            <span className="text-[10px] opacity-80 font-mono">({osintStories.length})</span>
            <ConflictSparkline
              stories={osintStories}
              label="Telegram & OSINT"
              color={macroFilter === 'TELEGRAM_OSINT' ? '#000000' : '#22d3ee'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          <button
            onClick={() => setMacroFilter('GEOPOLITICS')}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              macroFilter === 'GEOPOLITICS'
                ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                : 'bg-neutral-950 border border-amber-500/30 text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            <Globe className="h-3 w-3" />
            <span>Geopolitik</span>
            <span className="text-[10px] opacity-80 font-mono">({geopoliticsStories.length})</span>
            <ConflictSparkline
              stories={geopoliticsStories}
              label="Geopolitik Strategis"
              color={macroFilter === 'GEOPOLITICS' ? '#000000' : '#f59e0b'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>

          <button
            onClick={() => setMacroFilter('BREAKING')}
            className={`shrink-0 rounded-md px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
              macroFilter === 'BREAKING'
                ? 'bg-orange-500 text-white font-extrabold shadow-sm'
                : 'bg-neutral-950 border border-orange-500/30 text-orange-400 hover:bg-orange-950/40'
            }`}
          >
            <Flame className="h-3 w-3 fill-current" />
            <span>Breaking</span>
            <span className="text-[10px] opacity-80 font-mono">({breakingStories.length})</span>
            <ConflictSparkline
              stories={breakingStories}
              label="Breaking News"
              color={macroFilter === 'BREAKING' ? '#ffffff' : '#fb923c'}
              width={28}
              height={11}
              variant="tab"
            />
          </button>
        </div>

        {/* 4. DEDICATED 8 PRIMARY OSINT WAR NEWS CATEGORIES FILTER BAR */}
        <div className="mt-2 rounded-lg border border-purple-500/30 bg-purple-950/20 p-2 sm:p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-300">
              <Activity className="h-3.5 w-3.5 animate-pulse text-purple-400" />
              <span>8 KATEGORI UTAMA OSINT WAR NEWS:</span>
            </div>

            {/* Master OSINT War News Switch */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const nextState = !(isOsintOnlyMode || macroFilter === 'OSINT_ONLY');
                  setIsOsintOnlyMode(nextState);
                  if (nextState) {
                    setMacroFilter('OSINT_ONLY');
                  } else {
                    setMacroFilter('ALL');
                    setSelectedOsintCategory('ALL');
                  }
                }}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-black transition border shadow-sm ${
                  isOsintOnlyMode || macroFilter === 'OSINT_ONLY'
                    ? 'bg-purple-600 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.7)]'
                    : 'bg-black/60 text-purple-300 border-purple-500/40 hover:bg-purple-900/40 hover:text-white'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isOsintOnlyMode || macroFilter === 'OSINT_ONLY' ? 'bg-white animate-ping' : 'bg-purple-400'}`} />
                <span>{isOsintOnlyMode || macroFilter === 'OSINT_ONLY' ? '✓ HANYA BERITA OSINT' : 'AKTIFKAN FILTER OSINT'}</span>
              </button>

              {selectedOsintCategory !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedOsintCategory('ALL')}
                  className="rounded bg-neutral-900 border border-white/20 px-1.5 py-0.5 text-[9px] font-mono text-neutral-300 hover:text-white"
                  title="View all OSINT categories"
                >
                  All OSINT
                </button>
              )}
            </div>
          </div>

          {/* Horizontal scrollable pills for the 8 primary categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {/* All OSINT pill */}
            <button
              type="button"
              onClick={() => {
                setMacroFilter('OSINT_ONLY');
                setIsOsintOnlyMode(true);
                setSelectedOsintCategory('ALL');
              }}
              className={`shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold transition border ${
                (macroFilter === 'OSINT_ONLY' || isOsintOnlyMode) && selectedOsintCategory === 'ALL'
                  ? 'bg-purple-600 text-white border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.8)] font-black'
                  : 'bg-neutral-950 border-white/10 text-neutral-400 hover:text-white hover:border-purple-400/50'
              }`}
            >
              <span>⚡ All OSINT</span>
              <span className="text-[10px] font-mono opacity-80">({osintCategoryCounts.ALL || 0})</span>
            </button>

            {/* The 8 Official OSINT War Categories */}
            {OSINT_WAR_CATEGORIES.map((cat) => {
              const isSelected = selectedOsintCategory === cat.id;
              const count = osintCategoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setMacroFilter('OSINT_ONLY');
                    setIsOsintOnlyMode(true);
                    setSelectedOsintCategory(isSelected ? 'ALL' : cat.id);
                  }}
                  title={`${cat.id}: ${cat.descriptionId}`}
                  className={`shrink-0 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold transition border ${
                    isSelected
                      ? 'border-white bg-white text-black font-extrabold shadow-[0_0_12px_#ffffff]'
                      : `${cat.badgeColor} hover:brightness-125`
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate max-w-[135px] sm:max-w-none">{cat.label}</span>
                  <span className="rounded bg-black/60 px-1 py-0.2 text-[9px] font-mono opacity-90">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active filter notification ribbon (if search or location is filtered) */}
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-between rounded bg-neutral-900 border border-white/20 px-2.5 py-1 text-[11px] mt-1">
            <span className="text-neutral-300">
              Showing <strong className="text-white">{filteredStories.length}</strong> of {activePool.length} stories
            </span>
            <button
              onClick={handleResetAllFilters}
              className="text-yellow-400 hover:text-yellow-300 font-bold underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Stories List / War Theater Timeline Column */}
      {feedViewMode === 'timeline_column' ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <WarTheaterTimelineColumn
            stories={activePool}
            selectedStoryId={selectedStoryId}
            onSelectStory={onSelectStory}
            onOpenStoryDetail={onOpenStoryDetail}
            onOpenEditorForStory={onOpenEditorForStory}
            initialTheater={activeTheaterForTimeline}
            initialSearchQuery={searchQuery}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2.5">
          {/* Latest Attack Alert Ribbon */}
        {latestAttack && (
          <div
            onClick={() => onSelectStory(latestAttack)}
            className="group flex items-center justify-between gap-2 rounded-lg border border-red-500/40 bg-gradient-to-r from-red-950/70 via-black to-neutral-950 p-2.5 text-xs text-white transition hover:border-red-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
                <Zap className="h-3.5 w-3.5 fill-current" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-red-400 uppercase tracking-wider">
                  <span>LATEST ATTACK ALERT</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400 font-normal">{getRelativeTime(latestAttack.pubDate)}</span>
                  <ConflictSparkline
                    stories={attackStories}
                    label="Tren Serangan Kinetik 24J"
                    color="#ef4444"
                    width={32}
                    height={11}
                    variant="badge"
                  />
                </div>
                <p className="truncate text-xs font-bold text-white group-hover:text-red-200">
                  {latestAttack.title}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded bg-red-600/30 border border-red-500/50 px-2 py-1 text-[10px] font-bold text-red-300 group-hover:bg-red-600 group-hover:text-white transition">
              View
            </span>
          </div>
        )}

        {isLoading && stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white border-t-transparent shadow-[0_0_12px_#ffffff]" />
            <p className="mt-4 text-xs font-medium text-neutral-400">Memindai akun X dan sumber radar intelijen...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-neutral-950/90 p-8 text-center space-y-4 my-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black text-white text-2xl font-serif mx-auto shadow-[0_0_20px_rgba(255,255,255,0.25)]">
              𝕏
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Radar Bersih — Default Sumber Kosong</h3>
              <p className="text-neutral-400 text-xs max-w-md mx-auto leading-relaxed mt-1">
                Sesuai pengaturan Anda, default sumber dikosongkan. Tambahkan akun X (Twitter) atau sumber lainnya secara manual untuk mulai memantau feed secara real-time.
              </p>
            </div>
            {onOpenFeedManager && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onOpenFeedManager}
                  className="flex items-center gap-2 rounded bg-white px-4 py-2 text-xs font-black text-black hover:bg-neutral-200 transition shadow-[0_0_12px_rgba(255,255,255,0.5)] active:scale-95"
                >
                  <span className="font-serif font-black">𝕏</span>
                  <span>+ Tambahkan Akun X (Twitter) Sekarang</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/20 bg-neutral-950 p-8 text-center space-y-3">
            <div className="flex justify-center text-neutral-500">
              <Search className="h-8 w-8 stroke-1 text-neutral-500" />
            </div>
            <p className="font-extrabold text-white text-sm">No intelligence reports match active filters</p>
            <p className="text-neutral-400 text-xs max-w-sm mx-auto leading-relaxed">
              No tactical wire items found{searchQuery ? ` matching "${searchQuery}"` : ' for the selected filters'}.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="rounded border border-white/20 bg-neutral-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-neutral-800"
                >
                  Clear Search
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation('ALL');
                  setSelectedIntelType('ALL');
                  setSearchQuery('');
                  setSelectedLeader('ALL');
                  setSelectedEvent('ALL');
                  setSelectedGroupHandle(null);
                  setSelectedTheater('ALL');
                  setMacroFilter('ALL');
                }}
                className="rounded bg-white px-3 py-1 text-[11px] font-extrabold text-black hover:bg-neutral-200 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        ) : (
          filteredStories.map((story, idx) => {
            const isSelected = story.id === selectedStoryId;
            const isNew = newStoryIds.has(story.id);
            const isAttack =
              story.isNewAttack ||
              ['AIRSTRIKE', 'MISSILE', 'DRONE', 'SHELLING', 'OFFENSIVE', 'NAVAL'].includes(story.eventType);

            return (
              <div
                key={`${story.id}-${idx}`}
                onClick={() => onSelectStory(story)}
                className={`group relative cursor-pointer rounded-lg border p-3 transition duration-150 ${
                  isSelected
                    ? 'border-white bg-neutral-900 shadow-[0_0_16px_rgba(255,255,255,0.25)]'
                    : isAttack
                    ? 'border-red-950/80 bg-neutral-950 hover:border-red-600/60 hover:bg-neutral-900/60'
                    : 'border-white/15 bg-neutral-950/80 hover:border-white/40 hover:bg-neutral-900/60'
                }`}
              >
                {/* Badges Row */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* OSINT War Category Badge */}
                    {(() => {
                      const osintCat = story.osintData?.category || classifyOsintCategory(story);
                      const catMeta = OSINT_WAR_CATEGORIES.find((c) => c.id === osintCat) || OSINT_WAR_CATEGORIES[0];
                      const isCatSelected = selectedOsintCategory === osintCat;
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOsintCategory(isCatSelected ? 'ALL' : osintCat);
                            setMacroFilter('OSINT_ONLY');
                            setIsOsintOnlyMode(true);
                          }}
                          title={`Kategori OSINT: ${osintCat}`}
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-black transition cursor-pointer shadow-sm ${
                            isCatSelected
                              ? 'border-white bg-white text-black shadow-[0_0_8px_#ffffff]'
                              : catMeta.badgeColor
                          }`}
                        >
                          <span>{catMeta.icon}</span>
                          <span>{catMeta.label}</span>
                        </button>
                      );
                    })()}

                    {/* Geolocation Coordinates Badge */}
                    {(story.osintData?.coordinates || story.osintData?.locationName) && (
                      <span className="inline-flex items-center gap-0.5 rounded border border-purple-500/40 bg-purple-950/70 px-1.5 py-0.5 text-[8.5px] font-mono font-bold text-purple-300">
                        <MapPin className="h-2 w-2 text-purple-400" />
                        <span className="truncate max-w-[120px]">{story.osintData.coordinates || story.osintData.locationName}</span>
                      </span>
                    )}

                    {/* OSINT Telemetry Indicator */}
                    {story.osintData && (
                      <span className="inline-flex items-center gap-0.5 rounded border border-purple-400/40 bg-purple-900/60 px-1.5 py-0.5 text-[8.5px] font-mono font-bold text-purple-200">
                        <Activity className="h-2 w-2 animate-pulse" />
                        <span>TELEMETRI OSINT</span>
                      </span>
                    )}

                    {/* NEW ATTACK badge */}
                    {isAttack && (
                      <span className="flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse">
                        <Zap className="h-2.5 w-2.5 fill-current" />
                        ATTACK
                      </span>
                    )}

                    {/* GEOPOLITICS badge */}
                    {story.isGeopolitics && (
                      <span className="flex items-center gap-1 rounded border border-amber-400/50 bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.25)]">
                        <Globe className="h-2.5 w-2.5" />
                        GEOPOLITICS
                      </span>
                    )}

                    {/* Conflict Theater Timeline Badge Button */}
                    {(() => {
                      const text = `${story.title} ${story.summary} ${story.conflict}`.toLowerCase();
                      let targetTheater: WarTheaterId = 'ALL_THEATERS';
                      let theaterFlag = '🌐';
                      let theaterLabel = story.conflict || 'Global';
                      
                      if (/iran|tehran|centcom|irgc/i.test(text)) {
                        targetTheater = 'IRAN_USA';
                        theaterFlag = '🇮🇷 🇺🇸';
                        theaterLabel = 'Iran - USA';
                      } else if (/saudi|riyadh|najran|jizan/i.test(text) && /yemen|houthi|ansarallah/i.test(text)) {
                        targetTheater = 'SAUDI_YEMEN';
                        theaterFlag = '🇸🇦 🇾🇪';
                        theaterLabel = 'Arab Saudi - Yaman';
                      } else if (/ukraine|russia|kursk|pokrovsk|kharkiv/i.test(text)) {
                        targetTheater = 'UKRAINE_RUSSIA';
                        theaterFlag = '🇺🇦 🇷🇺';
                        theaterLabel = 'Ukraina - Rusia';
                      } else if (/gaza|hamas|qassam|rafah|palestin/i.test(text)) {
                        targetTheater = 'ISRAEL_GAZA';
                        theaterFlag = '🇮🇱 🇵🇸';
                        theaterLabel = 'Israel - Gaza';
                      } else if (/lebanon|hezbollah|beirut/i.test(text)) {
                        targetTheater = 'ISRAEL_LEBANON';
                        theaterFlag = '🇮🇱 🇱🇧';
                        theaterLabel = 'Israel - Lebanon';
                      } else if (/red sea|bab al-mandeb/i.test(text)) {
                        targetTheater = 'RED_SEA_YEMEN';
                        theaterFlag = '🇾🇪 ⚓';
                        theaterLabel = 'Laut Merah';
                      } else if (/sudan|rsf/i.test(text)) {
                        targetTheater = 'SUDAN_CONFLICT';
                        theaterFlag = '🇸🇩 ⚔️';
                        theaterLabel = 'Perang Sudan';
                      } else if (/north korea|pyongyang|dprk/i.test(text)) {
                        targetTheater = 'KOREA_PENINSULA';
                        theaterFlag = '🇰🇵 🇰🇷';
                        theaterLabel = 'Korea Utara - AS';
                      } else if (/taiwan|china/i.test(text)) {
                        targetTheater = 'TAIWAN_CHINA';
                        theaterFlag = '🇹🇼 🇨🇳';
                        theaterLabel = 'Taiwan - China';
                      } else if (/syria|iraq/i.test(text)) {
                        targetTheater = 'SYRIA_IRAQ';
                        theaterFlag = '🇸🇾 🇮🇶';
                        theaterLabel = 'Suriah - Irak';
                      }

                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTheaterForTimeline(targetTheater);
                            setFeedViewMode('timeline_column');
                          }}
                          title={`Buka Timeline Khusus: ${theaterLabel}`}
                          className="inline-flex items-center gap-1 rounded border border-red-500/50 bg-red-950/40 px-1.5 py-0.5 text-[9px] font-extrabold text-red-300 hover:border-red-400 hover:bg-red-900/60 transition cursor-pointer shadow-[0_0_6px_rgba(239,68,68,0.25)]"
                        >
                          <span>{theaterFlag}</span>
                          <span>{theaterLabel}</span>
                          <span className="text-[8px] text-red-400 font-mono">⏱️</span>
                        </button>
                      );
                    })()}

                    {/* Interactive Type of Intelligence Badge */}
                    {(() => {
                      const storyIntel = resolveIntelligenceType(story);
                      const isIntelActive = selectedIntelType === storyIntel;
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIntelType(isIntelActive ? 'ALL' : storyIntel);
                          }}
                          title={`Filter radar ke intel: ${storyIntel}`}
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold transition cursor-pointer hover:scale-105 shadow-[0_0_6px_rgba(255,255,255,0.15)] ${
                            isIntelActive
                              ? 'border-white bg-white text-black shadow-[0_0_8px_#ffffff] font-black'
                              : 'border-white/20 bg-neutral-900 text-neutral-200 hover:border-white/50 hover:text-white'
                          }`}
                        >
                          <Crosshair className="h-2.5 w-2.5 text-current opacity-80" />
                          <span>{storyIntel}</span>
                        </button>
                      );
                    })()}

                    {/* X (TWITTER) ACCOUNT BADGE */}
                    {(story.isX || story.xHandle || story.source.toLowerCase().includes('x @')) && (
                      <span className="flex items-center gap-1 rounded border border-white/40 bg-black px-1.5 py-0.5 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(255,255,255,0.25)]">
                        <span className="font-serif font-black">𝕏</span>
                        <span>
                          {story.xHandle ? `@${story.xHandle}` : story.source.replace(/^X\s*/i, '')}
                        </span>
                      </span>
                    )}

                    {/* TELEGRAM GROUP / THEATER BADGE */}
                    {(story.isTelegram || story.telegramHandle || story.source.toLowerCase().includes('telegram')) && (
                      <span
                        className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold shadow-[0_0_6px_rgba(6,182,212,0.3)] ${
                          story.telegramTheater === 'UKRAINIAN'
                            ? 'border-yellow-400/50 bg-yellow-950/70 text-yellow-300'
                            : story.telegramTheater === 'RUSSIAN'
                            ? 'border-red-500/50 bg-red-950/70 text-red-300'
                            : story.telegramTheater === 'ARABIC'
                            ? 'border-emerald-400/50 bg-emerald-950/70 text-emerald-300'
                            : 'border-cyan-400/50 bg-cyan-950/70 text-cyan-300'
                        }`}
                      >
                        <Send className="h-2.5 w-2.5" />
                        <span>
                          {story.telegramTheater === 'UKRAINIAN'
                            ? '🇺🇦 '
                            : story.telegramTheater === 'RUSSIAN'
                            ? '🇷🇺 '
                            : story.telegramTheater === 'ARABIC'
                            ? '🇾🇪 '
                            : ''}
                          {story.telegramHandle
                            ? `@${story.telegramHandle}`
                            : story.source.includes('@')
                            ? `@${story.source.split('@')[1]?.split(' ')[0]}`
                            : 'TELEGRAM'}
                        </span>
                      </span>
                    )}

                    {/* OSINT DESK badge */}
                    {(story.isOsint || story.source.toLowerCase().includes('osint') || story.source.toLowerCase().includes('bellingcat')) && !story.isTelegram && (
                      <span className="flex items-center gap-1 rounded border border-purple-400/50 bg-purple-950/70 px-1.5 py-0.5 text-[9px] font-bold text-purple-300 shadow-[0_0_6px_rgba(168,85,247,0.3)]">
                        <Activity className="h-2.5 w-2.5" />
                        OSINT
                      </span>
                    )}

                    {/* NEW badge */}
                    {isNew && (
                      <span className="animate-pulse rounded bg-white px-1.5 py-0.5 text-[9px] font-black text-black shadow-[0_0_8px_#ffffff]">
                        NEW
                      </span>
                    )}

                    {/* BREAKING badge */}
                    {story.isBreaking && (
                      <span className="flex items-center gap-1 rounded-full border border-white/80 bg-neutral-900 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-white shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                        <Flame className="h-2.5 w-2.5" />
                        BREAKING
                      </span>
                    )}

                    {/* FOTO ASLI COVER badge */}
                    {story.hasOriginalImage && (
                      <span className="flex items-center gap-0.5 rounded border border-emerald-400/50 bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.3)]">
                        <ImageIcon className="h-2.5 w-2.5" />
                        FOTO ASLI
                      </span>
                    )}

                    {/* Event Tag */}
                    <span className="rounded border border-white/20 bg-black px-1.5 py-0.5 text-[9px] font-black text-white">
                      {story.eventType}
                    </span>

                    {/* Conflict Area with 24H Sparkline */}
                    <span className={`inline-flex items-center gap-1 rounded bg-neutral-900/80 border border-white/10 px-1.5 py-0.5 text-[10px] font-medium ${story.conflict === 'War Geopolitics' ? 'text-amber-300 font-bold' : 'text-neutral-300'}`}>
                      <span>{story.conflict}</span>
                      <ConflictSparkline
                        stories={activePool}
                        conflictName={story.conflict}
                        locationTag={story.locationTag}
                        label={story.conflict}
                        width={26}
                        height={10}
                        variant="card"
                      />
                    </span>

                    {/* Key Leaders Chips */}
                    {story.leaders && story.leaders.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {story.leaders.map((ldr: string) => (
                          <span
                            key={ldr}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeader(ldr);
                            }}
                            title={`Filter by ${ldr}`}
                            className="inline-flex items-center gap-0.5 rounded border border-amber-400/40 bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 hover:bg-amber-400/30 transition cursor-pointer"
                          >
                            ★ {ldr}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Relative time & Freshly Written Badge */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {story.isUltraFresh ? (
                      <span className="flex items-center gap-1 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-400/60 px-1.5 py-0.5 text-[9px] font-black tracking-wider animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                        ⚡ {story.relativeTime || 'BARU SAJA'}
                      </span>
                    ) : (
                      <div
                        className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono"
                        title={`Dipublikasikan: ${new Date(story.pubDate).toLocaleString()}`}
                      >
                        <Clock className="h-2.5 w-2.5" />
                        <span>{story.relativeTime || getRelativeTime(story.pubDate)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* OSINT Sentinel & Sentiment Telemetry Header */}
                {(() => {
                  const sentiment = story.sentiment || analyzeStorySentiment(story);
                  const catMeta = SENTIMENT_CATEGORY_META[sentiment.category];
                  const threatMeta = THREAT_LEVEL_META[sentiment.threatLevel];
                  return (
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-1.5 text-[9px] font-mono">
                      <div className="flex items-center gap-1 flex-wrap">
                        {story.isUnderTheRadar && (
                          <span className="inline-flex items-center gap-1 rounded bg-purple-950/90 border border-purple-500/60 px-1.5 py-0.2 font-black text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                            ⚡ NON-MEDIA BESAR
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 font-black border ${catMeta.badgeBg} ${catMeta.border} ${catMeta.textClass}`}
                        >
                          <span>{catMeta.label}</span>
                          <span className="opacity-80">({sentiment.threatScore}/100)</span>
                        </span>

                        <span className={`rounded px-1.5 py-0.2 font-black font-mono ${threatMeta.badgeClass}`}>
                          {threatMeta.code}
                        </span>
                      </div>

                      {/* Mini Sentiment Tension Progress Bar */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[8.5px] text-neutral-400">Tensi</span>
                        <div className="w-14 h-1.5 rounded-full bg-neutral-900 border border-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${sentiment.threatScore}%`,
                              backgroundColor: catMeta.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Title & Photo Layout */}
                <div className="flex gap-2.5 items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold leading-snug text-white group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
                      {story.title}
                    </h3>
                    {story.summary && (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-neutral-400">
                        {story.summary}
                      </p>
                    )}

                    {/* Sentiment Key Drivers */}
                    {(() => {
                      const sentiment = story.sentiment || analyzeStorySentiment(story);
                      if (!sentiment?.keyDrivers || sentiment.keyDrivers.length === 0) return null;
                      return (
                        <div className="flex flex-wrap items-center gap-1 pt-1 text-[9px] text-neutral-400 font-mono">
                          <span className="text-neutral-500">Faktor:</span>
                          {sentiment.keyDrivers.slice(0, 2).map((kd) => (
                            <span key={kd} className="rounded bg-neutral-900 border border-white/10 px-1.5 py-0.2 text-[8.5px] text-neutral-300">
                              {kd}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  {story.imageUrl && (
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded border border-white/20 bg-neutral-900 shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                      <img
                        src={`/api/img-proxy?url=${encodeURIComponent(story.imageUrl)}`}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Tactical Military Tracking Badges on Story Card */}
                {(() => {
                  const tracking = story.militaryTracking || detectMilitaryTracking(story);
                  if (!tracking) return null;
                  const mvMeta = MOVEMENT_TYPE_META[tracking.movementType];
                  return (
                    <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-red-500/20 pt-1.5 text-[9px]">
                      {/* Armies / Regular Forces */}
                      {tracking.forces.map((f) => (
                        <span
                          key={f}
                          title={`Kekuatan Militer: ${f}`}
                          className="inline-flex items-center gap-1 rounded bg-blue-950/70 border border-blue-500/50 px-1.5 py-0.5 font-bold text-blue-200 select-none"
                        >
                          <Shield className="h-2 w-2 text-blue-400" />
                          <span>{f}</span>
                        </span>
                      ))}

                      {/* Militias & Paramilitary */}
                      {tracking.militias.map((m) => (
                        <span
                          key={m}
                          title={`Milisi/Faksi Tempur: ${m}`}
                          className="inline-flex items-center gap-1 rounded bg-emerald-950/70 border border-emerald-500/50 px-1.5 py-0.5 font-bold text-emerald-200 select-none"
                        >
                          <Swords className="h-2 w-2 text-emerald-400" />
                          <span>{m}</span>
                        </span>
                      ))}

                      {/* Movement Vector */}
                      {mvMeta && (
                        <span
                          title={mvMeta.description || mvMeta.label}
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-bold border select-none ${mvMeta.bg} ${mvMeta.border} ${mvMeta.color}`}
                        >
                          <span>{mvMeta.icon}</span>
                          <span>{mvMeta.label}</span>
                        </span>
                      )}

                      {/* Aircraft / Drone / Naval Assets Mentioned */}
                      {tracking.assetsMentioned && tracking.assetsMentioned.slice(0, 2).map((asset) => (
                        <span
                          key={asset}
                          title={`Alutsista Terdeteksi: ${asset}`}
                          className="inline-flex items-center gap-1 rounded bg-violet-950/60 border border-violet-500/40 px-1.5 py-0.5 font-mono text-[8.5px] text-violet-200 select-none"
                        >
                          <span>{asset.includes('Bomber') || asset.includes('Fighter') || asset.includes('F-') || asset.includes('Su-') ? '✈️' : asset.includes('Carrier') || asset.includes('Destroyer') ? '⚓' : asset.includes('UAV') || asset.includes('Drone') ? '📡' : '🚀'}</span>
                          <span>{asset}</span>
                        </span>
                      ))}

                      {/* Tactical Sector */}
                      {tracking.sector && (
                        <span className="text-[8.5px] text-neutral-400 font-mono ml-auto">
                          📍 {tracking.sector}
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Source & Action Footer */}
                <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[10px]">
                  <span className="font-semibold text-neutral-300 truncate max-w-[150px]">
                    {story.source}
                  </span>
                  <div className="flex items-center gap-2">
                    {story.link && (
                      <a
                        href={story.link}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                        title="View original article"
                        className="text-neutral-400 hover:text-white"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTimelineStory(story.id);
                      }}
                      className={`flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-bold transition ${
                        expandedTimelineStoryIds.has(story.id) || macroFilter === 'TIMELINE_TRACKER'
                          ? 'border-red-500 bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                          : 'border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/60 hover:text-white'
                      }`}
                      title="Lihat kronologi & timeline perkembangan insiden ini"
                    >
                      <Clock className="h-3 w-3 text-red-400" />
                      <span>Timeline ({(story.timelineUpdates?.length || 4)})</span>
                    </button>
                    {onOpenOsintManager && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenOsintManager(story);
                        }}
                        className="flex items-center gap-1 rounded border border-purple-500/50 bg-purple-950/60 px-2 py-1 text-[10px] font-bold text-purple-300 hover:bg-purple-900 hover:text-white transition shadow-sm"
                        title="Manage OSINT and BDA telemetry for this story"
                      >
                        <Activity className="h-3 w-3 text-purple-400" />
                        <span>⚙️ Manage OSINT</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenStoryDetail) {
                          onOpenStoryDetail(story);
                        } else {
                          onSelectStory(story);
                        }
                      }}
                      className="flex items-center gap-1 rounded border border-white/20 bg-neutral-900 px-2.5 py-1 text-[10px] font-bold text-neutral-200 transition hover:bg-neutral-800 hover:text-white"
                      title="Read full briefing and military intelligence summary"
                    >
                      <span>📖 Briefing</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenEditorForStory) {
                          onOpenEditorForStory(story);
                        } else {
                          onSelectStory(story);
                        }
                      }}
                      className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-[10px] font-extrabold text-black transition hover:bg-neutral-200 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
                      title="Open editor and create 1080p graphic for this story"
                    >
                      <span>🎨 1080p Studio</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Expanded Issue Timeline View inside Story Card */}
                {(expandedTimelineStoryIds.has(story.id) || macroFilter === 'TIMELINE_TRACKER') && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 pt-3 border-t border-red-500/30 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <IncidentTimeline story={story} relatedStories={activePool} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      )}
    </div>
  );
};
