import React, { useState } from 'react';
import {
  IncidentTimelineUpdate,
  NewsStory,
  TimelineUpdateType,
} from '../types';
import {
  TIMELINE_TYPE_CONFIG,
  getStoryIncidentTimeline,
  formatTimelineTimestamp,
} from '../utils/incidentTimeline';
import {
  Clock,
  Radio,
  Plus,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface IncidentTimelineProps {
  story: NewsStory;
  relatedStories?: NewsStory[];
  initialUpdates?: IncidentTimelineUpdate[];
  onAddUpdate?: (newUpdate: IncidentTimelineUpdate) => void;
  className?: string;
  compact?: boolean;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  story,
  relatedStories = [],
  initialUpdates,
  onAddUpdate,
  className = '',
  compact = false,
}) => {
  const [updates, setUpdates] = useState<IncidentTimelineUpdate[]>(() => {
    return initialUpdates || getStoryIncidentTimeline(story, relatedStories);
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState<TimelineUpdateType>('Update');
  const [newDesc, setNewDesc] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCreateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const freshUpdate: IncidentTimelineUpdate = {
      id: `custom-update-${Date.now()}`,
      type: newType,
      timestamp: formatTimelineTimestamp(new Date()),
      isoDate: new Date().toISOString(),
      description: newDesc.trim(),
      sourceTag: 'Manual Field Intel Update',
      threatLevel: newType === 'Escalation' ? 'CRITICAL' : 'HIGH',
      isLive: true,
    };

    const updatedList = [freshUpdate, ...updates];
    setUpdates(updatedList);
    if (onAddUpdate) onAddUpdate(freshUpdate);

    setNewDesc('');
    setIsAdding(false);
  };

  const handleCopyTimeline = () => {
    const text = updates
      .map(
        (u) =>
          `[${u.type.toUpperCase()}] ${u.timestamp}\n${u.description}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(
      `Issue Timeline: ${story.title}\nConflict: ${story.conflict}\n\n${text}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/95 p-4 sm:p-5 text-white shadow-2xl backdrop-blur-md ${className}`}
    >
      {/* Header bar mirroring user screenshot: "Issue timeline" */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
          <div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Issue timeline</span>
              <span className="rounded bg-neutral-900 border border-white/20 px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
                {updates.length} updates
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Kronologi perkembangan & investigasi insiden: <span className="text-neutral-200 font-semibold">{story.conflict}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyTimeline}
            className="flex items-center gap-1 rounded bg-neutral-900 border border-white/15 px-2 py-1 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
            title="Salin seluruh kronologi timeline"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Disalin</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Salin</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 rounded bg-red-600/20 border border-red-500/40 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-600 hover:text-white transition"
            title="Add timeline update"
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">+ Update</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded p-1 text-neutral-400 hover:text-white transition"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateUpdate}
          className="mb-5 rounded-lg border border-red-500/30 bg-neutral-950 p-3.5 space-y-2.5 animate-in fade-in"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-red-400 flex items-center gap-1">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              New Incident Progression Entry
            </span>
            <div className="flex items-center gap-1">
              {(['Update', 'Investigation', 'Alert', 'Confirmed', 'Escalation'] as TimelineUpdateType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNewType(t)}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition ${
                    newType === t
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Describe latest incident development (e.g., Missile defense interception confirmed, damage assessment, command statement)..."
            rows={2}
            className="w-full rounded border border-white/15 bg-black p-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded bg-neutral-900 border border-white/15 px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-500 shadow-sm"
            >
              Save Update
            </button>
          </div>
        </form>
      )}

      {/* The Timeline Spine & Items (Exact visual design matching user screenshot) */}
      {isExpanded && (
        <div className="relative pl-6 sm:pl-7 space-y-6 sm:space-y-7 before:absolute before:left-2 sm:before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-red-600 before:via-red-500/70 before:to-red-900/40">
          {updates.map((item, idx) => {
            const meta = TIMELINE_TYPE_CONFIG[item.type] || TIMELINE_TYPE_CONFIG.Update;
            return (
              <div key={item.id || idx} className="relative group">
                {/* Dot positioned right on the left spine line */}
                <div
                  className="absolute -left-[23px] sm:-left-[25px] top-1 h-3.5 w-3.5 rounded-full border-2 border-black transition group-hover:scale-125"
                  style={{
                    backgroundColor: meta.dotColor,
                    boxShadow: `0 0 10px ${meta.dotColor}`,
                  }}
                />

                {/* Badge and Timestamp row */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold font-mono uppercase tracking-wide border ${meta.badgeBg} ${meta.border} ${meta.textColor}`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-400 font-medium">
                    {item.timestamp}
                  </span>
                  {item.sourceTag && (
                    <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
                      • {item.sourceTag}
                    </span>
                  )}
                  {item.isLive && (
                    <span className="flex items-center gap-1 rounded bg-red-500/20 border border-red-500/50 px-1.5 py-0.2 text-[9px] font-black text-red-400">
                      LIVE
                    </span>
                  )}
                </div>

                {/* Update Description paragraph */}
                <p className="mt-2 text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal selection:bg-red-900/50">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IncidentTimeline;
