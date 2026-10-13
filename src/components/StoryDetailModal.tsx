import React from 'react';
import {
  X,
  ExternalLink,
  Shield,
  Crosshair,
  MapPin,
  Clock,
  Sparkles,
  Share2,
  Swords,
  Layers,
  Zap,
  Globe,
  Radio,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { NewsStory, OSINT_FIVE_PILLARS } from '../types';
import { MOVEMENT_TYPE_META, detectMilitaryTracking } from '../utils/militaryTracker';
import { resolveLocationTag, resolveIntelligenceType } from './LiveFeed';
import {
  SENTIMENT_CATEGORY_META,
  THREAT_LEVEL_META,
  MSM_PENETRATION_META,
  analyzeStorySentiment,
} from '../utils/sentimentAnalyzer';
import { ConflictSparkline } from './ConflictSparkline';
import { IncidentTimeline } from './IncidentTimeline';
import { OSINT_WAR_CATEGORIES } from '../types';
import { buildDefaultOsintData, detectOsintPillar } from '../utils/osintClassifier';

interface StoryDetailModalProps {
  story: NewsStory | null;
  allStories?: NewsStory[];
  isOpen: boolean;
  onClose: () => void;
  onOpenInEditor: (story: NewsStory) => void;
  onOpenInCaptions: (story: NewsStory) => void;
  onOpenOsintManager?: (story: NewsStory) => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  story,
  allStories = [],
  isOpen,
  onClose,
  onOpenInEditor,
  onOpenInCaptions,
  onOpenOsintManager,
}) => {
  if (!isOpen || !story) return null;

  const storyLoc = resolveLocationTag(story);
  const storyIntel = resolveIntelligenceType(story);
  const tracking = story.militaryTracking || detectMilitaryTracking(story);
  const mvMeta = tracking?.movementType ? MOVEMENT_TYPE_META[tracking.movementType] : null;
  const sentiment = story.sentiment || analyzeStorySentiment(story);
  const catMeta = SENTIMENT_CATEGORY_META[sentiment.category];
  const threatMeta = THREAT_LEVEL_META[sentiment.threatLevel];
  const msmMeta = MSM_PENETRATION_META[sentiment.msmPenetration];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/20 bg-neutral-950 p-5 sm:p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-red-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Detail Intelijen Berita
            </span>
            {story.isBreaking && (
              <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                BREAKING
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Hero image if present */}
        {story.imageUrl && (
          <div className="relative mt-4 h-52 sm:h-64 w-full overflow-hidden rounded-lg border border-white/15 bg-black">
            <img
              src={`/api/img-proxy?url=${encodeURIComponent(story.imageUrl)}`}
              alt={story.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
              <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                {story.source}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-neutral-300">
                <Clock className="h-3 w-3" />
                <span>{story.relativeTime || new Date(story.pubDate).toLocaleTimeString()}</span>
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <h2 className="mt-4 text-base sm:text-lg font-extrabold leading-snug text-white">
          {story.title}
        </h2>

        {/* 5 Core OSINT Pillars Status */}
        {(() => {
          const pId = story.osintPillar || detectOsintPillar(story);
          const pMeta = OSINT_FIVE_PILLARS.find((p) => p.id === pId) || OSINT_FIVE_PILLARS[0];
          return (
            <div className="mt-3 rounded-lg border border-white/15 bg-black/60 p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{pMeta.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs sm:text-sm">
                      {pMeta.title}
                    </span>
                    <span className={`rounded border px-1.5 py-0.2 text-[9px] font-mono font-black ${pMeta.badgeColor}`}>
                      OSINT VERIFIED
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    {pMeta.tagline}
                  </p>
                </div>
              </div>

              {onOpenOsintManager && (
                <button
                  type="button"
                  onClick={() => onOpenOsintManager(story)}
                  className="rounded-md border border-purple-400/50 bg-purple-950/60 px-2.5 py-1 text-[11px] font-bold text-purple-200 hover:bg-purple-900 transition flex items-center gap-1"
                >
                  <Activity className="h-3 w-3 text-purple-400" />
                  <span>Manage 5 OSINT Pillars</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* Metadata info */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400 border-b border-white/10 pb-3">
          {/* 𝕏 Twitter / Telegram Local Account badge */}
          {(story.isXTwitter || story.xHandle || story.source.startsWith('𝕏')) && (
            <span className="inline-flex items-center gap-1 rounded bg-white text-black px-2 py-0.5 text-[10px] font-black shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              <span className="font-mono">𝕏</span>
              <span>{story.xHandle ? `@${story.xHandle}` : 'Twitter Local'}</span>
            </span>
          )}

          {(story.isTelegram || story.telegramHandle || story.source.toLowerCase().includes('telegram')) && (
            <span className="inline-flex items-center gap-1 rounded bg-cyan-400 text-black px-2 py-0.5 text-[10px] font-black shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              <span>✈</span>
              <span>{story.telegramHandle ? `@${story.telegramHandle}` : 'Telegram'}</span>
            </span>
          )}

          {/* Native Language Tag */}
          {story.nativeLanguage && (
            <span className="inline-flex items-center gap-1 rounded border border-white/20 bg-neutral-900 px-2 py-0.5 text-[10px] font-mono font-bold text-neutral-300">
              {story.nativeLanguage === 'ar' && '🇾🇪 Native: العربية (Arabic)'}
              {story.nativeLanguage === 'uk' && '🇺🇦 Native: Українська (Ukrainian)'}
              {story.nativeLanguage === 'ru' && '🇷🇺 Native: Русский (Russian)'}
              {story.nativeLanguage === 'ur' && '🇵🇰 Native: اردو (Urdu)'}
              {story.nativeLanguage === 'en' && '🌐 Language: English'}
              {story.nativeLanguage === 'id' && '🇮🇩 Language: Indonesian'}
            </span>
          )}

          <span className="flex items-center gap-1 text-yellow-300">
            <MapPin className="h-3.5 w-3.5" />
            <span>{storyLoc}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 text-cyan-300">
            <Crosshair className="h-3.5 w-3.5" />
            <span>{storyIntel}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 rounded bg-neutral-900 border border-white/15 px-2 py-0.5 text-xs text-white">
            <span>{story.conflict}</span>
            <ConflictSparkline
              stories={allStories}
              conflictName={story.conflict}
              locationTag={story.locationTag}
              label={story.conflict}
              width={34}
              height={12}
              variant="card"
            />
          </span>
          <span aria-hidden="true">·</span>
          <span>{story.eventType}</span>
        </div>

        {/* 1. Automated Sentiment Analysis & OSINT Threat Index Box */}
        <div className={`mt-3.5 rounded-lg border ${catMeta.border} ${catMeta.badgeBg} p-3.5 space-y-2.5`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-white animate-pulse" />
              <span className="text-xs font-black tracking-wider text-white">
                SENTIMENT ANALYSIS & THREAT INDEX
              </span>
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-black font-mono ${threatMeta.badgeClass}`}>
                {threatMeta.code} ({sentiment.threatScore}/100)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`rounded border px-2 py-0.5 text-[9px] font-black ${msmMeta.tagClass}`}>
                {msmMeta.shortBadge}
              </span>
              <span className={`rounded border px-2 py-0.5 text-[9px] font-black ${catMeta.border} ${catMeta.textClass}`}>
                {catMeta.label}
              </span>
            </div>
          </div>

          {/* Threat Meter Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-300">
              <span>Kinetic Escalation Tension</span>
              <span className="font-bold">{sentiment.threatScore}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-900 border border-white/10 overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${sentiment.threatScore}%`,
                  backgroundColor: catMeta.color,
                }}
              />
            </div>
          </div>

          {/* English Sentiment Summary */}
          <p className="text-xs leading-relaxed text-neutral-200">
            {sentiment.sentimentSummary}
          </p>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-white/10 pt-2 text-[11px] font-mono">
            <div>
              <span className="text-neutral-400 block text-[9px]">MEDIA COVERAGE:</span>
              <strong className="text-white">{msmMeta.label}</strong>
            </div>
            <div>
              <span className="text-neutral-400 block text-[9px]">ESCALATION PROBABILITY:</span>
              <strong className="text-white">{sentiment.escalationProbability}%</strong>
            </div>
            <div>
              <span className="text-neutral-400 block text-[9px]">CIVILIAN IMPACT:</span>
              <strong className={sentiment.civilianImpactRisk === 'HIGH' ? 'text-red-400 font-bold' : 'text-neutral-200'}>
                {sentiment.civilianImpactRisk}
              </strong>
            </div>
          </div>

          {/* Key Drivers */}
          {sentiment.keyDrivers.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-400 font-mono">Key Drivers:</span>
              {sentiment.keyDrivers.map((driver) => (
                <span
                  key={driver}
                  className="rounded bg-black/50 border border-white/15 px-2 py-0.5 text-[10px] text-neutral-300 font-medium"
                >
                  {driver}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* --- OSINT WAR INTELLIGENCE MODULE --- */}
        {(() => {
          const osint = story.osintData || buildDefaultOsintData(story);
          const catMeta = OSINT_WAR_CATEGORIES.find((c) => c.id === osint.category) || OSINT_WAR_CATEGORIES[0];

          return (
            <div className="mt-4 rounded-xl border border-purple-500/40 bg-purple-950/20 p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-purple-600/30 border border-purple-400 text-purple-300">
                    <Activity className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
                      OSINT War Intelligence Radar
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-extrabold ${catMeta.badgeColor}`}>
                        <span>{catMeta.icon}</span>
                        <span>{catMeta.id}</span>
                      </span>
                      {osint.coordinates && (
                        <span className="rounded bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] font-mono text-purple-300 font-bold">
                          📍 {osint.coordinates}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {onOpenOsintManager && (
                  <button
                    onClick={() => onOpenOsintManager(story)}
                    className="flex items-center gap-1.5 rounded-lg border border-purple-400 bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                  >
                    <span>⚙️ Manage OSINT</span>
                  </button>
                )}
              </div>

              {osint.bdaSummary && (
                <div className="rounded bg-black/50 border border-purple-500/20 p-2.5 text-xs text-neutral-300 font-mono">
                  <span className="text-purple-300 font-bold block mb-0.5">VERIFICATION TELEMETRY:</span>
                  {osint.bdaSummary}
                </div>
              )}
            </div>
          );
        })()}

        {/* 2. Military tracking overview box */}
        {tracking && (
          <div className="mt-3.5 rounded-lg border border-red-500/30 bg-red-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-300 uppercase tracking-wider">
                <Shield className="h-3.5 w-3.5" />
                <span>Combat Force Tracking</span>
              </span>
              {mvMeta && (
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${mvMeta.bg} ${mvMeta.color}`}>
                  {mvMeta.icon} {mvMeta.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {tracking.forces.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 block font-mono">Regular Forces:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {tracking.forces.map((f) => (
                      <span key={f} className="rounded bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 text-[11px] font-bold text-blue-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tracking.militias.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 block font-mono">Militias / Factions:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {tracking.militias.map((m) => (
                      <span key={m} className="rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-bold text-emerald-200">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {tracking.tacticalSummary && (
              <p className="text-xs text-neutral-300 italic border-t border-red-500/20 pt-1.5">
                "{tracking.tacticalSummary}"
              </p>
            )}

            {tracking.sector && (
              <div className="text-[11px] text-neutral-400 font-mono">
                Sector: <strong className="text-white">{tracking.sector}</strong>
              </div>
            )}
          </div>
        )}

        {/* Story summary body */}
        <div className="mt-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1">
            News Briefing / Executive Summary:
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed text-neutral-200 bg-neutral-900/60 p-3.5 rounded-lg border border-white/10 whitespace-pre-wrap">
            {story.summary || story.title}
          </p>
        </div>

        {/* 3. Issue & Incident Timeline Tracker */}
        <div className="mt-4">
          <IncidentTimeline
            story={story}
            relatedStories={allStories}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            {story.link && (
              <a
                href={story.link}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 rounded border border-white/20 bg-neutral-900 px-3 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-800 hover:text-white transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>
                  {story.isXTwitter || story.xHandle ? `Open on 𝕏 (@${story.xHandle || 'post'})` : story.isTelegram ? `Open on Telegram (@${story.telegramHandle || 'post'})` : 'Open Original Source'}
                </span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenOsintManager && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOsintManager(story);
                }}
                className="flex items-center gap-1.5 rounded border border-purple-500/50 bg-purple-950/60 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-900 transition"
              >
                <span>⚙️ Edit OSINT Data</span>
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onOpenInEditor(story);
              }}
              className="flex items-center gap-1.5 rounded bg-white px-3.5 py-2 text-xs font-extrabold text-black hover:bg-neutral-200 transition shadow-[0_0_12px_rgba(255,255,255,0.4)]"
            >
              <Layers className="h-4 w-4" />
              <span>🎨 Create 1080p Graphic</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenInCaptions(story);
              }}
              className="flex items-center gap-1.5 rounded border border-emerald-400/60 bg-emerald-950/60 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900 transition"
            >
              <Share2 className="h-4 w-4" />
              <span>✍️ Generate AI Captions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
