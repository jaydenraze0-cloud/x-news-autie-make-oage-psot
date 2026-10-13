import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Download,
  Copy,
  RotateCcw,
  Undo2,
  Redo2,
  Type,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RefreshCw,
  Tag,
  Check,
  Zap,
} from 'lucide-react';
import { EditorConfig, AppSettings } from '../types';
import { getTextGlowStyle, getBoxGlowStyle, getDropShadowFilter } from '../utils/glow';
import { exportCanvasToBlob, exportCanvasToPng } from '../utils/exportImage';
import { removeBlackBackground } from '../utils/imageRemoval';
import { saveEditorStylePreferences, saveCurrentEditorConfig } from '../utils/storage';

interface SquareEditorProps {
  config: EditorConfig;
  onChange: (newConfig: EditorConfig) => void;
  settings: AppSettings;
  onReset: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  storyImageUrl?: string;
  storyLink?: string;
  onUpdateDefaultLogo?: (logoDataUrl: string, removeBg: boolean) => void;
}

type EditorTab = 'text' | 'highlight' | 'photo' | 'glow' | 'brand';

export const SquareEditor: React.FC<SquareEditorProps> = ({
  config,
  onChange,
  settings,
  onReset,
  onShowToast,
  storyImageUrl,
  storyLink,
  onUpdateDefaultLogo,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('text');
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [isResolvingImage, setIsResolvingImage] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.48);
  const containerRef = useRef<HTMLDivElement>(null);
  const postRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [rawLogoDataUrl, setRawLogoDataUrl] = useState<string | null>(null);

  // Gemini 3.8 Flash Neural Headline state
  const [isGeneratingAiHeadline, setIsGeneratingAiHeadline] = useState(false);
  const [activeHeadlineStyle, setActiveHeadlineStyle] = useState<'impact' | 'tactical' | 'short' | 'geopolitical'>('impact');
  const [aiVariations, setAiVariations] = useState<{ impact?: string; tactical?: string; short?: string } | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<EditorConfig[]>([config]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const updateConfig = useCallback(
    (newConfig: EditorConfig, recordHistory = true) => {
      onChange(newConfig);
      saveEditorStylePreferences(newConfig);
      saveCurrentEditorConfig(newConfig);
      if (recordHistory) {
        setHistory((prev) => {
          const trimmed = prev.slice(0, historyIdx + 1);
          return [...trimmed, newConfig].slice(-30);
        });
        setHistoryIdx((prev) => Math.min(prev + 1, 29));
      }
    },
    [historyIdx, onChange]
  );

  const handleGenerateSmartHeadline = async (style: 'impact' | 'tactical' | 'short' | 'geopolitical' = activeHeadlineStyle) => {
    setActiveHeadlineStyle(style);
    setIsGeneratingAiHeadline(true);
    try {
      const res = await fetch('/api/ai/smart-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: config.headline,
          summary: '',
          style,
        }),
      });
      const data = await res.json();
      if (data.headline) {
        let highlightList: string[] = [];
        if (data.highlight_words) {
          highlightList = data.highlight_words
            .split(/\s+/)
            .map((w: string) => w.replace(/[^\w\s-]/g, '').trim())
            .filter(Boolean);
        }
        updateConfig({
          ...config,
          headline: data.headline,
          highlightWords: highlightList.length > 0 ? highlightList : config.highlightWords,
        });
        if (data.variations) {
          setAiVariations(data.variations);
        }
        onShowToast(`Smart headline generated via ${data.provider || 'Gemini 3.8 Flash'}!`, 'success');
      }
    } catch {
      onShowToast('Failed to generate smart headline', 'error');
    } finally {
      setIsGeneratingAiHeadline(false);
    }
  };

  const handleToggleCase = (targetCase: 'upper' | 'title') => {
    if (!config.headline) return;
    if (targetCase === 'upper') {
      updateConfig({ ...config, headline: config.headline.toUpperCase() });
    } else {
      const titleCased = config.headline
        .toLowerCase()
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      updateConfig({ ...config, headline: titleCased });
    }
  };

  const handleToggleHighlightWord = (word: string) => {
    const cleanWord = word.replace(/[^\w-]/g, '').trim();
    if (!cleanWord) return;
    const current = config.highlightWords || [];
    const exists = current.some((w) => w.toUpperCase() === cleanWord.toUpperCase());
    const next = exists
      ? current.filter((w) => w.toUpperCase() !== cleanWord.toUpperCase())
      : [...current, cleanWord.toUpperCase()];
    updateConfig({ ...config, highlightWords: next });
  };

  const handleAutoHighlightBest = () => {
    const words = config.headline.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return;
    const combatKeywords = [
      'STRIKES', 'ATTACK', 'ATTACKED', 'INTERCEPTS', 'DRONES', 'MISSILES', 'AIRPORT',
      'EVACUATED', 'CARRIER', 'BOMBERS', 'FRONTLINE', 'WARSHIPS', 'DEPOT', 'REFINERY',
      'DEFENSE', 'FORCES', 'ADVANCES', 'LAUNCHES', 'TARGETS'
    ];
    const matches: string[] = [];
    for (const w of words) {
      const cleaned = w.replace(/[^\w]/g, '').toUpperCase();
      if (combatKeywords.includes(cleaned)) {
        matches.push(cleaned);
      }
    }
    const chosen = matches.length >= 2
      ? matches.slice(0, 3)
      : words.slice(-3).map((w) => w.replace(/[^\w]/g, '').toUpperCase());
    updateConfig({ ...config, highlightWords: chosen });
    onShowToast('Auto-selected best 2-3 highlight keywords!', 'info');
  };

  const handleFetchOriginalNewsPhoto = async (customQuery?: string) => {
    setIsResolvingImage(true);
    try {
      const q = customQuery || config.headline || '';
      const link = storyLink || '';
      const res = await fetch(
        `/api/resolve-image?url=${encodeURIComponent(link)}&title=${encodeURIComponent(q)}&query=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (data.success && data.imageUrl) {
        updateConfig({
          ...config,
          background: { ...config.background, imageUrl: data.imageUrl },
        });
        onShowToast(
          data.source === 'internet-search'
            ? 'Auto-discovered real web photo applied to canvas!'
            : 'Original cover photo applied to canvas!',
          'success'
        );
      } else if (storyImageUrl) {
        updateConfig({
          ...config,
          background: { ...config.background, imageUrl: storyImageUrl },
        });
        onShowToast('Article image applied!', 'success');
      } else {
        onShowToast('No internet photo found for this topic.', 'error');
      }
    } catch {
      if (storyImageUrl) {
        updateConfig({
          ...config,
          background: { ...config.background, imageUrl: storyImageUrl },
        });
        onShowToast('Article image applied!', 'success');
      }
    } finally {
      setIsResolvingImage(false);
    }
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevConfig = history[historyIdx - 1];
      setHistoryIdx(historyIdx - 1);
      onChange(prevConfig);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextConfig = history[historyIdx + 1];
      setHistoryIdx(historyIdx + 1);
      onChange(nextConfig);
    }
  };

  // Dynamically calculate responsive scale to fit the center column perfectly
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth - 32;
        const targetWidth = Math.min(availableWidth, 540);
        const calculatedScale = Math.max(0.28, Math.min(0.52, targetWidth / 1080));
        setPreviewScale(calculatedScale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const getSafeImageUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:') || rawUrl.startsWith('/')) {
      return rawUrl;
    }
    return `/api/img-proxy?url=${encodeURIComponent(rawUrl)}`;
  };

  const toggleWordHighlight = (word: string) => {
    const cleanWord = word.replace(/[^\w\s-]/g, '').trim();
    if (!cleanWord) return;
    const exists = config.highlightWords.some((w) => w.toLowerCase() === cleanWord.toLowerCase());
    let nextHighlightWords: string[];
    if (exists) {
      nextHighlightWords = config.highlightWords.filter((w) => w.toLowerCase() !== cleanWord.toLowerCase());
    } else {
      nextHighlightWords = [...config.highlightWords, cleanWord];
    }
    updateConfig({
      ...config,
      highlightWords: nextHighlightWords,
      autoHighlightLastLine: false,
    });
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateConfig({
          ...config,
          background: {
            ...config.background,
            imageUrl: dataUrl,
          },
        });
        onShowToast('Custom background photo loaded', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingLogo(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setRawLogoDataUrl(dataUrl);
        let finalLogo = dataUrl;
        if (settings.removeLogoBackground) {
          try {
            finalLogo = await removeBlackBackground(dataUrl);
          } catch (err) {
            console.warn('Background removal error:', err);
          }
        }
        if (onUpdateDefaultLogo) {
          onUpdateDefaultLogo(finalLogo, settings.removeLogoBackground);
        }
        onShowToast('Logo uploaded & saved as permanent default logo!', 'success');
      }
      setIsProcessingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleLogoRemoveBg = async (removeBg: boolean) => {
    setIsProcessingLogo(true);
    try {
      const source = rawLogoDataUrl || settings.logoDataUrl || '/brand/logo.svg';
      let processed = source;
      if (removeBg) {
        processed = await removeBlackBackground(source);
      }
      if (onUpdateDefaultLogo) {
        onUpdateDefaultLogo(processed, removeBg);
      }
      onShowToast(removeBg ? 'Auto black background removed!' : 'Original background restored.', 'info');
    } catch (err) {
      console.error('Logo background toggle failed:', err);
    } finally {
      setIsProcessingLogo(false);
    }
  };

  const handleResetToStarkLogo = async () => {
    setIsProcessingLogo(true);
    try {
      let processed = '/brand/logo.svg';
      if (settings.removeLogoBackground) {
        processed = await removeBlackBackground('/brand/logo.svg');
      }
      if (onUpdateDefaultLogo) {
        onUpdateDefaultLogo(processed, settings.removeLogoBackground);
      }
      setRawLogoDataUrl(null);
      onShowToast('Reset to Stark News default logo ("S" monogram)', 'info');
    } finally {
      setIsProcessingLogo(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!postRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await exportCanvasToPng(postRef.current);
      const a = document.createElement('a');
      const filename = `stark-news-x-post-${Date.now()}.png`;
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onShowToast(`Exported 1080x1080 PNG: ${filename}`, 'success');
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Export error');
      console.error('Download error:', msg);
      onShowToast('Failed to export image: ' + msg, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!postRef.current) return;
    setIsCopying(true);
    try {
      const blob = await exportCanvasToBlob(postRef.current);
      const winWithClipboard = window as unknown as { ClipboardItem?: new (items: Record<string, Blob>) => unknown };
      if (navigator.clipboard && winWithClipboard.ClipboardItem) {
        try {
          const item = new winWithClipboard.ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item as ClipboardItem]);
          onShowToast('Image copied to clipboard! Ready to paste into X or YouTube.', 'success');
          return;
        } catch (clipErr) {
          console.warn('Clipboard write fallback to download:', clipErr);
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stark-news-x-post-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      onShowToast('Clipboard unavailable. Downloaded PNG instead.', 'info');
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Copy error');
      console.warn('Clipboard write error:', msg);
      onShowToast('Failed to copy image: ' + msg, 'error');
    } finally {
      setIsCopying(false);
    }
  };

  const renderStyledHeadline = () => {
    const rawHeadline = config.headline.trim();
    if (!rawHeadline) return null;
    const words = rawHeadline.split(/\s+/).filter(Boolean);

    interface TextToken {
      text: string;
      isHighlighted: boolean;
      words: string[];
    }

    const tokens: TextToken[] = [];
    for (const word of words) {
      const clean = word.replace(/[^\w\s-]/g, '').trim();
      const isHigh = config.highlightWords.some(
        (hw) => hw.toLowerCase() === clean.toLowerCase()
      );
      const last = tokens[tokens.length - 1];
      if (last && last.isHighlighted === isHigh) {
        last.text += ' ' + word;
        last.words.push(word);
      } else {
        tokens.push({ text: word, isHighlighted: isHigh, words: [word] });
      }
    }

    return tokens.map((token, i) => {
      if (token.isHighlighted) {
        return (
          <React.Fragment key={i}>
            <span
              onClick={(e) => {
                e.stopPropagation();
                token.words.forEach((w) => toggleWordHighlight(w));
              }}
              title="Click to toggle highlight"
              style={{
                backgroundColor: config.highlightBoxColor,
                color: config.highlightTextColor,
                ...getBoxGlowStyle(config.glow, config.glow.toggles.highlightBox),
              }}
              className="inline-block cursor-pointer px-3 py-0.5 mx-1 my-0.5 rounded font-black tracking-tight transition hover:opacity-90 align-baseline"
            >
              {token.text}
            </span>
            {' '}
          </React.Fragment>
        );
      }
      return (
        <React.Fragment key={i}>
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (token.words[0]) toggleWordHighlight(token.words[0]);
            }}
            title="Click word to toggle highlight"
            style={{
              color: config.textColor,
              ...getTextGlowStyle(config.glow, config.glow.toggles.headline),
            }}
            className="inline cursor-pointer font-extrabold tracking-tight hover:underline"
          >
            {token.text}
          </span>
          {' '}
        </React.Fragment>
      );
    });
  };

  const wordsInHeadline = config.headline.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="flex h-full flex-col bg-black" ref={containerRef}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-wider text-white">STUDIO CANVAS</span>
          <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold text-neutral-400">
            1080 × 1080 px
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <Check className="h-2.5 w-2.5 text-emerald-400" />
            <span className="hidden sm:inline">Styling Preferences Saved</span>
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIdx === 0}
            title="Undo"
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white disabled:opacity-30"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIdx === history.length - 1}
            title="Redo"
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white disabled:opacity-30"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          {/* Reset */}
          <button
            onClick={onReset}
            title="Reset to auto-generated layout"
            className="flex items-center gap-1 rounded border border-white/15 px-2 py-1 text-[11px] text-neutral-300 hover:bg-neutral-900 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          {/* Copy Image */}
          <button
            onClick={handleCopyImage}
            disabled={isCopying}
            className="flex items-center gap-1 rounded border border-white/30 bg-neutral-950 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-neutral-900 hover:shadow-[0_0_8px_rgba(255,255,255,0.4)] disabled:opacity-50"
          >
            <Copy className="h-3 w-3" />
            <span>{isCopying ? 'Copying...' : 'Copy Image'}</span>
          </button>
          {/* Download PNG */}
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="flex items-center gap-1 rounded bg-white px-3 py-1 text-[11px] font-black text-black transition hover:bg-neutral-200 shadow-[0_0_12px_rgba(255,255,255,0.6)] disabled:opacity-50"
          >
            <Download className="h-3 w-3" />
            <span>{isExporting ? 'Exporting...' : 'Download PNG'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-4 bg-neutral-950/60">
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-black shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          style={{
            width: `${1080 * previewScale}px`,
            height: `${1080 * previewScale}px`,
          }}
        >
          {/* THE 1080x1080 MASTER CANVAS */}
          <div
            ref={postRef}
            id="wardesk-post-canvas"
            className="absolute top-0 left-0 select-none overflow-hidden bg-black text-white"
            style={{
              width: '1080px',
              height: '1080px',
              transform: `scale(${previewScale})`,
              transformOrigin: 'top left',
              fontFamily: "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {/* Layer 1: Background Image with Zoom and Pan */}
            {config.background.imageUrl && (
              <div
                className="absolute inset-0 overflow-hidden transition-transform duration-75"
                style={{
                  transform: `scale(${config.background.zoom / 100}) translate(${config.background.panX}px, ${config.background.panY}px)`,
                }}
              >
                <img
                  src={getSafeImageUrl(config.background.imageUrl)}
                  alt="News Cover"
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover object-center pointer-events-none"
                  onError={(e) => {
                    const img = e.currentTarget;
                    // Safe in-memory fallback without bypassing CORS or tainting canvas
                    img.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1080' height='1080'%3E%3Crect width='1080' height='1080' fill='%2312141a'/%3E%3Cpath d='M0 0l1080 1080M1080 0L0 1080' stroke='%23ffffff' stroke-opacity='0.03' stroke-width='2'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            )}

            {/* Layer 2: Soft Dark Top Gradient */}
            <div
              className="absolute inset-x-0 top-0 pointer-events-none"
              style={{
                height: '240px',
                background: `linear-gradient(to bottom, rgba(0,0,0,${config.background.topGradientOpacity / 100}) 0%, rgba(0,0,0,0) 100%)`,
              }}
            />

            {/* Layer 3: Solid Black Bottom Gradient */}
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{
                height: `${config.background.bottomGradientHeight}%`,
                background: `linear-gradient(to top, rgba(0,0,0,${config.background.bottomGradientOpacity / 100}) 0%, rgba(0,0,0,${(config.background.bottomGradientOpacity / 100) * 0.85}) 40%, rgba(0,0,0,0) 100%)`,
              }}
            />

            {/* Layer 4: Channel Logo */}
            {config.logo.show && (
              <div
                className="absolute pointer-events-auto"
                style={{
                  top: `${config.logo.margin}px`,
                  left: config.logo.position === 'top-left' ? `${config.logo.margin}px` : 'auto',
                  right: config.logo.position === 'top-right' ? `${config.logo.margin}px` : 'auto',
                  ...getDropShadowFilter(config.glow, config.glow.toggles.logo),
                }}
              >
                {settings.logoDataUrl ? (
                  <img
                    src={settings.logoDataUrl}
                    alt="Logo"
                    style={{
                      height: `${config.logo.size}px`,
                      width: 'auto',
                    }}
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-10 items-center justify-center rounded-full border-2 border-white bg-black/80 font-black text-white text-xl">
                    S
                  </div>
                )}
              </div>
            )}

            {/* Layer 5: Optional BREAKING Badge at Top-Right */}
            {config.badge.show && (
              <div
                className="absolute pointer-events-auto"
                style={{
                  top: `${config.logo.margin}px`,
                  right: `${config.logo.margin}px`,
                  ...getBoxGlowStyle(config.glow, config.glow.toggles.badge),
                }}
              >
                <div className="flex items-center gap-2 rounded-full border-2 border-white bg-black/70 px-4 py-1.5 backdrop-blur-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_#ffffff]" />
                  <span
                    className="text-sm font-black tracking-widest text-white uppercase"
                    style={getTextGlowStyle(config.glow, config.glow.toggles.badge)}
                  >
                    {config.badge.text || 'BREAKING'}
                  </span>
                </div>
              </div>
            )}

            {/* Layer 6: Main Content Group */}
            <div
              className="absolute pointer-events-auto"
              style={{
                top: `${config.headlineY}%`,
                left: `${config.headlineX}px`,
                right: `${config.headlineX}px`,
                textAlign: config.textAlign,
              }}
            >
              {config.divider.show && (
                <div
                  className="mb-4 h-0.5 w-24 bg-white"
                  style={{
                    ...getBoxGlowStyle(config.glow, config.glow.toggles.headline),
                    margin: config.textAlign === 'center' ? '0 auto 16px auto' : config.textAlign === 'right' ? '0 0 16px auto' : '0 0 16px 0',
                  }}
                />
              )}

              {/* Headline with clickable word highlighting and inline editing */}
              <div
                className="font-extrabold leading-[1.12] tracking-tight"
                style={{
                  fontSize: `${config.fontSize}px`,
                  fontFamily: config.fontFamily || "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
                onDoubleClick={() => setIsInlineEditing(true)}
              >
                {isInlineEditing ? (
                  <textarea
                    autoFocus
                    value={config.headline}
                    onChange={(e) => updateConfig({ ...config, headline: e.target.value }, false)}
                    onBlur={() => setIsInlineEditing(false)}
                    className="w-full bg-black/90 p-3 text-white border-2 border-white rounded outline-none shadow-[0_0_20px_#ffffff]"
                    style={{ fontSize: `${config.fontSize * 0.9}px` }}
                  />
                ) : (
                  <div>{renderStyledHeadline()}</div>
                )}
              </div>

              {/* Source Line and Footer @Handle */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-semibold opacity-75">
                {config.sourceLine.show && (
                  <span
                    style={{
                      color: '#FFFFFF',
                      ...getTextGlowStyle(config.glow, config.glow.toggles.footer),
                    }}
                  >
                    {config.sourceLine.text}
                  </span>
                )}
                {config.handleFooter.show && (
                  <span
                    className="font-bold tracking-wider"
                    style={{
                      color: '#FFFFFF',
                      ...getTextGlowStyle(config.glow, config.glow.toggles.footer),
                    }}
                  >
                    {config.handleFooter.text}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Controls Tab Navigation */}
      <div className="flex border-t border-white/10 bg-neutral-950 px-2 text-xs">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-bold tracking-wide transition ${
            activeTab === 'text'
              ? 'border-white text-white shadow-[0_2px_8px_rgba(255,255,255,0.4)]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Type className="h-3.5 w-3.5" />
          <span>TEXT & LAYOUT</span>
        </button>
        <button
          onClick={() => setActiveTab('highlight')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-bold tracking-wide transition ${
            activeTab === 'highlight'
              ? 'border-white text-white shadow-[0_2px_8px_rgba(255,255,255,0.4)]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>HIGHLIGHT WORDS</span>
        </button>
        <button
          onClick={() => setActiveTab('photo')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-bold tracking-wide transition ${
            activeTab === 'photo'
              ? 'border-white text-white shadow-[0_2px_8px_rgba(255,255,255,0.4)]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>PHOTO & GRADIENT</span>
        </button>
        <button
          onClick={() => setActiveTab('glow')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-bold tracking-wide transition ${
            activeTab === 'glow'
              ? 'border-white text-white shadow-[0_2px_8px_rgba(255,255,255,0.4)]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>GLOW SYSTEM</span>
        </button>
        <button
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 font-bold tracking-wide transition ${
            activeTab === 'brand'
              ? 'border-white text-white shadow-[0_2px_8px_rgba(255,255,255,0.4)]'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>BRANDING</span>
        </button>
      </div>

      {/* Editor Sub-Panels */}
      <div className="border-t border-white/10 bg-black p-3 sm:p-4 text-xs overflow-y-auto max-h-56">
        {/* TAB 1: TEXT & LAYOUT */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-white" />
                  <span>Headline Text</span>
                  <span className="text-[10px] text-neutral-500 font-normal hidden sm:inline">
                    (Double-click on canvas to edit inline)
                  </span>
                </label>

                {/* Gemini 3.8 Flash Neural Headline Generator Action Button */}
                <button
                  type="button"
                  onClick={() => handleGenerateSmartHeadline(activeHeadlineStyle)}
                  disabled={isGeneratingAiHeadline}
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-neutral-900 px-2.5 py-0.5 text-[10px] font-bold text-white transition hover:bg-white hover:text-black hover:border-white shadow-[0_0_10px_rgba(255,255,255,0.15)] disabled:opacity-40"
                  title="Generate intelligent 6-9 word breaking card headline using Gemini 3.8 Flash Neural Engine"
                >
                  <Sparkles className={`h-3 w-3 ${isGeneratingAiHeadline ? 'animate-spin text-cyan-400' : 'text-amber-300'}`} />
                  <span>{isGeneratingAiHeadline ? 'Generating...' : 'Gemini 3.8 Flash Smart Headline'}</span>
                </button>
              </div>

              <textarea
                rows={2}
                value={config.headline}
                onChange={(e) => updateConfig({ ...config, headline: e.target.value })}
                className="w-full rounded border border-white/20 bg-neutral-950 p-2 text-xs text-white focus:border-white focus:outline-none uppercase font-bold tracking-wide"
                placeholder="ENTER BREAKING NEWS HEADLINE (6-9 WORDS)..."
              />

              {/* Style Presets & Case Toggles */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-neutral-500 font-bold mr-0.5">Preset:</span>
                  <button
                    type="button"
                    onClick={() => handleGenerateSmartHeadline('impact')}
                    disabled={isGeneratingAiHeadline}
                    className={`rounded px-2 py-0.5 font-bold transition border ${
                      activeHeadlineStyle === 'impact'
                        ? 'border-white bg-white text-black'
                        : 'border-white/10 bg-neutral-900 text-neutral-300 hover:text-white'
                    }`}
                  >
                    💥 Breaking Impact
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateSmartHeadline('tactical')}
                    disabled={isGeneratingAiHeadline}
                    className={`rounded px-2 py-0.5 font-bold transition border ${
                      activeHeadlineStyle === 'tactical'
                        ? 'border-cyan-400 bg-cyan-400 text-black'
                        : 'border-white/10 bg-neutral-900 text-neutral-300 hover:text-white'
                    }`}
                  >
                    🎯 Tactical OSINT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateSmartHeadline('short')}
                    disabled={isGeneratingAiHeadline}
                    className={`rounded px-2 py-0.5 font-bold transition border ${
                      activeHeadlineStyle === 'short'
                        ? 'border-amber-400 bg-amber-400 text-black'
                        : 'border-white/10 bg-neutral-900 text-neutral-300 hover:text-white'
                    }`}
                  >
                    ⚡ Ultra Short
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateSmartHeadline('geopolitical')}
                    disabled={isGeneratingAiHeadline}
                    className={`rounded px-2 py-0.5 font-bold transition border ${
                      activeHeadlineStyle === 'geopolitical'
                        ? 'border-purple-400 bg-purple-400 text-black'
                        : 'border-white/10 bg-neutral-900 text-neutral-300 hover:text-white'
                    }`}
                  >
                    🌍 Geopolitics
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleCase('upper')}
                    className="rounded border border-white/10 bg-neutral-900 px-1.5 py-0.5 text-neutral-400 hover:text-white font-mono"
                    title="Convert to UPPERCASE"
                  >
                    ALL CAPS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleCase('title')}
                    className="rounded border border-white/10 bg-neutral-900 px-1.5 py-0.5 text-neutral-400 hover:text-white font-mono"
                    title="Convert to Title Case"
                  >
                    Title Case
                  </button>
                </div>
              </div>

              {/* Gemini 3.8 Flash Variations (if available) */}
              {aiVariations && (
                <div className="mt-2 rounded border border-white/10 bg-neutral-950 p-2 space-y-1.5 text-[10px]">
                  <div className="font-bold text-neutral-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-white">
                      <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                      <span>Gemini 3.8 Flash Neural Variations (Click to Apply)</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    {aiVariations.impact && (
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig({ ...config, headline: aiVariations.impact!.toUpperCase() });
                          onShowToast('Applied impact variation!', 'success');
                        }}
                        className="w-full text-left rounded border border-white/10 bg-neutral-900/80 px-2 py-1 text-[11px] font-bold text-neutral-200 hover:border-white hover:text-white transition"
                      >
                        <span className="text-neutral-500 mr-1.5 text-[9px] uppercase">Impact:</span>
                        {aiVariations.impact}
                      </button>
                    )}
                    {aiVariations.tactical && (
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig({ ...config, headline: aiVariations.tactical!.toUpperCase() });
                          onShowToast('Applied tactical variation!', 'success');
                        }}
                        className="w-full text-left rounded border border-white/10 bg-neutral-900/80 px-2 py-1 text-[11px] font-bold text-neutral-200 hover:border-cyan-400 hover:text-white transition"
                      >
                        <span className="text-cyan-400 mr-1.5 text-[9px] uppercase">Tactical:</span>
                        {aiVariations.tactical}
                      </button>
                    )}
                    {aiVariations.short && (
                      <button
                        type="button"
                        onClick={() => {
                          updateConfig({ ...config, headline: aiVariations.short!.toUpperCase() });
                          onShowToast('Applied short variation!', 'success');
                        }}
                        className="w-full text-left rounded border border-white/10 bg-neutral-900/80 px-2 py-1 text-[11px] font-bold text-neutral-200 hover:border-amber-400 hover:text-white transition"
                      >
                        <span className="text-amber-400 mr-1.5 text-[9px] uppercase">Short:</span>
                        {aiVariations.short}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Interactive Word-by-Word Highlight Selector */}
              {config.headline.trim() && (
                <div className="mt-2.5 rounded border border-white/10 bg-neutral-950 p-2 text-[10px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-neutral-400 flex items-center gap-1">
                      <Tag className="h-3 w-3 text-white" />
                      <span>Highlight in White Box (Click words to toggle):</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoHighlightBest}
                      className="text-cyan-400 hover:text-cyan-300 font-bold transition flex items-center gap-0.5"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Auto Best 3</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {config.headline.trim().split(/\s+/).map((w, idx) => {
                      const clean = w.replace(/[^\w-]/g, '').toUpperCase();
                      const isHighlighted = (config.highlightWords || []).some(
                        (hw) => hw.toUpperCase() === clean
                      );
                      return (
                        <button
                          key={`${w}-${idx}`}
                          type="button"
                          onClick={() => handleToggleHighlightWord(w)}
                          className={`rounded px-1.5 py-0.5 font-bold transition ${
                            isHighlighted
                              ? 'bg-white text-black shadow-[0_0_6px_rgba(255,255,255,0.6)] ring-1 ring-white'
                              : 'bg-neutral-900 text-neutral-400 border border-white/10 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Font Size</span>
                  <span className="text-white font-mono">{config.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="36"
                  max="84"
                  value={config.fontSize}
                  onChange={(e) => updateConfig({ ...config, fontSize: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Vertical Position</span>
                  <span className="text-white font-mono">{config.headlineY}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="88"
                  value={config.headlineY}
                  onChange={(e) => updateConfig({ ...config, headlineY: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Horizontal Margin</span>
                  <span className="text-white font-mono">{config.headlineX}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="96"
                  value={config.headlineX}
                  onChange={(e) => updateConfig({ ...config, headlineX: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>
              <div>
                <span className="mb-1 block text-neutral-400">Alignment</span>
                <div className="flex rounded border border-white/20 bg-neutral-950 p-0.5">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updateConfig({ ...config, textAlign: align })}
                      className={`flex-1 py-1 flex justify-center rounded ${
                        config.textAlign === align ? 'bg-white text-black font-bold' : 'text-neutral-400'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="h-3.5 w-3.5" />}
                      {align === 'center' && <AlignCenter className="h-3.5 w-3.5" />}
                      {align === 'right' && <AlignRight className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Elements Toggles */}
            <div className="flex flex-wrap gap-4 pt-1 border-t border-white/10 text-neutral-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.divider.show}
                  onChange={(e) => updateConfig({ ...config, divider: { show: e.target.checked } })}
                  className="accent-white"
                />
                <span>White Divider Line</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.badge.show}
                  onChange={(e) => updateConfig({ ...config, badge: { ...config.badge, show: e.target.checked } })}
                  className="accent-white"
                />
                <span>BREAKING Badge</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sourceLine.show}
                  onChange={(e) => updateConfig({ ...config, sourceLine: { ...config.sourceLine, show: e.target.checked } })}
                  className="accent-white"
                />
                <span>Source Line</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.handleFooter.show}
                  onChange={(e) => updateConfig({ ...config, handleFooter: { ...config.handleFooter, show: e.target.checked } })}
                  className="accent-white"
                />
                <span>Footer @Handle</span>
              </label>
            </div>

            <div className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-neutral-300">
              <Check className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>
                <strong>Preferences Saved:</strong> Font size ({config.fontSize}px), vertical position ({config.headlineY}%), margins ({config.headlineX}px), and text alignment are saved and will persist.
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: HIGHLIGHT WORDS */}
        {activeTab === 'highlight' && (
          <div className="space-y-3">
            <p className="text-neutral-400">
              Click individual words below to toggle the solid white marker box.
            </p>
            <div className="flex flex-wrap gap-1.5 rounded border border-white/15 bg-neutral-950 p-2.5">
              {wordsInHeadline.map((word, i) => {
                const clean = word.replace(/[^\w\s-]/g, '').trim();
                const isSelected = config.highlightWords.some(
                  (hw) => hw.toLowerCase() === clean.toLowerCase()
                );
                return (
                  <button
                    key={i}
                    onClick={() => toggleWordHighlight(word)}
                    className={`rounded px-2.5 py-1 text-xs font-bold transition active:scale-95 ${
                      isSelected
                        ? 'bg-white text-black shadow-[0_0_10px_#ffffff]'
                        : 'border border-white/20 text-neutral-400 hover:border-white hover:text-white'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
              <div>
                <label className="block text-neutral-400 mb-1">Highlight Box Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.highlightBoxColor}
                    onChange={(e) => updateConfig({ ...config, highlightBoxColor: e.target.value })}
                    className="h-7 w-9 cursor-pointer rounded border border-white/20 bg-black"
                  />
                  <span className="font-mono text-white">{config.highlightBoxColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Highlight Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.highlightTextColor}
                    onChange={(e) => updateConfig({ ...config, highlightTextColor: e.target.value })}
                    className="h-7 w-9 cursor-pointer rounded border border-white/20 bg-black"
                  />
                  <span className="font-mono text-white">{config.highlightTextColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Headline Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => updateConfig({ ...config, textColor: e.target.value })}
                    className="h-7 w-9 cursor-pointer rounded border border-white/20 bg-black"
                  />
                  <span className="font-mono text-white">{config.textColor}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-neutral-300">
              <Check className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>
                <strong>Text & Box Colors Saved:</strong> Headline color ({config.textColor}), highlight box ({config.highlightBoxColor}), and styles are automatically saved for subsequent stories.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: PHOTO & GRADIENT */}
        {activeTab === 'photo' && (
          <div className="space-y-3">
            {/* Real News Photo Status & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-white/15 bg-neutral-950">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 shrink-0 rounded overflow-hidden border border-white/20 bg-neutral-900 shadow-[0_0_8px_rgba(255,255,255,0.15)]">
                  <img
                    src={getSafeImageUrl(config.background.imageUrl)}
                    alt="Background"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Article Photo</span>
                    <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                      config.background.imageUrl.includes('images.unsplash.com')
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {config.background.imageUrl.includes('images.unsplash.com') ? 'Archive Placeholder' : '✓ Verified Article Photo'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    {config.background.imageUrl.includes('images.unsplash.com')
                      ? 'Click button on right to load photo from source article'
                      : 'Original photo from news report successfully applied'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFetchOriginalNewsPhoto()}
                  disabled={isResolvingImage}
                  title="Automatically search Google/Bing for a real news photograph matching this headline"
                  className="flex items-center gap-1.5 rounded border border-cyan-400/50 bg-cyan-950/60 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 transition shadow-[0_0_10px_rgba(34,211,238,0.25)] disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isResolvingImage ? 'animate-spin' : ''}`} />
                  <span>{isResolvingImage ? 'Searching Internet...' : '🔍 Auto-Search Internet Photo'}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-[11px] font-bold text-black shadow-[0_0_8px_rgba(255,255,255,0.4)] hover:bg-neutral-200 transition"
                >
                  <Upload className="h-3 w-3" />
                  <span>Upload Photo</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleCustomPhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Photo Zoom</span>
                  <span className="text-white font-mono">{config.background.zoom}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="250"
                  value={config.background.zoom}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      background: { ...config.background, zoom: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Reposition X</span>
                  <span className="text-white font-mono">{config.background.panX}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={config.background.panX}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      background: { ...config.background, panX: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Reposition Y</span>
                  <span className="text-white font-mono">{config.background.panY}px</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={config.background.panY}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      background: { ...config.background, panY: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
            </div>
            {/* Gradient Overlays */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Bottom Dark Opacity</span>
                  <span className="text-white font-mono">{config.background.bottomGradientOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={config.background.bottomGradientOpacity}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      background: { ...config.background, bottomGradientOpacity: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Bottom Gradient Height</span>
                  <span className="text-white font-mono">{config.background.bottomGradientHeight}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={config.background.bottomGradientHeight}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      background: { ...config.background, bottomGradientHeight: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Top Gradient (Readability)</span>
                  <span className="text-white font-mono">{config.background.topGradientOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={config.background.topGradientOpacity}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      background: { ...config.background, topGradientOpacity: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-neutral-300">
              <Check className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>
                <strong>Gradient & Zoom Saved:</strong> Zoom level ({config.background.zoom}%), pan position, and gradient ({config.background.bottomGradientOpacity}%) are preserved across stories.
              </span>
            </div>
          </div>
        )}

        {/* TAB 4: GLOW SYSTEM */}
        {activeTab === 'glow' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Glow Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.glow.color}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        glow: { ...config.glow, color: e.target.value },
                      })
                    }
                    className="h-7 w-9 cursor-pointer rounded border border-white/20 bg-black"
                  />
                  <span className="font-mono text-white">{config.glow.color}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Glow Intensity</span>
                  <span className="text-white font-mono">{config.glow.intensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.glow.intensity}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      glow: { ...config.glow, intensity: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Glow Spread</span>
                  <span className="text-white font-mono">{config.glow.spread}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={config.glow.spread}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      glow: { ...config.glow, spread: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
            </div>
            {/* Individual Element Glow Toggles */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <span className="block font-bold text-neutral-300">Target Element Glow Toggles:</span>
              <div className="flex flex-wrap gap-4 text-neutral-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.glow.toggles.headline}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        glow: {
                          ...config.glow,
                          toggles: { ...config.glow.toggles, headline: e.target.checked },
                        },
                      })
                    }
                    className="accent-white"
                  />
                  <span>Headline Text Glow</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.glow.toggles.highlightBox}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        glow: {
                          ...config.glow,
                          toggles: { ...config.glow.toggles, highlightBox: e.target.checked },
                        },
                      })
                    }
                    className="accent-white"
                  />
                  <span>Highlight Box Glow</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.glow.toggles.logo}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        glow: {
                          ...config.glow,
                          toggles: { ...config.glow.toggles, logo: e.target.checked },
                        },
                      })
                    }
                    className="accent-white"
                  />
                  <span>Logo Glow</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.glow.toggles.badge}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        glow: {
                          ...config.glow,
                          toggles: { ...config.glow.toggles, badge: e.target.checked },
                        },
                      })
                    }
                    className="accent-white"
                  />
                  <span>Badge Glow</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.glow.toggles.footer}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        glow: {
                          ...config.glow,
                          toggles: { ...config.glow.toggles, footer: e.target.checked },
                        },
                      })
                    }
                    className="accent-white"
                  />
                  <span>Footer Line Glow</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BRANDING */}
        {activeTab === 'brand' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/20 bg-neutral-950 p-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-white/40 bg-black/90 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {settings.logoDataUrl ? (
                      <img
                        src={settings.logoDataUrl}
                        alt="Channel Logo"
                        className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      />
                    ) : (
                      <span className="text-xl font-black text-white">S</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Channel Logo & Watermark</span>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
                        Permanent Default
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 block">
                      Saved logo automatically applies to all news posts & exports
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    disabled={isProcessingLogo}
                    className="flex items-center gap-1.5 rounded bg-white px-3 py-1.5 text-xs font-bold text-black shadow-[0_0_12px_rgba(255,255,255,0.5)] transition hover:bg-neutral-200 active:scale-95 disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isProcessingLogo ? 'Processing...' : 'Upload Logo'}</span>
                  </button>
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleResetToStarkLogo}
                    title="Reset to Stark News 'S' logo"
                    className="flex items-center gap-1 rounded border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:border-white/50 hover:text-white"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span className="hidden sm:inline">Reset Default</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                <div>
                  <span className="font-semibold text-white block">Auto Black-Background Removal</span>
                  <span className="text-[11px] text-neutral-400">
                    Transparent cutout for white logos on black backgrounds
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.removeLogoBackground}
                    onChange={(e) => handleToggleLogoRemoveBg(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-5 w-9 rounded-full bg-neutral-800 peer-checked:bg-white after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-black after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-white font-bold mb-2">
                  <input
                    type="checkbox"
                    checked={config.logo.show}
                    onChange={(e) =>
                      updateConfig({
                        ...config,
                        logo: { ...config.logo, show: e.target.checked },
                      })
                    }
                    className="accent-white"
                  />
                  <span>Show Channel Logo</span>
                </label>
                <div className="flex gap-2 text-neutral-400">
                  <button
                    onClick={() =>
                      updateConfig({
                        ...config,
                        logo: { ...config.logo, position: 'top-left' },
                      })
                    }
                    className={`flex-1 rounded border py-1 font-semibold ${
                      config.logo.position === 'top-left' ? 'border-white bg-white text-black' : 'border-white/20'
                    }`}
                  >
                    Top Left
                  </button>
                  <button
                    onClick={() =>
                      updateConfig({
                        ...config,
                        logo: { ...config.logo, position: 'top-right' },
                      })
                    }
                    className={`flex-1 rounded border py-1 font-semibold ${
                      config.logo.position === 'top-right' ? 'border-white bg-white text-black' : 'border-white/20'
                    }`}
                  >
                    Top Right
                  </button>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Logo Size</span>
                  <span className="text-white font-mono">{config.logo.size}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={config.logo.size}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      logo: { ...config.logo, size: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Logo Margin</span>
                  <span className="text-white font-mono">{config.logo.margin}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={config.logo.margin}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      logo: { ...config.logo, margin: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-400">Badge Text (Status / Pilar)</label>
                  <label className="flex items-center gap-1 text-[11px] text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.badge.show}
                      onChange={(e) => updateConfig({ ...config, badge: { ...config.badge, show: e.target.checked } })}
                      className="accent-white"
                    />
                    <span>Tampilkan Badge</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={config.badge.text}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      badge: { ...config.badge, text: e.target.value },
                    })
                  }
                  className="w-full rounded border border-white/20 bg-neutral-950 p-1.5 text-white text-xs mb-2"
                />

                {/* 5 OSINT Pillar Badge Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold block">
                    Preset Cepat 5 Pilar OSINT:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: '🚀 PILAR 1: STRIKE WIRE', text: 'PILAR 1 — BREAKING STRIKE', color: 'border-red-500/40 bg-red-950/60 text-red-300' },
                      { label: '🎯 RADAR INTEL', text: 'RADAR INTEL', color: 'border-purple-500/40 bg-purple-950/60 text-purple-300' },
                      { label: '🔍 PILAR 3: FOOTAGE VERIFIED', text: 'PILAR 3 — FOOTAGE VERIFIED', color: 'border-amber-500/40 bg-amber-950/60 text-amber-300' },
                      { label: '💥 PILAR 4: MILITARY LOSSES', text: 'PILAR 4 — MILITARY LOSSES', color: 'border-rose-500/40 bg-rose-950/60 text-rose-300' },
                      { label: '🌐 PILAR 5: STRATEGIC DEPLOYMENT', text: 'PILAR 5 — STRATEGIC DEPLOYMENT', color: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300' },
                      { label: '⚡ BREAKING', text: 'BREAKING', color: 'border-white/20 bg-neutral-900 text-white' },
                      { label: '🛡️ WAR UPDATE', text: 'WAR UPDATE', color: 'border-white/20 bg-neutral-900 text-white' },
                    ].map((p, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() =>
                          updateConfig({
                            ...config,
                            badge: { show: true, text: p.text },
                          })
                        }
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold border transition hover:brightness-125 ${p.color} ${
                          config.badge.text === p.text ? 'ring-1 ring-white font-black' : ''
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Footer @Handle Text</label>
                <input
                  type="text"
                  value={config.handleFooter.text}
                  onChange={(e) =>
                    updateConfig({
                      ...config,
                      handleFooter: { ...config.handleFooter, text: e.target.value },
                    })
                  }
                  className="w-full rounded border border-white/20 bg-neutral-950 p-1.5 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-neutral-300 mt-2">
              <Check className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>
                <strong>Branding Saved:</strong> Logo size ({config.logo.size}px), position ({config.logo.position}), and @handle are saved and persist across refreshes.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
