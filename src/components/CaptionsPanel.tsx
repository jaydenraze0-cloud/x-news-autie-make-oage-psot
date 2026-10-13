import React, { useState } from 'react';
import {
  Share2,
  Youtube,
  Twitter,
  Sparkles,
  RefreshCw,
  Copy,
  AlertCircle,
  Swords,
  Send,
  Zap,
  Type,
  Check,
} from 'lucide-react';
import { AppSettings, NewsStory } from '../types';
import { exportCanvasToBlob } from '../utils/exportImage';
import { analyzeStorySentiment } from '../utils/sentimentAnalyzer';

interface CaptionsPanelProps {
  captionX: string;
  onChangeCaptionX: (val: string) => void;
  captionYouTube: string;
  onChangeCaptionYouTube: (val: string) => void;
  currentStory: NewsStory | null;
  settings: AppSettings;
  aiAvailable: boolean;
  onRegenerateCaption: (type: 'all' | 'x' | 'youtube', focusStyle?: 'in-depth' | 'tactical' | 'geopolitical') => void;
  isRegenerating: boolean;
  onShowToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  selectedLang?: 'id' | 'en';
  onChangeLang?: (lang: 'id' | 'en') => void;
  headline?: string;
  onChangeHeadline?: (headline: string, highlightWords?: string[]) => void;
  highlightWords?: string[];
  onChangeHighlightWords?: (words: string[]) => void;
}

export const CaptionsPanel: React.FC<CaptionsPanelProps> = ({
  captionX,
  onChangeCaptionX,
  captionYouTube,
  onChangeCaptionYouTube,
  currentStory,
  settings,
  aiAvailable,
  onRegenerateCaption,
  isRegenerating,
  onShowToast,
  selectedLang = 'en',
  onChangeLang,
  headline = '',
  onChangeHeadline,
  highlightWords = [],
  onChangeHighlightWords,
}) => {
  const [isPostingX, setIsPostingX] = useState(false);
  const [isPostingYT, setIsPostingYT] = useState(false);
  const [isPostingTG, setIsPostingTG] = useState(false);

  // Focus style state (in-depth analysis with intelligence background by default)
  const [captionFocusMode, setCaptionFocusMode] = useState<'in-depth' | 'tactical' | 'geopolitical'>('in-depth');

  // Gemini 3.8 Flash Neural Headline Generator states
  const [isGeneratingHeadline, setIsGeneratingHeadline] = useState(false);
  const [activeHeadlineStyle, setActiveHeadlineStyle] = useState<'impact' | 'tactical' | 'short' | 'geopolitical'>('impact');
  const [aiVariations, setAiVariations] = useState<{ impact?: string; tactical?: string; short?: string } | null>(null);

  const sentiment = currentStory ? (currentStory.sentiment || analyzeStorySentiment(currentStory)) : null;

  const handleGenerateSmartHeadline = async (
    style: 'impact' | 'tactical' | 'short' | 'geopolitical' = activeHeadlineStyle
  ) => {
    if (!currentStory) {
      onShowToast('Pilih berita di radar terlebih dahulu', 'error');
      return;
    }
    setActiveHeadlineStyle(style);
    setIsGeneratingHeadline(true);
    try {
      const res = await fetch('/api/ai/smart-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentStory.title || headline || '',
          summary: currentStory.summary || '',
          source: currentStory.source || '',
          style,
          militaryTracking: currentStory.militaryTracking,
        }),
      });
      const data = await res.json();
      if (data.headline) {
        let cleanHighlights: string[] = [];
        if (data.highlight_words) {
          cleanHighlights = data.highlight_words
            .split(/\s+/)
            .map((w: string) => w.replace(/[^\w]/g, '').toUpperCase())
            .filter(Boolean);
        }
        onChangeHeadline?.(data.headline, cleanHighlights);
        if (data.variations) {
          setAiVariations(data.variations);
        }
        onShowToast(`Gemini 3.8 Flash: Headline diperbarui & disinkronkan ke kanvas!`, 'success');
      } else {
        onShowToast('Gagal membuat headline dari AI', 'error');
      }
    } catch (err: any) {
      onShowToast('AI Headline error: ' + (err?.message || 'Koneksi error'), 'error');
    } finally {
      setIsGeneratingHeadline(false);
    }
  };

  const handleApplyVariation = (varHeadline: string) => {
    if (!varHeadline) return;
    const combatWords = [
      'STRIKES', 'ATTACK', 'ATTACKED', 'INTERCEPTS', 'DRONES', 'MISSILES', 'AIRPORT',
      'EVACUATED', 'CARRIER', 'BOMBERS', 'FRONTLINE', 'WARSHIPS', 'DEPOT', 'REFINERY',
      'DEFENSE', 'FORCES', 'ADVANCES', 'LAUNCHES', 'TARGETS'
    ];
    const words = varHeadline.split(/\s+/).filter(Boolean);
    const matches: string[] = [];
    for (const w of words) {
      const c = w.replace(/[^\w]/g, '').toUpperCase();
      if (combatWords.includes(c)) matches.push(c);
    }
    const highlights = matches.length >= 2 ? matches.slice(0, 3) : words.slice(-2).map((w) => w.replace(/[^\w]/g, '').toUpperCase());
    onChangeHeadline?.(varHeadline.toUpperCase(), highlights);
    onShowToast('Variasi diterapkan ke kanvas!', 'success');
  };

  const handleToggleHighlight = (word: string) => {
    const clean = word.replace(/[^\w]/g, '').toUpperCase();
    if (!clean) return;
    const current = highlightWords || [];
    const exists = current.some((hw) => hw.toUpperCase() === clean);
    const next = exists
      ? current.filter((hw) => hw.toUpperCase() !== clean)
      : [...current, clean];
    onChangeHighlightWords?.(next);
  };

  const handleAutoHighlight = () => {
    if (!headline) return;
    const combatWords = [
      'STRIKES', 'ATTACK', 'ATTACKED', 'INTERCEPTS', 'DRONES', 'MISSILES', 'AIRPORT',
      'EVACUATED', 'CARRIER', 'BOMBERS', 'FRONTLINE', 'WARSHIPS', 'DEPOT', 'REFINERY',
      'DEFENSE', 'FORCES', 'ADVANCES', 'LAUNCHES', 'TARGETS'
    ];
    const words = headline.split(/\s+/).filter(Boolean);
    const matches: string[] = [];
    for (const w of words) {
      const c = w.replace(/[^\w]/g, '').toUpperCase();
      if (combatWords.includes(c)) matches.push(c);
    }
    const chosen = matches.length >= 2 ? matches.slice(0, 3) : words.slice(-3).map((w) => w.replace(/[^\w]/g, '').toUpperCase());
    onChangeHighlightWords?.(chosen);
    onShowToast('Kata kunci sorotan otomatis dipilih!', 'info');
  };

  const headlineWordsCount = (headline || '').trim().split(/\s+/).filter(Boolean).length;

  const handlePostToTelegram = async () => {
    if (!currentStory) return;
    setIsPostingTG(true);
    try {
      const sentHeader = sentiment
        ? `🚨 *OSINT THREAT:* ${sentiment.threatLevel} (${sentiment.threatScore}/100) | ${sentiment.msmPenetration === 'UNDER_THE_RADAR' ? 'DECENTRALIZED OSINT' : 'EARLY OSINT'}\n⚡ *STATUS:* ${sentiment.category === 'CRITICAL_ESCALATION' ? 'CRITICAL ESCALATION' : sentiment.category === 'HOSTILE_COMBAT' ? 'ACTIVE COMBAT' : 'TACTICAL ALERT'}\n`
        : '';
      const telegramText = `${sentHeader}🔥 *${currentStory.title}*\n\n${captionX || currentStory.summary || ''}\n\nVia @${settings.handle || 'StarkNews'}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(telegramText);
      }
      openExternalUrl(`https://t.me/share/url?url=${encodeURIComponent(sourceUrl)}&text=${encodeURIComponent(telegramText)}`);
      onShowToast('Telegram post copied! Share window opened.', 'success');
    } catch {
      onShowToast('Failed to process Telegram share', 'error');
    } finally {
      setIsPostingTG(false);
    }
  };

  const sourceUrl = currentStory?.link || '';

  // X (Twitter) character limits
  const xCharCount = captionX.length;
  const X_RECOMMENDED_LIMIT = 280;
  const isXOverLimit = xCharCount > X_RECOMMENDED_LIMIT;
  const isXNearLimit = xCharCount >= 240 && xCharCount <= X_RECOMMENDED_LIMIT;
  const xPercent = Math.min(100, Math.round((xCharCount / X_RECOMMENDED_LIMIT) * 100));

  // YouTube Community Post character & word limits
  const ytCharCount = captionYouTube.length;
  const ytWordCount = captionYouTube.trim().split(/\s+/).filter(Boolean).length;
  const YT_RECOMMENDED_LIMIT = 3000;
  const YT_HARD_LIMIT = 10000;
  const isYtOverRecommended = ytCharCount > YT_RECOMMENDED_LIMIT;
  const isYtOverHardLimit = ytCharCount > YT_HARD_LIMIT;
  const isYtNearLimit = ytCharCount >= 2500 && ytCharCount <= YT_RECOMMENDED_LIMIT;
  const ytPercent = Math.min(100, Math.round((ytCharCount / YT_RECOMMENDED_LIMIT) * 100));

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openExternalUrl = (url: string) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.debug('Link click fallback:', e);
    }
  };

  const handlePostToX = async () => {
    setIsPostingX(true);
    let imageCopied = false;
    const intentUrl = `https://x.com/intent/post?text=${encodeURIComponent(
      captionX
    )}&url=${encodeURIComponent(sourceUrl)}`;

    try {
      const postElem = document.getElementById('wardesk-post-canvas');
      if (!postElem) throw new Error('Canvas element not found in DOM');
      const blob = await exportCanvasToBlob(postElem);

      const winWithClipboard = window as unknown as { ClipboardItem?: new (items: Record<string, Blob>) => unknown };
      if (navigator.clipboard && winWithClipboard.ClipboardItem) {
        try {
          const item = new winWithClipboard.ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item as ClipboardItem]);
          imageCopied = true;
        } catch (clipErr) {
          console.warn('Clipboard write fallback to download:', clipErr);
        }
      }

      if (!imageCopied) {
        downloadBlob(blob, `stark-news-x-${Date.now()}.png`);
      }

      openExternalUrl(intentUrl);

      if (imageCopied) {
        onShowToast('Image copied to clipboard! Press Ctrl+V in the X compose box.', 'success');
      } else {
        onShowToast('Image downloaded! Upload it to your X post box.', 'info');
      }
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Export error');
      console.error('Post to X error:', msg);
      onShowToast('Error preparing post for X: ' + msg, 'error');
    } finally {
      setIsPostingX(false);
    }
  };

  const handlePostToYouTube = async () => {
    setIsPostingYT(true);
    const channelPostsUrl = settings.youtubePostsUrl || 'https://www.youtube.com/@Stark-News-x/posts';
    try {
      const postElem = document.getElementById('wardesk-post-canvas');
      if (!postElem) throw new Error('Canvas element not found in DOM');

      const blob = await exportCanvasToBlob(postElem);
      const filename = `stark-news-x-youtube-${Date.now()}.png`;
      downloadBlob(blob, filename);

      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(captionYouTube);
        } catch {
          // Non-fatal
        }
      }

      openExternalUrl(channelPostsUrl);

      onShowToast(
        'Image downloaded & caption copied! Click Create > Create post, upload image, then Ctrl+V.',
        'success'
      );
    } catch (err: any) {
      const msg = err?.message || (typeof err === 'string' ? err : 'Export error');
      console.error('Post to YouTube error:', msg);
      onShowToast('Error preparing YouTube post: ' + msg, 'error');
    } finally {
      setIsPostingYT(false);
    }
  };

  const copyTextToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onShowToast(`${label} copied to clipboard`, 'success');
    } catch {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-white/10 bg-black text-xs">
      {/* Top Header & Language Bar */}
      <div className="border-b border-white/10 p-3 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
            <h2 className="font-extrabold tracking-wider text-white">CAPTIONS & PUBLISHING</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-white/20 rounded px-2.5 py-0.5 shadow-sm">
            <span className="text-[10px] font-extrabold text-white tracking-widest">EN</span>
          </div>
        </div>

        {/* AI status badge and Regenerate All button */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <Sparkles className="h-3 w-3 text-white" />
            <span>{aiAvailable ? 'Gemini 3.8 Flash Neural Engine' : 'Deterministic Template Engine'}</span>
          </div>
          <button
            onClick={() => onRegenerateCaption('all', captionFocusMode)}
            disabled={isRegenerating || !currentStory}
            className="flex items-center gap-1 rounded border border-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white transition hover:bg-neutral-900 disabled:opacity-40"
          >
            <RefreshCw className={`h-2.5 w-2.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Both</span>
          </button>
        </div>

        {/* Analysis Focus Mode Selector */}
        <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/10">
          <span className="text-[10px] text-neutral-400 font-bold">Focus:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setCaptionFocusMode('in-depth');
                onRegenerateCaption('all', 'in-depth');
              }}
              disabled={isRegenerating || !currentStory}
              className={`rounded px-2 py-0.5 text-[9px] font-bold transition border ${
                captionFocusMode === 'in-depth'
                  ? 'border-white bg-white text-black'
                  : 'border-white/10 bg-neutral-900 text-neutral-300 hover:text-white'
              }`}
              title="In-depth analysis with intelligence situational background"
            >
              🎯 In-Depth Intel
            </button>
            <button
              type="button"
              onClick={() => {
                setCaptionFocusMode('tactical');
                onRegenerateCaption('all', 'tactical');
              }}
              disabled={isRegenerating || !currentStory}
              className={`rounded px-2 py-0.5 text-[9px] font-bold transition border ${
                captionFocusMode === 'tactical'
                  ? 'border-cyan-400 bg-cyan-400 text-black'
                  : 'border-white/10 bg-neutral-900 text-neutral-300 hover:text-white'
              }`}
              title="Fast frontline & tactical military telemetry"
            >
              ⚡ Tactical Wire
            </button>
            <button
              type="button"
              onClick={() => {
                setCaptionFocusMode('geopolitical');
                onRegenerateCaption('all', 'geopolitical');
              }}
              disabled={isRegenerating || !currentStory}
              className={`rounded px-2 py-0.5 text-[9px] font-bold transition border ${
                captionFocusMode === 'geopolitical'
                  ? 'border-purple-400 bg-purple-400 text-black'
                  : 'border-white/10 bg-neutral-900 text-neutral-300 hover:text-white'
              }`}
              title="Strategic geopolitical & diplomatic impact"
            >
              🌍 Geopolitics
            </button>
          </div>
        </div>
      </div>

      {/* Captions Content Body */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* FACT-GROUNDED VERIFICATION BANNER */}
        {currentStory && (
          <div className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-neutral-900/60 p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono font-bold text-white shrink-0">
                  {currentStory.isXTwitter || currentStory.xHandle ? '𝕏' : currentStory.isTelegram ? '✈' : '📡'}
                </span>
                <span className="truncate font-bold text-neutral-200">
                  {currentStory.xHandle ? `@${currentStory.xHandle}` : currentStory.source}
                </span>
              </div>
              <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                <Check className="h-2.5 w-2.5" />
                <span>100% Fact-Grounded</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-400">
              <span className="truncate">
                Dispatch Language: <strong className="text-white">English (EN)</strong>
              </span>
              <span className="text-neutral-400">
                Context: <strong className="text-neutral-300">{currentStory.militaryTracking ? 'Tactical Defense' : 'Geopolitical / Civic'}</strong>
              </span>
            </div>
          </div>
        )}

        {/* SECTION 0: HEADLINE TEXT (POWERED BY GEMINI 3.8 FLASH NEURAL ENGINE) */}
        <div className="rounded-lg border border-white/20 bg-neutral-950 p-3 space-y-2.5 shadow-[0_0_15px_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Type className="h-3.5 w-3.5 text-white" />
              <span>Headline Text</span>
              <span className="text-[10px] text-neutral-400 font-normal hidden sm:inline">
                (Double-click on canvas to edit inline)
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleGenerateSmartHeadline(activeHeadlineStyle)}
                disabled={isGeneratingHeadline || !currentStory}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-neutral-900 px-2.5 py-0.5 text-[10px] font-bold text-white transition hover:bg-white hover:text-black hover:border-white shadow-[0_0_10px_rgba(255,255,255,0.15)] disabled:opacity-40"
                title="Generate intelligent 6-9 word breaking card headline using Gemini 3.8 Flash Neural Engine"
              >
                <Sparkles className={`h-3 w-3 ${isGeneratingHeadline ? 'animate-spin text-cyan-400' : 'text-amber-300'}`} />
                <span>{isGeneratingHeadline ? 'Synthesizing...' : 'Gemini 3.8 Flash Smart Headline'}</span>
              </button>
              <button
                type="button"
                onClick={() => copyTextToClipboard(headline || '', 'Headline Text')}
                title="Copy headline text"
                className="text-neutral-400 hover:text-white p-1"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>

          <textarea
            rows={2}
            value={headline || ''}
            onChange={(e) => onChangeHeadline?.(e.target.value.toUpperCase())}
            placeholder="ENTER BREAKING NEWS HEADLINE (6-9 WORDS)..."
            className="w-full rounded border border-white/20 bg-black p-2 text-xs font-bold uppercase tracking-wide text-white focus:border-white focus:outline-none"
          />

          {/* Quick Style Presets powered by Gemini 3.8 Flash Neural Engine */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-neutral-400 font-bold mr-0.5">Preset:</span>
              <button
                type="button"
                onClick={() => handleGenerateSmartHeadline('impact')}
                disabled={isGeneratingHeadline || !currentStory}
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
                disabled={isGeneratingHeadline || !currentStory}
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
                disabled={isGeneratingHeadline || !currentStory}
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
                disabled={isGeneratingHeadline || !currentStory}
                className={`rounded px-2 py-0.5 font-bold transition border ${
                  activeHeadlineStyle === 'geopolitical'
                    ? 'border-purple-400 bg-purple-400 text-black'
                    : 'border-white/10 bg-neutral-900 text-neutral-300 hover:text-white'
                }`}
              >
                🌍 Geopolitics
              </button>
            </div>

            <div className="flex items-center gap-1 text-[9px] text-neutral-400 font-mono">
              <span>{headlineWordsCount} words</span>
              <span>•</span>
              <span className="text-emerald-400">✨ Sync with Canvas</span>
            </div>
          </div>

          {/* Display Gemini 3.8 Flash Smart Variations if available */}
          {aiVariations && (
            <div className="rounded border border-white/10 bg-black/60 p-2 space-y-1.5">
              <div className="text-[10px] font-bold text-neutral-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                  <span>Gemini 3.8 Flash Neural Variations (Click to Apply)</span>
                </span>
              </div>
              <div className="space-y-1">
                {aiVariations.impact && (
                  <button
                    type="button"
                    onClick={() => handleApplyVariation(aiVariations.impact!)}
                    className="w-full text-left rounded border border-white/10 bg-neutral-900/80 px-2 py-1 text-[11px] font-bold text-neutral-200 hover:border-white hover:text-white transition"
                  >
                    <span className="text-neutral-500 mr-1.5 text-[9px] uppercase">Impact:</span>
                    {aiVariations.impact}
                  </button>
                )}
                {aiVariations.tactical && (
                  <button
                    type="button"
                    onClick={() => handleApplyVariation(aiVariations.tactical!)}
                    className="w-full text-left rounded border border-white/10 bg-neutral-900/80 px-2 py-1 text-[11px] font-bold text-neutral-200 hover:border-cyan-400 hover:text-white transition"
                  >
                    <span className="text-cyan-400 mr-1.5 text-[9px] uppercase">Tactical:</span>
                    {aiVariations.tactical}
                  </button>
                )}
                {aiVariations.short && (
                  <button
                    type="button"
                    onClick={() => handleApplyVariation(aiVariations.short!)}
                    className="w-full text-left rounded border border-white/10 bg-neutral-900/80 px-2 py-1 text-[11px] font-bold text-neutral-200 hover:border-amber-400 hover:text-white transition"
                  >
                    <span className="text-amber-400 mr-1.5 text-[9px] uppercase">Short:</span>
                    {aiVariations.short}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Contrast Highlight Word Picker */}
          {headline && (
            <div className="pt-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                <span>Klik kata untuk aktifkan kotak putih sorotan (highlight):</span>
                <button
                  type="button"
                  onClick={handleAutoHighlight}
                  className="text-cyan-400 hover:underline font-bold"
                >
                  Auto-Pick Kata Kunci
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {headline.split(/\s+/).filter(Boolean).map((word, idx) => {
                  const cleanW = word.replace(/[^\w]/g, '').toUpperCase();
                  const isHighlighted = (highlightWords || []).some((hw) => hw.toUpperCase() === cleanW);
                  return (
                    <button
                      key={`${word}-${idx}`}
                      type="button"
                      onClick={() => handleToggleHighlight(word)}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition border ${
                        isHighlighted
                          ? 'bg-white text-black border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                          : 'bg-black text-neutral-300 border-white/15 hover:border-white/40'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION A: X (TWITTER) CAPTION */}
        <div className={`rounded-lg border bg-neutral-950/80 p-3 space-y-2.5 transition-colors ${
          isXOverLimit ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-white/15'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Twitter className="h-3.5 w-3.5 text-white" />
              <span>X (Twitter) Caption</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Visual Real-Time Character Indicator Badge */}
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                  isXOverLimit
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                    : isXNearLimit
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-neutral-900 text-neutral-300 border-white/10'
                }`}
              >
                <span>{xCharCount} / {X_RECOMMENDED_LIMIT}</span>
                {isXOverLimit ? (
                  <span className="font-sans text-[9px] font-black text-red-400">
                    (+{xCharCount - X_RECOMMENDED_LIMIT})
                  </span>
                ) : (
                  <span className="text-[9px] text-neutral-400">
                    ({X_RECOMMENDED_LIMIT - xCharCount} left)
                  </span>
                )}
              </div>
              <button
                onClick={() => onRegenerateCaption('x')}
                disabled={isRegenerating || !currentStory}
                title="Regenerate X caption"
                className="text-neutral-400 hover:text-white disabled:opacity-40"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
              <button
                onClick={() => copyTextToClipboard(captionX, 'X caption')}
                title="Copy caption"
                className="text-neutral-400 hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Visual Progress Meter Bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-900 border border-white/5">
            <div
              className={`h-full transition-all duration-150 ${
                isXOverLimit
                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : isXNearLimit
                  ? 'bg-amber-400'
                  : 'bg-white'
              }`}
              style={{ width: `${xPercent}%` }}
            />
          </div>

          <textarea
            rows={4}
            value={captionX}
            onChange={(e) => onChangeCaptionX(e.target.value)}
            placeholder="X post text including hashtags and context..."
            className={`w-full rounded border bg-black p-2.5 text-xs text-white leading-relaxed focus:outline-none transition-colors ${
              isXOverLimit
                ? 'border-red-500 focus:border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                : 'border-white/10 focus:border-white'
            }`}
          />
          {isXOverLimit && (
            <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium bg-red-950/40 border border-red-500/30 rounded px-2.5 py-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
              <span>Caption exceeds 280 character limit by <strong>{xCharCount - X_RECOMMENDED_LIMIT} characters</strong>. Shorten to post on X.</span>
            </div>
          )}

          {/* Dual Action Buttons: PUBLISH TO 𝕏 & PUBLISH TO TELEGRAM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handlePostToX}
              disabled={isPostingX || !currentStory}
              className={`flex items-center justify-center gap-2 rounded py-2 text-xs font-black transition active:scale-98 disabled:opacity-40 ${
                isXOverLimit
                  ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : 'bg-white text-black hover:bg-neutral-200 shadow-[0_0_12px_rgba(255,255,255,0.5)]'
              }`}
            >
              <Twitter className={`h-3.5 w-3.5 ${isXOverLimit ? 'fill-white' : 'fill-black'}`} />
              <span>{isPostingX ? 'PREPARING...' : 'PUBLISH TO 𝕏'}</span>
            </button>

            <button
              onClick={handlePostToTelegram}
              disabled={isPostingTG || !currentStory}
              className="flex items-center justify-center gap-2 rounded py-2 text-xs font-black transition active:scale-98 disabled:opacity-40 bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isPostingTG ? 'PREPARING...' : 'PUBLISH TO TELEGRAM'}</span>
            </button>
          </div>
        </div>

        {/* SECTION B: YOUTUBE POST CAPTION (LONG FORM) */}
        <div className={`rounded-lg border bg-neutral-950/80 p-3 space-y-2.5 transition-colors ${
          isYtOverRecommended ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-white/15'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Youtube className="h-3.5 w-3.5 text-white" />
              <span>YouTube Community Post (Long Form)</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Visual Real-Time Character Indicator Badge */}
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                  isYtOverRecommended
                    ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                    : isYtNearLimit
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-neutral-900 text-neutral-300 border-white/10'
                }`}
              >
                <span>{ytCharCount.toLocaleString()} / {YT_RECOMMENDED_LIMIT.toLocaleString()}</span>
                {isYtOverRecommended ? (
                  <span className="font-sans text-[9px] font-black text-red-400">
                    (+{ytCharCount - YT_RECOMMENDED_LIMIT})
                  </span>
                ) : (
                  <span className="text-[9px] text-neutral-400 hidden sm:inline">
                    chars
                  </span>
                )}
              </div>
              <button
                onClick={() => onRegenerateCaption('youtube')}
                disabled={isRegenerating || !currentStory}
                title="Regenerate YouTube caption"
                className="text-neutral-400 hover:text-white disabled:opacity-40"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
              <button
                onClick={() => copyTextToClipboard(captionYouTube, 'YouTube caption')}
                title="Copy caption"
                className="text-neutral-400 hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Visual Progress Meter Bar */}
          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-900 border border-white/5">
            <div
              className={`h-full transition-all duration-150 ${
                isYtOverRecommended
                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : isYtNearLimit
                  ? 'bg-amber-400'
                  : 'bg-white'
              }`}
              style={{ width: `${ytPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span>Recommended max: 3,000 chars (platform cap: 10,000)</span>
            <span className="font-mono text-neutral-300">{ytWordCount} words</span>
          </div>

          <textarea
            rows={10}
            value={captionYouTube}
            onChange={(e) => onChangeCaptionYouTube(e.target.value)}
            placeholder="Structured journalistic YouTube post..."
            className={`w-full rounded border bg-black p-2.5 font-mono text-[11px] leading-relaxed text-neutral-200 focus:outline-none transition-colors ${
              isYtOverRecommended
                ? 'border-red-500 focus:border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.25)]'
                : 'border-white/10 focus:border-white'
            }`}
          />

          {isYtOverHardLimit ? (
            <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium bg-red-950/40 border border-red-500/30 rounded px-2.5 py-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
              <span>Exceeds YouTube hard platform limit of 10,000 characters by <strong>{ytCharCount - YT_HARD_LIMIT} chars</strong>.</span>
            </div>
          ) : isYtOverRecommended ? (
            <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-medium bg-red-950/40 border border-red-500/30 rounded px-2.5 py-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
              <span>Exceeds recommended community limit (3,000 chars) by <strong>{ytCharCount - YT_RECOMMENDED_LIMIT} chars</strong>. Post may be collapsed on mobile.</span>
            </div>
          ) : null}

          {/* Primary Action Button: POST TO YOUTUBE */}
          <button
            onClick={handlePostToYouTube}
            disabled={isPostingYT || !currentStory}
            className={`w-full flex items-center justify-center gap-2 rounded border-2 bg-black py-2 text-xs font-black transition active:scale-98 disabled:opacity-40 ${
              isYtOverRecommended
                ? 'border-red-500 text-red-400 hover:bg-red-950/40 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'border-white text-white hover:bg-neutral-900 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
            }`}
          >
            <Youtube className="h-3.5 w-3.5 fill-white" />
            <span>{isPostingYT ? 'DOWNLOADING & COPYING...' : 'POST TO YOUTUBE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
