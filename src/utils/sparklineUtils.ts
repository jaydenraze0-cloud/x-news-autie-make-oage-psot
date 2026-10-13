import { NewsStory, LocationTag, SentimentAnalysis } from '../types';
import { SENTIMENT_CATEGORY_META } from './sentimentAnalyzer';

export interface SparklinePoint {
  timestamp: number;
  label: string; // e.g. "-21j", "-12j", "Sekarang"
  frequency: number;
  avgThreat: number;
  intensity: number; // 0 - 100 combined measure
}

export interface SparklineSummary {
  points: SparklinePoint[];
  values: number[]; // normalized heights (0 - 100)
  total24hCount: number;
  avgThreatScore: number;
  peakFrequency: number;
  trend: 'RISING' | 'FALLING' | 'STABLE';
  trendPercent: number; // e.g. +35 or -20
  dominantColor: string;
  intensityLevel: 'EKSTREM' | 'TINGGI' | 'SEDANG' | 'RENDAH';
  hasData: boolean;
}

// 8 buckets across 24 hours (3 hours each)
const DEFAULT_BUCKET_COUNT = 8;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * ONE_HOUR_MS;

/**
 * Parses story date robustly
 */
export function getStoryTimestamp(story: NewsStory, fallbackIndex = 0, now = Date.now()): number {
  if (story.pubDate) {
    const parsed = Date.parse(story.pubDate);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  // Fallback: staggered across recent hours if pubDate is missing or unparseable
  return now - (fallbackIndex * 35 * 60 * 1000);
}

/**
 * Computes a story's individual threat/tension intensity (0 to 100)
 */
export function getStoryThreatScore(story: NewsStory): number {
  if (story.sentiment && typeof story.sentiment.threatScore === 'number') {
    return story.sentiment.threatScore;
  }
  let score = 50;
  if (story.isBreaking) score += 20;
  if (story.isNewAttack) score += 25;
  if (story.eventType?.toLowerCase().includes('strike') || story.eventType?.toLowerCase().includes('attack')) {
    score += 15;
  }
  if (story.isUnderTheRadar) score += 10;
  return Math.min(100, Math.max(10, score));
}

/**
 * Generates 24-hour sparkline metrics and data points from a collection of stories
 */
export function compute24hSparkline(
  stories: NewsStory[],
  customColor?: string,
  bucketCount: number = DEFAULT_BUCKET_COUNT
): SparklineSummary {
  const now = Date.now();
  const bucketDuration = TWENTY_FOUR_HOURS_MS / bucketCount; // 3 hours per bucket

  // Initialize buckets from oldest (-24h) to newest (now)
  const buckets: { count: number; totalThreat: number; timestamp: number; label: string }[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = now - (bucketCount - i) * bucketDuration;
    const hoursAgo = Math.round((bucketCount - 1 - i) * (24 / bucketCount));
    const label = hoursAgo === 0 ? 'Sekarang' : `-${hoursAgo}j`;
    buckets.push({
      count: 0,
      totalThreat: 0,
      timestamp: bucketStart + bucketDuration / 2,
      label,
    });
  }

  let totalCount = 0;
  let overallThreatSum = 0;

  // Filter stories within last 24 hours and assign to buckets
  stories.forEach((story, idx) => {
    const storyTime = getStoryTimestamp(story, idx, now);
    const ageMs = now - storyTime;

    // We consider updates within last 24 hours, or gracefully normalize stories if feed timestamps are slightly offset
    if (ageMs >= 0 && ageMs <= TWENTY_FOUR_HOURS_MS) {
      const bucketIndex = Math.min(
        bucketCount - 1,
        Math.max(0, Math.floor((TWENTY_FOUR_HOURS_MS - ageMs) / bucketDuration))
      );
      const threat = getStoryThreatScore(story);
      buckets[bucketIndex].count += 1;
      buckets[bucketIndex].totalThreat += threat;
      totalCount += 1;
      overallThreatSum += threat;
    } else if (ageMs > TWENTY_FOUR_HOURS_MS && ageMs <= 48 * ONE_HOUR_MS) {
      // Put early 24-48h story slightly into the first baseline bucket with half weight
      const threat = getStoryThreatScore(story);
      buckets[0].count += 0.5;
      buckets[0].totalThreat += threat * 0.5;
      totalCount += 0.5;
      overallThreatSum += threat * 0.5;
    }
  });

  // If no stories matched the 24h window (e.g. static feed or test date),
  // distribute existing stories across recent buckets so the sparkline reflects relative timeline
  if (totalCount === 0 && stories.length > 0) {
    stories.slice(0, 15).forEach((story, idx) => {
      const bucketIndex = Math.min(bucketCount - 1, Math.floor((idx / Math.min(15, stories.length)) * bucketCount));
      const threat = getStoryThreatScore(story);
      buckets[bucketIndex].count += 1;
      buckets[bucketIndex].totalThreat += threat;
      totalCount += 1;
      overallThreatSum += threat;
    });
  }

  // Calculate points and normalized intensity values
  let peakFrequency = 0;
  buckets.forEach((b) => {
    if (b.count > peakFrequency) peakFrequency = b.count;
  });

  const points: SparklinePoint[] = buckets.map((b) => {
    const avgThreat = b.count > 0 ? Math.round(b.totalThreat / b.count) : 0;
    // Intensity formula: combines update density with tactical tension
    // When count is 0, baseline is 0. When count > 0, base on frequency ratio and threat score.
    const freqFactor = peakFrequency > 0 ? (b.count / peakFrequency) * 60 : 0;
    const threatFactor = (avgThreat / 100) * 40;
    const intensity = Math.min(100, Math.round(freqFactor + threatFactor));

    return {
      timestamp: b.timestamp,
      label: b.label,
      frequency: Math.round(b.count),
      avgThreat,
      intensity,
    };
  });

  // Normalized values for SVG rendering (ensure smooth curve with minimum visibility)
  const values = points.map((p) => p.intensity);

  // Compute trend (comparing second half of 24h to first half)
  const midpoint = Math.floor(bucketCount / 2);
  const firstHalfTotal = points.slice(0, midpoint).reduce((acc, p) => acc + p.frequency, 0);
  const secondHalfTotal = points.slice(midpoint).reduce((acc, p) => acc + p.frequency, 0);

  let trend: 'RISING' | 'FALLING' | 'STABLE' = 'STABLE';
  let trendPercent = 0;

  if (firstHalfTotal > 0 || secondHalfTotal > 0) {
    const diff = secondHalfTotal - firstHalfTotal;
    const base = Math.max(1, firstHalfTotal);
    trendPercent = Math.round((diff / base) * 100);

    if (trendPercent >= 20) trend = 'RISING';
    else if (trendPercent <= -20) trend = 'FALLING';
    else trend = 'STABLE';
  }

  const avgThreatScore = totalCount > 0 ? Math.round(overallThreatSum / totalCount) : 0;

  // Determine dominant intensity level
  let intensityLevel: 'EKSTREM' | 'TINGGI' | 'SEDANG' | 'RENDAH' = 'RENDAH';
  if (avgThreatScore >= 80 || peakFrequency >= 6) {
    intensityLevel = 'EKSTREM';
  } else if (avgThreatScore >= 60 || peakFrequency >= 3) {
    intensityLevel = 'TINGGI';
  } else if (avgThreatScore >= 35 || totalCount >= 2) {
    intensityLevel = 'SEDANG';
  }

  // Pick tactical dominant color
  let dominantColor = customColor || '#06b6d4'; // default cyan
  if (!customColor) {
    if (intensityLevel === 'EKSTREM') dominantColor = '#ef4444'; // red
    else if (intensityLevel === 'TINGGI') dominantColor = '#f97316'; // orange
    else if (intensityLevel === 'SEDANG') dominantColor = '#eab308'; // amber/yellow
    else dominantColor = '#10b981'; // emerald green
  }

  return {
    points,
    values,
    total24hCount: Math.round(totalCount),
    avgThreatScore,
    peakFrequency: Math.round(peakFrequency),
    trend,
    trendPercent,
    dominantColor,
    intensityLevel,
    hasData: totalCount > 0,
  };
}

/**
 * Filter stories by LocationTag
 */
export function filterStoriesByLocation(stories: NewsStory[], locTag: LocationTag): NewsStory[] {
  if (locTag === 'ALL') return stories;
  return stories.filter((s) => {
    if (s.locationTag === locTag) return true;
    const text = `${s.title} ${s.summary} ${s.source} ${s.conflict}`.toLowerCase();
    if (locTag === 'Ukraine') {
      return (
        s.conflict === 'Russia-Ukraine' ||
        s.telegramTheater === 'UKRAINIAN' ||
        /ukraine|kyiv|kharkiv|pokrovsk|donbas|zsu|укра|зсу/.test(text)
      );
    }
    if (locTag === 'Russia') {
      return /belgorod|kursk|engels|bryansk|voronezh|rostov|moscow|белгород|москв/.test(text);
    }
    if (locTag === 'Middle East') {
      return (
        s.conflict === 'Israel-Gaza' ||
        s.conflict === 'Lebanon / Hezbollah' ||
        s.conflict === 'Israel-Iran / Iran' ||
        /gaza|israel|lebanon|hezbollah|idf|hamas|iran|syria/.test(text)
      );
    }
    if (locTag === 'Red Sea & Yemen') {
      return /yemen|houthi|ansarallah|bab al-mandeb|red sea|ukmto/.test(text);
    }
    if (locTag === 'Asia-Pacific') {
      return /taiwan|china|beijing|philippines|south china sea|indo-pacific/.test(text);
    }
    if (locTag === 'Global / NATO') {
      return /nato|pentagon|un security council|biden|putin|defense ministry/.test(text);
    }
    return false;
  });
}

/**
 * Filter stories by Conflict Area Name (e.g., from story.conflict)
 */
export function filterStoriesByConflict(stories: NewsStory[], conflictName: string): NewsStory[] {
  if (!conflictName || conflictName === 'All' || conflictName === 'Semua') return stories;
  const lower = conflictName.toLowerCase();
  return stories.filter((s) => {
    if (s.conflict && s.conflict.toLowerCase() === lower) return true;
    if (s.conflict && s.conflict.toLowerCase().includes(lower)) return true;
    return false;
  });
}
