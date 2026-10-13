export type TelegramTheater = 'UKRAINIAN' | 'RUSSIAN' | 'ARABIC' | 'GLOBAL' | 'CUSTOM';
export type RadarTheater = 'ARABIC' | 'UKRAINIAN' | 'RUSSIAN' | 'PAKISTAN_SOUTHASIA' | 'GLOBAL' | 'CUSTOM';

export type LocationTag =
  | 'ALL'
  | 'Ukraine'
  | 'Russia'
  | 'Middle East'
  | 'Red Sea & Yemen'
  | 'Asia-Pacific'
  | 'Global / NATO';

export type IntelligenceType =
  | 'ALL'
  | 'Kinetic Strike'
  | 'Air Defense & SIGINT'
  | 'OSINT & Imagery'
  | 'Drone / UAV Recon'
  | 'Frontline Assault'
  | 'Naval & Maritime'
  | 'Strategic & Geopolitics'
  | 'Cyber & EW';

export type MilitaryMovementType =
  | 'ADVANCE'
  | 'REDEPLOYMENT'
  | 'ENCIRCLEMENT'
  | 'DEFENSE'
  | 'WITHDRAWAL'
  | 'STRIKE_SORTIE'
  | 'AIR_SORTIE'
  | 'NAVAL_MANEUVER'
  | 'AIR_DEFENSE_ACTION';

export type MilitaryForceType = 'REGULAR_ARMY' | 'MILITIA_PARAMILITARY' | 'SPECIAL_OPERATION' | 'AIR_NAVAL_ASSET';

export interface MilitaryTrackingInfo {
  forceType: MilitaryForceType;
  forces: string[];
  militias: string[];
  operations: string[];
  movementType: MilitaryMovementType;
  sector: string;
  tacticalSummary: string;
  unitMentioned?: string;
  assetsMentioned?: string[];
  theaterData?: {
    name: string;
    flag: string;
    hotpoint: string;
  };
}

export interface ConnectedTelegramGroup {
  id: string;
  name: string;
  handle: string; // e.g. 'kpszsu'
  theater: TelegramTheater;
  language: 'uk' | 'ru' | 'ar' | 'en' | 'other';
  description?: string;
  enabled: boolean;
  isCustom?: boolean;
}

export type SentimentCategory =
  | 'CRITICAL_ESCALATION'
  | 'HOSTILE_COMBAT'
  | 'HIGH_TENSION'
  | 'NEUTRAL_TACTICAL'
  | 'DE_ESCALATION';

export type ThreatLevel = 'EXTREME' | 'HIGH' | 'ELEVATED' | 'GUARDED';

export type MSMPenetration = 'UNDER_THE_RADAR' | 'EARLY_FIELD_SIGNAL' | 'MSM_BLINDSPOT';

export interface SentimentAnalysis {
  score: number; // -1.0 to 1.0 (negative = hostile/escalating, positive = de-escalating)
  threatScore: number; // 0 to 100
  category: SentimentCategory;
  threatLevel: ThreatLevel;
  urgency: 'FLASH' | 'URGENT' | 'ROUTINE';
  msmPenetration: MSMPenetration;
  sentimentSummary: string;
  keyDrivers: string[];
  civilianImpactRisk: 'HIGH' | 'MODERATE' | 'LOW';
  escalationProbability: number; // 0 to 100
}

export type OsintWarCategory =
  | 'Airstrikes & Missile Attacks'
  | 'Drone Warfare & UAV'
  | 'Satellite Imagery & Geolocation'
  | 'Military Aircraft & Air Defense'
  | 'Naval Warfare & Maritime Security'
  | 'Ground War & Frontline Changes'
  | 'Intelligence, Surveillance & OSINT Investigations'
  | 'Military Logistics & Strategic Infrastructure'
  | 'AIRSTRIKES_MISSILES'
  | 'DRONE_UAV'
  | 'SATELLITE_GEOLOCATION'
  | 'AIRCRAFT_AIRDEFENSE'
  | 'NAVAL_MARITIME'
  | 'GROUND_FRONTLINE'
  | 'INTEL_INVESTIGATIONS'
  | 'LOGISTICS_INFRASTRUCTURE';

export type BdaStatusType =
  | 'CONFIRMED_DESTROYED'
  | 'HEAVILY_DAMAGED'
  | 'MODERATE_DAMAGE'
  | 'CRATERED_RUNWAY'
  | 'BURNING_FIRE'
  | 'INSPECTING'
  | 'INTERCEPTED'
  | 'RUNWAY_CRATER'
  | 'RADAR_HIT'
  | 'HEAVY_DAMAGE';

export type OsintVerificationStatus =
  | 'SATELLITE_VERIFIED'
  | 'GEOLOCATED'
  | 'VISUALLY_CONFIRMED'
  | 'UNDER_INVESTIGATION'
  | 'UNCONFIRMED_CLAIM'
  | 'VERIFIED_GEOLOCATED';

export type OsintPillarType =
  | 'PILAR_1_STRIKES'
  | 'PILAR_2_SATELLITE'
  | 'PILAR_3_VERIFICATION'
  | 'PILAR_4_LOSSES'
  | 'PILAR_5_STRATEGIC';

export interface OsintPillarMeta {
  id: OsintPillarType;
  number: number;
  title: string;
  shortLabel: string;
  icon: string;
  badgeColor: string;
  accentHex: string;
  tagline: string;
  description: string;
  recommendedSources: string[];
  sampleQuery: string;
}

export const OSINT_FIVE_PILLARS: OsintPillarMeta[] = [
  {
    id: 'PILAR_1_STRIKES',
    number: 1,
    title: 'Pilar 1 — Breaking Strike News',
    shortLabel: 'Pilar 1: Strike Wire',
    icon: '🚀',
    badgeColor: 'border-red-500/50 bg-red-950/70 text-red-300',
    accentHex: '#ef4444',
    tagline: 'Missile strikes, UAV operations, explosions, air defense interceptions, and attack claims',
    description: 'Ballistic missile launches, Shahed/FPV drone strikes, air defense battery activations (Patriot/S-400), and real-time military infrastructure impact.',
    recommendedSources: ['@sentdefender', '@ELINTNews', '@WarMonitor3', '@clashreport', '@kpszsu'],
    sampleQuery: '(missile OR airstrike OR drone OR intercepted OR explosion) (strike OR attack)',
  },
  {
    id: 'PILAR_2_SATELLITE',
    number: 2,
    title: 'Pillar 2 — Satellite OSINT',
    shortLabel: 'Pillar 2: Satellite Imagery',
    icon: '🛰️',
    badgeColor: 'border-purple-500/50 bg-purple-950/70 text-purple-300',
    accentHex: '#a855f7',
    tagline: 'Before & after strike imagery analysis, base damage, and visual BDA evidence',
    description: 'Optical & SAR satellite imagery verification (Maxar, PlanetScope, Sentinel-2), NASA FIRMS thermal anomaly detection, and Battle Damage Assessment (BDA).',
    recommendedSources: ['@GeoConfirmed', '@bradyafr', '@detresfa_', '@MT_Anderson', 'ISW Frontline'],
    sampleQuery: '"satellite imagery" OR "Sentinel-2" OR "Maxar" OR "PlanetScope" OR "NASA FIRMS"',
  },
  {
    id: 'PILAR_3_VERIFICATION',
    number: 3,
    title: 'Pillar 3 — Viral Footage Verification',
    shortLabel: 'Pillar 3: Video Verification',
    icon: '🔍',
    badgeColor: 'border-amber-500/50 bg-amber-950/70 text-amber-300',
    accentHex: '#f59e0b',
    tagline: 'Verifying authenticity, matching coordinates, identifying hardware, and auditing claims',
    description: 'Authenticity checks for viral combat footage, geolocating terrain contours, identifying military equipment, and auditing war propaganda claims.',
    recommendedSources: ['@GeoConfirmed', '@Bellingcat', '@CalibreObscura', '@RALee85'],
    sampleQuery: '"geolocated" OR "visual confirmation" OR "geolocation" OR "footage verified"',
  },
  {
    id: 'PILAR_4_LOSSES',
    number: 4,
    title: 'Pillar 4 — Weapons & Military Losses',
    shortLabel: 'Pillar 4: Assets & Losses',
    icon: '💥',
    badgeColor: 'border-rose-500/50 bg-rose-950/70 text-rose-300',
    accentHex: '#f43f5e',
    tagline: 'Downed aircraft, struck air defense systems, damaged warships, and equipment comparisons',
    description: 'Visual documentation of damaged/destroyed military equipment (fighter jets, Patriot/S-400 SAM batteries, warships, armored vehicles) and technical asset comparisons.',
    recommendedSources: ['@oryxspioenkop', '@Rebel44CZ', 'Naval News', '@warintel4u'],
    sampleQuery: '"shot down" OR "losses" OR "destroyed" OR "damaged" ("S-400" OR "Patriot" OR "fighter jet" OR "warship")',
  },
  {
    id: 'PILAR_5_STRATEGIC',
    number: 5,
    title: 'Pillar 5 — Strategic Military Developments',
    shortLabel: 'Pillar 5: Strategic & Fleets',
    icon: '🌐',
    badgeColor: 'border-cyan-500/50 bg-cyan-950/70 text-cyan-300',
    accentHex: '#06b6d4',
    tagline: 'Troop deployments, fleet movements, military mobilizations, and macro conflict impacts',
    description: 'Monitoring Carrier Strike Group (CSG) movements, ground force redeployments, strategic chokepoint navigation (Bab al-Mandeb/Hormuz), and geopolitical escalation dynamics.',
    recommendedSources: ['@TheStudyofWar', '@deepstateua', 'UKMTO Maritime', '@FRHoffmann1'],
    sampleQuery: '("troop deployment" OR "carrier strike group" OR "mobilization" OR "frontline advance")',
  },
];

export interface SatelliteComparison {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  beforeDate?: string;
  afterDate?: string;
  resolution?: string; // e.g. "0.5m PlanetScope", "Sentinel-2 L2A", "Maxar WorldView-3"
  damageAssessment?: string; // e.g. "Runway cratered (3 strikes), revetment hangar destroyed"
  sensorType?: 'OPTICAL' | 'SAR_RADAR' | 'INFRARED_FIRMS' | 'COMMERCIAL_SAT';
  targetFacility?: string; // e.g. "Runway 04/22", "Fuel Storage Tank #3"
}

export interface OsintData {
  category: OsintWarCategory;
  categoryLabel?: string;
  categoryIcon?: string;
  gridZone?: string;
  targetName?: string;
  bdaStatus?: string;
  satelliteSensor?: string;
  dateStamp?: string;
  coordinates?: string; // e.g. "48.2831°N, 37.1842°E"
  locationName?: string; // e.g. "Millerovo Air Base, Rostov Oblast"
  verificationStatus: OsintVerificationStatus;
  confidenceScore?: number; // 0 - 100%
  satelliteImageUrl?: string;
  satelliteImagery?: SatelliteComparison;
  equipmentIdentified?: string[]; // e.g. ["Su-34 Fullback", "S-400 92N6E", "Shahed-136"]
  bdaSummary?: string; // Battle Damage Assessment
  satelliteMapUrl?: string;
  sourceAnalyst?: string; // e.g. "GeoConfirmed", "DeepState UA", "Tatarigami", "MT Anderson"
  visualEvidenceUrl?: string;
  notes?: string;
}

export type OsintMetadata = OsintData;

export interface NewsStory {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  pubDate: string;
  imageUrl: string;
  conflict: string;
  eventType: string;
  isBreaking: boolean;
  isNewAttack?: boolean;
  isGeopolitics?: boolean;
  locationTag?: LocationTag;
  intelligenceType?: IntelligenceType;
  isTelegram?: boolean;
  isOsint?: boolean;
  isOsintOnly?: boolean;
  osintData?: OsintData;
  osintCategory?: OsintWarCategory;
  osintMetadata?: OsintData;
  osintPillar?: OsintPillarType;
  isX?: boolean;
  isXTwitter?: boolean;
  nativeLanguage?: string;
  xHandle?: string;
  xTheater?: RadarTheater;
  xAuthorName?: string;
  xProfileUrl?: string;
  telegramTheater?: TelegramTheater;
  telegramHandle?: string;
  telegramLanguage?: 'uk' | 'ru' | 'ar' | 'en' | 'other';
  leaders?: string[];
  pubTimestamp?: number;
  hasOriginalImage?: boolean;
  relativeTime?: string;
  isUltraFresh?: boolean;
  militaryTracking?: MilitaryTrackingInfo;
  sentiment?: SentimentAnalysis;
  isUnderTheRadar?: boolean;
  timelineUpdates?: IncidentTimelineUpdate[];
  incidentId?: string;
  incidentTitle?: string;
  incidentStatus?: 'ACTIVE_ESCALATION' | 'UNDER_INVESTIGATION' | 'CONFIRMED' | 'STABILIZED';
}

export interface OsintCategoryInfo {
  id: OsintWarCategory;
  label: string;
  icon: string;
  badgeColor: string;
  accentColor: string;
  descriptionId: string;
  examples: string;
}

export const OSINT_WAR_CATEGORIES: OsintCategoryInfo[] = [
  {
    id: 'Airstrikes & Missile Attacks',
    label: 'Airstrikes & Missiles',
    icon: '🎯',
    badgeColor: 'border-red-500/50 bg-red-950/40 text-red-400',
    accentColor: '#ef4444',
    descriptionId: 'Ballistic missiles, cruise missiles, glide bombs, and military base or infrastructure strikes.',
    examples: 'Russian missile strike, Iranian drone attack, Houthi missile launch.',
  },
  {
    id: 'Drone Warfare & UAV',
    label: 'Drone & UAV',
    icon: '🛸',
    badgeColor: 'border-amber-500/50 bg-amber-950/40 text-amber-400',
    accentColor: '#f59e0b',
    descriptionId: 'FPV drones, Shahed, Geran, Lancet, reconnaissance UAVs, USVs (naval drones), and anti-drone electronic warfare.',
    examples: 'Drone interception, UAV shot down, drone factory strike.',
  },
  {
    id: 'Satellite Imagery & Geolocation',
    label: 'Satellite & Geolocation',
    icon: '🛰️',
    badgeColor: 'border-purple-500/50 bg-purple-950/40 text-purple-300',
    accentColor: '#a855f7',
    descriptionId: 'Before & after strike satellite imagery, coordinate geolocation, runway craters, hangars, and radar BDA.',
    examples: 'Satellite imagery reveals damage at an airbase, Before/After BDA.',
  },
  {
    id: 'Military Aircraft & Air Defense',
    label: 'Air Defense & Aviation',
    icon: '✈️',
    badgeColor: 'border-sky-500/50 bg-sky-950/40 text-sky-400',
    accentColor: '#38bdf8',
    descriptionId: 'Fighter jets, strategic bombers, helicopters, AWACS, Patriot, S-400, Pantsir, THAAD, radar, and missile intercepts.',
    examples: 'Fighter jet crash, air defense interception, bomber deployment.',
  },
  {
    id: 'Naval Warfare & Maritime Security',
    label: 'Naval & Maritime',
    icon: '⚓',
    badgeColor: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
    accentColor: '#06b6d4',
    descriptionId: 'Warships, submarines, aircraft carriers, merchant vessel attacks, naval mines, and maritime theater security.',
    examples: 'Warship deployment, tanker attack, naval blockade.',
  },
  {
    id: 'Ground War & Frontline Changes',
    label: 'Ground War & Frontline',
    icon: '⚔️',
    badgeColor: 'border-orange-500/50 bg-orange-950/40 text-orange-400',
    accentColor: '#f97316',
    descriptionId: 'Territorial control shifts, mechanized infantry assaults, armored vehicle losses, fortifications, and frontline changes.',
    examples: 'Territorial advance, Russian MoD claims capture, Ukrainian counterattack.',
  },
  {
    id: 'Intelligence, Surveillance & OSINT Investigations',
    label: 'OSINT Investigations',
    icon: '🔍',
    badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400',
    accentColor: '#10b981',
    descriptionId: 'Field imagery and video analysis, military unit identification, open-source asset tracking, and propaganda claim audits.',
    examples: 'Geolocated footage, visual confirmation, claim verification.',
  },
  {
    id: 'Military Logistics & Strategic Infrastructure',
    label: 'Logistics & Infrastructure',
    icon: '🏭',
    badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
    accentColor: '#f43f5e',
    descriptionId: 'Ammunition depots, oil refineries, power grids, strategic rail links, naval ports, and defense industrial complexes.',
    examples: 'Refinery strike, ammunition depot explosion, military supply disruption.',
  },
];

export type TimelineUpdateType =
  | 'Investigation'
  | 'Update'
  | 'Alert'
  | 'Confirmed'
  | 'Escalation'
  | 'Resolution';

export interface IncidentTimelineUpdate {
  id: string;
  type: TimelineUpdateType;
  timestamp: string; // e.g. "October 9th, 9:55 PM (GMT-4)"
  isoDate?: string;
  badgeLabel?: string;
  headline?: string;
  description: string;
  sourceTag?: string; // e.g. "DeepStateUA", "Rybar", "UKMTO", "IDF Field Command"
  threatLevel?: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'INFO';
  isLive?: boolean;
}

export interface GlowToggles {
  headline: boolean;
  highlightBox: boolean;
  logo: boolean;
  badge: boolean;
  footer: boolean;
}

export interface GlowConfig {
  color: string; // default #FFFFFF
  intensity: number; // 0-100, default 60
  spread: number; // 0-100, default 50
  toggles: GlowToggles;
}

export interface BackgroundConfig {
  imageUrl: string;
  zoom: number; // 100 - 250%
  panX: number; // -100 to 100
  panY: number; // -100 to 100
  bottomGradientOpacity: number; // 0 - 100%
  bottomGradientHeight: number; // 20 - 80%
  topGradientOpacity: number; // 0 - 100%
}

export interface LogoConfig {
  show: boolean;
  size: number; // 40 - 120px
  margin: number; // 24 - 80px
  position: 'top-left' | 'top-right';
}

export interface EditorConfig {
  headline: string;
  highlightWords: string[];
  autoHighlightLastLine: boolean;
  fontSize: number; // 36 - 84
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  headlineY: number; // 40 - 90%
  headlineX: number; // 24 - 80px
  textColor: string;
  highlightBoxColor: string;
  highlightTextColor: string;
  glow: GlowConfig;
  background: BackgroundConfig;
  logo: LogoConfig;
  badge: {
    show: boolean;
    text: string;
  };
  divider: {
    show: boolean;
  };
  sourceLine: {
    show: boolean;
    text: string;
  };
  handleFooter: {
    show: boolean;
    text: string;
  };
  osintTelemetry?: {
    show: boolean;
    showThreatStamp: boolean;
    showRadarCrosshair?: boolean;
    format: 'compact' | 'full';
    theme?: 'tactical_cyan' | 'alert_red' | 'phosphor_green' | 'stark_white';
    customStampText?: string;
  };
  tacticalBadge?: {
    show: boolean;
    text: string;
    subText?: string;
    movementType?: MilitaryMovementType;
  };
  osintSatelliteMap?: {
    enabled?: boolean;
    show?: boolean;
    category?: any;
    gridZone?: string;
    targetName?: string;
    coordinates?: string;
    bdaStatus?: string;
    satelliteSensor?: string;
    dateStamp?: string;
    showCrosshair?: boolean;
    showCoordinatesHud?: boolean;
    showBdaBadge?: boolean;
    showCategoryBadge?: boolean;
    showGridLines?: boolean;
    theme?: string;
    comparisonMode?: 'SPLIT' | 'AFTER_ONLY' | 'BEFORE_ONLY' | 'SLIDER' | 'single' | 'split_before_after';
    bdaSummary?: string;
    sensorLabel?: string;
    beforeImageUrl?: string;
    afterImageUrl?: string;
  };
}

export interface AppSettings {
  channelName: string;
  handle: string;
  logoDataUrl: string;
  removeLogoBackground: boolean;
  accentColor: string;
  glowDefaults: GlowConfig;
  defaultHashtags: string;
  closingSentence: string;
  youtubePostsUrl: string;
  captionLang: 'id' | 'en';
  pollInterval: number; // seconds (15, 30, 60)
  soundEnabled: boolean;
  trackedConflicts: string[];
  trackedKeywords: string[];
}

export interface DraftItem {
  id: string;
  storyId: string;
  createdAt: string;
  title: string;
  source: string;
  imageUrl: string;
  editorConfig: EditorConfig;
  captionX: string;
  captionYouTube: string;
  isBreaking: boolean;
}

export interface FeedMonitor {
  id: string;
  name: string;
  type: 'X_ACCOUNT' | 'GOOGLE_NEWS' | 'WEB_RSS' | 'TELEGRAM_CHANNEL' | 'OSINT_DESK';
  queryOrUrl: string;
  url: string;
  enabled: boolean;
  isOsint?: boolean;
  xHandle?: string;
  category?: string;
  avatarUrl?: string;
  isCustom?: boolean;
  lastFetchedAt?: string;
  itemCount?: number;
}

export type MarketCategory = 'COMMODITIES' | 'CRYPTO' | 'FOREX' | 'INDICES';

export interface MarketAsset {
  symbol: string;
  displaySymbol: string;
  name: string;
  category: MarketCategory;
  unit: string;
  description: string;
  geopoliticalSensitivity: 'EXTREME' | 'HIGH' | 'MEDIUM';
  tvSymbol: string;
}

export type TradingBias = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface TechnicalLevels {
  entryZone: string;
  support1: string;
  support2: string;
  resistance1: string;
  resistance2: string;
  takeProfit1: string;
  takeProfit2: string;
  stopLoss: string;
  riskRewardRatio: string;
}

export interface MarketSentimentSignal {
  symbol: string;
  assetName: string;
  category: MarketCategory;
  signal: TradingBias;
  confidence: number;
  timeframe: 'SCALP' | 'INTRADAY' | 'SWING';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  catalystSummary: string;
  newsImpactAnalysis: string;
  technicalLevels: TechnicalLevels;
  correlatedNewsCount: number;
  generatedAt: string;
  provider: string;
}
