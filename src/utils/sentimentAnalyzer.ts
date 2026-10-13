import { SentimentAnalysis, SentimentCategory, ThreatLevel, MSMPenetration } from '../types';

export const SENTIMENT_CATEGORY_META: Record<
  SentimentCategory,
  {
    label: string;
    shortLabel: string;
    color: string;
    badgeBg: string;
    border: string;
    textClass: string;
    description: string;
  }
> = {
  CRITICAL_ESCALATION: {
    label: 'ESKALASI KRITIS',
    shortLabel: 'KRITIS',
    color: '#ef4444',
    badgeBg: 'bg-red-950/80',
    border: 'border-red-500/70',
    textClass: 'text-red-400',
    description: 'Serangan kinetik masif atau manuver destruktif dengan risiko eskalasi perang langsung',
  },
  HOSTILE_COMBAT: {
    label: 'PERTEMPURAN AKTIF',
    shortLabel: 'TEMPUR',
    color: '#f97316',
    badgeBg: 'bg-orange-950/80',
    border: 'border-orange-500/70',
    textClass: 'text-orange-400',
    description: 'Baku tembak, kontak senjata garis depan, atau penembakan artileri terarah',
  },
  HIGH_TENSION: {
    label: 'KETEGANGAN TINGGI',
    shortLabel: 'SIAGA',
    color: '#eab308',
    badgeBg: 'bg-amber-950/80',
    border: 'border-amber-500/70',
    textClass: 'text-amber-400',
    description: 'Ancaman pembalasan, mobilisasi kekuatan, atau retorika ancaman strategis',
  },
  NEUTRAL_TACTICAL: {
    label: 'TELEMETRI / TAKTIS',
    shortLabel: 'TAKTIK',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-950/80',
    border: 'border-cyan-500/70',
    textClass: 'text-cyan-400',
    description: 'Laporan pergerakan logistik, rekognisi drone, reposisi armada, atau patroli rutin',
  },
  DE_ESCALATION: {
    label: 'DE-ESKALASI / REDA',
    shortLabel: 'REDA',
    color: '#10b981',
    badgeBg: 'bg-emerald-950/80',
    border: 'border-emerald-500/70',
    textClass: 'text-emerald-400',
    description: 'Gencatan senjata, pertukaran tahanan, evakuasi warga, atau komitmen diplomasi',
  },
};

export const THREAT_LEVEL_META: Record<
  ThreatLevel,
  {
    code: string;
    label: string;
    badgeClass: string;
    bgClass: string;
    borderClass: string;
    glowClass: string;
  }
> = {
  EXTREME: {
    code: 'CODE RED',
    label: 'ANCAMAN EKSTREM',
    badgeClass: 'bg-red-600 text-white font-black',
    bgClass: 'bg-red-950/50',
    borderClass: 'border-red-500/70',
    glowClass: 'shadow-[0_0_12px_rgba(239,68,68,0.5)]',
  },
  HIGH: {
    code: 'CODE ORANGE',
    label: 'ANCAMAN TINGGI',
    badgeClass: 'bg-orange-600 text-white font-black',
    bgClass: 'bg-orange-950/50',
    borderClass: 'border-orange-500/70',
    glowClass: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]',
  },
  ELEVATED: {
    code: 'CODE YELLOW',
    label: 'ANCAMAN SIAGA',
    badgeClass: 'bg-amber-500 text-black font-black',
    bgClass: 'bg-amber-950/50',
    borderClass: 'border-amber-500/70',
    glowClass: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
  },
  GUARDED: {
    code: 'CODE GREEN',
    label: 'STATUS TERPANTAU',
    badgeClass: 'bg-emerald-600 text-white font-black',
    bgClass: 'bg-emerald-950/50',
    borderClass: 'border-emerald-500/70',
    glowClass: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
  },
};

export const MSM_PENETRATION_META: Record<
  MSMPenetration,
  {
    label: string;
    shortBadge: string;
    description: string;
    tagClass: string;
  }
> = {
  UNDER_THE_RADAR: {
    label: 'DECENTRALIZED OSINT / RAW INTERCEPT',
    shortBadge: '⚡ OSINT EXCLUSIVE',
    description: 'Direct frontline reports from OSINT / Telegram channels not yet covered by mainstream media',
    tagClass: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
  },
  EARLY_FIELD_SIGNAL: {
    label: 'EARLY FIELD SIGNAL',
    shortBadge: '📡 FIELD DISPATCH',
    description: 'Detected from tactical observation posts before international wire release',
    tagClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
  },
  MSM_BLINDSPOT: {
    label: 'MEDIA BLINDSPOT',
    shortBadge: '🎯 BLINDSPOT',
    description: 'Strategic conflict zone development overlooked by mainstream corporate news',
    tagClass: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
  },
};

/**
 * Analyzes raw intelligence report text, source provenance, and event markers
 * to generate automated sentiment, threat rating, and mainstream-media coverage status.
 */
export function analyzeStorySentiment(story: {
  title: string;
  summary?: string;
  source?: string;
  link?: string;
  eventType?: string;
  conflict?: string;
  isTelegram?: boolean;
  isOsint?: boolean;
  isBreaking?: boolean;
}): SentimentAnalysis {
  const text = `${story.title} ${story.summary || ''} ${story.source || ''}`.toLowerCase();
  const event = (story.eventType || '').toUpperCase();

  let hostileWeight = 0;
  let deEscalateWeight = 0;
  const keyDrivers: string[] = [];

  // 1. Extreme Kinetic & Lethal Markers (Weight +4 to +6)
  if (
    /ballistic\s+missile|hypersonic|salvo\s+rudal|barrage|heavy\s+shelling|cluster\s+munition|b-2|stealth\s+bomber|f-35|atacms|iskander|kinzhal|tsirkon|houthi\s+missile|rudal\s+balistik|serangan\s+fajar/i.test(
      text
    )
  ) {
    hostileWeight += 5;
    keyDrivers.push('Salvo Rudal / Serangan Hipersonik');
  }

  if (
    /massacre|casualties|killed|death\s+toll|warga\s+tewas|korban\s+jiwa|hancur\s+total|collateral\s+damage|blackout\s+total|target\s+sipil/i.test(
      text
    )
  ) {
    hostileWeight += 4;
    keyDrivers.push('Dampak Korban & Kehancuran');
  }

  if (
    /air\s+strike|airstrike|bombardment|pengeboman|jet\s+tempur|su-34|shahed|drone\s+swarm|kamikaze\s+drone|menghantam\s+pangkalan|gudang\s+amunisi/i.test(
      text
    )
  ) {
    hostileWeight += 4;
    keyDrivers.push('Serangan Udara / Drone Tempur');
  }

  if (
    /anti-ship|chokepoint|bab\s+al-mandeb|red\s+sea|carrier\s+strike|kapal\s+induk|destroyer|vessel\s+hit|on\s+fire|tenggelam|interdiksi/i.test(
      text
    )
  ) {
    hostileWeight += 4;
    keyDrivers.push('Interdiksi Maritim & Blokade');
  }

  if (
    /offensive|ground\s+assault|incursion|breakthrough|trench|frontline\s+collapse|menembus\s+pertahanan|serbuan\s+darat|mengepung/i.test(
      text
    )
  ) {
    hostileWeight += 3;
    keyDrivers.push('Ofensif Darat Terobosan');
  }

  if (
    /air\s+defense|intercept|patriot\s+fired|iron\s+dome|s-400|menembak\s+jatuh|sirene\s+udara|air\s+raid\s+alert/i.test(
      text
    )
  ) {
    hostileWeight += 3;
    keyDrivers.push('Aktivasi Pertahanan Udara');
  }

  if (
    /nuclear|dirty\s+bomb|radiasi|pltn|red\s+line|ultimatum|ancaman\s+nuklir|retaliation\s+vowed|balas\s+dendam/i.test(
      text
    )
  ) {
    hostileWeight += 5;
    keyDrivers.push('Eskalasi Ancaman Strategis');
  }

  // Event type baseline weights
  if (['MISSILE', 'AIRSTRIKE', 'SHELLING'].includes(event)) hostileWeight += 3;
  if (['DRONE', 'NAVAL', 'OFFENSIVE'].includes(event)) hostileWeight += 2;
  if (event === 'AIR DEFENSE') hostileWeight += 1;

  // 2. De-escalation & Diplomatic Markers
  if (
    /ceasefire|truce|gencatan\s+senjata|peace\s+talks|perundingan\s+damai|prisoner\s+swap|pertukaran\s+tawanan|evacuation\s+corridor|humanitarian\s+pause/i.test(
      text
    )
  ) {
    deEscalateWeight += 5;
    keyDrivers.push('Peluang Gencatan Senjata');
  }

  if (
    /withdraw|pullback|penarikan\s+pasukan|de-escalat|meredakan\s+ketegangan|diplomatic\s+channel|dialog|aid\s+convoy|bantuan\s+kemanusiaan/i.test(
      text
    )
  ) {
    deEscalateWeight += 3;
    keyDrivers.push('Manuver Penarikan / Diplomasi');
  }

  if (['CEASEFIRE', 'DIPLOMACY'].includes(event)) deEscalateWeight += 4;

  // 3. Compute Sentiment Score (-1.0 to 1.0) and Threat Score (0 to 100)
  let netHostility = hostileWeight - deEscalateWeight;
  let score = 0;
  let threatScore = 50;

  if (netHostility > 0) {
    // Negative score = hostile/escalating
    score = Math.max(-1.0, -Math.min(1.0, 0.2 + netHostility * 0.12));
    threatScore = Math.min(99, Math.max(55, 50 + netHostility * 7 + (story.isBreaking ? 10 : 0)));
  } else if (netHostility < 0) {
    // Positive score = de-escalating
    score = Math.min(1.0, Math.max(0.1, Math.abs(netHostility) * 0.18));
    threatScore = Math.max(10, Math.min(45, 50 - Math.abs(netHostility) * 8));
  } else {
    score = 0.0;
    threatScore = 48;
  }

  // Round score to 2 decimals
  score = Math.round(score * 100) / 100;
  threatScore = Math.min(100, Math.max(5, Math.round(threatScore)));

  // 4. Determine Sentiment Category
  let category: SentimentCategory = 'NEUTRAL_TACTICAL';
  if (score <= -0.75) {
    category = 'CRITICAL_ESCALATION';
  } else if (score <= -0.45) {
    category = 'HOSTILE_COMBAT';
  } else if (score < -0.15) {
    category = 'HIGH_TENSION';
  } else if (score >= 0.25) {
    category = 'DE_ESCALATION';
  } else {
    category = 'NEUTRAL_TACTICAL';
  }

  // 5. Determine Threat Level
  let threatLevel: ThreatLevel = 'GUARDED';
  if (threatScore >= 80) threatLevel = 'EXTREME';
  else if (threatScore >= 65) threatLevel = 'HIGH';
  else if (threatScore >= 45) threatLevel = 'ELEVATED';
  else threatLevel = 'GUARDED';

  // 6. Urgency Flag
  let urgency: 'FLASH' | 'URGENT' | 'ROUTINE' = 'ROUTINE';
  if (threatLevel === 'EXTREME' || story.isBreaking) urgency = 'FLASH';
  else if (threatLevel === 'HIGH' || score < -0.5) urgency = 'URGENT';

  // 7. Non-Mainstream Media Penetration (OSINT / Under-The-Radar)
  const isDirectTelegram =
    Boolean(story.isTelegram) ||
    /t\.me|telegram|@|ansarallah|kpszsu|operativnozsu|deepstate|rybar|milinfolive|rozhin|qudsn/i.test(
      story.source || ''
    );
  const isOsintSource =
    Boolean(story.isOsint) ||
    /osint|geoconfirmed|liveuamap|wartranslated|ukmto|frontelligence|bellingcat/i.test(
      `${story.source} ${story.link}`
    );

  let msmPenetration: MSMPenetration = 'UNDER_THE_RADAR';
  if (isDirectTelegram) {
    msmPenetration = 'UNDER_THE_RADAR';
  } else if (isOsintSource) {
    msmPenetration = 'EARLY_FIELD_SIGNAL';
  } else if (threatScore >= 70 && !/reuters|apnews|bbc|aljazeera|cnn/i.test(story.source || '')) {
    msmPenetration = 'MSM_BLINDSPOT';
  } else {
    msmPenetration = 'UNDER_THE_RADAR';
  }

  // 8. Generate Automated English Summary for OSINT Desk
  let sentimentSummary = '';
  if (category === 'CRITICAL_ESCALATION') {
    sentimentSummary = `Critical escalation (${threatScore}/100): High-damage kinetic operations or strike salvos detected without diplomatic pauses.`;
  } else if (category === 'HOSTILE_COMBAT') {
    sentimentSummary = `Active combat engagement (${threatScore}/100): Direct firefights and tactical maneuvers observed on operational frontlines.`;
  } else if (category === 'HIGH_TENSION') {
    sentimentSummary = `Elevated tension (${threatScore}/100): High-readiness posturing or threat warnings between opposing factions.`;
  } else if (category === 'DE_ESCALATION') {
    sentimentSummary = `De-escalation indicators (${threatScore}/100): Signs of reduced intensity or local humanitarian pause in the field.`;
  } else {
    sentimentSummary = `Controlled telemetry status (${threatScore}/100): Routine patrols and logistics movement with no active large-scale clashes.`;
  }

  // Default driver if empty
  if (keyDrivers.length === 0) {
    keyDrivers.push(
      event ? `Sector Activity ${event}` : 'Tactical Field Dynamics'
    );
  }

  const civilianImpactRisk: 'HIGH' | 'MODERATE' | 'LOW' =
    threatScore >= 80 ? 'HIGH' : threatScore >= 55 ? 'MODERATE' : 'LOW';

  const escalationProbability = Math.min(
    98,
    Math.max(12, Math.round(threatScore * 0.95))
  );

  return {
    score,
    threatScore,
    category,
    threatLevel,
    urgency,
    msmPenetration,
    sentimentSummary,
    keyDrivers: Array.from(new Set(keyDrivers)),
    civilianImpactRisk,
    escalationProbability,
  };
}
