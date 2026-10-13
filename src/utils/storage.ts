import { AppSettings, DraftItem, EditorConfig, FeedMonitor, ConnectedTelegramGroup, TelegramTheater, OsintPillarType } from '../types';

const SETTINGS_KEY = 'stark_news_settings';
const DRAFTS_KEY = 'stark_news_drafts';
const FEEDS_KEY = 'stark_news_feed_monitors';
const TELEGRAM_GROUPS_KEY = 'stark_news_telegram_groups';

export function buildGoogleNewsUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query.trim())}&hl=en-US&gl=US&ceid=US:en`;
}

// Catalog of live feeds from all defense, wire and OSINT sources
export const CATALOG_SAMPLE_FEEDS: FeedMonitor[] = [
  {
    id: 'feed-tg-kpszsu',
    name: 'Telegram @kpszsu (Повітряні Сили ЗСУ / UA Air Force Alerts)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'kpszsu',
    url: 'https://t.me/s/kpszsu',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-operativnozsu',
    name: 'Telegram @operativnoZSU (Оперативно ЗСУ / Frontline Combat)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'operativnoZSU',
    url: 'https://t.me/s/operativnoZSU',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-deepstateua',
    name: 'Telegram @deepstateua (DeepState Frontline OSINT)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'deepstateua',
    url: 'https://t.me/s/deepstateua',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-milinfolive',
    name: 'Telegram @milinfolive (Военный Осведомитель / Frontline Armor & Strikes)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'milinfolive',
    url: 'https://t.me/s/milinfolive',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-rybar',
    name: 'Telegram @rybar (Рыбарь / Military Analysis & Maps)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'rybar',
    url: 'https://t.me/s/rybar',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-ansarallah',
    name: 'Telegram @AnsarAllahMC (الإعلام الحربي اليمني / Yemen & Red Sea Operations)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'AnsarAllahMC',
    url: 'https://t.me/s/AnsarAllahMC',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-cmilitary',
    name: 'Telegram @C_Military1 (الإعلام الحربي المركزي / Central Military Media)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'C_Military1',
    url: 'https://t.me/s/C_Military1',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-almayadeen',
    name: 'Telegram @almayadeen (الميادين عاجل / Al Mayadeen Live War Alerts)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'almayadeen',
    url: 'https://t.me/s/almayadeen',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-qudsn',
    name: 'Telegram @qudsn (شبكة قدس الإخبارية / Quds News Frontline)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'qudsn',
    url: 'https://t.me/s/qudsn',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-alibk3',
    name: 'Telegram @Alibk3 (Ali Bk - Middle East & Global Conflict Desk)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'Alibk3',
    url: 'https://t.me/s/Alibk3',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-liveuamap',
    name: 'Telegram @liveuamap (Global Conflict Map OSINT)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'liveuamap',
    url: 'https://t.me/s/liveuamap',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-wartranslated',
    name: 'Telegram @wartranslated (Frontline & Intel OSINT)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'wartranslated',
    url: 'https://t.me/s/wartranslated',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-osinttechnical',
    name: 'Telegram @osinttechnical (OSINTtechnical Defense Tracking)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'osinttechnical',
    url: 'https://t.me/s/osinttechnical',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-middleeastobserver',
    name: 'Telegram @middleeastobserver (Red Sea, Yemen & MidEast OSINT)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'middleeastobserver',
    url: 'https://t.me/s/middleeastobserver',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-rybar-en',
    name: 'Telegram @rybar_en (Rybar Military Analysis in English)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'rybar_en',
    url: 'https://t.me/s/rybar_en',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-bellingcat-osint',
    name: 'Bellingcat (OSINT Investigations)',
    type: 'OSINT_DESK',
    queryOrUrl: 'https://www.bellingcat.com/feed/',
    url: 'https://www.bellingcat.com/feed/',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-ukmto-osint',
    name: 'UKMTO (Maritime Security & Bab al-Mandeb Incidents)',
    type: 'OSINT_DESK',
    queryOrUrl: '"UKMTO" OR "United Kingdom Maritime Trade Operations"',
    url: 'https://news.google.com/rss/search?q=%22UKMTO%22+OR+%22United+Kingdom+Maritime+Trade+Operations%22&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-isw-osint',
    name: 'Institute for the Study of War (ISW Frontline OSINT)',
    type: 'OSINT_DESK',
    queryOrUrl: '"Institute for the Study of War" OR site:understandingwar.org',
    url: 'https://news.google.com/rss/search?q=%22Institute+for+the+Study+of+War%22+OR+site:understandingwar.org&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-geoconfirmed-osint',
    name: 'GeoConfirmed (Geolocated Combat OSINT)',
    type: 'OSINT_DESK',
    queryOrUrl: '"GeoConfirmed" OR site:geoconfirmed.org',
    url: 'https://news.google.com/rss/search?q=%22GeoConfirmed%22+OR+site:geoconfirmed.org&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-zsu-official',
    name: 'Armed Forces of Ukraine (zsu.gov.ua)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.zsu.gov.ua/en/news',
    url: 'https://news.google.com/rss/search?q=site:zsu.gov.ua&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-zsu-general-staff',
    name: 'General Staff of the Armed Forces of Ukraine (ZSU)',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '"General Staff of the Armed Forces of Ukraine" OR "General Staff of Ukraine"',
    url: 'https://news.google.com/rss/search?q=%22General+Staff+of+the+Armed+Forces+of+Ukraine%22+OR+%22General+Staff+of+Ukraine%22&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-bab-al-mandeb-strait',
    name: 'Bab al-Mandeb Strait & Red Sea Operations',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '("Bab al-Mandeb" OR "Bab el-Mandeb" OR "Gulf of Aden" OR "Red Sea") (Houthi OR missile OR drone OR warship OR strike OR naval OR tanker OR shipping)',
    url: 'https://news.google.com/rss/search?q=%28%22Bab+al-Mandeb%22+OR+%22Bab+el-Mandeb%22+OR+%22Gulf+of+Aden%22+OR+%22Red+Sea%22%29+%28Houthi+OR+missile+OR+drone+OR+warship+OR+strike+OR+naval+OR+tanker+OR+shipping%29&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-gnews-strikes',
    name: 'Google News - Global Strikes & Airstrikes',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'breaking (airstrike OR missile strike OR drone attack OR rocket barrage)',
    url: 'https://news.google.com/rss/search?q=breaking+(airstrike+OR+missile+strike+OR+drone+attack+OR+rocket+barrage)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-gnews-geopolitics',
    name: 'Google News - War Geopolitics & Alliances',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '(geopolitics OR NATO OR Pentagon OR "nuclear deterrence" OR "defense pact") (war OR military)',
    url: 'https://news.google.com/rss/search?q=(geopolitics+OR+NATO+OR+Pentagon+OR+"nuclear+deterrence"+OR+"defense+pact")+(war+OR+military)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-gnews-ukraine',
    name: 'Google News - Ukraine & Frontlines',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'Ukraine Russia war frontline strike shelling',
    url: 'https://news.google.com/rss/search?q=Ukraine+Russia+war+frontline+strike+shelling&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-gnews-mideast',
    name: 'Google News - Middle East & Red Sea',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'Middle East strike Israel Iran Houthis Yemen Red Sea airstrike',
    url: 'https://news.google.com/rss/search?q=Middle+East+strike+Israel+Iran+Houthis+Yemen+Red+Sea+airstrike&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-gnews-pacific',
    name: 'Google News - Taiwan Strait & Indo-Pacific',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '(Taiwan strait OR "South China Sea" OR "North Korea" OR ICBM OR PLA) military',
    url: 'https://news.google.com/rss/search?q=(Taiwan+strait+OR+"South+China+Sea"+OR+"North+Korea"+OR+ICBM+OR+PLA)+military&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-the-war-zone',
    name: 'The War Zone (Kinetic & Air Strikes)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.twz.com/feed',
    url: 'https://www.twz.com/feed',
    enabled: true,
  },
  {
    id: 'feed-naval-news',
    name: 'Naval News (Warships & Naval Clashes)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.navalnews.com/feed/',
    url: 'https://www.navalnews.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-rss-bbc',
    name: 'BBC World News (RSS)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    enabled: true,
  },
  {
    id: 'feed-rss-aljazeera',
    name: 'Al Jazeera International (RSS)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.aljazeera.com/xml/rss/all.xml',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    enabled: true,
  },
  {
    id: 'feed-defense-news',
    name: 'Defense News (Global Military)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml',
    url: 'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml',
    enabled: true,
  },
  {
    id: 'feed-defense-one',
    name: 'Defense One (Geopolitics & Pentagon)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.defenseone.com/rss/all/',
    url: 'https://www.defenseone.com/rss/all/',
    enabled: true,
  },
  {
    id: 'feed-defence-blog',
    name: 'Defence Blog (Frontline & Armor)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://defence-blog.com/feed/',
    url: 'https://defence-blog.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-euromaidan',
    name: 'Euromaidan Press (Ukraine Frontline)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://euromaidanpress.com/feed/',
    url: 'https://euromaidanpress.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-the-cradle',
    name: 'The Cradle (Middle East Conflict)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://thecradle.co/feed',
    url: 'https://thecradle.co/feed',
    enabled: true,
  },
  {
    id: 'feed-military-times',
    name: 'Military Times (Troops & Combat)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml',
    url: 'https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml',
    enabled: true,
  },
  {
    id: 'feed-air-space',
    name: 'Air & Space Forces (Air Strikes)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.airandspaceforces.com/feed/',
    url: 'https://www.airandspaceforces.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-gcaptain',
    name: 'gCaptain (Maritime Security & Bab al-Mandeb)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://gcaptain.com/feed/',
    url: 'https://gcaptain.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-army-times',
    name: 'Army Times (Ground Combat)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.armytimes.com/arc/outboundfeeds/rss/?outputType=xml',
    url: 'https://www.armytimes.com/arc/outboundfeeds/rss/?outputType=xml',
    enabled: true,
  },
  {
    id: 'feed-c4isrnet',
    name: 'C4ISRNET (Cyber, EW & Space Defense)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.c4isrnet.com/arc/outboundfeeds/rss/?outputType=xml',
    url: 'https://www.c4isrnet.com/arc/outboundfeeds/rss/?outputType=xml',
    enabled: true,
  },
  {
    id: 'feed-warontherocks',
    name: 'War on the Rocks (Defense Strategy)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://warontherocks.com/feed/',
    url: 'https://warontherocks.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-modern-war',
    name: 'Modern War Institute (West Point)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://mwi.westpoint.edu/feed/',
    url: 'https://mwi.westpoint.edu/feed/',
    enabled: true,
  },
  {
    id: 'feed-uk-defence-journal',
    name: 'UK Defence Journal (NATO & Europe)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://ukdefencejournal.org.uk/feed/',
    url: 'https://ukdefencejournal.org.uk/feed/',
    enabled: true,
  },
  {
    id: 'feed-france24',
    name: 'France 24 World (RSS)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.france24.com/en/rss',
    url: 'https://www.france24.com/en/rss',
    enabled: true,
  },
  {
    id: 'feed-sky-news',
    name: 'Sky News World (RSS)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://feeds.skynews.com/feeds/rss/world.xml',
    url: 'https://feeds.skynews.com/feeds/rss/world.xml',
    enabled: true,
  },
  {
    id: 'feed-dw-world',
    name: 'Deutsche Welle World (DW)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://rss.dw.com/rdf/rss-en-all',
    url: 'https://rss.dw.com/rdf/rss-en-all',
    enabled: true,
  },
  // --- MAJOR MEDIA WAR WIRES ---
  {
    id: 'feed-reuters-defense',
    name: 'Reuters World Defense & Conflict Wire',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:reuters.com (war OR military OR missile OR airstrike OR frontline OR troops OR CENTCOM OR Houthi OR Ukraine OR Gaza OR Iran)',
    url: 'https://news.google.com/rss/search?q=site:reuters.com+(war+OR+military+OR+missile+OR+airstrike+OR+frontline+OR+troops+OR+CENTCOM+OR+Houthi+OR+Ukraine+OR+Gaza+OR+Iran)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-ap-defense',
    name: 'Associated Press (AP) War & Combat Wire',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:apnews.com (war OR military OR airstrike OR casualties OR missile OR frontline OR troops OR clashes)',
    url: 'https://news.google.com/rss/search?q=site:apnews.com+(war+OR+military+OR+airstrike+OR+casualties+OR+missile+OR+frontline+OR+troops+OR+clashes)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-afp-defense',
    name: 'AFP (Agence France-Presse) Defense Wire',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '("Agence France-Presse" OR "AFP") (war OR military OR airstrike OR missile OR conflict)',
    url: 'https://news.google.com/rss/search?q=%28%22Agence+France-Presse%22+OR+%22AFP%22%29+%28war+OR+military+OR+airstrike+OR+missile+OR+conflict%29&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-kyiv-independent',
    name: 'The Kyiv Independent (Ukraine Frontline)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://kyivindependent.com/feed/',
    url: 'https://kyivindependent.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-pravda-ua',
    name: 'Ukrainska Pravda (Defense & War Wire)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.pravda.com.ua/eng/rss/',
    url: 'https://www.pravda.com.ua/eng/rss/',
    enabled: true,
  },
  {
    id: 'feed-haaretz-war',
    name: 'Haaretz Conflict & Security Desk',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:haaretz.com (war OR military OR strike OR IDF OR Gaza OR Lebanon OR Iran)',
    url: 'https://news.google.com/rss/search?q=site:haaretz.com+(war+OR+military+OR+strike+OR+IDF+OR+Gaza+OR+Lebanon+OR+Iran)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-timesofisrael-war',
    name: 'Times of Israel Defense Wire',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:timesofisrael.com (IDF OR military OR strike OR Gaza OR Hezbollah OR missile OR rocket)',
    url: 'https://news.google.com/rss/search?q=site:timesofisrael.com+(IDF+OR+military+OR+strike+OR+Gaza+OR+Hezbollah+OR+missile+OR+rocket)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-arabnews-defense',
    name: 'Arab News Defense & Regional Security',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:arabnews.com (military OR Houthis OR Yemen OR Saudi OR strike OR defense OR coalition)',
    url: 'https://news.google.com/rss/search?q=site:arabnews.com+(military+OR+Houthis+OR+Yemen+OR+Saudi+OR+strike+OR+defense+OR+coalition)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-tehrantimes-defense',
    name: 'Tehran Times Defense & Strategic Desk',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:tehrantimes.com (IRGC OR military OR missile OR defense OR CENTCOM OR Hormuz)',
    url: 'https://news.google.com/rss/search?q=site:tehrantimes.com+(IRGC+OR+military+OR+missile+OR+defense+OR+CENTCOM+OR+Hormuz)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-tasnim-war',
    name: 'Tasnim News Agency Conflict Wire',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:tasnimnews.com (military OR IRGC OR missile OR strike OR defense)',
    url: 'https://news.google.com/rss/search?q=site:tasnimnews.com+(military+OR+IRGC+OR+missile+OR+strike+OR+defense)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-tass-military',
    name: 'TASS Defense & Armed Forces News',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:tass.com (military OR defense OR frontline OR strike OR missile OR troops)',
    url: 'https://news.google.com/rss/search?q=site:tass.com+(military+OR+defense+OR+frontline+OR+strike+OR+missile+OR+troops)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-sudantribune-war',
    name: 'Sudan Tribune Conflict Wire',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:sudantribune.com (SAF OR RSF OR military OR clashes OR army OR artillery)',
    url: 'https://news.google.com/rss/search?q=site:sudantribune.com+(SAF+OR+RSF+OR+military+OR+clashes+OR+army+OR+artillery)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-yonhap-military',
    name: 'Yonhap News Military Desk (Korea Security)',
    type: 'GOOGLE_NEWS',
    queryOrUrl: 'site:en.yna.co.kr (military OR missile OR "North Korea" OR ICBM OR defense OR drill)',
    url: 'https://news.google.com/rss/search?q=site:en.yna.co.kr+(military+OR+missile+OR+%22North+Korea%22+OR+ICBM+OR+defense+OR+drill)&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  // --- SPECIALIZED DEFENSE & MILITARY TECH ---
  {
    id: 'feed-militarnyi',
    name: 'Militarnyi (Defense & Armed Forces Tech)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://mil.in.ua/en/feed/',
    url: 'https://mil.in.ua/en/feed/',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-defense-express',
    name: 'Defense Express (Missile & Combat Telemetry)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://en.defence-ua.com/rss/',
    url: 'https://en.defence-ua.com/rss/',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-the-defense-post',
    name: 'The Defense Post (Global Military Ops)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.thedefensepost.com/feed/',
    url: 'https://www.thedefensepost.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-army-recognition',
    name: 'Army Recognition (Armored Combat Tech)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.armyrecognition.com/feed/',
    url: 'https://www.armyrecognition.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-breaking-defense',
    name: 'Breaking Defense (Pentagon & Warfare Tech)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://breakingdefense.com/feed/',
    url: 'https://breakingdefense.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-sofrep',
    name: 'SOFREP (Special Operations Forces Intelligence)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://sofrep.com/feed/',
    url: 'https://sofrep.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-task-and-purpose',
    name: 'Task & Purpose (Military Combat)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://taskandpurpose.com/feed/',
    url: 'https://taskandpurpose.com/feed/',
    enabled: true,
  },
  {
    id: 'feed-stars-and-stripes',
    name: 'Stars and Stripes (US Military Global Fronts)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://www.stripes.com/arc/outboundfeeds/rss/?outputType=xml',
    url: 'https://www.stripes.com/arc/outboundfeeds/rss/?outputType=xml',
    enabled: true,
  },
  {
    id: 'feed-militaryland',
    name: 'MilitaryLand (Frontline Units & Maps)',
    type: 'WEB_RSS',
    queryOrUrl: 'https://militaryland.net/feed/',
    url: 'https://militaryland.net/feed/',
    enabled: true,
    isOsint: true,
  },
  // --- REAL-TIME CONFLICT RADARS ---
  {
    id: 'feed-radar-iran-usa',
    name: 'Radar Konflik: Iran vs USA (IRGC vs CENTCOM)',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '("Iran" OR "IRGC" OR "Tehran" OR "Khamenei" OR "Persian Gulf" OR "Hormuz") ("CENTCOM" OR "U.S. Navy" OR "carrier" OR "Pentagon" OR "strike" OR "ballistic missile") when:2h',
    url: 'https://news.google.com/rss/search?q=%28%22Iran%22+OR+%22IRGC%22+OR+%22Tehran%22+OR+%22Khamenei%22+OR+%22Persian+Gulf%22+OR+%22Hormuz%22%29+%28%22CENTCOM%22+OR+%22U.S.+Navy%22+OR+%22carrier%22+OR+%22Pentagon%22+OR+%22strike%22+OR+%22ballistic+missile%22%29+when:2h&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-radar-saudi-yemen',
    name: 'Radar Konflik: Arab Saudi vs Milisi Yaman (Houthi)',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '("Saudi Arabia" OR "Riyadh" OR "Najran" OR "Jizan" OR "Khamis Mushait") ("Yemen" OR "Houthi" OR "Ansar Allah" OR "drone" OR "missile" OR "coalition") when:2h',
    url: 'https://news.google.com/rss/search?q=%28%22Saudi+Arabia%22+OR+%22Riyadh%22+OR+%22Najran%22+OR+%22Jizan%22+OR+%22Khamis+Mushait%22%29+%28%22Yemen%22+OR+%22Houthi%22+OR+%22Ansar+Allah%22+OR+%22drone%22+OR+%22missile%22+OR+%22coalition%22%29+when:2h&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-radar-lebanon',
    name: 'Radar Front: Israel vs Lebanon (Hezbollah)',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '("Lebanon" OR "Hezbollah" OR "Beirut" OR "Litani" OR "Dahiyeh") (strike OR intercepted OR missile OR rocket OR IDF) when:2h',
    url: 'https://news.google.com/rss/search?q=%28%22Lebanon%22+OR+%22Hezbollah%22+OR+%22Beirut%22+OR+%22Litani%22+OR+%22Dahiyeh%22%29+%28strike+OR+intercepted+OR+missile+OR+rocket+OR+IDF%29+when:2h&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-radar-syria-iraq',
    name: 'Radar Front: Suriah & Irak (Milisi vs Pangkalan AS)',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '("Syria" OR "Iraq" OR "Al-Tanf" OR "Ain al-Asad" OR "Golan" OR "Deir ez-Zor") (strike OR drone OR missile OR military) when:2h',
    url: 'https://news.google.com/rss/search?q=%28%22Syria%22+OR+%22Iraq%22+OR+%22Al-Tanf%22+OR+%22Ain+al-Asad%22+OR+%22Golan%22+OR+%22Deir+ez-Zor%22%29+%28strike+OR+drone+OR+missile+OR+military%29+when:2h&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-radar-sudan',
    name: 'Radar Konflik: Perang Saudara Sudan (SAF vs RSF)',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '("Sudan" OR "Khartoum" OR "El Fasher" OR "Darfur") ("SAF" OR "RSF" OR "Rapid Support Forces" OR "army" OR "clashes" OR "artillery") when:3h',
    url: 'https://news.google.com/rss/search?q=%28%22Sudan%22+OR+%22Khartoum%22+OR+%22El+Fasher%22+OR+%22Darfur%22%29+%28%22SAF%22+OR+%22RSF%22+OR+%22Rapid+Support+Forces%22+OR+%22army%22+OR+%22clashes%22+OR+%22artillery%22%29+when:3h&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
  {
    id: 'feed-radar-korea',
    name: 'Radar Front: Semenanjung Korea (Korut ICBM vs AS)',
    type: 'GOOGLE_NEWS',
    queryOrUrl: '("North Korea" OR "DPRK" OR "Pyongyang" OR "Kim Jong Un") (missile OR ICBM OR "nuclear" OR "Hwasong" OR "military drill") when:3h',
    url: 'https://news.google.com/rss/search?q=%28%22North+Korea%22+OR+%22DPRK%22+OR+%22Pyongyang%22+OR+%22Kim+Jong+Un%22%29+%28missile+OR+ICBM+OR+%22nuclear%22+OR+%22Hwasong%22+OR+%22military+drill%22%29+when:3h&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
  },
];

export const PRESET_TELEGRAM_FEEDS: FeedMonitor[] = [
  // Ukrainian Frontline & Alert Desks
  {
    id: 'feed-tg-kpszsu',
    name: 'Telegram @kpszsu (Повітряні Сили ЗСУ)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'kpszsu',
    url: 'https://t.me/s/kpszsu',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-operativnozsu',
    name: 'Telegram @operativnoZSU (Оперативно ЗСУ)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'operativnoZSU',
    url: 'https://t.me/s/operativnoZSU',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-deepstateua',
    name: 'Telegram @deepstateua (DeepState UA)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'deepstateua',
    url: 'https://t.me/s/deepstateua',
    enabled: true,
    isOsint: true,
  },
  // Russian Military & Combat Desks
  {
    id: 'feed-tg-milinfolive',
    name: 'Telegram @milinfolive (Военный Осведомитель)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'milinfolive',
    url: 'https://t.me/s/milinfolive',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-rybar',
    name: 'Telegram @rybar (Рыбарь)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'rybar',
    url: 'https://t.me/s/rybar',
    enabled: true,
    isOsint: true,
  },
  // Arab / Middle East & Red Sea Tracking Desks
  {
    id: 'feed-tg-ansarallah',
    name: 'Telegram @AnsarAllahMC (الإعلام الحربي اليمني)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'AnsarAllahMC',
    url: 'https://t.me/s/AnsarAllahMC',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-cmilitary',
    name: 'Telegram @C_Military1 (الإعلام الحربي المركزي)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'C_Military1',
    url: 'https://t.me/s/C_Military1',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-almayadeen',
    name: 'Telegram @almayadeen (الميادين عاجل)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'almayadeen',
    url: 'https://t.me/s/almayadeen',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-qudsn',
    name: 'Telegram @qudsn (شبكة قدس الإخبارية)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'qudsn',
    url: 'https://t.me/s/qudsn',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-alibk3',
    name: 'Telegram @Alibk3 (Ali Bk - Middle East & Global Conflict)',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'Alibk3',
    url: 'https://t.me/s/Alibk3',
    enabled: true,
    isOsint: true,
  },
  // International Military & OSINT Desks
  {
    id: 'feed-tg-liveuamap',
    name: 'Telegram @liveuamap',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'liveuamap',
    url: 'https://t.me/s/liveuamap',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-wartranslated',
    name: 'Telegram @wartranslated',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'wartranslated',
    url: 'https://t.me/s/wartranslated',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-osinttechnical',
    name: 'Telegram @osinttechnical',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'osinttechnical',
    url: 'https://t.me/s/osinttechnical',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-middleeastobserver',
    name: 'Telegram @middleeastobserver',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'middleeastobserver',
    url: 'https://t.me/s/middleeastobserver',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-tg-rybar-en',
    name: 'Telegram @rybar_en',
    type: 'TELEGRAM_CHANNEL',
    queryOrUrl: 'rybar_en',
    url: 'https://t.me/s/rybar_en',
    enabled: true,
    isOsint: true,
  },
];

export const PRESET_OSINT_FEEDS: FeedMonitor[] = [
  {
    id: 'feed-bellingcat-osint',
    name: 'Bellingcat (OSINT Investigations)',
    type: 'OSINT_DESK',
    queryOrUrl: 'https://www.bellingcat.com/feed/',
    url: 'https://www.bellingcat.com/feed/',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-ukmto-osint',
    name: 'UKMTO (Maritime Security & Bab al-Mandeb)',
    type: 'OSINT_DESK',
    queryOrUrl: '"UKMTO" OR "United Kingdom Maritime Trade Operations"',
    url: 'https://news.google.com/rss/search?q=%22UKMTO%22+OR+%22United+Kingdom+Maritime+Trade+Operations%22&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-isw-osint',
    name: 'Institute for the Study of War (ISW Frontline)',
    type: 'OSINT_DESK',
    queryOrUrl: '"Institute for the Study of War" OR site:understandingwar.org',
    url: 'https://news.google.com/rss/search?q=%22Institute+for+the+Study+of+War%22+OR+site:understandingwar.org&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-naval-news-osint',
    name: 'Naval News (Warships & Naval Clashes)',
    type: 'OSINT_DESK',
    queryOrUrl: 'https://www.navalnews.com/feed/',
    url: 'https://www.navalnews.com/feed/',
    enabled: true,
    isOsint: true,
  },
  {
    id: 'feed-geoconfirmed-osint',
    name: 'GeoConfirmed (Geolocated Combat OSINT)',
    type: 'OSINT_DESK',
    queryOrUrl: '"GeoConfirmed" OR site:geoconfirmed.org',
    url: 'https://news.google.com/rss/search?q=%22GeoConfirmed%22+OR+site:geoconfirmed.org&hl=en-US&gl=US&ceid=US:en',
    enabled: true,
    isOsint: true,
  },
];

export const OSINT_PILLAR_PRESET_SOURCES: Record<OsintPillarType, FeedMonitor[]> = {
  PILAR_1_STRIKES: [
    {
      id: 'pillar1-sentdefender',
      name: 'OSINTdefender (@sentdefender) - Live Strike & Alert Radar',
      type: 'X_ACCOUNT',
      queryOrUrl: 'sentdefender',
      url: 'https://x.com/sentdefender',
      xHandle: 'sentdefender',
      category: 'Pilar 1: Strike Wire',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar1-elintnews',
      name: 'ELINT News (@ELINTNews) - Ballistic & Missile Tracker',
      type: 'X_ACCOUNT',
      queryOrUrl: 'ELINTNews',
      url: 'https://x.com/ELINTNews',
      xHandle: 'ELINTNews',
      category: 'Pilar 1: Strike Wire',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar1-warmonitor',
      name: 'WarMonitor3 (@WarMonitor3) - Breaking Combat & Strike Desk',
      type: 'X_ACCOUNT',
      queryOrUrl: 'WarMonitor3',
      url: 'https://x.com/WarMonitor3',
      xHandle: 'WarMonitor3',
      category: 'Pilar 1: Strike Wire',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar1-kpszsu',
      name: 'Telegram @kpszsu (UA Air Force Live Missile & Drone Alerts)',
      type: 'TELEGRAM_CHANNEL',
      queryOrUrl: 'kpszsu',
      url: 'https://t.me/s/kpszsu',
      category: 'Pilar 1: Strike Wire',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar1-wire-gnews',
      name: 'Breaking Strikes & Interceptions Live Wire',
      type: 'GOOGLE_NEWS',
      queryOrUrl: 'breaking ("missile strike" OR "drone attack" OR "airstrike" OR "air defense intercepted" OR "explosion") when:1h',
      url: 'https://news.google.com/rss/search?q=breaking+%28%22missile+strike%22+OR+%22drone+attack%22+OR+%22airstrike%22+OR+%22air+defense+intercepted%22+OR+%22explosion%22%29+when:1h&hl=en-US&gl=US&ceid=US:en',
      category: 'Pilar 1: Strike Wire',
      enabled: true,
      isOsint: true,
    },
  ],
  PILAR_2_SATELLITE: [
    {
      id: 'pillar2-geoconfirmed',
      name: 'GeoConfirmed (@GeoConfirmed) - Geolocated Satellite BDA',
      type: 'X_ACCOUNT',
      queryOrUrl: 'GeoConfirmed',
      url: 'https://x.com/GeoConfirmed',
      xHandle: 'GeoConfirmed',
      category: 'Pilar 2: Satellite OSINT',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar2-bradyafr',
      name: 'Brady Africk (@bradyafr) - Fortifications & Airbase Satellites',
      type: 'X_ACCOUNT',
      queryOrUrl: 'bradyafr',
      url: 'https://x.com/bradyafr',
      xHandle: 'bradyafr',
      category: 'Pilar 2: Satellite OSINT',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar2-detresfa',
      name: 'Detresfa (@detresfa_) - Strategic Satellite & Imagery Analyst',
      type: 'X_ACCOUNT',
      queryOrUrl: 'detresfa_',
      url: 'https://x.com/detresfa_',
      xHandle: 'detresfa_',
      category: 'Pilar 2: Satellite OSINT',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar2-mtanderson',
      name: 'MT Anderson (@MT_Anderson) - Naval Base & Strategic Bomber Imagery',
      type: 'X_ACCOUNT',
      queryOrUrl: 'MT_Anderson',
      url: 'https://x.com/MT_Anderson',
      xHandle: 'MT_Anderson',
      category: 'Pilar 2: Satellite OSINT',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar2-wire-gnews',
      name: 'Satellite BDA & Damage Assessment Wire',
      type: 'GOOGLE_NEWS',
      queryOrUrl: '("satellite imagery" OR "Sentinel-2" OR "Maxar" OR "PlanetScope" OR "NASA FIRMS") ("damage" OR "strike" OR "airbase" OR "crater") when:24h',
      url: 'https://news.google.com/rss/search?q=%28%22satellite+imagery%22+OR+%22Sentinel-2%22+OR+%22Maxar%22+OR+%22PlanetScope%22+OR+%22NASA+FIRMS%22%29+%28%22damage%22+OR+%22strike%22+OR+%22airbase%22+OR+%22crater%22%29+when:24h&hl=en-US&gl=US&ceid=US:en',
      category: 'Pilar 2: Satellite OSINT',
      enabled: true,
      isOsint: true,
    },
  ],
  PILAR_3_VERIFICATION: [
    {
      id: 'pillar3-bellingcat',
      name: 'Bellingcat (@bellingcat) - Investigative OSINT & Video Verification',
      type: 'X_ACCOUNT',
      queryOrUrl: 'bellingcat',
      url: 'https://x.com/bellingcat',
      xHandle: 'bellingcat',
      category: 'Pilar 3: Video Verification',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar3-calibreobscura',
      name: 'Calibre Obscura (@CalibreObscura) - Small Arms & Equipment Verification',
      type: 'X_ACCOUNT',
      queryOrUrl: 'CalibreObscura',
      url: 'https://x.com/CalibreObscura',
      xHandle: 'CalibreObscura',
      category: 'Pilar 3: Video Verification',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar3-clashreport',
      name: 'Clash Report (@clashreport) - Frontline & Drone Footage Desk',
      type: 'X_ACCOUNT',
      queryOrUrl: 'clashreport',
      url: 'https://x.com/clashreport',
      xHandle: 'clashreport',
      category: 'Pilar 3: Video Verification',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar3-wire-gnews',
      name: 'Geolocated Combat Footage Verification Wire',
      type: 'GOOGLE_NEWS',
      queryOrUrl: '("geolocated" OR "visual confirmation" OR "geolocation" OR "footage verified") (combat OR frontline OR strike) when:24h',
      url: 'https://news.google.com/rss/search?q=%28%22geolocated%22+OR+%22visual+confirmation%22+OR+%22geolocation%22+OR+%22footage+verified%22%29+%28combat+OR+frontline+OR+strike%29+when:24h&hl=en-US&gl=US&ceid=US:en',
      category: 'Pilar 3: Video Verification',
      enabled: true,
      isOsint: true,
    },
  ],
  PILAR_4_LOSSES: [
    {
      id: 'pillar4-oryx',
      name: 'Oryx (@oryxspioenkop) - Visually Confirmed Equipment Losses',
      type: 'X_ACCOUNT',
      queryOrUrl: 'oryxspioenkop',
      url: 'https://x.com/oryxspioenkop',
      xHandle: 'oryxspioenkop',
      category: 'Pilar 4: Weapons & Losses',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar4-rebel44cz',
      name: 'Jakub Janovsky (@Rebel44CZ) - Verified Losses Database Lead',
      type: 'X_ACCOUNT',
      queryOrUrl: 'Rebel44CZ',
      url: 'https://x.com/Rebel44CZ',
      xHandle: 'Rebel44CZ',
      category: 'Pilar 4: Weapons & Losses',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar4-navalnews',
      name: 'Naval News (Warship Losses, Submarines & Maritime Weapons)',
      type: 'OSINT_DESK',
      queryOrUrl: 'https://www.navalnews.com/feed/',
      url: 'https://www.navalnews.com/feed/',
      category: 'Pilar 4: Weapons & Losses',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar4-wire-gnews',
      name: 'Downed Aircraft & Military Equipment Losses Wire',
      type: 'GOOGLE_NEWS',
      queryOrUrl: '("shot down" OR "losses" OR "destroyed" OR "damaged") ("S-400" OR "Patriot" OR "fighter jet" OR "warship" OR "tank") when:24h',
      url: 'https://news.google.com/rss/search?q=%28%22shot+down%22+OR+%22losses%22+OR+%22destroyed%22+OR+%22damaged%22%29+%28%22S-400%22+OR+%22Patriot%22+OR+%22fighter+jet%22+OR+%22warship%22+OR+%22tank%22%29+when:24h&hl=en-US&gl=US&ceid=US:en',
      category: 'Pilar 4: Weapons & Losses',
      enabled: true,
      isOsint: true,
    },
  ],
  PILAR_5_STRATEGIC: [
    {
      id: 'pillar5-isw',
      name: 'The Study of War (@TheStudyofWar) - Frontline Assessments',
      type: 'X_ACCOUNT',
      queryOrUrl: 'TheStudyofWar',
      url: 'https://x.com/TheStudyofWar',
      xHandle: 'TheStudyofWar',
      category: 'Pilar 5: Strategic Developments',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar5-deepstateua',
      name: 'Telegram @deepstateua (DeepState Frontline Tactical Changes)',
      type: 'TELEGRAM_CHANNEL',
      queryOrUrl: 'deepstateua',
      url: 'https://t.me/s/deepstateua',
      category: 'Pilar 5: Strategic Developments',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar5-ukmto',
      name: 'UKMTO (Red Sea & Maritime Shipping Security Alerts)',
      type: 'OSINT_DESK',
      queryOrUrl: '"UKMTO" OR "United Kingdom Maritime Trade Operations"',
      url: 'https://news.google.com/rss/search?q=%22UKMTO%22+OR+%22United+Kingdom+Maritime+Trade+Operations%22&hl=en-US&gl=US&ceid=US:en',
      category: 'Pilar 5: Strategic Developments',
      enabled: true,
      isOsint: true,
    },
    {
      id: 'pillar5-wire-gnews',
      name: 'Strategic Troop Deployments & Carrier Groups Wire',
      type: 'GOOGLE_NEWS',
      queryOrUrl: '("carrier strike group" OR "troop deployment" OR "mobilization" OR "military offensive" OR "frontline advance") when:24h',
      url: 'https://news.google.com/rss/search?q=%28%22carrier+strike+group%22+OR+%22troop+deployment%22+OR+%22mobilization%22+OR+%22military+offensive%22+OR+%22frontline+advance%22%29+when:24h&hl=en-US&gl=US&ceid=US:en',
      category: 'Pilar 5: Strategic Developments',
      enabled: true,
      isOsint: true,
    },
  ],
};

export const PRESET_X_ACCOUNTS: FeedMonitor[] = [
  {
    id: 'preset-x-tier10k',
    name: 'DB (@tier10k) - Fast News & Breaking Wire',
    type: 'X_ACCOUNT',
    queryOrUrl: 'tier10k',
    url: 'https://x.com/tier10k',
    xHandle: 'tier10k',
    category: 'Breaking Wire',
    enabled: true,
  },
  {
    id: 'preset-x-deltaone',
    name: 'Walter Bloomberg (@DeItaone) - Market & Geo Wire',
    type: 'X_ACCOUNT',
    queryOrUrl: 'DeItaone',
    url: 'https://x.com/DeItaone',
    xHandle: 'DeItaone',
    category: 'Finance & Geo',
    enabled: true,
  },
  {
    id: 'preset-x-watcherguru',
    name: 'Watcher Guru (@WatcherGuru) - Breaking Updates',
    type: 'X_ACCOUNT',
    queryOrUrl: 'WatcherGuru',
    url: 'https://x.com/WatcherGuru',
    xHandle: 'WatcherGuru',
    category: 'Breaking News',
    enabled: true,
  },
  {
    id: 'preset-x-sentdefender',
    name: 'OSINTdefender (@sentdefender) - Conflict Radar',
    type: 'X_ACCOUNT',
    queryOrUrl: 'sentdefender',
    url: 'https://x.com/sentdefender',
    xHandle: 'sentdefender',
    category: 'Conflict OSINT',
    enabled: true,
  },
  {
    id: 'preset-x-osinttechnical',
    name: 'OSINTtechnical (@Osinttechnical) - Defense Intel',
    type: 'X_ACCOUNT',
    queryOrUrl: 'Osinttechnical',
    url: 'https://x.com/Osinttechnical',
    xHandle: 'Osinttechnical',
    category: 'Military Intel',
    enabled: true,
  },
  {
    id: 'preset-x-marionawfal',
    name: 'Mario Nawfal (@MarioNawfal) - Global Breaking',
    type: 'X_ACCOUNT',
    queryOrUrl: 'MarioNawfal',
    url: 'https://x.com/MarioNawfal',
    xHandle: 'MarioNawfal',
    category: 'Global News',
    enabled: true,
  },
  {
    id: 'preset-x-spectatorindex',
    name: 'The Spectator Index (@spectatorindex)',
    type: 'X_ACCOUNT',
    queryOrUrl: 'spectatorindex',
    url: 'https://x.com/spectatorindex',
    xHandle: 'spectatorindex',
    category: 'World Index',
    enabled: true,
  },
  {
    id: 'preset-x-bbcbreaking',
    name: 'BBC Breaking News (@BBCBreaking)',
    type: 'X_ACCOUNT',
    queryOrUrl: 'BBCBreaking',
    url: 'https://x.com/BBCBreaking',
    xHandle: 'BBCBreaking',
    category: 'Major Wire',
    enabled: true,
  },
  {
    id: 'preset-x-clashreport',
    name: 'Clash Report (@clashreport) - Frontline & Drone Footage',
    type: 'X_ACCOUNT',
    queryOrUrl: 'clashreport',
    url: 'https://x.com/clashreport',
    xHandle: 'clashreport',
    category: 'Conflict OSINT',
    enabled: true,
  },
  {
    id: 'preset-x-elintnews',
    name: 'ELINT News (@ELINTNews) - MidEast & Ballistic Radar',
    type: 'X_ACCOUNT',
    queryOrUrl: 'ELINTNews',
    url: 'https://x.com/ELINTNews',
    xHandle: 'ELINTNews',
    category: 'Military Intel',
    enabled: true,
  },
  {
    id: 'preset-x-faytuks',
    name: 'Faytuks News (@Faytuks) - Rapid Geopolitical Wire',
    type: 'X_ACCOUNT',
    queryOrUrl: 'Faytuks',
    url: 'https://x.com/Faytuks',
    xHandle: 'Faytuks',
    category: 'Breaking Wire',
    enabled: true,
  },
  {
    id: 'preset-x-auroraintel',
    name: 'Aurora Intel (@AuroraIntel) - Middle East & Levant OSINT',
    type: 'X_ACCOUNT',
    queryOrUrl: 'AuroraIntel',
    url: 'https://x.com/AuroraIntel',
    xHandle: 'AuroraIntel',
    category: 'Conflict OSINT',
    enabled: true,
  },
  {
    id: 'preset-x-qudsnen',
    name: 'Quds News Network (@QudsNen) - MidEast Breaking',
    type: 'X_ACCOUNT',
    queryOrUrl: 'QudsNen',
    url: 'https://x.com/QudsNen',
    xHandle: 'QudsNen',
    category: 'MidEast Wire',
    enabled: true,
  },
  {
    id: 'preset-x-warnoir',
    name: 'War Noir (@war_noir) - Conflict Weapons & Munitions',
    type: 'X_ACCOUNT',
    queryOrUrl: 'war_noir',
    url: 'https://x.com/war_noir',
    xHandle: 'war_noir',
    category: 'Weapons OSINT',
    enabled: true,
  },
  {
    id: 'preset-x-ajabreaking',
    name: 'Al Jazeera Breaking (@AJABreaking) - Urgent Wire',
    type: 'X_ACCOUNT',
    queryOrUrl: 'AJABreaking',
    url: 'https://x.com/AJABreaking',
    xHandle: 'AJABreaking',
    category: 'MidEast Wire',
    enabled: true,
  },
  {
    id: 'preset-x-alarabiyabrk',
    name: 'Al Arabiya Urgent (@AlArabiya_Brk) - Gulf & Levant',
    type: 'X_ACCOUNT',
    queryOrUrl: 'AlArabiya_Brk',
    url: 'https://x.com/AlArabiya_Brk',
    xHandle: 'AlArabiya_Brk',
    category: 'MidEast Wire',
    enabled: true,
  },
];

export const DEFAULT_FEED_MONITORS: FeedMonitor[] = CATALOG_SAMPLE_FEEDS;

function deduplicateFeeds(list: FeedMonitor[]): FeedMonitor[] {
  const seen = new Set<string>();
  const out: FeedMonitor[] = [];
  for (const item of list) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

const CUSTOM_FEEDS_KEY = 'stark_news_custom_feeds';

export function loadCustomFeeds(): FeedMonitor[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FEEDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({ ...item, isCustom: true }));
      }
    }
  } catch {}
  return [];
}

export function saveCustomFeed(feed: FeedMonitor): void {
  try {
    const current = loadCustomFeeds();
    const cleanFeed: FeedMonitor = { ...feed, isCustom: true };
    const filtered = current.filter(
      (f) =>
        f.id !== feed.id &&
        f.url.toLowerCase() !== feed.url.toLowerCase() &&
        (!feed.xHandle || f.xHandle?.toLowerCase() !== feed.xHandle?.toLowerCase())
    );
    filtered.push(cleanFeed);
    localStorage.setItem(CUSTOM_FEEDS_KEY, JSON.stringify(filtered));
  } catch {}
}

export function removeCustomFeed(idOrHandleOrUrl: string): void {
  try {
    const current = loadCustomFeeds();
    const target = idOrHandleOrUrl.toLowerCase().trim();
    const filtered = current.filter(
      (f) =>
        f.id.toLowerCase() !== target &&
        f.url.toLowerCase() !== target &&
        (!f.xHandle || f.xHandle.toLowerCase() !== target.replace(/^@/, '')) &&
        (!f.queryOrUrl || f.queryOrUrl.toLowerCase() !== target.replace(/^@/, ''))
    );
    localStorage.setItem(CUSTOM_FEEDS_KEY, JSON.stringify(filtered));
  } catch {}
}

export function loadFeedMonitors(): FeedMonitor[] {
  try {
    const raw = localStorage.getItem(FEEDS_KEY);
    const customFeeds = loadCustomFeeds();

    if (raw === null) {
      const dedupDefault = deduplicateFeeds([...customFeeds, ...DEFAULT_FEED_MONITORS]);
      localStorage.setItem(FEEDS_KEY, JSON.stringify(dedupDefault));
      return dedupDefault;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) {
        return customFeeds.length > 0 ? customFeeds : [];
      }
      // If list is small (e.g. only a few custom channels), merge with default news monitors
      if (parsed.length < 15) {
        const combined = [...parsed];
        for (const d of DEFAULT_FEED_MONITORS) {
          if (!combined.some((f) => f.id === d.id || f.url?.toLowerCase() === d.url?.toLowerCase())) {
            combined.push(d);
          }
        }
        for (const cf of customFeeds) {
          if (!combined.some((f) => f.id === cf.id || f.url?.toLowerCase() === cf.url?.toLowerCase())) {
            combined.push(cf);
          }
        }
        const dedup = deduplicateFeeds(combined);
        try {
          localStorage.setItem(FEEDS_KEY, JSON.stringify(dedup));
        } catch {}
        return dedup;
      }
      // Ensure any custom feeds added by user are never discarded
      const combined = [...parsed];
      for (const cf of customFeeds) {
        if (!combined.some((f) => f.id === cf.id || f.url?.toLowerCase() === cf.url?.toLowerCase())) {
          combined.push(cf);
        }
      }
      return deduplicateFeeds(combined);
    }
    return customFeeds;
  } catch {
    return loadCustomFeeds();
  }
}

export function clearAllFeedMonitors(clearCustom = true): void {
  try {
    localStorage.setItem(FEEDS_KEY, JSON.stringify([]));
    if (clearCustom) {
      localStorage.removeItem(CUSTOM_FEEDS_KEY);
    }
    localStorage.removeItem('stark_cached_stories');
  } catch {}
}

export function restoreDefaultFeedMonitors(): FeedMonitor[] {
  try {
    const customFeeds = loadCustomFeeds();
    const merged = deduplicateFeeds([...customFeeds, ...DEFAULT_FEED_MONITORS]);
    localStorage.setItem(FEEDS_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return deduplicateFeeds(DEFAULT_FEED_MONITORS);
  }
}

export function saveFeedMonitors(monitors: FeedMonitor[]): void {
  try {
    localStorage.setItem(FEEDS_KEY, JSON.stringify(monitors));
    // Persist any feeds that are user-custom or newly added into the dedicated custom store
    const customMonitors = monitors.filter((m) => m.isCustom);
    localStorage.setItem(CUSTOM_FEEDS_KEY, JSON.stringify(customMonitors));
  } catch (e) {
    console.error('Failed to save feed monitors:', e);
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  channelName: 'Stark-News-x',
  handle: '@Stark-News-x',
  logoDataUrl: '/brand/logo.svg',
  removeLogoBackground: true,
  accentColor: '#FFFFFF',
  glowDefaults: {
    color: '#FFFFFF',
    intensity: 60,
    spread: 50,
    toggles: {
      headline: true,
      highlightBox: true,
      logo: true,
      badge: true,
      footer: true,
    },
  },
  defaultHashtags: '#StarkNews #BreakingNews #Geopolitics #Military #Defense',
  closingSentence: 'Follow @Stark-News-x for breaking military and geopolitical intelligence updates.',
  youtubePostsUrl: 'https://www.youtube.com/@Stark-News-x/posts',
  captionLang: 'en',
  pollInterval: 30,
  soundEnabled: false,
  trackedConflicts: [
    'Bab al-Mandeb / Red Sea',
    'Russia-Ukraine',
    'Israel-Gaza',
    'Israel-Iran / Iran',
    'Lebanon / Hezbollah',
    'Syria',
    'China-Taiwan',
    'North Korea',
    'Sudan',
    'Myanmar',
  ],
  trackedKeywords: [
    'drone attack',
    'missile strike',
    'airstrike',
    'ballistic missile',
    'ground offensive',
    'naval attack',
    'nuclear',
    'ceasefire',
    'peace talks',
    'sanctions',
  ],
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed.handle === '@wardesk' || !parsed.handle) {
      parsed.handle = '@Stark-News-x';
      parsed.channelName = 'Stark-News-x';
      parsed.youtubePostsUrl = 'https://www.youtube.com/@Stark-News-x/posts';
    }
    if (!parsed.channelName || parsed.channelName === 'WarDesk' || parsed.channelName === 'Stark News') {
      parsed.channelName = 'Stark-News-x';
    }
    if (!parsed.closingSentence || parsed.closingSentence.includes('Follow untuk')) {
      parsed.closingSentence = 'Follow @Stark-News-x for breaking military and geopolitical intelligence updates.';
    }
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      glowDefaults: {
        ...DEFAULT_SETTINGS.glowDefaults,
        ...(parsed.glowDefaults || {}),
        toggles: {
          ...DEFAULT_SETTINGS.glowDefaults.toggles,
          ...(parsed.glowDefaults?.toggles || {}),
        },
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22 || err?.code === 1014) {
      try {
        localStorage.removeItem('stark_cached_stories');
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return;
      } catch {}
    }
    console.warn('Settings persistence note:', err?.message || err);
  }
}

export function loadDrafts(): DraftItem[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function sanitizeDraftForStorage(draft: DraftItem): DraftItem {
  // If imageUrl or config contains huge base64 data URLs, strip or truncate them to prevent quota blowout
  const cleanImageUrl =
    draft.imageUrl && draft.imageUrl.startsWith('data:') && draft.imageUrl.length > 5000
      ? ''
      : draft.imageUrl;

  const bgUrl = draft.editorConfig.background?.imageUrl;
  const cleanBgUrl =
    bgUrl && bgUrl.startsWith('data:') && bgUrl.length > 5000 ? '' : bgUrl;

  return {
    ...draft,
    imageUrl: cleanImageUrl,
    editorConfig: {
      ...draft.editorConfig,
      background: {
        ...draft.editorConfig.background,
        imageUrl: cleanBgUrl,
      },
    },
  };
}

export function saveDrafts(drafts: DraftItem[]) {
  try {
    const sanitized = (Array.isArray(drafts) ? drafts.slice(0, 15) : []).map(sanitizeDraftForStorage);

    const attemptSave = (items: DraftItem[]): boolean => {
      try {
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(items));
        return true;
      } catch (e: any) {
        // Clear non-critical caches to recover storage capacity
        if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014) {
          try {
            localStorage.removeItem('stark_cached_stories');
          } catch {}
        }
        return false;
      }
    };

    // 1. Try saving sanitized list (up to 15 items)
    if (attemptSave(sanitized)) return;

    // 2. If storage quota exceeded, retry with 5 items
    if (attemptSave(sanitized.slice(0, 5))) return;

    // 3. Retry with most recent single item
    if (sanitized.length > 0 && attemptSave(sanitized.slice(0, 1))) return;

    // 4. If even single item fails, clear drafts key safely
    try {
      localStorage.removeItem(DRAFTS_KEY);
    } catch {}
    console.warn('[Stark-News] Storage quota reached, drafts safely handled.');
  } catch (err) {
    console.warn('[Stark-News] Error in saveDrafts:', err);
  }
}

export interface EditorStylePreferences {
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  headlineY: number;
  headlineX: number;
  textColor: string;
  highlightBoxColor: string;
  highlightTextColor: string;
  autoHighlightLastLine: boolean;
  glow?: {
    color: string;
    intensity: number;
    spread: number;
    toggles: {
      headline: boolean;
      highlightBox: boolean;
      logo: boolean;
      badge: boolean;
      footer: boolean;
    };
  };
  backgroundZoom: number;
  backgroundPanX: number;
  backgroundPanY: number;
  bottomGradientOpacity: number;
  bottomGradientHeight: number;
  topGradientOpacity: number;
  logoShow: boolean;
  logoSize: number;
  logoMargin: number;
  logoPosition: 'top-left' | 'top-right';
  dividerShow: boolean;
  badgeShow: boolean;
  badgeText: string;
  sourceLineShow: boolean;
  sourceLineText?: string;
  handleFooterShow: boolean;
  handleFooterText?: string;
  headlineText?: string;
  highlightWords?: string[];
  imageUrl?: string;
}

const EDITOR_STYLE_PREFS_KEY = 'stark_news_editor_style_preferences';
const CURRENT_EDITOR_CONFIG_KEY = 'stark_news_current_editor_config';

export function saveCurrentEditorConfig(config: EditorConfig): void {
  try {
    localStorage.setItem(CURRENT_EDITOR_CONFIG_KEY, JSON.stringify(config));
  } catch (e: any) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014) {
      try {
        localStorage.removeItem('stark_cached_stories');
        localStorage.setItem(CURRENT_EDITOR_CONFIG_KEY, JSON.stringify(config));
      } catch {}
    }
    console.debug('Current editor config persistence notice:', e?.message || e);
  }
}

export function hasSavedEditorConfig(): boolean {
  try {
    return Boolean(localStorage.getItem(CURRENT_EDITOR_CONFIG_KEY));
  } catch {
    return false;
  }
}

export function loadCurrentEditorConfig(settings: AppSettings): EditorConfig {
  try {
    const raw = localStorage.getItem(CURRENT_EDITOR_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.headline) {
        // Ensure all required fields exist with resilient defaults
        return {
          headline: parsed.headline || 'MASSIVE MISSILE BARRAGE REPORTED IN STRATEGIC THEATRE',
          highlightWords: Array.isArray(parsed.highlightWords) ? parsed.highlightWords : ['BARRAGE', 'STRATEGIC', 'THEATRE'],
          autoHighlightLastLine: parsed.autoHighlightLastLine ?? true,
          fontSize: typeof parsed.fontSize === 'number' ? parsed.fontSize : 54,
          fontFamily: parsed.fontFamily || 'Montserrat',
          textAlign: parsed.textAlign || 'left',
          headlineY: typeof parsed.headlineY === 'number' ? parsed.headlineY : 76,
          headlineX: typeof parsed.headlineX === 'number' ? parsed.headlineX : 48,
          textColor: parsed.textColor || '#FFFFFF',
          highlightBoxColor: parsed.highlightBoxColor || '#FFFFFF',
          highlightTextColor: parsed.highlightTextColor || '#000000',
          glow: parsed.glow || {
            color: settings.glowDefaults?.color || '#FFFFFF',
            intensity: settings.glowDefaults?.intensity ?? 60,
            spread: settings.glowDefaults?.spread ?? 50,
            toggles: {
              headline: settings.glowDefaults?.toggles?.headline ?? true,
              highlightBox: settings.glowDefaults?.toggles?.highlightBox ?? true,
              logo: settings.glowDefaults?.toggles?.logo ?? true,
              badge: settings.glowDefaults?.toggles?.badge ?? true,
              footer: settings.glowDefaults?.toggles?.footer ?? true,
            },
          },
          background: {
            imageUrl:
              parsed.background?.imageUrl ||
              'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
            zoom: parsed.background?.zoom ?? 100,
            panX: parsed.background?.panX ?? 0,
            panY: parsed.background?.panY ?? 0,
            bottomGradientOpacity: parsed.background?.bottomGradientOpacity ?? 92,
            bottomGradientHeight: parsed.background?.bottomGradientHeight ?? 58,
            topGradientOpacity: parsed.background?.topGradientOpacity ?? 55,
          },
          logo: {
            show: parsed.logo?.show ?? true,
            size: parsed.logo?.size ?? 68,
            margin: parsed.logo?.margin ?? 48,
            position: parsed.logo?.position || 'top-left',
          },
          badge: {
            show: parsed.badge?.show ?? true,
            text: parsed.badge?.text || 'BREAKING',
          },
          divider: {
            show: parsed.divider?.show ?? true,
          },
          sourceLine: {
            show: parsed.sourceLine?.show ?? true,
            text: parsed.sourceLine?.text || `Source: Stark-News-x Radar • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          },
          handleFooter: {
            show: parsed.handleFooter?.show ?? true,
            text: parsed.handleFooter?.text || settings.handle || '@Stark-News-x',
          },
          tacticalBadge: undefined,
        };
      }
    }
  } catch (e) {
    console.debug('Failed to load saved current editor config', e);
  }

  return createDefaultEditorConfig(
    'MASSIVE MISSILE BARRAGE REPORTED IN STRATEGIC THEATRE',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    'Stark-News-x Radar',
    settings,
    true
  );
}

export function saveEditorStylePreferences(config: EditorConfig): void {
  try {
    const prefs: EditorStylePreferences = {
      fontSize: config.fontSize,
      fontFamily: config.fontFamily || 'Montserrat',
      textAlign: config.textAlign || 'left',
      headlineY: config.headlineY ?? 76,
      headlineX: config.headlineX ?? 48,
      textColor: config.textColor || '#FFFFFF',
      highlightBoxColor: config.highlightBoxColor || '#FFFFFF',
      highlightTextColor: config.highlightTextColor || '#000000',
      autoHighlightLastLine: config.autoHighlightLastLine ?? true,
      glow: config.glow
        ? {
            color: config.glow.color,
            intensity: config.glow.intensity,
            spread: config.glow.spread,
            toggles: { ...config.glow.toggles },
          }
        : undefined,
      backgroundZoom: config.background?.zoom ?? 100,
      backgroundPanX: config.background?.panX ?? 0,
      backgroundPanY: config.background?.panY ?? 0,
      bottomGradientOpacity: config.background?.bottomGradientOpacity ?? 92,
      bottomGradientHeight: config.background?.bottomGradientHeight ?? 58,
      topGradientOpacity: config.background?.topGradientOpacity ?? 55,
      logoShow: config.logo?.show ?? true,
      logoSize: config.logo?.size ?? 68,
      logoMargin: config.logo?.margin ?? 48,
      logoPosition: config.logo?.position || 'top-left',
      dividerShow: config.divider?.show ?? true,
      badgeShow: config.badge?.show ?? true,
      badgeText: config.badge?.text || 'BREAKING',
      sourceLineShow: config.sourceLine?.show ?? true,
      sourceLineText: config.sourceLine?.text,
      handleFooterShow: config.handleFooter?.show ?? true,
      handleFooterText: config.handleFooter?.text,
      headlineText: config.headline,
      highlightWords: config.highlightWords,
      imageUrl:
        config.background?.imageUrl &&
        config.background.imageUrl.startsWith('data:') &&
        config.background.imageUrl.length > 5000
          ? ''
          : config.background?.imageUrl,
    };
    try {
      localStorage.setItem(EDITOR_STYLE_PREFS_KEY, JSON.stringify(prefs));
    } catch (e: any) {
      if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014) {
        try {
          localStorage.removeItem('stark_cached_stories');
          localStorage.setItem(EDITOR_STYLE_PREFS_KEY, JSON.stringify(prefs));
        } catch {}
      }
    }
    saveCurrentEditorConfig(config);
  } catch (e) {
    console.debug('Failed to save editor preferences', e);
  }
}

export function loadEditorStylePreferences(): Partial<EditorStylePreferences> | null {
  try {
    const raw = localStorage.getItem(EDITOR_STYLE_PREFS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.debug('Failed to load editor preferences', e);
  }
  return null;
}

export function clearEditorStylePreferences(): void {
  try {
    localStorage.removeItem(EDITOR_STYLE_PREFS_KEY);
    localStorage.removeItem(CURRENT_EDITOR_CONFIG_KEY);
  } catch {}
}

/**
 * Intelligent breaking news headline condenser for visual canvas graphic cards
 */
export function synthesizeSmartHeadline(rawTitle: string): { headline: string; highlightWords: string[] } {
  if (!rawTitle) return { headline: '', highlightWords: [] };
  let text = rawTitle.trim();
  text = text.replace(/https?:\/\/\S+/gi, '');
  text = text.replace(/\s*-\s*(?:X|Twitter|Reuters|AP|BBC|AFP|Al Jazeera|CNN|The Guardian|WSJ|NYT|TASS).*$/i, '');
  text = text.replace(/\s*\|\s*.*$/, '');
  text = text.replace(/^(?:Breaking(?:\s*News)?|Urgent|Alert|Update|Exclusive|Just In)[\s:–—-]+/i, '');
  text = text.replace(/^(?:U\.S\.|US|Regional|Local|Defense)?\s*(?:officials|sources|envoys|spokesperson|analysts)\s*(?:told|say|said|claim|confirmed|reported)\s*(?:that|the)?\s*/i, '');
  text = text.replace(/^(?:according to|speaking to|citing|per)\s*[^,;]+[,;]\s*/i, '');
  text = text.replace(/^(?:in a notable development|in a major escalation|reports indicate that|it has been reported that)\s*,?\s*/i, '');
  text = text.replace(/["'\u201C\u201D\u2018\u2019]/g, '').trim();

  // Handle Arabic tweets / Cyrillic
  if (/[\u0600-\u06FF]/.test(text)) {
    if (/صواريخ|صاروخ|قصف|انفجار|طيران/i.test(text) && /شرقية|السعودية|ابيستن|الرياض/i.test(text)) {
      return { headline: 'MISSILE STRIKES REPORTED TARGETING SAUDI EASTERN REGION', highlightWords: ['MISSILE', 'STRIKES'] };
    }
    if (/الحوثي|حوثي/i.test(text) && /تعز|جبل حبشي/i.test(text)) {
      return { headline: 'HOUTHI MILITIA MOVES ON TAIZ PROVINCE FRONTLINES', highlightWords: ['HOUTHI', 'MILITIA'] };
    }
    if (/باب المندب|البحر الأحمر/i.test(text)) {
      return { headline: 'NAVAL CLASHES REPORTED IN BAB AL-MANDEB STRAIT', highlightWords: ['NAVAL', 'CLASHES'] };
    }
    if (/مطار|الملك خالد/i.test(text)) {
      return { headline: 'ATTACK TARGETS RIYADH INTERNATIONAL AIRPORT', highlightWords: ['ATTACK', 'TARGETS'] };
    }
  }

  const primaryClause = text.split(/,\s*(?:two|three|one|several|speaking|according|citing|killing|injuring|as|while)\b/i)[0] || text;
  let words = primaryClause.split(/\s+/).filter(Boolean);
  if (words.length > 9) {
    words = words.slice(0, 9);
  }
  const headline = words.join(' ').toUpperCase().trim();

  const combatTerms = [
    'STRIKES', 'ATTACK', 'ATTACKED', 'INTERCEPTS', 'INTERCEPTED', 'DRONES',
    'MISSILES', 'AIRPORT', 'EVACUATED', 'CARRIER', 'BOMBERS', 'FRONTLINE',
    'WARSHIPS', 'DEPOT', 'REFINERY', 'DEFENSE', 'FORCES', 'ADVANCES', 'LAUNCHES'
  ];
  const headWords = headline.split(/\s+/);
  let highlights: string[] = [];
  for (let i = 0; i < headWords.length; i++) {
    const w = headWords[i].replace(/[^\w]/g, '');
    if (combatTerms.includes(w)) {
      highlights.push(headWords[i]);
      if (headWords[i + 1]) highlights.push(headWords[i + 1]);
      break;
    }
  }
  if (highlights.length < 2) {
    highlights = headWords.length > 2 ? headWords.slice(-2) : headWords;
  }

  return { headline, highlightWords: highlights.slice(0, 3) };
}

/**
 * Applies a new news story to the editor configuration while STRICTLY PRESERVING
 * all custom user styling settings (font size, colors, photo gradient, zoom, positions, toggles, etc.)
 */
export function applyStoryToEditorConfig(
  prevConfig: EditorConfig,
  headline: string,
  imageUrl: string,
  sourceName: string,
  isBreaking = false
): EditorConfig {
  const prefs = loadEditorStylePreferences();
  const { headline: smartHead, highlightWords: smartHighlights } = synthesizeSmartHeadline(headline);
  const finalHeadline = smartHead || headline;
  const words = finalHeadline.trim().split(/\s+/).filter(Boolean);
  const highlightWords = smartHighlights.length > 0 ? smartHighlights : (words.length > 3 ? words.slice(-3) : words.slice(-1));

  const updated: EditorConfig = {
    ...prevConfig,
    headline: finalHeadline,
    highlightWords,
    autoHighlightLastLine: prevConfig.autoHighlightLastLine ?? prefs?.autoHighlightLastLine ?? true,
    fontSize: prevConfig.fontSize ?? prefs?.fontSize ?? 54,
    fontFamily: prevConfig.fontFamily ?? prefs?.fontFamily ?? 'Montserrat',
    textAlign: prevConfig.textAlign ?? prefs?.textAlign ?? 'left',
    headlineY: prevConfig.headlineY ?? prefs?.headlineY ?? 76,
    headlineX: prevConfig.headlineX ?? prefs?.headlineX ?? 48,
    textColor: prevConfig.textColor ?? prefs?.textColor ?? '#FFFFFF',
    highlightBoxColor: prevConfig.highlightBoxColor ?? prefs?.highlightBoxColor ?? '#FFFFFF',
    highlightTextColor: prevConfig.highlightTextColor ?? prefs?.highlightTextColor ?? '#000000',
    glow: prevConfig.glow || prefs?.glow || {
      color: '#FFFFFF',
      intensity: 60,
      spread: 50,
      toggles: { headline: true, highlightBox: true, logo: true, badge: true, footer: true },
    },
    background: {
      ...prevConfig.background,
      imageUrl: imageUrl || prevConfig.background?.imageUrl,
      zoom: prevConfig.background?.zoom ?? prefs?.backgroundZoom ?? 100,
      panX: prevConfig.background?.panX ?? prefs?.backgroundPanX ?? 0,
      panY: prevConfig.background?.panY ?? prefs?.backgroundPanY ?? 0,
      bottomGradientOpacity: prevConfig.background?.bottomGradientOpacity ?? prefs?.bottomGradientOpacity ?? 92,
      bottomGradientHeight: prevConfig.background?.bottomGradientHeight ?? prefs?.bottomGradientHeight ?? 58,
      topGradientOpacity: prevConfig.background?.topGradientOpacity ?? prefs?.topGradientOpacity ?? 55,
    },
    logo: {
      ...prevConfig.logo,
      show: prevConfig.logo?.show ?? prefs?.logoShow ?? true,
      size: prevConfig.logo?.size ?? prefs?.logoSize ?? 68,
      margin: prevConfig.logo?.margin ?? prefs?.logoMargin ?? 48,
      position: prevConfig.logo?.position ?? prefs?.logoPosition ?? 'top-left',
    },
    badge: {
      show: prevConfig.badge?.show ?? prefs?.badgeShow ?? true,
      text: isBreaking ? 'BREAKING' : (prevConfig.badge?.text || prefs?.badgeText || 'WAR UPDATE'),
    },
    divider: {
      show: prevConfig.divider?.show ?? prefs?.dividerShow ?? true,
    },
    sourceLine: {
      show: prevConfig.sourceLine?.show ?? prefs?.sourceLineShow ?? true,
      text: `Source: ${sourceName} • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    },
    handleFooter: {
      show: prevConfig.handleFooter?.show ?? prefs?.handleFooterShow ?? true,
      text: prevConfig.handleFooter?.text || prefs?.handleFooterText || '@Stark-News-x',
    },
    tacticalBadge: undefined,
  };

  saveCurrentEditorConfig(updated);
  saveEditorStylePreferences(updated);
  return updated;
}

export function createDefaultEditorConfig(
  headline: string,
  imageUrl: string,
  sourceName: string,
  settings: AppSettings,
  isBreaking = false,
  customPreferences?: Partial<EditorStylePreferences> | null
): EditorConfig {
  const prefs = customPreferences !== undefined ? customPreferences : loadEditorStylePreferences();
  const words = headline.trim().split(/\s+/).filter(Boolean);
  const highlightWords = words.length > 3 ? words.slice(-3) : words.slice(-1);

  return {
    headline: prefs?.headlineText || headline,
    highlightWords: prefs?.highlightWords && prefs.highlightWords.length > 0 ? prefs.highlightWords : highlightWords,
    autoHighlightLastLine: prefs?.autoHighlightLastLine ?? true,
    fontSize: prefs?.fontSize ?? 54,
    fontFamily: prefs?.fontFamily ?? 'Montserrat',
    textAlign: prefs?.textAlign ?? 'left',
    headlineY: prefs?.headlineY ?? 76,
    headlineX: prefs?.headlineX ?? 48,
    textColor: prefs?.textColor ?? '#FFFFFF',
    highlightBoxColor: prefs?.highlightBoxColor ?? '#FFFFFF',
    highlightTextColor: prefs?.highlightTextColor ?? '#000000',
    glow: prefs?.glow
      ? {
          color: prefs.glow.color,
          intensity: prefs.glow.intensity,
          spread: prefs.glow.spread,
          toggles: { ...prefs.glow.toggles },
        }
      : {
          color: settings.glowDefaults.color,
          intensity: settings.glowDefaults.intensity,
          spread: settings.glowDefaults.spread,
          toggles: { ...settings.glowDefaults.toggles },
        },
    background: {
      imageUrl: prefs?.imageUrl || imageUrl,
      zoom: prefs?.backgroundZoom ?? 100,
      panX: prefs?.backgroundPanX ?? 0,
      panY: prefs?.backgroundPanY ?? 0,
      bottomGradientOpacity: prefs?.bottomGradientOpacity ?? 92,
      bottomGradientHeight: prefs?.bottomGradientHeight ?? 58,
      topGradientOpacity: prefs?.topGradientOpacity ?? 55,
    },
    logo: {
      show: prefs?.logoShow ?? true,
      size: prefs?.logoSize ?? 68,
      margin: prefs?.logoMargin ?? 48,
      position: prefs?.logoPosition ?? 'top-left',
    },
    badge: {
      show: prefs?.badgeShow ?? true,
      text: isBreaking ? 'BREAKING' : (prefs?.badgeText || 'WAR UPDATE'),
    },
    divider: {
      show: prefs?.dividerShow ?? true,
    },
    sourceLine: {
      show: prefs?.sourceLineShow ?? true,
      text: prefs?.sourceLineText || `Source: ${sourceName} • ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    },
    handleFooter: {
      show: prefs?.handleFooterShow ?? true,
      text: prefs?.handleFooterText || settings.handle || '@Stark-News-x',
    },
    tacticalBadge: undefined,
  };
}

export const DEFAULT_TELEGRAM_GROUPS: ConnectedTelegramGroup[] = [];

export const CATALOG_TELEGRAM_GROUPS: ConnectedTelegramGroup[] = [
  // Ukrainian Frontline & Air Alerts
  {
    id: 'tg-grp-kpszsu',
    name: 'Повітряні Сили ЗСУ',
    handle: 'kpszsu',
    theater: 'UKRAINIAN',
    language: 'uk',
    description: 'Radar warning radar alerts, incoming missiles & Shaheds',
    enabled: true,
  },
  {
    id: 'tg-grp-operativnozsu',
    name: 'Оперативно ЗСУ',
    handle: 'operativnoZSU',
    theater: 'UKRAINIAN',
    language: 'uk',
    description: 'Frontline combat video & tactical situation updates',
    enabled: true,
  },
  {
    id: 'tg-grp-deepstateua',
    name: 'DeepState UA Frontline',
    handle: 'deepstateua',
    theater: 'UKRAINIAN',
    language: 'uk',
    description: 'Geolocated frontline mapping & territorial changes',
    enabled: true,
  },
  {
    id: 'tg-grp-mysiagin',
    name: 'Юрій Мисягін',
    handle: 'mysiagin',
    theater: 'UKRAINIAN',
    language: 'uk',
    description: 'Frontline defense footage, artillery & drone strikes',
    enabled: true,
  },

  // Russian Military & Combat Intelligence
  {
    id: 'tg-grp-milinfolive',
    name: 'Военный Осведомитель',
    handle: 'milinfolive',
    theater: 'RUSSIAN',
    language: 'ru',
    description: 'Russian frontline armor, air defense & Lancet strikes',
    enabled: true,
  },
  {
    id: 'tg-grp-rybar',
    name: 'Рыбарь Военная аналитика',
    handle: 'rybar',
    theater: 'RUSSIAN',
    language: 'ru',
    description: 'Daily operational war maps & military intelligence',
    enabled: true,
  },
  {
    id: 'tg-grp-boris-rozhin',
    name: 'Colonelcassad (Рожин)',
    handle: 'boris_rozhin',
    theater: 'RUSSIAN',
    language: 'ru',
    description: 'Donbas front, Kursk operations & combat status',
    enabled: true,
  },
  {
    id: 'tg-grp-dva-majors',
    name: 'Два майора',
    handle: 'dva_majors',
    theater: 'RUSSIAN',
    language: 'ru',
    description: 'Frontline summaries & tactical sector movements',
    enabled: true,
  },

  // Arabic Tracking Groups (Yemen, Red Sea, Levant & Palestine)
  {
    id: 'tg-grp-ansarallah',
    name: 'الإعلام الحربي اليمني',
    handle: 'AnsarAllahMC',
    theater: 'ARABIC',
    language: 'ar',
    description: 'Yemen Armed Forces, Bab al-Mandeb & Red Sea strikes',
    enabled: true,
  },
  {
    id: 'tg-grp-cmilitary',
    name: 'الإعلام الحربي المركزي',
    handle: 'C_Military1',
    theater: 'ARABIC',
    language: 'ar',
    description: 'Levant frontline operations, rocket strikes & clashes',
    enabled: true,
  },
  {
    id: 'tg-grp-almayadeen',
    name: 'الميادين عاجل',
    handle: 'almayadeen',
    theater: 'ARABIC',
    language: 'ar',
    description: 'Rapid breaking war dispatches across Middle East',
    enabled: true,
  },
  {
    id: 'tg-grp-qudsn',
    name: 'شبكة قدس الإخبارية',
    handle: 'qudsn',
    theater: 'ARABIC',
    language: 'ar',
    description: 'Gaza, West Bank & regional frontline reports',
    enabled: true,
  },
  {
    id: 'tg-grp-alibk3',
    name: 'Ali Bk (تغطية وتحليل الشرق الأوسط)',
    handle: 'Alibk3',
    theater: 'ARABIC',
    language: 'ar',
    description: 'Middle East conflict, Yemen, Riyadh & Red Sea rapid breaking reports',
    enabled: true,
  },

  // Global / OSINT
  {
    id: 'tg-grp-liveuamap',
    name: 'Liveuamap World',
    handle: 'liveuamap',
    theater: 'GLOBAL',
    language: 'en',
    description: 'Global conflict tracking & incident coordinates',
    enabled: true,
  },
  {
    id: 'tg-grp-wartranslated',
    name: 'WarTranslated',
    handle: 'wartranslated',
    theater: 'GLOBAL',
    language: 'en',
    description: 'Intercepts, frontline translations & tactical intel',
    enabled: true,
  },
];

const DELETED_TELEGRAM_GROUPS_KEY = 'stark_news_deleted_telegram_handles';

export function loadDeletedTelegramHandles(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_TELEGRAM_GROUPS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr.map((h: string) => String(h).toLowerCase()));
      }
    }
  } catch {}
  return new Set();
}

export function markTelegramHandleDeleted(handle: string): void {
  try {
    const deleted = loadDeletedTelegramHandles();
    deleted.add(handle.toLowerCase().trim());
    localStorage.setItem(DELETED_TELEGRAM_GROUPS_KEY, JSON.stringify(Array.from(deleted)));
  } catch {}
}

export function unmarkTelegramHandleDeleted(handle: string): void {
  try {
    const deleted = loadDeletedTelegramHandles();
    deleted.delete(handle.toLowerCase().trim());
    localStorage.setItem(DELETED_TELEGRAM_GROUPS_KEY, JSON.stringify(Array.from(deleted)));
  } catch {}
}

export function clearDeletedTelegramHandles(): void {
  try {
    localStorage.removeItem(DELETED_TELEGRAM_GROUPS_KEY);
  } catch {}
}

export function loadConnectedTelegramGroups(): ConnectedTelegramGroup[] {
  try {
    const raw = localStorage.getItem(TELEGRAM_GROUPS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveConnectedTelegramGroups(groups: ConnectedTelegramGroup[]): void {
  try {
    localStorage.setItem(TELEGRAM_GROUPS_KEY, JSON.stringify(groups));
  } catch {}
}

export function restoreDefaultTelegramGroups(): ConnectedTelegramGroup[] {
  try {
    clearDeletedTelegramHandles();
    localStorage.setItem(TELEGRAM_GROUPS_KEY, JSON.stringify(DEFAULT_TELEGRAM_GROUPS));
  } catch {}
  return DEFAULT_TELEGRAM_GROUPS;
}
