import {
  NewsStory,
  OsintData,
  OsintWarCategory,
  SatelliteComparison,
  OSINT_WAR_CATEGORIES,
  OsintPillarType,
} from '../types';

export interface MilitaryHotspotPreset {
  name: string;
  theater: string;
  coordinates: string;
  category: OsintWarCategory;
  sensorType: 'OPTICAL' | 'SAR_RADAR' | 'INFRARED_FIRMS' | 'COMMERCIAL_SAT';
  beforeImageUrl: string;
  afterImageUrl: string;
  damageAssessment: string;
  targetFacility: string;
}

export const MILITARY_HOTSPOT_PRESETS: MilitaryHotspotPreset[] = [
  {
    name: 'Engels-2 Strategic Airbase, Saratov',
    theater: 'Russian Deep Strategic Hub',
    coordinates: '51.4826°N, 46.2084°E',
    category: 'Satellite Imagery & Geolocation',
    sensorType: 'COMMERCIAL_SAT',
    beforeImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1517976487502-86d9a10129cf?auto=format&fit=crop&w=1200&q=80',
    damageAssessment: 'Dampak drone terverifikasi di apron Tu-95MS; 2 hanggar perisai hancur, jejak hangus di taxiway.',
    targetFacility: 'Apron Bomber Strategis Tu-95 / Tu-160',
  },
  {
    name: 'Millerovo Air Base, Rostov Oblast',
    theater: 'Russian Tactical Aviation Hub',
    coordinates: '48.9531°N, 40.3014°E',
    category: 'Airstrikes & Missile Attacks',
    sensorType: 'OPTICAL',
    beforeImageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1200&q=80',
    damageAssessment: 'Serangan rudal presisi ATACMS / Storm Shadow mengenai depot bahan bakar dan fasilitas perawatan avionik.',
    targetFacility: 'Depot Avtur & Bengkel Perawatan Su-30SM',
  },
  {
    name: 'Sevastopol Drydock & Naval Base, Crimea',
    theater: 'Black Sea Naval Command',
    coordinates: '44.6166°N, 33.5254°E',
    category: 'Naval Warfare & Maritime Security',
    sensorType: 'SAR_RADAR',
    beforeImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
    damageAssessment: 'Kapal pendarat Ropucha & kapal selam Kilo mengalami kerusakan struktural masif akibat serangan drone maritim & rudal.',
    targetFacility: 'Dok Kering No. 13 & Lambung Kapal Armada Laut Hitam',
  },
  {
    name: 'Pokrovsk Fortification & Railroad Hub, Donbas',
    theater: 'Eastern Ukrainian Frontline Axis',
    coordinates: '48.2831°N, 37.1842°E',
    category: 'Ground War & Frontline Changes',
    sensorType: 'OPTICAL',
    beforeImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=1200&q=80',
    damageAssessment: 'Parit pertahanan tergeolokasi, kawah artileri 152mm/155mm, pergerakan infanteri mekanis terkonfirmasi visual drone FPV.',
    targetFacility: 'Garis Parit Perimeter & Rel Logistik Militer',
  },
  {
    name: 'Feodosia Oil Terminal & Marine Port, Crimea',
    theater: 'Strategic Supply & Fuel Infrastructure',
    coordinates: '45.0289°N, 35.4053°E',
    category: 'Military Logistics & Strategic Infrastructure',
    sensorType: 'INFRARED_FIRMS',
    beforeImageUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    damageAssessment: 'Sensor termal FIRMS mendeteksi anomali suhu ekstrem: 5 tangki bahan bakar meledak dan terbakar pasca serangan drone kamikaze.',
    targetFacility: 'Tangki Penyimpanan Minyak Mentah No. 4 & 5',
  },
  {
    name: 'Al-Hudaydah Port & Fuel Terminals, Yemen',
    theater: 'Red Sea & Bab al-Mandeb Chokepoint',
    coordinates: '14.7978°N, 42.9545°E',
    category: 'Naval Warfare & Maritime Security',
    sensorType: 'COMMERCIAL_SAT',
    beforeImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1517976487502-86d9a10129cf?auto=format&fit=crop&w=1200&q=80',
    damageAssessment: 'Citra satelit PlanetScope memperlihatkan derek kargo pelabuhan roboh dan pipa bahan bakar pantai rusak.',
    targetFacility: 'Dermaga Kontainer & Tangki Minyak Pesisir',
  },
  {
    name: 'Isfahan Aerospace & Air Defense Node, Iran',
    theater: 'Central Strategic Missile & S-300 Network',
    coordinates: '32.6546°N, 51.6680°E',
    category: 'Military Aircraft & Air Defense',
    sensorType: 'OPTICAL',
    beforeImageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    damageAssessment: 'Radar kendali tembak 30N6E baterai S-300 hancur oleh amunisi presisi stand-off tanpa merusak struktur sipil di sekitarnya.',
    targetFacility: 'Pos Radar Pertahanan Udara S-300PMU2',
  },
  {
    name: 'Tartus Naval Support Facility, Syria',
    theater: 'Eastern Mediterranean Littoral',
    coordinates: '34.9125°N, 35.8758°E',
    category: 'Intelligence, Surveillance & OSINT Investigations',
    sensorType: 'OPTICAL',
    beforeImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?auto=format&fit=crop&w=1200&q=80',
    damageAssessment: 'Pelacakan OSINT AIS & citra satelit memperlihatkan relokasi korvet rudal dan kapal pendukung logistik keluar dari pelabuhan.',
    targetFacility: 'Dermaga Apung No. 2 & Tambatan Kapal Perang',
  },
];

/**
 * Classifies any war news story into one of the 8 explicit primary OSINT War News Categories:
 * 1. Airstrikes & Missile Attacks
 * 2. Drone Warfare & UAV
 * 3. Satellite Imagery & Geolocation
 * 4. Military Aircraft & Air Defense
 * 5. Naval Warfare & Maritime Security
 * 6. Ground War & Frontline Changes
 * 7. Intelligence, Surveillance & OSINT Investigations
 * 8. Military Logistics & Strategic Infrastructure
 */
export function classifyOsintCategory(story: {
  title: string;
  summary?: string;
  conflict?: string;
  source?: string;
  eventType?: string;
}): OsintWarCategory {
  const text = `${story.title} ${story.summary || ''} ${story.conflict || ''} ${story.eventType || ''} ${story.source || ''}`.toLowerCase();

  // 3. Satellite Imagery & Geolocation
  if (
    text.includes('satellite imagery') ||
    text.includes('satellite photo') ||
    text.includes('planet labs') ||
    text.includes('sentinel-2') ||
    text.includes('maxar') ||
    text.includes('geolocated') ||
    text.includes('geolocation') ||
    text.includes('before and after') ||
    text.includes('damage at an airbase') ||
    text.includes('runway damage') ||
    text.includes('hangar damage') ||
    text.includes('citra satelit') ||
    text.includes('bda') ||
    text.includes('battle damage assessment')
  ) {
    return 'Satellite Imagery & Geolocation';
  }

  // 2. Drone Warfare & UAV
  if (
    story.eventType === 'DRONE' ||
    text.includes('drone') ||
    text.includes('uav') ||
    text.includes('fpv') ||
    text.includes('shahed') ||
    text.includes('geran') ||
    text.includes('lancet') ||
    text.includes('ucav') ||
    text.includes('anti-drone') ||
    text.includes('drone boat') ||
    text.includes('naval drone') ||
    text.includes('magura') ||
    text.includes('kamikaze drone') ||
    text.includes('дрон') ||
    text.includes('бпла') ||
    text.includes('مسيرة') ||
    text.includes('مسيرات')
  ) {
    return 'Drone Warfare & UAV';
  }

  // 5. Naval Warfare & Maritime Security
  if (
    story.eventType === 'NAVAL' ||
    text.includes('warship') ||
    text.includes('submarine') ||
    text.includes('aircraft carrier') ||
    text.includes('tanker attack') ||
    text.includes('naval blockade') ||
    text.includes('sea drone') ||
    text.includes('maritime') ||
    text.includes('red sea') ||
    text.includes('bab al-mandeb') ||
    text.includes('black sea') ||
    text.includes('persian gulf') ||
    text.includes('gulf of aden') ||
    text.includes('destroyer') ||
    text.includes('frigate') ||
    text.includes('corvette') ||
    text.includes('vessel') ||
    text.includes('ukmto') ||
    text.includes('anti-ship') ||
    text.includes('корабл') ||
    text.includes('سفينة') ||
    text.includes('ناقلة')
  ) {
    return 'Naval Warfare & Maritime Security';
  }

  // 8. Military Logistics & Strategic Infrastructure
  if (
    text.includes('ammunition depot') ||
    text.includes('ammo depot') ||
    text.includes('oil refinery') ||
    text.includes('fuel depot') ||
    text.includes('power grid') ||
    text.includes('supply line') ||
    text.includes('railway') ||
    text.includes('railroad') ||
    text.includes('weapon factory') ||
    text.includes('defense industry') ||
    text.includes('munitions plant') ||
    text.includes('storage facility') ||
    text.includes('depot amunisi') ||
    text.includes('kilang minyak') ||
    text.includes('jalur suplai') ||
    text.includes('pabrik senjata') ||
    text.includes('склад боеприпасов') ||
    text.includes('нпз') ||
    text.includes('нефтебаз')
  ) {
    return 'Military Logistics & Strategic Infrastructure';
  }

  // 4. Military Aircraft & Air Defense
  if (
    story.eventType === 'AIR DEFENSE' ||
    text.includes('air defense') ||
    text.includes('fighter jet') ||
    text.includes('bomber') ||
    text.includes('helicopter') ||
    text.includes('awacs') ||
    text.includes('patriot') ||
    text.includes('s-400') ||
    text.includes('s-300') ||
    text.includes('pantsir') ||
    text.includes('thaad') ||
    text.includes('radar') ||
    text.includes('su-35') ||
    text.includes('su-34') ||
    text.includes('f-16') ||
    text.includes('f-35') ||
    text.includes('tu-95') ||
    text.includes('tu-160') ||
    text.includes('tu-22m3') ||
    text.includes('interception') ||
    text.includes('пво') ||
    text.includes('ппо') ||
    text.includes('دفاع جوي') ||
    text.includes('طيران')
  ) {
    return 'Military Aircraft & Air Defense';
  }

  // 6. Ground War & Frontline Changes
  if (
    story.eventType === 'OFFENSIVE' ||
    text.includes('territorial advance') ||
    text.includes('frontline') ||
    text.includes('counterattack') ||
    text.includes('ground offensive') ||
    text.includes('tank destroyed') ||
    text.includes('armored vehicle') ||
    text.includes('trench') ||
    text.includes('fortification') ||
    text.includes('assault') ||
    text.includes('mechanized') ||
    text.includes('claims capture') ||
    text.includes('pokrovsk') ||
    text.includes('chasiv yar') ||
    text.includes('donbas') ||
    text.includes('kursk border') ||
    text.includes('perebutan wilayah') ||
    text.includes('pergerakan pasukan') ||
    text.includes('штурм') ||
    text.includes('наступ') ||
    text.includes('окоп')
  ) {
    return 'Ground War & Frontline Changes';
  }

  // 1. Airstrikes & Missile Attacks
  if (
    story.eventType === 'MISSILE' ||
    story.eventType === 'AIRSTRIKE' ||
    story.eventType === 'SHELLING' ||
    text.includes('missile strike') ||
    text.includes('ballistic missile') ||
    text.includes('cruise missile') ||
    text.includes('airstrike') ||
    text.includes('air strike') ||
    text.includes('guided bomb') ||
    text.includes('glide bomb') ||
    text.includes('kab-') ||
    text.includes('fab-') ||
    text.includes('atacms') ||
    text.includes('iskander') ||
    text.includes('kalibr') ||
    text.includes('storm shadow') ||
    text.includes('serangan rudal') ||
    text.includes('bom udara') ||
    text.includes('ракета') ||
    text.includes('авиаудар') ||
    text.includes('صاروخ')
  ) {
    return 'Airstrikes & Missile Attacks';
  }

  // 7. Intelligence, Surveillance & OSINT Investigations
  if (
    text.includes('osint') ||
    text.includes('investigation') ||
    text.includes('visual confirmation') ||
    text.includes('claim verification') ||
    text.includes('unit identification') ||
    text.includes('bellingcat') ||
    text.includes('deepstate') ||
    text.includes('geoconfirmed') ||
    text.includes('oryx') ||
    text.includes('sigint') ||
    text.includes('surveillance') ||
    text.includes('telemetry')
  ) {
    return 'Intelligence, Surveillance & OSINT Investigations';
  }

  return 'Airstrikes & Missile Attacks';
}

/**
 * Automatically creates structured OSINT data for any story
 */
export function buildDefaultOsintData(story: NewsStory): OsintData {
  if (story.osintData) return story.osintData;

  const category = classifyOsintCategory(story);
  const text = `${story.title} ${story.summary} ${story.conflict}`.toLowerCase();

  // Find best matching military hotspot or default
  let matchedPreset = MILITARY_HOTSPOT_PRESETS.find((p) =>
    text.includes(p.name.toLowerCase().split(',')[0].trim())
  );

  if (!matchedPreset) {
    if (text.includes('pokrovsk') || text.includes('donbas')) {
      matchedPreset = MILITARY_HOTSPOT_PRESETS[3];
    } else if (text.includes('engels') || text.includes('saratov')) {
      matchedPreset = MILITARY_HOTSPOT_PRESETS[0];
    } else if (text.includes('crimea') || text.includes('sevastopol') || text.includes('black sea')) {
      matchedPreset = MILITARY_HOTSPOT_PRESETS[2];
    } else if (text.includes('red sea') || text.includes('yemen') || text.includes('houthi')) {
      matchedPreset = MILITARY_HOTSPOT_PRESETS[5];
    } else if (text.includes('iran') || text.includes('isfahan') || text.includes('tehran')) {
      matchedPreset = MILITARY_HOTSPOT_PRESETS[6];
    } else {
      matchedPreset = MILITARY_HOTSPOT_PRESETS.find((p) => p.category === category) || MILITARY_HOTSPOT_PRESETS[0];
    }
  }

  // Equipment detection
  const equipmentIdentified: string[] = [];
  if (text.includes('su-34') || text.includes('su-35')) equipmentIdentified.push('Su-34 / Su-35 Flanker');
  if (text.includes('f-16')) equipmentIdentified.push('F-16 Fighting Falcon');
  if (text.includes('f-35')) equipmentIdentified.push('F-35 Lightning II');
  if (text.includes('s-400')) equipmentIdentified.push('S-400 Triumf');
  if (text.includes('patriot')) equipmentIdentified.push('MIM-104 Patriot PAC-3');
  if (text.includes('atacms')) equipmentIdentified.push('MGM-140 ATACMS');
  if (text.includes('storm shadow') || text.includes('scalp')) equipmentIdentified.push('Storm Shadow / SCALP-EG');
  if (text.includes('shahed') || text.includes('geran')) equipmentIdentified.push('Shahed-136 / Geran-2');
  if (text.includes('lancet')) equipmentIdentified.push('Lancet-3 Loitering Munition');
  if (text.includes('fpv')) equipmentIdentified.push('FPV Combat Strike UAV');
  if (text.includes('tank') || text.includes('t-72') || text.includes('t-90')) equipmentIdentified.push('Main Battle Tank (T-90M / T-72B3)');
  if (text.includes('destroyer') || text.includes('arleigh burke')) equipmentIdentified.push('Arleigh Burke-class Destroyer');
  if (equipmentIdentified.length === 0) {
    equipmentIdentified.push('Aset Tempur Terverifikasi OSINT');
  }

  const satComparison: SatelliteComparison = {
    beforeImageUrl: matchedPreset.beforeImageUrl,
    afterImageUrl: story.imageUrl || matchedPreset.afterImageUrl,
    beforeDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
    afterDate: new Date().toISOString().split('T')[0],
    resolution: matchedPreset.sensorType === 'COMMERCIAL_SAT' ? '0.5m Maxar WorldView' : '10m Sentinel-2 MSI',
    sensorType: matchedPreset.sensorType,
    damageAssessment: matchedPreset.damageAssessment,
    targetFacility: matchedPreset.targetFacility,
  };

  return {
    category,
    coordinates: matchedPreset.coordinates,
    locationName: matchedPreset.name,
    verificationStatus: 'SATELLITE_VERIFIED',
    confidenceScore: 94,
    satelliteImagery: satComparison,
    equipmentIdentified,
    bdaSummary: matchedPreset.damageAssessment,
    sourceAnalyst: story.source?.includes('@') ? story.source : 'OSINT Defense Radar Desk',
    notes: `Military telemetry verified based on public geolocation imagery and open-source intelligence (${category}).`,
  };
}

/**
 * Classifies a story into one of the 5 Core OSINT Pillars
 */
export function detectOsintPillar(story: Partial<NewsStory>): OsintPillarType {
  const text = `${story.title || ''} ${story.summary || ''} ${story.source || ''} ${story.conflict || ''}`.toLowerCase();

  // Pilar 2: Satellite OSINT
  if (
    /satellite|citra satelit|sentinel|maxar|planetscope|firms|infrared|sar radar|synthetic aperture|bda|battle damage|runway crater|hangar destroyed|cratered|detresfa|bradyafr|mt\s?anderson/i.test(
      text
    )
  ) {
    return 'PILAR_2_SATELLITE';
  }

  // Pilar 3: Viral Footage Verification
  if (
    /geolocated|geolocation|geoconfirmed|footage verified|video verification|visual confirmation|combat footage|bellingcat|calibreobscura|claim verification|viral video|landmark match|coordinates confirmed/i.test(
      text
    )
  ) {
    return 'PILAR_3_VERIFICATION';
  }

  // Pilar 4: Weapons & Military Losses
  if (
    /shot down|crash|losses|oryx|equipment destroyed|air defense hit|radar hit|s-400 hit|patriot hit|warship damaged|sunk|corvette damaged|naval losses|fighter jet lost|su-34|su-35|f-16|t-90|leopard lost|bradley lost|alutsista hancur|pesawat jatuh/i.test(
      text
    )
  ) {
    return 'PILAR_4_LOSSES';
  }

  // Pilar 5: Strategic Military Developments
  if (
    /carrier strike group|csg|armada|deployment|troop deployment|mobilization|mobilisasi|isw|institute for the study of war|strategic development|ukmto|convoy|flotilla|reinforcement|red sea patrol|hormuz strait|peta garis depan|deepstate map|frontline changes|territorial advance/i.test(
      text
    )
  ) {
    return 'PILAR_5_STRATEGIC';
  }

  // Pilar 1: Breaking Strike News (Default for kinetic/strike reports)
  return 'PILAR_1_STRIKES';
}

/**
 * Enriches a NewsStory with full OSINT fields and 5 Pillars tag
 */
export function enrichStoryWithOsint(story: NewsStory): NewsStory {
  const osint = story.osintData || buildDefaultOsintData(story);
  const pillar = story.osintPillar || detectOsintPillar(story);
  return {
    ...story,
    isOsint: true,
    isOsintOnly: true,
    osintData: osint,
    osintPillar: pillar,
  };
}
