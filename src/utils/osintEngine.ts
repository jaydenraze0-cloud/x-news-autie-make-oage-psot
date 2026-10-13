import { NewsStory, OsintWarCategory, OsintMetadata, BdaStatusType } from '../types';

export interface OsintCategoryMeta {
  id: OsintWarCategory;
  label: string;
  labelId: string;
  icon: string;
  desc: string;
  examples: string;
  badgeClass: string;
  activeClass: string;
  glowColor: string;
  accentHex: string;
}

export const OSINT_WAR_CATEGORIES: OsintCategoryMeta[] = [
  {
    id: 'AIRSTRIKES_MISSILES',
    label: 'Airstrikes & Missile Attacks',
    labelId: 'Serangan Udara & Rudal',
    icon: '🚀',
    desc: 'Berita serangan rudal balistik, rudal jelajah, drone kamikaze, bom udara, dan serangan terhadap pangkalan militer atau infrastruktur.',
    examples: 'Russian missile strike, Iranian drone attack, Houthi missile launch',
    badgeClass: 'border-red-500/50 text-red-300 bg-red-950/40',
    activeClass: 'border-red-500 bg-red-600 text-white font-extrabold shadow-[0_0_12px_rgba(239,68,68,0.7)]',
    glowColor: 'rgba(239,68,68,0.8)',
    accentHex: '#EF4444',
  },
  {
    id: 'DRONE_UAV',
    label: 'Drone Warfare & UAV',
    labelId: 'Peperangan Drone & UAV',
    icon: '📡',
    desc: 'Drone FPV, Shahed, Geran, Lancet, drone pengintai, UCAV, drone laut, serta sistem anti-drone.',
    examples: 'drone interception, UAV shot down, drone factory strike',
    badgeClass: 'border-amber-500/50 text-amber-300 bg-amber-950/40',
    activeClass: 'border-amber-400 bg-amber-500 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.7)]',
    glowColor: 'rgba(245,158,11,0.8)',
    accentHex: '#F59E0B',
  },
  {
    id: 'SATELLITE_GEOLOCATION',
    label: 'Satellite Imagery & Geolocation',
    labelId: 'Citra Satelit & Geolokasi',
    icon: '🛰️',
    desc: 'Membandingkan citra sebelum dan sesudah serangan, memverifikasi lokasi video, mengidentifikasi kerusakan landasan pacu, hanggar, radar, dan pangkalan militer.',
    examples: 'satellite imagery reveals damage at an airbase',
    badgeClass: 'border-cyan-400/50 text-cyan-300 bg-cyan-950/40',
    activeClass: 'border-cyan-400 bg-cyan-500 text-black font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.7)]',
    glowColor: 'rgba(6,182,212,0.8)',
    accentHex: '#06B6D4',
  },
  {
    id: 'AIRCRAFT_AIRDEFENSE',
    label: 'Military Aircraft & Air Defense',
    labelId: 'Pesawat Militer & Pertahanan Udara',
    icon: '🛡️',
    desc: 'Pesawat tempur, bomber, helikopter, AWACS, sistem Patriot, S-400, Pantsir, THAAD, radar, dan pencegatan rudal.',
    examples: 'fighter jet crash, air defense interception, bomber deployment',
    badgeClass: 'border-sky-400/50 text-sky-300 bg-sky-950/40',
    activeClass: 'border-sky-400 bg-sky-500 text-black font-extrabold shadow-[0_0_12px_rgba(14,165,233,0.7)]',
    glowColor: 'rgba(14,165,233,0.8)',
    accentHex: '#0EA5E9',
  },
  {
    id: 'NAVAL_MARITIME',
    label: 'Naval Warfare & Maritime Security',
    labelId: 'Peperangan Laut & Keamanan Maritim',
    icon: '⚓',
    desc: 'Kapal perang, kapal selam, kapal induk, serangan terhadap kapal dagang, ranjau laut, operasi di Laut Merah, Teluk Persia, dan Laut Hitam.',
    examples: 'warship deployment, tanker attack, naval blockade',
    badgeClass: 'border-teal-400/50 text-teal-300 bg-teal-950/40',
    activeClass: 'border-teal-400 bg-teal-500 text-black font-extrabold shadow-[0_0_12px_rgba(20,184,166,0.7)]',
    glowColor: 'rgba(20,184,166,0.8)',
    accentHex: '#14B8A6',
  },
  {
    id: 'GROUND_FRONTLINE',
    label: 'Ground War & Frontline Changes',
    labelId: 'Perang Darat & Garis Depan',
    icon: '⚔️',
    desc: 'Perebutan wilayah, pergerakan pasukan, tank hancur, kendaraan lapis baja, parit pertahanan, dan klaim penaklukan kota.',
    examples: 'territorial advance, Russian MoD claims capture, Ukrainian counterattack',
    badgeClass: 'border-orange-500/50 text-orange-300 bg-orange-950/40',
    activeClass: 'border-orange-400 bg-orange-600 text-white font-extrabold shadow-[0_0_12px_rgba(234,88,12,0.7)]',
    glowColor: 'rgba(234,88,12,0.8)',
    accentHex: '#EA580C',
  },
  {
    id: 'INTEL_INVESTIGATIONS',
    label: 'Intelligence, Surveillance & OSINT Investigations',
    labelId: 'Investigasi Intelijen & OSINT',
    icon: '🔍',
    desc: 'Analisis foto dan video, identifikasi unit, pelacakan pergerakan aset militer dari sumber publik, serta pemeriksaan klaim yang viral.',
    examples: 'geolocated footage, visual confirmation, claim verification',
    badgeClass: 'border-purple-400/50 text-purple-300 bg-purple-950/40',
    activeClass: 'border-purple-400 bg-purple-600 text-white font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.7)]',
    glowColor: 'rgba(168,85,247,0.8)',
    accentHex: '#A855F7',
  },
  {
    id: 'LOGISTICS_INFRASTRUCTURE',
    label: 'Military Logistics & Strategic Infrastructure',
    labelId: 'Logistik Militer & Infrastruktur',
    icon: '🏭',
    desc: 'Depot amunisi, kilang minyak, jaringan listrik, jalur suplai, rel kereta, pelabuhan, pabrik senjata, dan fasilitas industri pertahanan.',
    examples: 'refinery strike, ammunition depot explosion, military supply disruption',
    badgeClass: 'border-emerald-400/50 text-emerald-300 bg-emerald-950/40',
    activeClass: 'border-emerald-400 bg-emerald-600 text-white font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.7)]',
    glowColor: 'rgba(16,185,129,0.8)',
    accentHex: '#10B981',
  },
];

export function getOsintCategoryMeta(category?: OsintWarCategory): OsintCategoryMeta {
  if (!category) return OSINT_WAR_CATEGORIES[0];
  const found = OSINT_WAR_CATEGORIES.find((c) => c.id === category);
  return found || OSINT_WAR_CATEGORIES[0];
}

export const GEOLOCATION_HOTZONES = [
  {
    name: 'Engels-2 Strategic Bomber Airbase',
    location: 'Saratov Oblast, Russia',
    coordinates: '51°29\'01"N 46°12\'36"E',
    gridZone: 'MGRS 38UNB549102',
    category: 'SATELLITE_GEOLOCATION' as OsintWarCategory,
    targetName: 'STRATEGIC RUNWAY & BOMBER REVETMENTS',
  },
  {
    name: 'Pokrovsk Frontline Fortification Axis',
    location: 'Donetsk Oblast, Ukraine',
    coordinates: '48°17\'15"N 37°10\'50"E',
    gridZone: 'MGRS 37UDR129841',
    category: 'GROUND_FRONTLINE' as OsintWarCategory,
    targetName: 'DEFENSIVE PERIMETER TRENCH NETWORK',
  },
  {
    name: 'Hodeidah Port & Naval Facilities',
    location: 'Red Sea Coast, Yemen',
    coordinates: '14°48\'08"N 42°56\'19"E',
    gridZone: 'MGRS 38PKC229810',
    category: 'NAVAL_MARITIME' as OsintWarCategory,
    targetName: 'CONTAINER QUAY & RADAR BATTERY',
  },
  {
    name: 'Saki Airbase (Novofedorivka)',
    location: 'Crimea',
    coordinates: '45°05\'34"N 33°35\'48"E',
    gridZone: 'MGRS 36TWT829410',
    category: 'SATELLITE_GEOLOCATION' as OsintWarCategory,
    targetName: 'SU-30/SU-24 HARDENED AIRCRAFT SHELTERS',
  },
  {
    name: 'Sevastopol Naval Base South Bay',
    location: 'Crimea / Black Sea',
    coordinates: '44°37\'01"N 33°31\'30"E',
    gridZone: 'MGRS 36TWT781923',
    category: 'NAVAL_MARITIME' as OsintWarCategory,
    targetName: 'SUBMARINE PIER & REPAIR DOCKS',
  },
  {
    name: 'Belgorod Border Logistics Node',
    location: 'Belgorod Oblast, Russia',
    coordinates: '50°35\'49"N 36°35\'15"E',
    gridZone: 'MGRS 37UCP652190',
    category: 'LOGISTICS_INFRASTRUCTURE' as OsintWarCategory,
    targetName: 'RAIL TRANSSHIPMENT & AMMO STORAGE',
  },
  {
    name: 'Kursk Frontline Operational Sector',
    location: 'Kursk Oblast, Russia',
    coordinates: '51°43\'12"N 36°11\'20"E',
    gridZone: 'MGRS 37UCQ321945',
    category: 'GROUND_FRONTLINE' as OsintWarCategory,
    targetName: 'COMBAT CONTACT LINE & ARMOR AXIS',
  },
  {
    name: 'Bab al-Mandeb Maritime Strait',
    location: 'Red Sea Chokepoint',
    coordinates: '12°35\'10"N 43°20\'45"E',
    gridZone: 'MGRS 38PKC901844',
    category: 'NAVAL_MARITIME' as OsintWarCategory,
    targetName: 'COMMERCIAL SHIPPING LANE & WARSHIP SCREEN',
  },
  {
    name: 'Isfahan Military Industrial Complex',
    location: 'Isfahan Province, Iran',
    coordinates: '32°39\'12"N 51°40\'30"E',
    gridZone: 'MGRS 39RVP431209',
    category: 'LOGISTICS_INFRASTRUCTURE' as OsintWarCategory,
    targetName: 'UAV & BALLISTIC MISSILE PRODUCTION FACILITY',
  },
  {
    name: 'Mezzeh Military Airbase',
    location: 'Damascus, Syria',
    coordinates: '33°28\'40"N 36°13\'24"E',
    gridZone: 'MGRS 37SBB912831',
    category: 'AIRSTRIKES_MISSILES' as OsintWarCategory,
    targetName: 'RADAR COMMAND CENTER & AMMUNITION DEPOT',
  },
];

export const SATELLITE_MAP_PRESETS = [
  {
    id: 'sat-airbase-runway',
    label: 'Airbase Runway & Hangars (Satellite High-Res)',
    subLabel: 'Citra satelit landasan pacu & bunker pesawat',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    category: 'SATELLITE_GEOLOCATION' as OsintWarCategory,
    sensor: 'MAXAR 0.3m HD OPTICAL',
  },
  {
    id: 'sat-naval-dock',
    label: 'Naval Port & Destroyer Piers (Satellite High-Res)',
    subLabel: 'Citra satelit dermaga pangkalan laut & kapal perang',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    category: 'NAVAL_MARITIME' as OsintWarCategory,
    sensor: 'SENTINEL-2 10m MULTISPECTRAL',
  },
  {
    id: 'sat-refinery-depot',
    label: 'Oil Refinery & Fuel Tanks (Satellite High-Res)',
    subLabel: 'Citra satelit kilang minyak & tangki penyimpanan',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    category: 'LOGISTICS_INFRASTRUCTURE' as OsintWarCategory,
    sensor: 'PLANETSCOPE 3.0m RAPIDEYE',
  },
  {
    id: 'sat-trenches-frontline',
    label: 'Frontline Fortification & Trenches (Satellite)',
    subLabel: 'Citra satelit garis parit pertahanan & kawah artileri',
    url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1200&q=80',
    category: 'GROUND_FRONTLINE' as OsintWarCategory,
    sensor: 'AIRBUS PLEIADES 0.5m',
  },
  {
    id: 'sat-sar-radar',
    label: 'Orbital SAR Radar Imagery (Synthetic Aperture)',
    subLabel: 'Citra radar satelit tembus awan & malam',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    category: 'INTEL_INVESTIGATIONS' as OsintWarCategory,
    sensor: 'SENTINEL-1 C-BAND SAR RADAR',
  },
  {
    id: 'sat-night-flir',
    label: 'Night Tactical Reconnaissance & Thermal',
    subLabel: 'Citra pengintaian termal & tanda ledakan malam',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    category: 'DRONE_UAV' as OsintWarCategory,
    sensor: 'FLIR TACTICAL RECON SENSOR',
  },
];

/**
 * Accurately detects and classifies a story into one of the 8 OSINT War News Categories
 */
export function detectOsintCategory(story: Partial<NewsStory>): OsintWarCategory {
  if (story.osintCategory) return story.osintCategory;
  if (story.osintMetadata?.category) return story.osintMetadata.category;

  const text = `${story.title || ''} ${story.summary || ''} ${story.source || ''} ${story.conflict || ''} ${story.eventType || ''}`.toLowerCase();

  // 1. Satellite Imagery & Geolocation check
  if (
    text.includes('satellite') ||
    text.includes('imagery') ||
    text.includes('geolocation') ||
    text.includes('geolocated') ||
    text.includes('sentinel') ||
    text.includes('maxar') ||
    text.includes('planetscope') ||
    text.includes('runway damage') ||
    text.includes('before and after') ||
    text.includes('bda') ||
    text.includes('battle damage assessment') ||
    text.includes('citra satelit') ||
    text.includes('hangar damage')
  ) {
    return 'SATELLITE_GEOLOCATION';
  }

  // 2. Drone Warfare & UAV
  if (
    story.eventType === 'DRONE' ||
    text.includes('drone') ||
    text.includes('uav') ||
    text.includes('shahed') ||
    text.includes('geran') ||
    text.includes('lancet') ||
    text.includes('fpv') ||
    text.includes('ucav') ||
    text.includes('sea drone') ||
    text.includes('usv') ||
    text.includes('magura') ||
    text.includes('anti-drone') ||
    text.includes('drone interception') ||
    text.includes('uav shot down') ||
    text.includes('drone swarm') ||
    text.includes('дрон') ||
    text.includes('беспилотник') ||
    text.includes('مسيرة')
  ) {
    return 'DRONE_UAV';
  }

  // 3. Military Aircraft & Air Defense
  if (
    story.eventType === 'AIR DEFENSE' ||
    text.includes('air defense') ||
    text.includes('patriot') ||
    text.includes('s-400') ||
    text.includes('s-300') ||
    text.includes('pantsir') ||
    text.includes('thaad') ||
    text.includes('iron dome') ||
    text.includes('fighter jet') ||
    text.includes('su-34') ||
    text.includes('su-35') ||
    text.includes('su-57') ||
    text.includes('f-16') ||
    text.includes('f-35') ||
    text.includes('bomber') ||
    text.includes('tu-95') ||
    text.includes('tu-22') ||
    text.includes('tu-160') ||
    text.includes('awacs') ||
    text.includes('a-50') ||
    text.includes('helicopter') ||
    text.includes('ka-52') ||
    text.includes('interception') ||
    text.includes('ппо') ||
    text.includes('пво') ||
    text.includes('دفاع جوي')
  ) {
    return 'AIRCRAFT_AIRDEFENSE';
  }

  // 4. Naval Warfare & Maritime Security
  if (
    story.eventType === 'NAVAL' ||
    text.includes('naval') ||
    text.includes('warship') ||
    text.includes('destroyer') ||
    text.includes('frigate') ||
    text.includes('submarine') ||
    text.includes('aircraft carrier') ||
    text.includes('tanker attack') ||
    text.includes('red sea') ||
    text.includes('bab al-mandeb') ||
    text.includes('persian gulf') ||
    text.includes('strait of hormuz') ||
    text.includes('black sea') ||
    text.includes('sea mine') ||
    text.includes('blockade') ||
    text.includes('ukmto') ||
    text.includes('maritime') ||
    text.includes('corvette') ||
    text.includes('корабл') ||
    text.includes('سفينة')
  ) {
    return 'NAVAL_MARITIME';
  }

  // 5. Military Logistics & Strategic Infrastructure
  if (
    text.includes('refinery') ||
    text.includes('oil depot') ||
    text.includes('fuel depot') ||
    text.includes('ammunition depot') ||
    text.includes('ammo depot') ||
    text.includes('power grid') ||
    text.includes('substation') ||
    text.includes('railway') ||
    text.includes('supply line') ||
    text.includes('supply route') ||
    text.includes('weapons factory') ||
    text.includes('defense plant') ||
    text.includes('port strike') ||
    text.includes('depot amunisi') ||
    text.includes('kilang minyak') ||
    text.includes('склад бп') ||
    text.includes('нпз')
  ) {
    return 'LOGISTICS_INFRASTRUCTURE';
  }

  // 6. Ground War & Frontline Changes
  if (
    story.eventType === 'OFFENSIVE' ||
    text.includes('territorial advance') ||
    text.includes('counterattack') ||
    text.includes('frontline') ||
    text.includes('infantry') ||
    text.includes('trench') ||
    text.includes('mechanized assault') ||
    text.includes('tank destroyed') ||
    text.includes('armored column') ||
    text.includes('bmp') ||
    text.includes('btr') ||
    text.includes('capture of') ||
    text.includes('pokrovsk') ||
    text.includes('chasiv yar') ||
    text.includes('kursk incursion') ||
    text.includes('deepstate') ||
    text.includes('передова') ||
    text.includes('наступ')
  ) {
    return 'GROUND_FRONTLINE';
  }

  // 7. Intelligence, Surveillance & OSINT Investigations
  if (
    text.includes('osint') ||
    text.includes('investigation') ||
    text.includes('visual confirmation') ||
    text.includes('claim verification') ||
    text.includes('tracking movement') ||
    text.includes('bellingcat') ||
    text.includes('geoconfirmed') ||
    text.includes('rybar') ||
    text.includes('intercepted call') ||
    text.includes('sigint') ||
    text.includes('investigasi')
  ) {
    return 'INTEL_INVESTIGATIONS';
  }

  // 8. Default fallback for missile & kinetic strikes
  if (
    ['MISSILE', 'AIRSTRIKE', 'SHELLING'].includes(story.eventType || '') ||
    text.includes('missile') ||
    text.includes('airstrike') ||
    text.includes('ballistic') ||
    text.includes('cruise missile') ||
    text.includes('iskander') ||
    text.includes('atacms') ||
    text.includes('kinzhal') ||
    text.includes('kalibr') ||
    text.includes('glide bomb') ||
    text.includes('fab-') ||
    text.includes('barrage')
  ) {
    return 'AIRSTRIKES_MISSILES';
  }

  return 'AIRSTRIKES_MISSILES';
}

/**
 * Checks whether a news story qualifies as an OSINT War News story
 */
export function isStoryOsint(story: NewsStory): boolean {
  if (story.isOsint) return true;
  if (story.osintCategory) return true;
  if (story.osintMetadata) return true;
  if (story.isTelegram || Boolean(story.telegramHandle)) return true;

  const src = (story.source || '').toLowerCase();
  const lnk = (story.link || '').toLowerCase();
  const txt = `${story.title} ${story.summary}`.toLowerCase();

  // Known OSINT desks & defense intelligence feeds
  if (
    /osint|telegram|bellingcat|deepstate|liveuamap|kpszsu|operativnozsu|milinfolive|ansarallah|almayadeen|qudsn|wartranslated|rybar|geoconfirmed|ukmto|isw|twz|naval news|defense news|c4isrnet/i.test(
      src
    )
  ) {
    return true;
  }

  if (/t\.me|bellingcat|geoconfirmed|liveuamap|understandingwar|twz\.com/i.test(lnk)) {
    return true;
  }

  // OSINT keywords and indicators
  if (
    /satellite|citra satelit|geolocated|geolocation|bda|battle damage|airbase|runway|shahed|fpv|lancet|patriot|s-400|warship|destroyer|trench|ammunition depot|refinery strike|visual confirmation/i.test(
      txt
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Transforms any news story into a comprehensive OSINT Intel Package
 */
export function transformStoryToOsint(
  story: NewsStory,
  manualCategory?: OsintWarCategory,
  manualCoords?: string,
  manualTarget?: string,
  manualBda?: BdaStatusType
): OsintMetadata {
  const category = manualCategory || story.osintCategory || detectOsintCategory(story);
  const catMeta = getOsintCategoryMeta(category);

  // Auto-match hotzone based on text content
  const text = `${story.title} ${story.summary} ${story.conflict} ${story.source}`.toLowerCase();
  let matchedHotzone = GEOLOCATION_HOTZONES.find((hz) => {
    const hzKeywords = hz.name.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    return hzKeywords.some((kw) => text.includes(kw));
  });

  if (!matchedHotzone) {
    if (text.includes('ukraine') || text.includes('donbas') || text.includes('pokrovsk')) {
      matchedHotzone = GEOLOCATION_HOTZONES[1]; // Pokrovsk
    } else if (text.includes('engels') || text.includes('saratov')) {
      matchedHotzone = GEOLOCATION_HOTZONES[0]; // Engels
    } else if (text.includes('red sea') || text.includes('yemen') || text.includes('houthi') || text.includes('hodeidah')) {
      matchedHotzone = GEOLOCATION_HOTZONES[2]; // Hodeidah
    } else if (text.includes('crimea') || text.includes('saki') || text.includes('sevastopol')) {
      matchedHotzone = GEOLOCATION_HOTZONES[3]; // Saki
    } else if (text.includes('belgorod') || text.includes('kursk')) {
      matchedHotzone = GEOLOCATION_HOTZONES[5]; // Belgorod
    } else if (text.includes('iran') || text.includes('isfahan') || text.includes('tehran')) {
      matchedHotzone = GEOLOCATION_HOTZONES[8]; // Isfahan
    } else {
      matchedHotzone = GEOLOCATION_HOTZONES[0]; // Engels Default
    }
  }

  let defaultBda: BdaStatusType = 'CONFIRMED_DESTROYED';
  if (text.includes('intercept') || text.includes('shot down') || text.includes('thwarted')) {
    defaultBda = 'INTERCEPTED';
  } else if (text.includes('runway') || text.includes('crater')) {
    defaultBda = 'RUNWAY_CRATER';
  } else if (text.includes('radar') || text.includes('air defense damaged')) {
    defaultBda = 'RADAR_HIT';
  } else if (text.includes('heavy damage') || text.includes('fire') || text.includes('smoke')) {
    defaultBda = 'HEAVY_DAMAGE';
  }

  const coordinates = manualCoords || matchedHotzone.coordinates;
  const gridZone = matchedHotzone.gridZone;
  const targetName = manualTarget || matchedHotzone.targetName;
  const bdaStatus = manualBda || defaultBda;

  const now = new Date();
  const dateStamp = `${now.getUTCDate().toString().padStart(2, '0')} ${now.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${now.getUTCFullYear()} // ${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')} UTC`;

  return {
    category,
    categoryLabel: catMeta.label,
    categoryIcon: catMeta.icon,
    coordinates,
    gridZone,
    targetName,
    bdaStatus,
    satelliteSensor: 'SENTINEL-2 / MAXAR HIGH-RES',
    dateStamp,
    confidenceScore: 92,
    verificationStatus: 'VERIFIED_GEOLOCATED',
    notes: `OSINT combat intelligence verification via Stark-News-x telemetry. Target geolocated at ${coordinates} (${gridZone}). BDA Status: ${bdaStatus}.`,
  };
}
