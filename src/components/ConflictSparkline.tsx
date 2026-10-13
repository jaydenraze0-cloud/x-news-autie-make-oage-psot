import React, { useMemo, useState } from 'react';
import { NewsStory, LocationTag } from '../types';
import {
  compute24hSparkline,
  filterStoriesByLocation,
  filterStoriesByConflict,
  SparklineSummary,
} from '../utils/sparklineUtils';
import { TrendingUp, TrendingDown, Minus, Flame, Activity } from 'lucide-react';

interface ConflictSparklineProps {
  /** The collection of stories to compute 24h intensity & frequency from */
  stories?: NewsStory[];
  /** Optional pre-filtered stories */
  locationTag?: LocationTag;
  /** Optional conflict name (e.g. 'Russia-Ukraine', 'Israel-Gaza') */
  conflictName?: string;
  /** Custom stroke color (otherwise dynamic based on intensity) */
  color?: string;
  /** Width of the SVG canvas */
  width?: number;
  /** Height of the SVG canvas */
  height?: number;
  /** Visual variant */
  variant?: 'inline' | 'tab' | 'badge' | 'card';
  /** Show live ping dot at the newest point */
  showPing?: boolean;
  /** Show interactive tactical tooltip on hover */
  showTooltip?: boolean;
  /** Custom label for tooltip */
  label?: string;
  /** Additional CSS class names */
  className?: string;
}

export const ConflictSparkline: React.FC<ConflictSparklineProps> = ({
  stories = [],
  locationTag,
  conflictName,
  color,
  width = 36,
  height = 13,
  variant = 'inline',
  showPing = true,
  showTooltip = true,
  label,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Filter stories if locationTag or conflictName is provided
  const targetStories = useMemo(() => {
    if (locationTag && locationTag !== 'ALL') {
      return filterStoriesByLocation(stories, locationTag);
    }
    if (conflictName) {
      return filterStoriesByConflict(stories, conflictName);
    }
    return stories;
  }, [stories, locationTag, conflictName]);

  // Compute 24h sparkline summary
  const summary: SparklineSummary = useMemo(() => {
    return compute24hSparkline(targetStories, color);
  }, [targetStories, color]);

  // Generate SVG path coordinates
  const { pathData, areaData, pointsCoords, lastPoint } = useMemo(() => {
    const pts = summary.values;
    if (!pts || pts.length === 0) {
      return { pathData: '', areaData: '', pointsCoords: [], lastPoint: null };
    }

    const paddingX = 2;
    const paddingY = 2;
    const effWidth = Math.max(10, width - paddingX * 2);
    const effHeight = Math.max(6, height - paddingY * 2);

    const stepX = effWidth / Math.max(1, pts.length - 1);
    const maxVal = Math.max(10, ...pts);

    const coords = pts.map((val, idx) => {
      const x = paddingX + idx * stepX;
      // Invert Y because SVG 0 is top
      const ratio = val / maxVal;
      const y = paddingY + effHeight - ratio * effHeight;
      return { x, y, val };
    });

    if (coords.length === 1) {
      const p = coords[0];
      return {
        pathData: `M ${p.x} ${p.y} L ${p.x + effWidth} ${p.y}`,
        areaData: '',
        pointsCoords: coords,
        lastPoint: p,
      };
    }

    // Smooth Bezier path
    let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const midX = (curr.x + next.x) / 2;
      d += ` Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}, ${midX.toFixed(1)} ${((curr.y + next.y) / 2).toFixed(1)}`;
      d += ` T ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
    }

    // Closed area path for background fill
    const area = `${d} L ${coords[coords.length - 1].x.toFixed(1)} ${(height - paddingY).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(height - paddingY).toFixed(1)} Z`;

    return {
      pathData: d,
      areaData: area,
      pointsCoords: coords,
      lastPoint: coords[coords.length - 1],
    };
  }, [summary.values, width, height]);

  const activeColor = color || summary.dominantColor;
  const gradientId = useMemo(
    () => `spark-grad-${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  const displayLabel = label || conflictName || locationTag || 'Wilayah Konflik';

  return (
    <div
      className={`relative inline-flex items-center shrink-0 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${displayLabel} 24h: ${summary.total24hCount} updates, tensi ${summary.avgThreatScore}/100 (${summary.intensityLevel})`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={activeColor} stopOpacity={0.45} />
            <stop offset="100%" stopColor={activeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Baseline rule */}
        <line
          x1={2}
          y1={height - 2}
          x2={width - 2}
          y2={height - 2}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          strokeDasharray="2,2"
        />

        {/* Translucent fill under line */}
        {areaData && (
          <path d={areaData} fill={`url(#${gradientId})`} />
        )}

        {/* The main sparkline path */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke={activeColor}
            strokeWidth={variant === 'card' ? 1.4 : 1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Live ping dot on latest update (now) */}
        {showPing && lastPoint && (
          <g>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="2"
              fill={activeColor}
            />
            {summary.hasData && (
              <circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r="3.5"
                fill="none"
                stroke={activeColor}
                strokeWidth="0.75"
                className="animate-ping opacity-75 origin-center"
              />
            )}
          </g>
        )}
      </svg>

      {/* Floating Tactical HUD Popover on Hover */}
      {showTooltip && isHovered && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none w-56 rounded-md border border-white/25 bg-neutral-950/95 p-2 shadow-2xl backdrop-blur-md text-[10px] text-white space-y-1.5 transition animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1">
            <div className="flex items-center gap-1 font-bold truncate max-w-[140px]">
              <Activity className="h-3 w-3 text-cyan-400 shrink-0" />
              <span className="truncate">{displayLabel}</span>
            </div>
            <span
              className="text-[9px] font-mono font-black px-1 rounded uppercase"
              style={{
                color: activeColor,
                backgroundColor: `${activeColor}20`,
                border: `1px solid ${activeColor}50`,
              }}
            >
              24H TIK
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
            <div className="bg-neutral-900/80 rounded p-1 border border-white/5">
              <span className="text-neutral-400 block text-[8px]">FREKUENSI 24J</span>
              <span className="font-bold text-white text-xs">
                {summary.total24hCount}{' '}
                <span className="text-[8px] text-neutral-400">laporan</span>
              </span>
            </div>
            <div className="bg-neutral-900/80 rounded p-1 border border-white/5">
              <span className="text-neutral-400 block text-[8px]">TENSI RATA-RATA</span>
              <span className="font-bold text-xs" style={{ color: activeColor }}>
                {summary.avgThreatScore}/100
              </span>
            </div>
          </div>

          {/* Mini 8-slot histogram / activity bars */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[8px] text-neutral-400 font-mono">
              <span>-24j</span>
              <span>Timeline Intensitas & Update</span>
              <span>Skrg</span>
            </div>
            <div className="flex items-end gap-1 h-6 bg-neutral-900/50 rounded p-1 border border-white/5">
              {summary.points.map((pt, i) => {
                const maxIntensity = Math.max(10, ...summary.values);
                const hPercent = Math.max(15, Math.round((pt.intensity / maxIntensity) * 100));
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all group/bar relative"
                    style={{
                      height: `${hPercent}%`,
                      backgroundColor: pt.frequency > 0 ? activeColor : 'rgba(255,255,255,0.1)',
                      opacity: pt.frequency > 0 ? 0.9 : 0.3,
                    }}
                    title={`${pt.label}: ${pt.frequency} update, tensi ${pt.avgThreat}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Trend row */}
          <div className="flex items-center justify-between text-[9px] pt-0.5 border-t border-white/10 text-neutral-300 font-mono">
            <span className="flex items-center gap-1">
              <span className="text-neutral-400">Tren:</span>
              {summary.trend === 'RISING' && (
                <span className="text-red-400 font-bold flex items-center gap-0.5">
                  <TrendingUp className="h-2.5 w-2.5" />
                  Meningkat (+{Math.abs(summary.trendPercent)}%)
                </span>
              )}
              {summary.trend === 'FALLING' && (
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingDown className="h-2.5 w-2.5" />
                  Mereda ({summary.trendPercent}%)
                </span>
              )}
              {summary.trend === 'STABLE' && (
                <span className="text-neutral-300 font-medium flex items-center gap-0.5">
                  <Minus className="h-2.5 w-2.5" />
                  Stabil
                </span>
              )}
            </span>
            <span className="text-[8.5px] font-bold text-neutral-400">
              Puncak: {summary.peakFrequency}/slot
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default ConflictSparkline;
