import { MilitaryTrackingInfo, MilitaryMovementType, MilitaryForceType, NewsStory } from '../types';

export interface MilitaryFilterOption {
  id: string;
  label: string;
  category: 'ALL' | 'ARMY' | 'MILITIA' | 'AERIAL_NAVAL' | 'OPERATION';
  icon: string;
  badgeColor: string;
}

export const MILITARY_FILTER_OPTIONS: MilitaryFilterOption[] = [
  { id: 'ALL', label: 'SEMUA UNIT & OPERASI', category: 'ALL', icon: '⚔️', badgeColor: 'bg-neutral-800 text-white' },

  // --- TENTARA RESMI (Regular State Armies) ---
  { id: 'army-us-nato', label: '🇺🇸 Pasukan Amerika (US CENTCOM / Navy / USAF)', category: 'ARMY', icon: '🇺🇸', badgeColor: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/50' },
  { id: 'army-saudi', label: '🇸🇦 Pasukan Arab Saudi (KSA Armed Forces / RSAF)', category: 'ARMY', icon: '🇸🇦', badgeColor: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50' },
  { id: 'army-idf', label: '🇮🇱 Pasukan Israel (IDF / IAF F-35 Air Force)', category: 'ARMY', icon: '🇮🇱', badgeColor: 'bg-sky-950/70 text-sky-300 border-sky-500/50' },
  { id: 'army-afu', label: '🇺🇦 AFU / Tentara Ukraina (ZSU)', category: 'ARMY', icon: '🇺🇦', badgeColor: 'bg-blue-900/70 text-blue-300 border-blue-500/50' },
  { id: 'army-vsrf', label: '🇷🇺 Tentara Rusia (VSRF / VDV)', category: 'ARMY', icon: '🇷🇺', badgeColor: 'bg-red-950/70 text-red-300 border-red-500/50' },
  { id: 'army-iran', label: '🇮🇷 Garda Revolusi Iran (IRGC Aerospace & Navy)', category: 'ARMY', icon: '🇮🇷', badgeColor: 'bg-teal-950/70 text-teal-300 border-teal-500/50' },
  { id: 'army-saa', label: '🇸🇾 Tentara Suriah (SAA)', category: 'ARMY', icon: '🇸🇾', badgeColor: 'bg-amber-950/70 text-amber-300 border-amber-500/50' },

  // --- MILISI & FAKSI BERSENJATA (Militias & Non-State Armed Groups) ---
  { id: 'militia-houthi', label: '🇾🇪 Ansar Allah (Milisi Houthi Yaman)', category: 'MILITIA', icon: '🇾🇪', badgeColor: 'bg-emerald-900/80 text-emerald-200 border-emerald-400/60' },
  { id: 'militia-qassam', label: '🇵🇸 Al-Qassam & Faksi Gaza (Hamas / PIJ)', category: 'MILITIA', icon: '🇵🇸', badgeColor: 'bg-teal-900/80 text-teal-200 border-teal-400/60' },
  { id: 'militia-hezbollah', label: '🇱🇧 Hizbullah (Radwan Force Lebanon)', category: 'MILITIA', icon: '🇱🇧', badgeColor: 'bg-yellow-950/70 text-yellow-300 border-yellow-500/50' },
  { id: 'militia-iraq', label: '🇮🇶 Perlawanan Islam Irak (Kataib Hezbollah)', category: 'MILITIA', icon: '🇮🇶', badgeColor: 'bg-orange-950/70 text-orange-300 border-orange-500/50' },
  { id: 'militia-wagner', label: '🛡️ PMC Wagner / Korps Sukarelawan', category: 'MILITIA', icon: '🛡️', badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-600' },

  // --- PESAWAT TEMPUR, DRONE & KAPAL PERANG (Aviation & Naval Assets) ---
  { id: 'asset-jets', label: '✈️ Pesawat Tempur & Siluman (B-2, F-35, F-15, Su-34)', category: 'AERIAL_NAVAL', icon: '✈️', badgeColor: 'bg-violet-950/70 text-violet-300 border-violet-500/50' },
  { id: 'asset-drones', label: '📡 Drone Tempur & Pengintai (MQ-9, Shahed-136, FPV)', category: 'AERIAL_NAVAL', icon: '📡', badgeColor: 'bg-amber-950/70 text-amber-300 border-amber-500/50' },
  { id: 'asset-naval', label: '⚓ Kapal Induk & Destroyer (CSG, DDG, Warships)', category: 'AERIAL_NAVAL', icon: '⚓', badgeColor: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50' },
  { id: 'asset-missiles', label: '🚀 Rudal Balistik & Pertahanan Udara (Patriot, Arrow)', category: 'AERIAL_NAVAL', icon: '🚀', badgeColor: 'bg-rose-950/70 text-rose-300 border-rose-500/50' },

  // --- OPERASI MILITER AKTIF (Active Frontlines & Theaters) ---
  { id: 'op-redsea', label: '🌊 Interdiksi Laut Merah & Bab al-Mandeb (Houthi vs US/Koalisi)', category: 'OPERATION', icon: '🌊', badgeColor: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50' },
  { id: 'op-saudi-border', label: '🛡️ Pertahanan Perbatasan Saudi & Intersepsi Patriot', category: 'OPERATION', icon: '🛡️', badgeColor: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50' },
  { id: 'op-gaza', label: '⚔️ Operasi Sektor Gaza & Rafah (IDF vs Al-Qassam)', category: 'OPERATION', icon: '⚔️', badgeColor: 'bg-amber-950/70 text-amber-300 border-amber-500/50' },
  { id: 'op-us-centcom', label: '🦅 Gugus Tempur & Misi Serangan US CENTCOM', category: 'OPERATION', icon: '🦅', badgeColor: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/50' },
  { id: 'op-lebanon', label: '🏔️ Operasi Lintas Batas Lebanon (IDF vs Hizbullah)', category: 'OPERATION', icon: '🏔️', badgeColor: 'bg-lime-950/70 text-lime-300 border-lime-500/50' },
  { id: 'op-pokrovsk', label: '🎯 Ofensif Poros Pokrovsk (VSRF vs AFU)', category: 'OPERATION', icon: '🎯', badgeColor: 'bg-rose-950/70 text-rose-300 border-rose-500/50' },
  { id: 'op-kursk', label: '⚡ Manuver Perbatasan Wilayah Kursk', category: 'OPERATION', icon: '⚡', badgeColor: 'bg-purple-950/70 text-purple-300 border-purple-500/50' },
];

export const MOVEMENT_TYPE_META: Record<
  MilitaryMovementType,
  { label: string; icon: string; color: string; border: string; bg: string; description: string }
> = {
  ADVANCE: {
    label: 'Penetrasi Maju',
    icon: '↗️',
    color: 'text-rose-400',
    border: 'border-rose-500/50',
    bg: 'bg-rose-950/40',
    description: 'Serbuan ofensif dan penetrasi menekan garis pertahanan musuh',
  },
  REDEPLOYMENT: {
    label: 'Mobilisasi & Relokasi',
    icon: '🔄',
    color: 'text-blue-400',
    border: 'border-blue-500/50',
    bg: 'bg-blue-950/40',
    description: 'Alih gelar konvoi, rotasi pasukan, dan pengerahan bala bantuan',
  },
  ENCIRCLEMENT: {
    label: 'Manuver Sayap / Pengepungan',
    icon: '⭕',
    color: 'text-amber-400',
    border: 'border-amber-500/50',
    bg: 'bg-amber-950/40',
    description: 'Manuver menjepit poros logistik dan isolasi posisi tempur',
  },
  DEFENSE: {
    label: 'Pertahanan Garis / Kubu',
    icon: '🛡️',
    color: 'text-emerald-400',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-950/40',
    description: 'Kesiagaan benteng pertahanan, parit perlindungan, dan pencegatan',
  },
  WITHDRAWAL: {
    label: 'Penarikan Taktis',
    icon: '↩️',
    color: 'text-yellow-400',
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-950/40',
    description: 'Penarikan pasukan secara teratur dan reposisi ke garis belakang',
  },
  STRIKE_SORTIE: {
    label: 'Salvo Rudal / Serangan Jarak Jauh',
    icon: '🚀',
    color: 'text-red-400',
    border: 'border-red-500/50',
    bg: 'bg-red-950/40',
    description: 'Peluncuran salvo rudal balistik, jelajah, dan kawanan drone serbu',
  },
  AIR_SORTIE: {
    label: 'Manuver Pesawat Tempur / Sortie Udara',
    icon: '✈️',
    color: 'text-violet-400',
    border: 'border-violet-500/50',
    bg: 'bg-violet-950/40',
    description: 'Serangan udara pesawat tempur, misi pengeboman siluman & patroli CAP',
  },
  NAVAL_MANEUVER: {
    label: 'Operasi Laut / Patroli Interdiksi',
    icon: '⚓',
    color: 'text-cyan-400',
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-950/40',
    description: 'Manuver kapal perang, interdiksi maritim, dan kesiagaan gugus tempur',
  },
  AIR_DEFENSE_ACTION: {
    label: 'Pencegatan Pertahanan Udara',
    icon: '🛡️⚡',
    color: 'text-sky-400',
    border: 'border-sky-500/50',
    bg: 'bg-sky-950/40',
    description: 'Intersepsi radar aktif, penembakan rudal penangkal (Patriot / Iron Dome)',
  },
};

/**
 * Tactical Theater definitions with coordinates and hotpoint descriptions for map radar display
 */
export interface TacticalTheaterInfo {
  id: string;
  name: string;
  flag: string;
  coordinates: { x: number; y: number }; // Relative 0-100% canvas coordinates
  forcesActive: string[];
  hotpoint: string;
  status: 'HIGH_INTENSITY' | 'SURVEILLANCE' | 'ACTIVE_CLASH';
}

export const TACTICAL_THEATERS: TacticalTheaterInfo[] = [
  {
    id: 'theater-redsea',
    name: 'Laut Merah & Bab al-Mandeb',
    flag: '🇾🇪⚓',
    coordinates: { x: 44, y: 64 },
    forcesActive: ['Ansar Allah (Houthi)', 'US CENTCOM / Navy', 'Koalisi Sekutu'],
    hotpoint: 'Serangan rudal anti-kapal Houthi vs Destroyer US Navy & interdiksi kapal dagang',
    status: 'HIGH_INTENSITY',
  },
  {
    id: 'theater-saudi-border',
    name: 'Perbatasan Selatan Arab Saudi',
    flag: '🇸🇦🛡️',
    coordinates: { x: 50, y: 58 },
    forcesActive: ['Pasukan Arab Saudi', 'RSAF Air Defense', 'Ansar Allah'],
    hotpoint: 'Kesiagaan sistem Patriot PAC-3 & patroli perbatasan Jizan / Najran / Khamis Mushait',
    status: 'ACTIVE_CLASH',
  },
  {
    id: 'theater-gaza',
    name: 'Sektor Jalur Gaza & Rafah',
    flag: '🇵🇸⚔️🇮🇱',
    coordinates: { x: 38, y: 50 },
    forcesActive: ['IDF (Israel)', 'Al-Qassam & Faksi Gaza'],
    hotpoint: 'Pertempuran jarak dekat lorong & reruntuhan, serbuan udara IAF & perlawanan anti-tank',
    status: 'HIGH_INTENSITY',
  },
  {
    id: 'theater-lebanon',
    name: 'Front Lintas Batas Lebanon Selatan',
    flag: '🇱🇧⚔️🇮🇱',
    coordinates: { x: 40, y: 46 },
    forcesActive: ['Hizbullah (Radwan Force)', 'IDF Komando Utara'],
    hotpoint: 'Baku tembak artileri, salvo roket perbatasan & serangan udara terarah di Dahieh / Litani',
    status: 'ACTIVE_CLASH',
  },
  {
    id: 'theater-centcom-gulf',
    name: 'Koridor US CENTCOM & Teluk Persia',
    flag: '🇺🇸✈️',
    coordinates: { x: 56, y: 52 },
    forcesActive: ['US CENTCOM (Carrier CSG)', 'US Air Force (B-2 / MQ-9)', 'IRGC Iran'],
    hotpoint: 'Patroli kapal induk USS Lincoln / Truman, sortie pengebom siluman B-2 & orbit MQ-9 Reaper',
    status: 'SURVEILLANCE',
  },
  {
    id: 'theater-pokrovsk',
    name: 'Poros Ofensif Donbas (Pokrovsk)',
    flag: '🇺🇦⚔️🇷🇺',
    coordinates: { x: 48, y: 28 },
    forcesActive: ['AFU / Tentara Ukraina', 'Tentara Rusia (VSRF)'],
    hotpoint: 'Penetrasi mekanis divisi lapis baja Rusia membidik hub logistik Pokrovsk',
    status: 'HIGH_INTENSITY',
  },
  {
    id: 'theater-kursk',
    name: 'Garis Depan Wilayah Kursk',
    flag: '⚡🇷🇺🇺🇦',
    coordinates: { x: 46, y: 22 },
    forcesActive: ['AFU Pasukan Manuver', 'VSRF / Pasukan Marinir & VDV'],
    hotpoint: 'Serangan sayap, perebutan desa perbatasan & pertempuran manuver mobile',
    status: 'ACTIVE_CLASH',
  },
];

/**
 * Extracts military hardware, aircraft, warships, missiles, and specific military units from text
 */
export function extractMilitaryAssets(text: string): string[] {
  const assets: string[] = [];
  const lower = text.toLowerCase();

  // Stealth Bombers & Fighter Jets
  if (/b-2|b-2\s+spirit|stealth\s+bomber|pengebom\s+siluman/i.test(lower)) {
    assets.push('B-2 Spirit Stealth Bomber');
  }
  if (/f-35|f-35i|adir|lightning\s+ii/i.test(lower)) {
    assets.push('F-35 Lightning II / Adir');
  }
  if (/f-16|fighting\s+falcon|viper/i.test(lower)) {
    assets.push('F-16 Fighting Falcon');
  }
  if (/f-15|f-15e|strike\s+eagle|f-15i|ra'am|f-15sa/i.test(lower)) {
    assets.push('F-15 Strike Eagle / SA');
  }
  if (/su-34|fullback/i.test(lower)) {
    assets.push('Su-34 Fullback Strike Fighter');
  }
  if (/su-35|flanker-e|su-57|felon/i.test(lower)) {
    assets.push('Su-35 / Su-57 Fighter');
  }
  if (/mig-31|kinzhal\s+carrier/i.test(lower)) {
    assets.push('MiG-31K Interceptor');
  }

  // Combat Drones & UAVs
  if (/mq-9|reaper|predator/i.test(lower)) {
    assets.push('MQ-9 Reaper Strike UAV');
  }
  if (/shahed|shahed-136|geran-2/i.test(lower)) {
    assets.push('Shahed-136 Kamikaze Drone');
  }
  if (/fpv\s+drone|kamikaze\s+drone|drone\s+swarm/i.test(lower)) {
    assets.push('FPV Combat Drone Swarm');
  }

  // Warships & Naval Assets
  if (/aircraft\s+carrier|carrier\s+strike\s+group|kapal\s+induk|uss\s+(?:abraham\s+lincoln|harry\s+s\.\s+truman|dwight\s+d\.\s+eisenhower|truman|lincoln)/i.test(lower)) {
    assets.push('US Navy Carrier Strike Group (CSG)');
  }
  if (/guided\s+missile\s+destroyer|arleigh\s+burke|kapal\s+perusak|destroyer|ddg/i.test(lower)) {
    assets.push('Arleigh Burke-class Destroyer (DDG)');
  }
  if (/sa'ar\s*6|saar\s*6|korvet\s+sa'ar/i.test(lower)) {
    assets.push('Sa’ar 6-class Corvette (Israel Navy)');
  }
  if (/magura|usv|sea\s+drone|drone\s+laut/i.test(lower)) {
    assets.push('Magura V5 Naval Drone (USV)');
  }

  // Air Defense & Missiles
  if (/patriot|pac-3|patriot\s+missile|baterai\s+patriot/i.test(lower)) {
    assets.push('MIM-104 Patriot PAC-3');
  }
  if (/iron\s+dome|kubah\s+besi/i.test(lower)) {
    assets.push('Iron Dome C-RAM');
  }
  if (/arrow\s*3|arrow-3|david's\s+sling/i.test(lower)) {
    assets.push('Arrow-3 / David’s Sling System');
  }
  if (/s-400|s-300|triumph/i.test(lower)) {
    assets.push('S-400 Triumf Air Defense');
  }
  if (/ballistic\s+missile|anti-ship\s+missile|rudal\s+balistik|rudal\s+anti-kapal|asbm/i.test(lower)) {
    assets.push('Anti-Ship Ballistic Missile (ASBM)');
  }
  if (/yasin|al-yasin\s+105|yasin-105|tandem\s+rpg/i.test(lower)) {
    assets.push('Al-Yasin 105 Tandem RPG');
  }
  if (/atacms|storm\s+shadow|scalp|iskander/i.test(lower)) {
    assets.push('ATACMS / Iskander-M Ballistic');
  }

  return Array.from(new Set(assets));
}

/**
 * Analyzes news content and extracts military forces, militias, operations, movement vectors, and sectors.
 */
export function detectMilitaryTracking(item: {
  title: string;
  summary?: string;
  source?: string;
  conflict?: string;
  eventType?: string;
}): MilitaryTrackingInfo | undefined {
  const text = `${item.title} ${item.summary || ''} ${item.source || ''}`.toLowerCase();

  const forces: string[] = [];
  const militias: string[] = [];
  const operations: string[] = [];
  let detectedSector = '';
  let unitMentioned = '';

  // 1. REGULAR STATE ARMIES (Tentara Resmi)
  // US Forces / CENTCOM
  if (
    /us\s+(?:military|navy|air\s+force|army|troops|forces)|centcom|pentagon|nato|pasukan\s+amerika|tentara\s+as|militer\s+amerika|koalisi\s+(?:as|nato|maritim)|b-2|carrier\s+strike|uss\s+(?:lincoln|truman|eisenhower)/i.test(
      text
    )
  ) {
    forces.push('Pasukan Amerika (US CENTCOM / Navy)');
  }

  // Saudi Armed Forces (KSA) - As specifically requested by user
  if (
    /saudi|riyadh|rsaf|royal\s+saudi|tentara\s+saudi|pasukan\s+arab\s+saudi|militer\s+saudi|koalisi\s+arab|patriot\s+saudi|jizan|najran|asir|khamis\s+mushait|القوات\s+السعودية|التحالف\s+العربي|سلاح\s+الجو\s+السعودي|الدفاع\s+الجوي\s+الملكي/i.test(
      text
    )
  ) {
    forces.push('Pasukan Arab Saudi (KSA Armed Forces / RSAF)');
    operations.push('Pertahanan Perbatasan Saudi & Intersepsi Patriot');
  }

  // Israel Defense Forces (IDF) - As requested
  if (
    /idf|israel\s+defense\s+forces|israeli\s+(?:army|military|air\s+force|troops|navy)|tentara\s+israel|militer\s+israel|pasukan\s+israel|iaf|f-35i|iron\s+dome|arrow-3|golani|divisi\s+(?:98|36|162)|צה"ל|جيش\s+الاحتلال/i.test(
      text
    )
  ) {
    forces.push('Pasukan Israel (IDF / IAF)');
  }

  // Ukrainian Armed Forces (AFU / ZSU)
  if (
    /afu|zsu|ukrainian\s+(?:armed\s+forces|army|military|troops|brigade|marines|air\s+force)|kpszsu|operativnozsu|tentara\s+ukraina|angkatan\s+bersenjata\s+ukraina|зсу|повітрян|генеральний\s+штаб/i.test(
      text
    )
  ) {
    forces.push('AFU (ZSU / Ukraina)');
  }

  // Russian Armed Forces (VSRF)
  if (
    /vsrf|russian\s+(?:army|armed\s+forces|military|troops|defense\s+ministry|mod|vdv|marines|air\s+force)|tentara\s+rusia|militer\s+rusia|рыбарь|минобороны|вс\s*рф|осведомитель/i.test(
      text
    )
  ) {
    forces.push('Tentara Rusia (VSRF / VDV)');
  }

  // Iranian Armed Forces & IRGC
  if (/irgc|iranian\s+(?:armed\s+forces|military|guards|aerospace|navy)|garda\s+revolusi\s+iran|pasukan\s+iran|الحرس\s+الثوري/i.test(text)) {
    forces.push('Garda Revolusi Iran (IRGC)');
  }

  // Syrian Armed Forces (SAA)
  if (/syrian\s+(?:army|armed\s+forces)|saa|tentara\s+suriah|damascus\s+troops|الجيش\s+السوري/i.test(text)) {
    forces.push('Tentara Suriah (SAA)');
  }

  // 2. MILITIAS & PARAMILITARY FACTIONS (Milisi & Faksi Bersenjata)
  // Ansar Allah / Houthis (Yemen) - As specifically requested by user
  if (
    /houthi|ansar\s*allah|yemen\s+(?:armed\s+forces|navy|militia|force)|milisi\s+houthi|ansarallah|yaman\s+force|tentara\s+yaman|pasukan\s+houthi|حوثي|أنصار\s*الله|القوات\s+المسلحة\s+اليمنية/i.test(
      text
    )
  ) {
    militias.push('Ansar Allah (Milisi Houthi Yaman)');
    operations.push('Interdiksi Laut Merah & Bab al-Mandeb');
  }

  // Hamas & Palestinian Factions (Al-Qassam, Saraya Al-Quds) - As specifically requested
  if (
    /hamas|qassam|al-qassam|palestinian\s+islamic\s+jihad|pij|saraya\s+al-quds|faksi\s+gaza|brigade\s+al-qassam|pejuang\s+hamas|yasin\s+105|كتائب\s*القسام|حماس|سرايا\s+القدس/i.test(
      text
    )
  ) {
    militias.push('Al-Qassam & Faksi Gaza (Hamas)');
    operations.push('Operasi Militer Sektor Gaza & Rafah');
  }

  // Hezbollah (Lebanon)
  if (
    /hezbollah|hizbullah|islamic\s+resistance\s+in\s+lebanon|radwan\s+force|milisi\s+hizbullah|حزب\s*الله/i.test(
      text
    )
  ) {
    militias.push('Hizbullah (Radwan Force Lebanon)');
    operations.push('Operasi Lintas Batas Lebanon');
  }

  // Islamic Resistance in Iraq
  if (
    /islamic\s+resistance\s+in\s+iraq|kata'ib\s+hezbollah|al-nujaba|badr\s+organization|milisi\s+irak|pro-iran\s+militia|المقاومة\s+الإسلامية\s+في\s+العراق/i.test(
      text
    )
  ) {
    militias.push('Perlawanan Islam Irak');
  }

  // Wagner / Volunteer Corps
  if (/wagner|pmc|africa\s+corps|russian\s+volunteer\s+corps|korps\s+sukarelawan/i.test(text)) {
    militias.push('PMC Wagner / Korps Sukarelawan');
  }

  // 3. NAMED OPERATIONS & STRATEGIC AXES
  if (/red\s+sea|bab\s+al-mandeb|gulf\s+of\s+aden|laut\s+merah|selat\s+mandeb|prosperity\s+guardian/i.test(text)) {
    if (!operations.includes('Interdiksi Laut Merah & Bab al-Mandeb')) {
      operations.push('Interdiksi Laut Merah & Bab al-Mandeb');
    }
    detectedSector = 'Koridor Maritim Laut Merah & Bab al-Mandeb';
  }

  if (/saudi\s+border|jizan|najran|asir|southern\s+saudi|perbatasan\s+saudi/i.test(text)) {
    if (!operations.includes('Pertahanan Perbatasan Saudi & Intersepsi Patriot')) {
      operations.push('Pertahanan Perbatasan Saudi & Intersepsi Patriot');
    }
    detectedSector = 'Garis Perbatasan Selatan Arab Saudi';
  }

  if (/gaza|rafah|khan\s+younis|netzarim|jabalia|jalur\s+gaza/i.test(text)) {
    if (!operations.includes('Operasi Militer Sektor Gaza & Rafah')) {
      operations.push('Operasi Militer Sektor Gaza & Rafah');
    }
    detectedSector = 'Sektor Jalur Gaza & Rafah';
  }

  if (/lebanon|litani|beirut|dahieh|selatan\s+lebanon/i.test(text)) {
    if (!operations.includes('Operasi Lintas Batas Lebanon')) {
      operations.push('Operasi Lintas Batas Lebanon');
    }
    detectedSector = 'Garis Depan Lebanon Selatan';
  }

  if (/pokrovsk|toretsk|myrnohrad|poros\s+pokrovsk/i.test(text)) {
    operations.push('Ofensif Poros Pokrovsk');
    detectedSector = 'Poros Ofensif Donbas-Pokrovsk';
  }

  if (/kursk|sudzha|korenevo|perbatasan\s+kursk/i.test(text)) {
    operations.push('Manuver Perbatasan Kursk');
    detectedSector = 'Garis Depan Wilayah Kursk';
  }

  // Extract Mentioned Tactical Units & Hardware
  const assetsMentioned = extractMilitaryAssets(text);

  const unitRegexes = [
    /(\b\d{1,3}(?:st|nd|rd|th)?\s+(?:mechanized|assault|airborne|armored|infantry|brigade|division|regiment)\b)/i,
    /(brigade\s+\d{1,3}|divisi\s+\d{1,3}|batalyon\s+[a-zA-Z0-9]+)/i,
    /(radwan\s+(?:unit|force)|pasukan\s+radwan)/i,
    /(al-qassam\s+brigade|brigade\s+al-qassam|al-quds\s+brigade)/i,
    /(carrier\s+strike\s+group|gugus\s+tempur\s+kapal\s+induk)/i,
    /(royal\s+saudi\s+air\s+force|rsaf\s+squadron)/i,
    /(black\s+sea\s+fleet|armada\s+laut\s+hitam)/i,
  ];

  for (const reg of unitRegexes) {
    const match = text.match(reg);
    if (match && match[1]) {
      unitMentioned = match[1].trim();
      break;
    }
  }

  // Fallback defaults based on conflict category or source if empty
  if (forces.length === 0 && militias.length === 0 && operations.length === 0) {
    if (
      item.conflict === 'Bab al-Mandeb / Red Sea' ||
      item.conflict === 'Yemen / Red Sea' ||
      /yemen|houthi|ansarallah|bab al-mandeb|red sea|laut merah|aden/i.test(text)
    ) {
      militias.push('Ansar Allah (Milisi Houthi Yaman)');
      forces.push('Pasukan Amerika (US CENTCOM / Navy)');
      operations.push('Interdiksi Laut Merah & Bab al-Mandeb');
      detectedSector = 'Koridor Maritim Laut Merah & Bab al-Mandeb';
    } else if (
      item.conflict === 'Israel-Gaza' ||
      /gaza|hamas|qassam|rafah|khan younis|palestine/i.test(text)
    ) {
      militias.push('Al-Qassam & Faksi Gaza (Hamas)');
      forces.push('Pasukan Israel (IDF / IAF)');
      operations.push('Operasi Militer Sektor Gaza & Rafah');
      detectedSector = 'Sektor Jalur Gaza & Rafah';
    } else if (
      item.conflict === 'Lebanon / Hezbollah' ||
      /lebanon|hezbollah|hizbullah|beirut|dahieh|litani/i.test(text)
    ) {
      militias.push('Hizbullah (Radwan Force Lebanon)');
      forces.push('Pasukan Israel (IDF / IAF)');
      operations.push('Operasi Lintas Batas Lebanon');
      detectedSector = 'Garis Depan Lebanon Selatan';
    } else if (
      item.conflict === 'Russia-Ukraine' ||
      /ukraine|russia|kyiv|kharkiv|donbas|pokrovsk|kursk|zsu|vsrf/i.test(text)
    ) {
      forces.push('AFU (ZSU / Ukraina)');
      forces.push('Tentara Rusia (VSRF / VDV)');
      detectedSector = 'Garis Depan Ukraina Timur';
      operations.push('Manuver Front Ofensif & Pertahanan Teritorial');
    } else if (
      item.conflict === 'China-Taiwan' ||
      /taiwan|pla|beijing|taipei|south china sea|laut china selatan/i.test(text)
    ) {
      forces.push('PLA (Militer Tiongkok)');
      forces.push('ROC (Angkatan Bersenjata Taiwan)');
      operations.push('Patroli Tempur Selat Taiwan & Laut China Selatan');
      detectedSector = 'Selat Taiwan & Kawasan Indo-Pasifik';
    } else if (
      item.conflict === 'North Korea' ||
      /north korea|pyongyang|dprk|kim jong|korea utara|icbm|laut jepang/i.test(text)
    ) {
      forces.push('KPA (Militer Korea Utara)');
      forces.push('US-ROK Combined Forces');
      operations.push('Uji Coba Rudal Strategis & Kesiapsiagaan DMZ');
      detectedSector = 'Semenanjung Korea & Laut Timur';
    } else if (
      item.conflict === 'Israel-Iran / Iran' ||
      /iran|tehran|irgc|hormuz|persian gulf|teluk persia/i.test(text)
    ) {
      forces.push('Garda Revolusi Iran (IRGC)');
      forces.push('Pasukan Israel / US CENTCOM');
      operations.push('Kesiagaan Pertahanan Teluk & Rudal Hipersonik');
      detectedSector = 'Teater Teluk Persia & Teheran';
    } else if (
      item.conflict === 'Syria' ||
      /syria|damascus|saa|suriah|golan|idlib|aleppo/i.test(text)
    ) {
      forces.push('Tentara Suriah (SAA)');
      forces.push('Koalisi Taktis Garis Depan');
      operations.push('Operasi Stabilitas Wilayah Suriah');
      detectedSector = 'Garis Depan Suriah & Dataran Tinggi Golan';
    } else if (
      item.conflict === 'Sudan' ||
      /sudan|khartoum|darfur|rsf|saf/i.test(text)
    ) {
      forces.push('SAF (Angkatan Bersenjata Sudan)');
      militias.push('RSF (Rapid Support Forces)');
      operations.push('Pertempuran Kendali Ibukota & Darfur');
      detectedSector = 'Sektor Khartoum & Kawasan Darfur';
    } else if (
      item.conflict === 'Myanmar' ||
      /myanmar|junta|tatmadaw|pdf/i.test(text)
    ) {
      forces.push('Tatmadaw (Militer Junta Myanmar)');
      militias.push('PDF (People\'s Defense Force)');
      operations.push('Operasi Perlawanan Front Regional');
      detectedSector = 'Sektor Pertahanan Regional Myanmar';
    } else {
      // Universal Intelligent Fallback for all other news/sources
      const srcName = item.source || 'Intelijen Pertahanan';
      forces.push(`Gugus Tugas Taktis (${srcName.replace(/@/g, '').split(' ')[0]})`);
      operations.push('Pemantauan Operasional & Kesiagaan Strategis');
      detectedSector = item.conflict && item.conflict !== 'ALL' && item.conflict !== 'Global Conflicts'
        ? `Teater Operasi ${item.conflict}`
        : 'Teater Pertahanan & Keamanan Global';
    }
  }

  // Ensure forces has at least one entry
  if (forces.length === 0 && militias.length === 0) {
    forces.push('Satuan Pengamanan Taktis');
  }

  // 4. DETECT MOVEMENT TYPE (Vektor Pergerakan & Status Taktis)
  let movementType: MilitaryMovementType = 'ADVANCE';
  let tacticalSummary = 'Penetrasi serbuan maju menekan garis pertahanan';

  // Check air defense interception
  if (
    /air\s+defense|intercept|intercepted|downed|patriot\s+(?:downed|intercept)|iron\s+dome\s+engaged|intersepsi|menembak\s+jatuh|menangkal\s+rudal/i.test(
      text
    )
  ) {
    movementType = 'AIR_DEFENSE_ACTION';
    tacticalSummary = 'Aksi pertahanan udara & intersepsi proyektil inbound';
  } else if (
    /fighter\s+jet|stealth\s+bomber|b-2|air\s+strike|airstrike|sorties|air\s+patrol|bombardment|pesawat\s+tempur|serangan\s+udara|pengeboman/i.test(
      text
    )
  ) {
    movementType = 'AIR_SORTIE';
    tacticalSummary = 'Manuver pesawat tempur & sortie pengeboman terarah';
  } else if (
    /missile\s+barrage|salvo|ballistic\s+missile|drone\s+swarm|shahed|rudal\s+balistik|peluncuran\s+rudal|salvo\s+roket/i.test(
      text
    )
  ) {
    movementType = 'STRIKE_SORTIE';
    tacticalSummary = 'Serangan jarak jauh via salvo rudal dan kawanan drone';
  } else if (
    /warship|destroyer|aircraft\s+carrier|naval|anti-ship|patrol|kapal\s+perang|kapal\s+induk|interdiksi\s+laut|blokade/i.test(
      text
    )
  ) {
    movementType = 'NAVAL_MANEUVER';
    tacticalSummary = 'Patroli kapal perang & interdiksi perairan strategis';
  } else if (
    /retreat|withdraw|pulled\s+back|fall\s+back|mundur|penarikan\s+pasukan|meninggalkan\s+posisi/i.test(
      text
    )
  ) {
    movementType = 'WITHDRAWAL';
    tacticalSummary = 'Penarikan taktis dan reorganisasi formasi pertahanan';
  } else if (
    /encircle|surround|pocket|flank|pincer|mengepung|manuver\s+sayap|menjepit\s+posisi/i.test(
      text
    )
  ) {
    movementType = 'ENCIRCLEMENT';
    tacticalSummary = 'Manuver sayap & penjepitan poros pergerakan lawan';
  } else if (
    /deploy|redeploy|convoy|reinforce|transfer\s+troops|alih\s+gelar|mobilisasi|penempatan\s+pasukan|konvoi/i.test(
      text
    )
  ) {
    movementType = 'REDEPLOYMENT';
    tacticalSummary = 'Mobilisasi unit dan alih gelar kekuatan tempur';
  } else if (
    /defend|fortif|trench|repel|repulsed|bunker|menahan|membendung|benteng\s+pertahanan/i.test(
      text
    )
  ) {
    movementType = 'DEFENSE';
    tacticalSummary = 'Pertahanan garis perimeter dan kubu perlindungan';
  } else {
    movementType = 'ADVANCE';
    tacticalSummary = 'Penetrasi serbuan maju menekan garis pertahanan musuh';
  }

  let forceType: MilitaryForceType = 'REGULAR_ARMY';
  if (assetsMentioned.length > 0) {
    forceType = 'AIR_NAVAL_ASSET';
  } else if (militias.length > 0 && forces.length === 0) {
    forceType = 'MILITIA_PARAMILITARY';
  } else if (operations.length > 0 && forces.length === 0 && militias.length === 0) {
    forceType = 'SPECIAL_OPERATION';
  }

  // Determine Theater Data for visual display
  let theaterData: { name: string; flag: string; hotpoint: string } | undefined;
  if (detectedSector.includes('Merah') || detectedSector.includes('Mandeb')) {
    theaterData = { name: 'Laut Merah & Bab al-Mandeb', flag: '🇾🇪⚓', hotpoint: 'Interdiksi Maritim Houthi vs US Navy' };
  } else if (detectedSector.includes('Saudi')) {
    theaterData = { name: 'Perbatasan Arab Saudi', flag: '🇸🇦🛡️', hotpoint: 'Patriot Air Defense & Southern Border' };
  } else if (detectedSector.includes('Gaza')) {
    theaterData = { name: 'Sektor Jalur Gaza', flag: '🇵🇸⚔️🇮🇱', hotpoint: 'IDF Southern Command vs Brigade Al-Qassam' };
  } else if (detectedSector.includes('Lebanon')) {
    theaterData = { name: 'Garis Depan Lebanon', flag: '🇱🇧⚔️🇮🇱', hotpoint: 'Hizbullah vs IDF Northern Command' };
  } else if (detectedSector.includes('Pokrovsk')) {
    theaterData = { name: 'Poros Donbas Pokrovsk', flag: '🇺🇦⚔️🇷🇺', hotpoint: 'Ofensif VSRF vs Pertahanan AFU' };
  } else if (detectedSector.includes('Kursk')) {
    theaterData = { name: 'Front Wilayah Kursk', flag: '⚡🇷🇺🇺🇦', hotpoint: 'Pertempuran Lintas Batas' };
  } else if (detectedSector.includes('Taiwan') || detectedSector.includes('Pasifik')) {
    theaterData = { name: 'Selat Taiwan & Indo-Pasifik', flag: '🇨🇳⚔️🇹🇼', hotpoint: 'Patroli Tempur PLA vs Pertahanan Taiwan' };
  } else if (detectedSector.includes('Korea')) {
    theaterData = { name: 'Semenanjung Korea', flag: '🇰🇵🚀🇰🇷', hotpoint: 'Uji Coba Rudal DPRK vs Sekutu AS-ROK' };
  } else if (detectedSector.includes('Iran') || detectedSector.includes('Teluk')) {
    theaterData = { name: 'Teater Teluk & Iran', flag: '🇮🇷⚡🇺🇸', hotpoint: 'Kesiapsiagaan IRGC vs Komando US CENTCOM' };
  } else if (detectedSector.includes('Suriah') || detectedSector.includes('Golan')) {
    theaterData = { name: 'Teater Wilayah Suriah', flag: '🇸🇾⚔️', hotpoint: 'Front Operasi Suriah & Golan' };
  } else if (detectedSector.includes('Sudan')) {
    theaterData = { name: 'Konflik Bersenjata Sudan', flag: '🇸🇩⚡', hotpoint: 'SAF vs Pasukan Milisi RSF' };
  } else {
    theaterData = { name: detectedSector || 'Pertahanan Global', flag: '🌐📡', hotpoint: 'Pemantauan Situasi Pertahanan Taktis' };
  }

  return {
    forceType,
    forces,
    militias,
    operations,
    movementType,
    sector: detectedSector || 'Front Operasi Aktif',
    tacticalSummary,
    unitMentioned: unitMentioned || undefined,
    assetsMentioned: assetsMentioned.length > 0 ? assetsMentioned : undefined,
    theaterData,
  };
}

/**
 * Returns a quick tactical filter match for stories based on selected filter option ID.
 */
export function matchesMilitaryFilter(story: NewsStory, filterId: string): boolean {
  if (filterId === 'ALL') return true;

  const tracking = story.militaryTracking || detectMilitaryTracking(story);
  const text = `${story.title} ${story.summary} ${story.source}`.toLowerCase();

  switch (filterId) {
    // 1. Regular Armies
    case 'army-us-nato':
      return (
        Boolean(tracking && tracking.forces.some((f) => /centcom|us\s+|amerika|nato/i.test(f))) ||
        /us\s+(?:military|navy|air\s+force|army)|centcom|pentagon|pasukan\s+amerika|tentara\s+as|b-2|carrier\s+strike|uss\s+(?:lincoln|truman)/i.test(text)
      );

    case 'army-saudi':
      return (
        Boolean(tracking && tracking.forces.some((f) => /saudi|ksa|rsaf/i.test(f))) ||
        /saudi|riyadh|rsaf|royal\s+saudi|tentara\s+saudi|pasukan\s+arab\s+saudi|militer\s+saudi|patriot\s+saudi|jizan|najran|القوات\s+السعودية/i.test(text)
      );

    case 'army-idf':
      return (
        Boolean(tracking && tracking.forces.some((f) => /idf|israel|iaf/i.test(f))) ||
        /idf|israel\s+defense|tentara\s+israel|militer\s+israel|pasukan\s+israel|iaf|f-35i|iron\s+dome|צה"ל/i.test(text)
      );

    case 'army-afu':
      return (
        Boolean(tracking && tracking.forces.some((f) => /afu|zsu|ukraina/i.test(f))) ||
        /afu|zsu|tentara\s+ukraina|зсу|повітрян/i.test(text)
      );

    case 'army-vsrf':
      return (
        Boolean(tracking && tracking.forces.some((f) => /vsrf|rusia|vdv/i.test(f))) ||
        /vsrf|tentara\s+rusia|militer\s+rusia|минобороны|вс\s*рф/i.test(text)
      );

    case 'army-iran':
      return (
        Boolean(tracking && tracking.forces.some((f) => /irgc|iran/i.test(f))) ||
        /irgc|garda\s+revolusi|iranian\s+military|الحرس\s+الثوري/i.test(text)
      );

    case 'army-saa':
      return (
        Boolean(tracking && tracking.forces.some((f) => /saa|suriah/i.test(f))) ||
        /saa|tentara\s+suriah|damascus/i.test(text)
      );

    // 2. Militias
    case 'militia-houthi':
      return (
        Boolean(tracking && tracking.militias.some((m) => /houthi|ansar/i.test(m))) ||
        /houthi|ansar\s*allah|ansarallah|milisi\s+houthi|yaman\s+force|حوثي|أنصار\s*الله/i.test(text)
      );

    case 'militia-qassam':
      return (
        Boolean(tracking && tracking.militias.some((m) => /qassam|hamas|gaza/i.test(m))) ||
        /hamas|qassam|al-qassam|faksi\s+gaza|saraya\s+al-quds|yasin\s+105|كتائب\s*القسام/i.test(text)
      );

    case 'militia-hezbollah':
      return (
        Boolean(tracking && tracking.militias.some((m) => /hezbollah|hizbullah/i.test(m))) ||
        /hezbollah|hizbullah|radwan\s+force|milisi\s+hizbullah|حزب\s*الله/i.test(text)
      );

    case 'militia-iraq':
      return (
        Boolean(tracking && tracking.militias.some((m) => /iraq|irak/i.test(m))) ||
        /islamic\s+resistance\s+in\s+iraq|milisi\s+irak|kata'ib\s+hezbollah/i.test(text)
      );

    case 'militia-wagner':
      return (
        Boolean(tracking && tracking.militias.some((m) => /wagner|sukarelawan/i.test(m))) ||
        /wagner|pmc|africa\s+corps/i.test(text)
      );

    // 3. Aerial & Naval Assets
    case 'asset-jets':
      return (
        Boolean(tracking && tracking.assetsMentioned && tracking.assetsMentioned.some((a) => /b-2|f-35|f-16|f-15|su-34|su-35|mig-31/i.test(a))) ||
        /pesawat\s+tempur|stealth\s+bomber|b-2|f-35|f-16|f-15|su-34|su-35|fighter\s+jet|airstrike|авіаудар/i.test(text)
      );

    case 'asset-drones':
      return (
        Boolean(tracking && tracking.assetsMentioned && tracking.assetsMentioned.some((a) => /mq-9|shahed|drone|uav/i.test(a))) ||
        story.eventType === 'DRONE' ||
        /mq-9|reaper|shahed|kamikaze\s+drone|fpv\s+drone|дрон|бпла|مسيّرة/i.test(text)
      );

    case 'asset-naval':
      return (
        Boolean(tracking && tracking.assetsMentioned && tracking.assetsMentioned.some((a) => /carrier|destroyer|corvette|usv|naval/i.test(a))) ||
        story.eventType === 'NAVAL' ||
        /carrier|kapal\s+induk|destroyer|kapal\s+perusak|warship|korvet|sa'ar\s*6|magura|interdiksi\s+laut|vessel/i.test(text)
      );

    case 'asset-missiles':
      return (
        Boolean(tracking && tracking.assetsMentioned && tracking.assetsMentioned.some((a) => /patriot|iron\s+dome|arrow|ballistic|atacms/i.test(a))) ||
        ['MISSILE', 'AIR DEFENSE'].includes(story.eventType) ||
        /patriot|iron\s+dome|arrow-3|rudal\s+balistik|salvo\s+roket|cruise\s+missile|صاروخ|ракета/i.test(text)
      );

    // 4. Operations
    case 'op-redsea':
      return (
        Boolean(tracking && (tracking.operations.some((o) => /laut\s+merah|red\s+sea/i.test(o)) || tracking.sector.includes('Merah'))) ||
        /red\s+sea|bab\s+al-mandeb|laut\s+merah|gulf\s+of\s+aden|prosperity\s+guardian/i.test(text)
      );

    case 'op-saudi-border':
      return (
        Boolean(tracking && (tracking.operations.some((o) => /saudi|patriot/i.test(o)) || tracking.sector.includes('Saudi'))) ||
        /perbatasan\s+saudi|jizan|najran|asir|saudi\s+border|patriot\s+saudi/i.test(text)
      );

    case 'op-gaza':
      return (
        Boolean(tracking && (tracking.operations.some((o) => /gaza|rafah/i.test(o)) || tracking.sector.includes('Gaza'))) ||
        /gaza|rafah|khan\s+younis|netzarim|jalur\s+gaza/i.test(text)
      );

    case 'op-us-centcom':
      return (
        Boolean(tracking && (tracking.operations.some((o) => /centcom|us/i.test(o)) || tracking.forces.some((f) => /centcom/i.test(f)))) ||
        /centcom|carrier\s+strike\s+group|us\s+navy|b-2\s+spirit|uss\s+(?:lincoln|truman)/i.test(text)
      );

    case 'op-lebanon':
      return (
        Boolean(tracking && (tracking.operations.some((o) => /lebanon/i.test(o)) || tracking.sector.includes('Lebanon'))) ||
        /lebanon|litani|dahieh|beirut|selatan\s+lebanon/i.test(text)
      );

    case 'op-pokrovsk':
      return (
        Boolean(tracking && (tracking.operations.some((o) => /pokrovsk/i.test(o)) || tracking.sector.includes('Pokrovsk'))) ||
        /pokrovsk|poros\s+pokrovsk/i.test(text)
      );

    case 'op-kursk':
      return (
        Boolean(tracking && (tracking.operations.some((o) => /kursk/i.test(o)) || tracking.sector.includes('Kursk'))) ||
        /kursk|sudzha|perbatasan\s+kursk/i.test(text)
      );

    default:
      if (!tracking) return false;
      const target = filterId.toLowerCase();
      return (
        tracking.forces.some((f) => f.toLowerCase().includes(target)) ||
        tracking.militias.some((m) => m.toLowerCase().includes(target)) ||
        tracking.operations.some((o) => o.toLowerCase().includes(target)) ||
        tracking.sector.toLowerCase().includes(target)
      );
  }
}
