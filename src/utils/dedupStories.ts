import { NewsStory } from '../types';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was',
  'are', 'were', 'been', 'be', 'have', 'has', 'had', 'says', 'said', 'after', 'over', 'into',
  'about', 'new', 'more', 'its', 'their', 'this', 'that', 'will', 'would', 'could', 'can',
  'and', 'or', 'but', 'amid', 'near', 'across', 'reports', 'reported', 'claims', 'claiming',
  'according', 'shows', 'video', 'footage', 'confirms', 'confirmed', 'amidst', 'following',
  'breaking', 'urgent', 'update', 'live'
]);

export function cleanHeadline(title: string): string {
  if (!title) return '';
  let cleaned = title
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .trim();

  // Strip trailing publisher attributions common in Google News & wires
  for (let i = 0; i < 3; i++) {
    cleaned = cleaned.replace(/\s*(?:[-–—|/:\\]{1,2}|via)\s*[^–—|-|/:\\]+$/i, '').trim();
  }

  // Strip leading alert / wire prefixes
  cleaned = cleaned.replace(
    /^(?:breaking(?:\s+news)?|urgent|live(?:\s+updates)?|exclusive|just in|alert|report|update|statement|centcom|idf|iaf|zsu|pentagon|kremlin|mod|white house)[\s:–—-]+/i,
    ''
  ).trim();

  // Normalize quotes and non-alphanumerics
  return cleaned
    .toLowerCase()
    .replace(/["'“”‘’«»[\]()]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getHeadlineWords(title: string): Set<string> {
  const words = cleanHeadline(title)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

export function areHeadlinesDuplicates(t1: string, t2: string): boolean {
  if (!t1 || !t2) return false;
  const c1 = cleanHeadline(t1);
  const c2 = cleanHeadline(t2);
  if (c1 === c2) return true;
  if (c1.length > 16 && (c2.includes(c1) || c1.includes(c2))) return true;

  const w1 = getHeadlineWords(t1);
  const w2 = getHeadlineWords(t2);
  if (w1.size === 0 || w2.size === 0) return false;

  let intersection = 0;
  for (const w of w1) {
    if (w2.has(w)) intersection++;
  }

  const union = new Set([...w1, ...w2]).size;
  const jaccard = intersection / union;
  const overlap = intersection / Math.min(w1.size, w2.size);

  if (overlap >= 0.55 && Math.min(w1.size, w2.size) >= 3) return true;
  if (jaccard >= 0.38 && intersection >= 3) return true;

  return false;
}

export function areStoriesDuplicatePair(s1: NewsStory, s2: NewsStory): boolean {
  if (!s1 || !s2) return false;
  if (s1.id === s2.id) return true;
  if (s1.link && s2.link && s1.link === s2.link) return true;

  if (areHeadlinesDuplicates(s1.title, s2.title)) return true;

  // Time & entity check
  const time1 = s1.pubTimestamp || new Date(s1.pubDate).getTime() || 0;
  const time2 = s2.pubTimestamp || new Date(s2.pubDate).getTime() || 0;
  if (time1 > 0 && time2 > 0 && Math.abs(time1 - time2) < 12 * 60 * 60 * 1000) {
    if (s1.locationTag && s2.locationTag && s1.locationTag === s2.locationTag && s1.locationTag !== 'ALL') {
      const w1 = getHeadlineWords(s1.title);
      const w2 = getHeadlineWords(s2.title);
      const combatKeywords = [
        'drone', 'missile', 'airstrike', 'strike', 'attack', 'patriot', 'shahed',
        'houthi', 'centcom', 'idf', 'kharkiv', 'pokrovsk', 'kursk', 'beirut',
        'tel aviv', 'red sea', 'intercept', 'intercepted', 'warship', 'destroy',
        'destroyed', 'clashes', 'offensive'
      ];
      let matches = 0;
      for (const kw of combatKeywords) {
        if (w1.has(kw) && w2.has(kw)) matches++;
      }
      if (matches >= 2) {
        let intersection = 0;
        for (const w of w1) {
          if (w2.has(w)) intersection++;
        }
        if (intersection >= 3) return true;
      }
    }
  }

  return false;
}

/**
 * Filter and deduplicate a list of news stories in chronological order.
 * Keeps the best cover image and latest metadata.
 */
export function deduplicateStories(stories: NewsStory[]): NewsStory[] {
  if (!Array.isArray(stories) || stories.length === 0) return [];

  const deduped: NewsStory[] = [];
  const seenIds = new Set<string>();

  for (const story of stories) {
    if (!story || !story.title) continue;

    let matchIndex = -1;
    for (let i = 0; i < deduped.length; i++) {
      if (areStoriesDuplicatePair(deduped[i], story)) {
        matchIndex = i;
        break;
      }
    }

    if (matchIndex !== -1) {
      const existing = deduped[matchIndex];
      // Upgrade image if duplicate has verified original photo
      if (!existing.hasOriginalImage && story.hasOriginalImage && story.imageUrl) {
        existing.imageUrl = story.imageUrl;
        existing.hasOriginalImage = true;
      }
      // Upgrade timestamp if newer
      if (story.pubTimestamp && story.pubTimestamp > (existing.pubTimestamp || 0)) {
        existing.pubTimestamp = story.pubTimestamp;
        existing.pubDate = story.pubDate;
        existing.relativeTime = story.relativeTime;
      }
      // Upgrade summary if richer
      if ((!existing.summary || existing.summary.length < 50) && story.summary && story.summary.length > 50) {
        existing.summary = story.summary;
      }
    } else if (!seenIds.has(story.id)) {
      seenIds.add(story.id);
      deduped.push(story);
    }
  }

  return deduped;
}
