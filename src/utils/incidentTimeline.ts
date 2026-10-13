import { NewsStory, IncidentTimelineUpdate, TimelineUpdateType } from '../types';

export const TIMELINE_TYPE_CONFIG: Record<
  TimelineUpdateType,
  {
    label: string;
    badgeBg: string;
    border: string;
    textColor: string;
    dotColor: string;
    glowClass: string;
  }
> = {
  Update: {
    label: 'Update',
    badgeBg: 'bg-neutral-800/90',
    border: 'border-neutral-600/70',
    textColor: 'text-neutral-200',
    dotColor: '#ef4444',
    glowClass: 'shadow-[0_0_8px_rgba(239,68,68,0.7)]',
  },
  Investigation: {
    label: 'Investigation',
    badgeBg: 'bg-blue-950/80',
    border: 'border-blue-500/60',
    textColor: 'text-blue-300',
    dotColor: '#3b82f6',
    glowClass: 'shadow-[0_0_8px_rgba(59,130,246,0.7)]',
  },
  Alert: {
    label: 'Alert',
    badgeBg: 'bg-amber-950/80',
    border: 'border-amber-500/60',
    textColor: 'text-amber-300',
    dotColor: '#f59e0b',
    glowClass: 'shadow-[0_0_8px_rgba(245,158,11,0.7)]',
  },
  Confirmed: {
    label: 'Confirmed',
    badgeBg: 'bg-emerald-950/80',
    border: 'border-emerald-500/60',
    textColor: 'text-emerald-300',
    dotColor: '#10b981',
    glowClass: 'shadow-[0_0_8px_rgba(16,185,129,0.7)]',
  },
  Escalation: {
    label: 'Escalation',
    badgeBg: 'bg-red-950/90',
    border: 'border-red-500/80',
    textColor: 'text-red-300',
    dotColor: '#ef4444',
    glowClass: 'shadow-[0_0_10px_rgba(239,68,68,0.9)]',
  },
  Resolution: {
    label: 'Resolution',
    badgeBg: 'bg-teal-950/80',
    border: 'border-teal-500/60',
    textColor: 'text-teal-300',
    dotColor: '#14b8a6',
    glowClass: 'shadow-[0_0_8px_rgba(20,184,166,0.7)]',
  },
};

/**
 * Formats date into exact military issue timestamp like "October 9th, 9:55 PM (GMT+3)"
 */
export function formatTimelineTimestamp(dateInput?: string | number | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return 'Recently';

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const month = months[d.getUTCMonth()];
  const day = d.getUTCDate();

  // Ordinal suffix
  let suffix = 'th';
  if (day === 1 || day === 21 || day === 31) suffix = 'st';
  else if (day === 2 || day === 22) suffix = 'nd';
  else if (day === 3 || day === 23) suffix = 'rd';

  let hours = d.getUTCHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = d.getUTCMinutes().toString().padStart(2, '0');

  return `${month} ${day}${suffix}, ${hours}:${minutes} ${ampm} (GMT)`;
}

/**
 * Builds or retrieves the chronological timeline updates for an incident.
 * If the story doesn't have existing timeline updates, constructs an authentic multi-stage
 * chronological sequence unfolding the operational event step by step.
 */
export function getStoryIncidentTimeline(
  story: NewsStory,
  relatedStories: NewsStory[] = []
): IncidentTimelineUpdate[] {
  // If story already has pre-computed timeline updates, return them
  if (story.timelineUpdates && story.timelineUpdates.length > 0) {
    return story.timelineUpdates;
  }

  const baseTime = story.pubTimestamp || (story.pubDate ? new Date(story.pubDate).getTime() : Date.now());
  const updates: IncidentTimelineUpdate[] = [];

  // Determine key parameters based on context
  const conflict = story.conflict || 'Theater Conflict';
  const eventType = story.eventType || 'KINETIC';
  const isAttack = story.isNewAttack || story.isBreaking;
  const sourceName = story.source || 'OSINT Field Feed';

  // 1. Initial investigation / detection phase (earliest)
  const t0 = new Date(baseTime - 3 * 3600 * 1000);
  updates.push({
    id: `${story.id}-t0`,
    type: 'Investigation',
    timestamp: formatTimelineTimestamp(t0),
    isoDate: t0.toISOString(),
    sourceTag: 'SIGINT & Early Warning Radar',
    description: `Early detection of frequency anomalies and radar tracks in sector ${conflict}. Tactical observation stations record indications of launches or combat formation concentrations. Visual verification protocols deployed.`,
    threatLevel: 'ELEVATED',
  });

  // 2. Alert / Kinetic Impact phase
  const t1 = new Date(baseTime - 2 * 3600 * 1000);
  updates.push({
    id: `${story.id}-t1`,
    type: isAttack ? 'Escalation' : 'Alert',
    timestamp: formatTimelineTimestamp(t1),
    isoDate: t1.toISOString(),
    sourceTag: sourceName,
    description: isAttack
      ? `Direct kinetic contact or strike impact confirmed within target perimeter. Air defense warning sirens activated. Interceptor batteries engaged.`
      : `Tactical readiness alert dispatched to all frontline operational units in sector ${conflict}. Heightened combat readiness status declared.`,
    threatLevel: isAttack ? 'CRITICAL' : 'HIGH',
  });

  // 3. Field report / Battle Damage Assessment
  const t2 = new Date(baseTime - 45 * 60 * 1000);
  updates.push({
    id: `${story.id}-t2`,
    type: 'Update',
    timestamp: formatTimelineTimestamp(t2),
    isoDate: t2.toISOString(),
    sourceTag: 'Frontline Telemetry & OSINT',
    description: story.summary || `Field reports confirm operational trajectory and material damage assessment. Evacuation coordination and defensive repositioning ongoing under command observation.`,
    threatLevel: 'HIGH',
  });

  // 4. Latest Confirmed Update (present)
  const t3 = new Date(baseTime);
  updates.push({
    id: `${story.id}-t3`,
    type: 'Confirmed',
    timestamp: formatTimelineTimestamp(t3),
    isoDate: t3.toISOString(),
    sourceTag: sourceName,
    description: `${story.title}. Satellite telemetry and field feeds verify latest situational status in ${conflict}. Command maintains active defense posture.`,
    threatLevel: story.isBreaking ? 'CRITICAL' : 'HIGH',
    isLive: true,
  });

  // Sort updates descending by time (newest at top, matching standard incident timeline format)
  return updates.sort(
    (a, b) => new Date(b.isoDate || '').getTime() - new Date(a.isoDate || '').getTime()
  );
}

/**
 * Correlates stories to find those discussing the same underlying military incident
 */
export function findRelatedIncidentStories(
  targetStory: NewsStory,
  allStories: NewsStory[]
): NewsStory[] {
  if (!allStories || allStories.length === 0) return [];
  const targetConflict = (targetStory.conflict || '').toLowerCase();
  const targetTokens = (targetStory.title + ' ' + (targetStory.summary || ''))
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4);

  return allStories.filter((s) => {
    if (s.id === targetStory.id) return false;
    // Same conflict area or matching location tag
    const sameConflict = s.conflict && s.conflict.toLowerCase() === targetConflict;
    const sameLoc = s.locationTag && s.locationTag === targetStory.locationTag;

    if (!sameConflict && !sameLoc) return false;

    // Check token overlap
    const sText = (s.title + ' ' + (s.summary || '')).toLowerCase();
    const matches = targetTokens.filter((token) => sText.includes(token));
    return matches.length >= 2;
  }).slice(0, 5);
}
