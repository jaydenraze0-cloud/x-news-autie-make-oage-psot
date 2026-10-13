import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { LiveFeed } from './components/LiveFeed';
import { SquareEditor } from './components/SquareEditor';
import { CaptionsPanel } from './components/CaptionsPanel';
import { SettingsModal } from './components/SettingsModal';
import { DraftsDrawer } from './components/DraftsDrawer';
import { WarDataVizModal } from './components/WarDataVizModal';
import { FeedManagerModal } from './components/FeedManagerModal';
import { StoryDetailModal } from './components/StoryDetailModal';
import { OsintManagerModal } from './components/OsintManagerModal';
import { Toast, ToastMessage } from './components/Toast';
import { NewsStory, EditorConfig, AppSettings, DraftItem, FeedMonitor, ConnectedTelegramGroup } from './types';
import {
  loadSettings,
  saveSettings,
  loadDrafts,
  saveDrafts,
  loadFeedMonitors,
  saveFeedMonitors,
  loadConnectedTelegramGroups,
  saveConnectedTelegramGroups,
  markTelegramHandleDeleted,
  restoreDefaultTelegramGroups,
  createDefaultEditorConfig,
  applyStoryToEditorConfig,
  saveEditorStylePreferences,
  clearEditorStylePreferences,
  saveCurrentEditorConfig,
  loadCurrentEditorConfig,
  hasSavedEditorConfig,
} from './utils/storage';
import { detectMilitaryTracking } from './utils/militaryTracker';
import { analyzeStorySentiment } from './utils/sentimentAnalyzer';
import { buildDefaultOsintData, detectOsintPillar } from './utils/osintClassifier';
import { deduplicateStories } from './utils/dedupStories';
import { playNewsAlertSound } from './utils/sound';
import { removeBlackBackground } from './utils/imageRemoval';
import { Radio, Layout, Share2, Layers, Columns3 } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [drafts, setDrafts] = useState<DraftItem[]>(() => loadDrafts());
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [newStoryIds, setNewStoryIds] = useState<Set<string>>(new Set());
  const [selectedStory, setSelectedStory] = useState<NewsStory | null>(null);
  const [editorConfig, setEditorConfig] = useState<EditorConfig>(() =>
    loadCurrentEditorConfig(settings)
  );
  const [captionX, setCaptionX] = useState<string>('');
  const [captionYouTube, setCaptionYouTube] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<'id' | 'en'>('en');
  const [isPolling, setIsPolling] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRegeneratingCaptions, setIsRegeneratingCaptions] = useState(false);
  const [isResolvingImage, setIsResolvingImage] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [aiAvailable, setAiAvailable] = useState(false);

  // Modals, Detail View & Navigation Tabs
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [isDataVizOpen, setIsDataVizOpen] = useState(false);
  const [isFeedManagerOpen, setIsFeedManagerOpen] = useState(false);
  const [isOsintManagerOpen, setIsOsintManagerOpen] = useState(false);
  const [osintStoryToManage, setOsintStoryToManage] = useState<NewsStory | null>(null);
  const [detailStory, setDetailStory] = useState<NewsStory | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRealtimeInterceptsOpen, setIsRealtimeInterceptsOpen] = useState(false);
  const [recentIntercepts, setRecentIntercepts] = useState<NewsStory[]>([]);
  const [unreadInterceptsCount, setUnreadInterceptsCount] = useState(0);
  const [feedMonitors, setFeedMonitors] = useState<FeedMonitor[]>(() => loadFeedMonitors());
  const [telegramGroups, setTelegramGroups] = useState<ConnectedTelegramGroup[]>(() =>
    loadConnectedTelegramGroups()
  );
  const [activeTab, setActiveTab] = useState<'feed' | 'editor' | 'captions'>('feed');
  const [isThreeColumnMode, setIsThreeColumnMode] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const previousStoryIdsRef = useRef<Set<string>>(new Set());

  const xTrackedCount = feedMonitors.filter(
    (f) =>
      f.type === 'X_ACCOUNT' ||
      Boolean(f.xHandle) ||
      f.url.includes('x.com/') ||
      f.url.includes('twitter.com/')
  ).length;

  // Track and display all incoming stories from monitored sources without dropping feeds
  const displayedStories = useMemo(() => {
    return stories;
  }, [stories]);

  // Sync feed monitors to server on boot and track all feeds
  useEffect(() => {
    fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sources: feedMonitors }),
    })
      .then(() => {
        if (feedMonitors.length > 0 && feedMonitors.some((f) => f.enabled)) {
          fetchNews(true);
        } else {
          setStories([]);
        }
      })
      .catch((err) => {
        console.warn('Sources sync warning:', err);
        if (feedMonitors.length > 0 && feedMonitors.some((f) => f.enabled)) {
          fetchNews(true);
        } else {
          setStories([]);
        }
      });
  }, []);

  // Toast notification dispatcher
  const showToast = useCallback((text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize and check logo transparency on boot
  useEffect(() => {
    const checkLogo = async () => {
      if (settings.removeLogoBackground && settings.logoDataUrl === '/brand/logo.svg') {
        try {
          const processed = await removeBlackBackground('/brand/logo.svg');
          const updated = { ...settings, logoDataUrl: processed };
          setSettings(updated);
          saveSettings(updated);
        } catch (e) {
          console.debug('Default logo processing completed', e);
        }
      }
    };
    checkLogo();
  }, []);

  // Check server health and AI status
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.aiEnabled) {
          setAiAvailable(true);
        }
      })
      .catch((err) => console.debug('Status check note:', err));
  }, []);

  // Generate captions and editorial headline using AI / template
  const generateCaptionsForStory = useCallback(
    async (
      story: NewsStory,
      targetLang: 'id' | 'en' = 'en',
      focusStyle: 'in-depth' | 'tactical' | 'geopolitical' = 'in-depth'
    ) => {
      setIsRegeneratingCaptions(true);
      try {
        const tracking = story.militaryTracking || detectMilitaryTracking(story);
        const res = await fetch('/api/ai/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: story.title,
            summary: story.summary,
            source: story.source,
            category: story.osintCategory || story.intelligenceType || story.locationTag,
            xHandle: story.xHandle,
            author: story.xAuthorName,
            targetLang: 'en',
            focusStyle,
            militaryTracking: tracking,
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
          setEditorConfig((prev) => {
            const updated = {
              ...prev,
              headline: data.headline,
              highlightWords: highlightList.length > 0 ? highlightList : prev.highlightWords,
              badge: {
                ...prev.badge,
                show: prev.badge?.show ?? true,
                text: story.isBreaking ? 'BREAKING' : (prev.badge?.text || 'INTEL UPDATE'),
              },
              sourceLine: {
                ...prev.sourceLine,
                show: prev.sourceLine?.show ?? true,
                text: `Source: ${story.xHandle ? `@${story.xHandle}` : story.source} • ${new Date(story.pubDate).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                )}`,
              },
            };
            saveCurrentEditorConfig(updated);
            saveEditorStylePreferences(updated);
            return updated;
          });
        }
        if (data.caption_x) {
          setCaptionX(data.caption_x);
        }
        if (data.caption_youtube) {
          setCaptionYouTube(data.caption_youtube);
        }
        if (data.aiAvailable) {
          setAiAvailable(true);
        }
      } catch (err: any) {
        console.warn('AI caption rewrite failed, using template:', err);
      } finally {
        setIsRegeneratingCaptions(false);
      }
    },
    []
  );

  // Select a story from the feed
  const handleSelectStory = useCallback(
    (story: NewsStory, switchTab = false) => {
      setSelectedStory(story);

      // Apply the selected story to the editor while strictly preserving
      // all user styling choices (font size, colors, photo gradient, zoom, position, etc.)
      setEditorConfig((prevConfig) => {
        const updated = applyStoryToEditorConfig(
          prevConfig,
          story.title,
          story.imageUrl,
          story.source,
          story.isBreaking
        );
        saveEditorStylePreferences(updated);
        return updated;
      });

      // Immediately populate with the actual news content so the user instantly sees the selected story facts
      const hashtagsStr = settings.defaultHashtags || '#StarkNews #BreakingNews #Geopolitics';
      const cleanSum = (story.summary || '').replace(/\s+/g, ' ').trim();
      const firstSentence = cleanSum ? cleanSum.split(/(?<=[.!?])\s+/)[0] : '';
      let initialCaptionX = `${story.title}. ${firstSentence}`.trim();
      if (initialCaptionX.length > 200) {
        initialCaptionX = initialCaptionX.substring(0, 197) + '...';
      }
      setCaptionX(`${initialCaptionX}\n\nFollow @Stark-News-x ${hashtagsStr}`);

      const initialCaptionYT = `${story.title}\n\n${cleanSum || story.title}\n\nFollow @Stark-News-x for breaking news updates. ${hashtagsStr}`;
      setCaptionYouTube(initialCaptionYT);

      // Auto-resolve exact real news photo from publisher website or headline
      if (!story.imageUrl) {
        setIsResolvingImage(true);
      }
      const resolveUrl = `/api/resolve-image?url=${encodeURIComponent(story.link || '')}&title=${encodeURIComponent(story.title || '')}`;
      fetch(resolveUrl)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.imageUrl) {
            setEditorConfig((prev) => ({
              ...prev,
              background: {
                ...prev.background,
                imageUrl: d.imageUrl,
              },
            }));
            setSelectedStory((prev) =>
              prev ? { ...prev, imageUrl: d.imageUrl, hasOriginalImage: true } : prev
            );
            setStories((prev) =>
              prev.map((s) => (s.id === story.id ? { ...s, imageUrl: d.imageUrl, hasOriginalImage: true } : s))
            );
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsResolvingImage(false);
        });

      // Generate captions via AI engine
      generateCaptionsForStory(story, selectedLang);
      if (switchTab) {
        setActiveTab('editor');
      }
    },
    [settings, selectedLang, generateCaptionsForStory]
  );

  const handleOpenEditorForStory = useCallback(
    (story: NewsStory) => {
      handleSelectStory(story, false);
      setActiveTab('editor');
      showToast(`Opening studio for: ${story.title.substring(0, 35)}...`, 'info');
    },
    [handleSelectStory, showToast]
  );

  const handleOpenCaptionsForStory = useCallback(
    (story: NewsStory) => {
      handleSelectStory(story, false);
      setActiveTab('captions');
      showToast('Opening captions & publishing studio', 'info');
    },
    [handleSelectStory, showToast]
  );

  const handleOpenStoryDetail = useCallback((story: NewsStory) => {
    setSelectedStory(story);
    setDetailStory(story);
    setIsDetailModalOpen(true);
  }, []);

  const handleOpenOsintManager = useCallback((story: NewsStory) => {
    setSelectedStory(story);
    setOsintStoryToManage(story);
    setIsOsintManagerOpen(true);
  }, []);

  const handleSaveOsintStory = useCallback(
    (updatedStory: NewsStory) => {
      setStories((prev) =>
        prev.map((s) => (s.id === updatedStory.id ? updatedStory : s))
      );
      if (selectedStory?.id === updatedStory.id) {
        setSelectedStory(updatedStory);
        if (updatedStory.imageUrl) {
          setEditorConfig((prev) => ({
            ...prev,
            background: {
              ...prev.background,
              imageUrl: updatedStory.imageUrl,
            },
          }));
        }
      }
      if (detailStory?.id === updatedStory.id) {
        setDetailStory(updatedStory);
      }
      try {
        const cached = localStorage.getItem('stark_cached_stories');
        if (cached) {
          const list = JSON.parse(cached);
          const nextList = list.map((s: any) => (s.id === updatedStory.id ? updatedStory : s));
          localStorage.setItem('stark_cached_stories', JSON.stringify(nextList));
        }
      } catch {}
    },
    [selectedStory?.id, detailStory?.id]
  );

  // Fetch news stories from API with resilient fallback and timeout protection
  const fetchNews = useCallback(
    async (manual = false) => {
      const currentFeeds = loadFeedMonitors();
      const hasActive = currentFeeds.length > 0 && currentFeeds.some((f) => f.enabled);
      if (!hasActive) {
        setStories([]);
        localStorage.removeItem('stark_cached_stories');
        if (manual) setIsRefreshing(false);
        return;
      }

      if (manual) setIsRefreshing(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        const res = await fetch(`/api/news?forceRefresh=${manual}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();
        if (data.success && Array.isArray(data.stories)) {
          if (data.stories.length === 0) {
            setStories([]);
            setSecondsSinceUpdate(0);
            return;
          }
          const rawIncoming: NewsStory[] = [];
          for (const s of data.stories) {
            if (!s.militaryTracking) {
              s.militaryTracking = detectMilitaryTracking(s);
            }
            if (!s.sentiment) {
              s.sentiment = analyzeStorySentiment(s);
            }
            if (!s.osintData) {
              s.osintData = buildDefaultOsintData(s);
            }
            if (!s.osintPillar) {
              s.osintPillar = detectOsintPillar(s);
            }
            if (s.isUnderTheRadar === undefined) {
              s.isUnderTheRadar =
                Boolean(s.isTelegram) ||
                Boolean(s.isOsint) ||
                s.sentiment?.msmPenetration === 'UNDER_THE_RADAR' ||
                s.sentiment?.msmPenetration === 'EARLY_FIELD_SIGNAL' ||
                !/reuters|apnews|bbc|cnn|aljazeera|nytimes|wsj|washingtonpost/i.test(s.source || '');
            }
            rawIncoming.push(s);
          }

          const incoming = deduplicateStories(rawIncoming);

          // STRICT CHRONOLOGICAL SORTING: Newest uploaded news ALWAYS on top!
          incoming.sort((a, b) => {
            const timeA = a.pubTimestamp || new Date(a.pubDate).getTime() || 0;
            const timeB = b.pubTimestamp || new Date(b.pubDate).getTime() || 0;
            return timeB - timeA;
          });

          // Persist lightweight cached stories to localStorage for instant offline/restart recovery
          try {
            const minimalStories = incoming.slice(0, 25).map((s) => ({
              id: s.id,
              title: s.title,
              summary: s.summary ? s.summary.slice(0, 200) : '',
              link: s.link,
              source: s.source,
              pubDate: s.pubDate,
              imageUrl: s.imageUrl && s.imageUrl.startsWith('data:') ? '' : s.imageUrl,
              conflict: s.conflict,
              eventType: s.eventType,
              isBreaking: s.isBreaking,
              locationTag: s.locationTag,
              intelligenceType: s.intelligenceType,
            }));
            localStorage.setItem('stark_cached_stories', JSON.stringify(minimalStories));
          } catch {
            try {
              localStorage.removeItem('stark_cached_stories');
            } catch {}
          }

          if (previousStoryIdsRef.current.size > 0) {
            const newlyAdded = incoming.filter((s) => !previousStoryIdsRef.current.has(s.id));
            if (newlyAdded.length > 0) {
              const freshIds = new Set(newlyAdded.map((s) => s.id));
              setNewStoryIds(freshIds);

              // Prepend to real-time intercepts
              setRecentIntercepts((prev) => {
                const merged = [...newlyAdded, ...prev];
                const seenMap = new Set<string>();
                return merged
                  .filter((item) => {
                    if (seenMap.has(item.id)) return false;
                    seenMap.add(item.id);
                    return true;
                  })
                  .slice(0, 40);
              });
              setUnreadInterceptsCount((prev) => prev + newlyAdded.length);

              // Audio notification for incoming intel dispatches
              const hasAlertworthy = newlyAdded.some(
                (s) =>
                  s.isBreaking ||
                  s.isUnderTheRadar ||
                  s.sentiment?.threatLevel === 'EXTREME' ||
                  s.sentiment?.category === 'CRITICAL_ESCALATION'
              );
              if (settings.soundEnabled && hasAlertworthy) {
                playNewsAlertSound();
              }

              // Browser desktop push notification if enabled
              if ('Notification' in window && Notification.permission === 'granted') {
                const topNew = newlyAdded[0];
                const msmBadge = topNew.isUnderTheRadar ? '⚡ [NON-MEDIA BESAR]' : '[OSINT RADAR]';
                const threatBadge = topNew.sentiment ? `[${topNew.sentiment.threatLevel}]` : '';
                try {
                  new Notification(`${msmBadge} ${threatBadge} Stark-News-x`, {
                    body: topNew.title,
                    icon: '/brand/logo.svg',
                  });
                } catch {}
              }

              const underTheRadarNewCount = newlyAdded.filter((s) => s.isUnderTheRadar).length;
              showToast(
                `📡 ${newlyAdded.length} new OSINT reports detected${underTheRadarNewCount > 0 ? ` (${underTheRadarNewCount} field intercepts)` : ''}!`,
                'info'
              );
            }
          }

          previousStoryIdsRef.current = new Set(incoming.map((s) => s.id));
          setStories(incoming);
          setSecondsSinceUpdate(0);

          if (manual) {
            showToast(`Radar updated: ${incoming.length} active intelligence dispatches`, 'success');
          }
          if (!selectedStory && !hasSavedEditorConfig() && incoming.length > 0) {
            handleSelectStory(incoming[0], false);
          } else if (selectedStory) {
            // Keep user's current selected story and editorial changes intact
            const matched = incoming.find((s) => s.id === selectedStory.id);
            if (matched) {
              setSelectedStory((prev) => (prev ? { ...matched, title: prev.title } : matched));
            }
          }
        }
      } catch (err: any) {
        console.debug('[Radar] Feeds sync note:', err?.message || err);
        // Fallback: If stories list is empty, restore from persistent local cache ONLY if active feeds exist
        try {
          const currentFeeds = loadFeedMonitors();
          if (currentFeeds.length > 0 && currentFeeds.some((f) => f.enabled)) {
            const raw = localStorage.getItem('stark_cached_stories');
            if (raw) {
              const cachedList: NewsStory[] = JSON.parse(raw);
              if (Array.isArray(cachedList) && cachedList.length > 0) {
                const fullList = cachedList.map((s) => ({
                  ...s,
                  militaryTracking: s.militaryTracking || detectMilitaryTracking(s),
                }));
                setStories((prev) => (prev.length === 0 ? fullList : prev));
                if (!selectedStory) {
                  handleSelectStory(fullList[0], false);
                }
              }
            }
          }
        } catch {}
      } finally {
        if (manual) setIsRefreshing(false);
      }
    },
    [selectedStory, settings, showToast, handleSelectStory]
  );


  // Polling interval timer
  useEffect(() => {
    if (!isPolling) return;
    const intervalSec = settings.pollInterval || 30;
    const pollTimer = setInterval(() => {
      if (feedMonitors.length > 0 && feedMonitors.some((f) => f.enabled)) {
        fetchNews(false);
      }
    }, intervalSec * 1000);
    const secTimer = setInterval(() => {
      setSecondsSinceUpdate((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(pollTimer);
      clearInterval(secTimer);
    };
  }, [isPolling, settings.pollInterval, fetchNews, feedMonitors]);

  const handleRegenerateCaptions = (
    type: 'all' | 'x' | 'youtube',
    focusStyle: 'in-depth' | 'tactical' | 'geopolitical' = 'in-depth'
  ) => {
    if (!selectedStory) return;
    generateCaptionsForStory(selectedStory, 'en', focusStyle);
    showToast(`Synthesizing grounded ${focusStyle} intelligence package in English...`, 'info');
  };

  const handleChangeLang = (lang: 'id' | 'en') => {
    setSelectedLang(lang);
    if (selectedStory) {
      generateCaptionsForStory(selectedStory, lang);
      showToast(`Switched caption language to ${lang === 'id' ? 'Indonesian' : 'English'}`, 'info');
    }
  };

  const handleResetEditor = () => {
    clearEditorStylePreferences();
    const targetTitle = selectedStory?.title || editorConfig.headline;
    const targetImage = selectedStory?.imageUrl || editorConfig.background.imageUrl;
    const targetSource = selectedStory?.source || 'Stark-News-x Radar';
    const isBreaking = selectedStory?.isBreaking ?? false;

    const resetConfig = createDefaultEditorConfig(
      targetTitle,
      targetImage,
      targetSource,
      settings,
      isBreaking,
      null
    );
    setEditorConfig(resetConfig);
    showToast('Pengaturan editor berhasil di-reset ke default pabrik', 'info');
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    setEditorConfig((prev) => ({
      ...prev,
      handleFooter: {
        ...prev.handleFooter,
        text: newSettings.handle || '@Stark-News-x',
      },
    }));
  };

  const handleUpdateDefaultLogo = async (logoUrl: string, removeBg: boolean) => {
    const updatedSettings: AppSettings = {
      ...settings,
      logoDataUrl: logoUrl,
      removeLogoBackground: removeBg,
    };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);

    if (logoUrl.startsWith('data:image/')) {
      try {
        await fetch('/api/brand/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: logoUrl }),
        });
      } catch (err) {
        console.debug('[Stark-News] Server logo sync note:', err);
      }
    }
  };

  const handleLoadDraft = (draft: DraftItem) => {
    setEditorConfig(draft.editorConfig);
    setCaptionX(draft.captionX);
    setCaptionYouTube(draft.captionYouTube);
    showToast(`Loaded draft: ${draft.title.substring(0, 35)}...`, 'success');
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      saveDrafts(updated);
      return updated;
    });
    showToast('Draft deleted', 'info');
  };

  const handleClearAllDrafts = () => {
    setDrafts([]);
    saveDrafts([]);
    showToast('All drafts cleared', 'info');
  };

  const handleUpdateFeedMonitors = useCallback(
    async (updated: FeedMonitor[]) => {
      setFeedMonitors(updated);
      saveFeedMonitors(updated);
      const hasActive = updated.length > 0 && updated.some((f) => f.enabled);
      if (!hasActive) {
        setStories([]);
        localStorage.removeItem('stark_cached_stories');
      }
      try {
        await fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sources: updated }),
        });
        showToast(
          updated.length === 0
            ? 'Semua sumber dikosongkan. Radar bersih.'
            : `Sumber diperbarui: ${updated.filter((f) => f.enabled).length} aktif`,
          'success'
        );
        if (hasActive) {
          fetchNews(true);
        } else {
          setStories([]);
          localStorage.removeItem('stark_cached_stories');
        }
      } catch (err: any) {
        console.error('Failed to sync feed sources:', err);
      }
    },
    [showToast, fetchNews]
  );

  const handleUpdateTelegramGroups = useCallback(
    (updated: ConnectedTelegramGroup[]) => {
      setTelegramGroups(updated);
      saveConnectedTelegramGroups(updated);

      // Synchronize enabled telegram groups into feedMonitors for backend scraping
      setFeedMonitors((prevFeeds) => {
        let modified = false;
        const currentTelegramHandles = new Set(updated.map((g) => g.handle.toLowerCase()));

        // Remove feedMonitors of telegram channels that were deleted, but preserve user custom feeds
        let newFeeds = prevFeeds.filter((f) => {
          if (f.type === 'TELEGRAM_CHANNEL' && !f.isCustom) {
            const handle = (f.queryOrUrl || '').toLowerCase();
            if (!currentTelegramHandles.has(handle)) {
              modified = true;
              return false;
            }
          }
          return true;
        });

        updated.forEach((grp) => {
          const handle = grp.handle.toLowerCase();
          const existingIdx = newFeeds.findIndex(
            (f) =>
              f.queryOrUrl.toLowerCase() === handle ||
              f.url.toLowerCase().includes(`/s/${handle}`)
          );

          if (grp.enabled) {
            if (existingIdx === -1) {
              newFeeds.push({
                id: `feed-tg-${handle}`,
                name: `Telegram @${grp.handle} (${grp.name})`,
                type: 'TELEGRAM_CHANNEL',
                queryOrUrl: grp.handle,
                url: `https://t.me/s/${grp.handle}`,
                enabled: true,
                isOsint: true,
              });
              modified = true;
            } else if (!newFeeds[existingIdx].enabled) {
              newFeeds[existingIdx] = { ...newFeeds[existingIdx], enabled: true };
              modified = true;
            }
          } else {
            if (existingIdx !== -1 && newFeeds[existingIdx].enabled) {
              newFeeds[existingIdx] = { ...newFeeds[existingIdx], enabled: false };
              modified = true;
            }
          }
        });

        if (modified) {
          saveFeedMonitors(newFeeds);
          fetch('/api/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sources: newFeeds }),
          }).catch(() => {});
        }

        return modified ? newFeeds : prevFeeds;
      });

      showToast(
        `Grup Telegram diperbarui: ${updated.filter((g) => g.enabled).length} grup aktif`,
        'info'
      );
    },
    [showToast]
  );

  const handleDeleteTelegramGroup = useCallback(
    (group: ConnectedTelegramGroup) => {
      markTelegramHandleDeleted(group.handle);
      const updated = telegramGroups.filter((g) => g.id !== group.id);
      setTelegramGroups(updated);
      saveConnectedTelegramGroups(updated);

      setFeedMonitors((prevFeeds) => {
        const handle = group.handle.toLowerCase();
        const updatedFeeds = prevFeeds.filter(
          (f) =>
            f.queryOrUrl.toLowerCase() !== handle &&
            !f.url.toLowerCase().includes(`/s/${handle}`)
        );
        saveFeedMonitors(updatedFeeds);
        fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sources: updatedFeeds }),
        }).catch(() => {});
        return updatedFeeds;
      });

      showToast(`Telegram group @${group.handle} removed from radar tracking`, 'info');
    },
    [telegramGroups, showToast]
  );

  const handleRestoreDefaultTelegramGroups = useCallback(() => {
    const defaults = restoreDefaultTelegramGroups();
    handleUpdateTelegramGroups(defaults);
    showToast('All default radar Telegram groups restored', 'success');
  }, [handleUpdateTelegramGroups, showToast]);

  const handleConnectCustomTelegramGroup = useCallback(
    (group: ConnectedTelegramGroup) => {
      const handle = group.handle.toLowerCase();
      const newFeed: FeedMonitor = {
        id: `feed-tg-${handle}`,
        name: `Telegram @${group.handle} (${group.name})`,
        type: 'TELEGRAM_CHANNEL',
        queryOrUrl: group.handle,
        url: `https://t.me/s/${group.handle}`,
        enabled: true,
        isOsint: true,
        isCustom: true,
      };

      setFeedMonitors((prev) => {
        const filtered = prev.filter(
          (f) => f.queryOrUrl.toLowerCase() !== handle && !f.url.includes(`/s/${handle}`)
        );
        const updated = [...filtered, newFeed];
        saveFeedMonitors(updated);
        fetch('/api/sources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sources: updated }),
        }).catch(() => {});
        return updated;
      });

      showToast(`Grup @${group.handle} berhasil dihubungkan ke LiveFeed!`, 'success');
      fetchNews(true);
    },
    [fetchNews, showToast]
  );

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-black text-white selection:bg-white selection:text-black font-sans">
      {/* 1. Global Header */}
      <Header
        isPolling={isPolling}
        onTogglePolling={() => setIsPolling(!isPolling)}
        secondsSinceUpdate={secondsSinceUpdate}
        onManualRefresh={() => fetchNews(true)}
        isRefreshing={isRefreshing}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        drafts={drafts}
        onOpenDrafts={() => setIsDraftsOpen(true)}
        onToggleSound={() => {
          const updated = { ...settings, soundEnabled: !settings.soundEnabled };
          setSettings(updated);
          saveSettings(updated);
          showToast(`Breaking alert sound ${updated.soundEnabled ? 'ENABLED' : 'MUTED'}`, 'info');
        }}
        aiAvailable={aiAvailable}
        onOpenDataViz={() => setIsDataVizOpen(true)}
        onOpenFeedManager={() => setIsFeedManagerOpen(true)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        storyCount={displayedStories.length}
        isThreeColumnMode={isThreeColumnMode}
        onToggleThreeColumnMode={() => setIsThreeColumnMode(!isThreeColumnMode)}
        xTrackedCount={xTrackedCount}
      />

      {/* 2. Main Desktop 3-Column Layout / Mobile & Focused Tabbed Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: LIVE FEED (Radar Berita) */}
        <section
          className={`h-full overflow-hidden ${
            isThreeColumnMode
              ? activeTab === 'feed'
                ? 'w-full xl:w-[400px] shrink-0 block'
                : 'hidden xl:block xl:w-[400px] shrink-0'
              : activeTab === 'feed'
              ? 'w-full block'
              : 'hidden'
          }`}
        >
          <LiveFeed
            stories={displayedStories}
            newStoryIds={newStoryIds}
            selectedStoryId={selectedStory?.id || null}
            onSelectStory={handleSelectStory}
            isLoading={isRefreshing && displayedStories.length === 0}
            onOpenDataViz={() => setIsDataVizOpen(true)}
            onOpenFeedManager={() => setIsFeedManagerOpen(true)}
            onRefresh={() => fetchNews(true)}
            isRefreshing={isRefreshing}
            telegramGroups={telegramGroups}
            onUpdateTelegramGroups={handleUpdateTelegramGroups}
            onDeleteTelegramGroup={handleDeleteTelegramGroup}
            onRestoreDefaultTelegramGroups={handleRestoreDefaultTelegramGroups}
            onConnectCustomTelegramGroup={handleConnectCustomTelegramGroup}
            onOpenStoryDetail={handleOpenStoryDetail}
            onOpenEditorForStory={handleOpenEditorForStory}
            onOpenOsintManager={handleOpenOsintManager}
          />
        </section>

        {/* COLUMN 2: SQUARE 1080x1080 EDITOR (Center Column) */}
        <section
          className={`h-full overflow-hidden border-r border-white/10 ${
            isThreeColumnMode
              ? activeTab === 'editor'
                ? 'w-full xl:flex-1 block'
                : 'hidden xl:block xl:flex-1'
              : activeTab === 'editor'
              ? 'w-full block'
              : 'hidden'
          }`}
        >
          <SquareEditor
            config={editorConfig}
            onChange={(cfg) => {
              setEditorConfig(cfg);
              saveEditorStylePreferences(cfg);
            }}
            settings={settings}
            onReset={handleResetEditor}
            onShowToast={showToast}
            storyImageUrl={selectedStory?.imageUrl}
            storyLink={selectedStory?.link}
            onUpdateDefaultLogo={handleUpdateDefaultLogo}
            isResolvingImage={isResolvingImage}
            onStoryImageResolved={(imgUrl) => {
              setSelectedStory((prev) =>
                prev ? { ...prev, imageUrl: imgUrl, hasOriginalImage: true } : prev
              );
              setStories((prev) =>
                prev.map((s) =>
                  s.id === selectedStory?.id
                    ? { ...s, imageUrl: imgUrl, hasOriginalImage: true }
                    : s
                )
              );
            }}
          />
        </section>

        {/* COLUMN 3: CAPTIONS & ACTION BUTTONS (Right Column) */}
        <section
          className={`h-full overflow-hidden ${
            isThreeColumnMode
              ? activeTab === 'captions'
                ? 'w-full xl:w-[420px] shrink-0 block'
                : 'hidden xl:block xl:w-[420px] shrink-0'
              : activeTab === 'captions'
              ? 'w-full block'
              : 'hidden'
          }`}
        >
          <CaptionsPanel
            captionX={captionX}
            onChangeCaptionX={setCaptionX}
            captionYouTube={captionYouTube}
            onChangeCaptionYouTube={setCaptionYouTube}
            currentStory={selectedStory}
            settings={settings}
            aiAvailable={aiAvailable}
            onRegenerateCaption={handleRegenerateCaptions}
            isRegenerating={isRegeneratingCaptions}
            onShowToast={showToast}
            selectedLang={selectedLang}
            onChangeLang={handleChangeLang}
            headline={editorConfig.headline}
            highlightWords={editorConfig.highlightWords}
            onChangeHeadline={(newHeadline, newHighlights) => {
              setEditorConfig((prev) => {
                const updated = {
                  ...prev,
                  headline: newHeadline,
                  highlightWords: newHighlights && newHighlights.length > 0 ? newHighlights : prev.highlightWords,
                };
                saveCurrentEditorConfig(updated);
                saveEditorStylePreferences(updated);
                return updated;
              });
            }}
            onChangeHighlightWords={(newWords) => {
              setEditorConfig((prev) => {
                const updated = { ...prev, highlightWords: newWords };
                saveCurrentEditorConfig(updated);
                saveEditorStylePreferences(updated);
                return updated;
              });
            }}
          />
        </section>
      </main>

      {/* 3. Mobile / Tablet / Single View Navigation Bottom Bar */}
      <nav className={`flex ${isThreeColumnMode ? 'xl:hidden' : ''} items-center justify-around border-t border-white/15 bg-black py-2.5 text-xs font-bold shrink-0`}>
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'feed'
              ? 'text-white drop-shadow-[0_0_8px_#ffffff]'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Radio className="h-4 w-4 text-red-500" />
          <span>Radar Berita ({stories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'editor'
              ? 'text-white drop-shadow-[0_0_8px_#ffffff]'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Editor Grafis 1080p</span>
        </button>
        <button
          onClick={() => setActiveTab('captions')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'captions'
              ? 'text-white drop-shadow-[0_0_8px_#ffffff]'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Share2 className="h-4 w-4" />
          <span>AI Captions & Teks</span>
        </button>
      </nav>

      {/* 4. Story Detail Briefing Modal */}
      <StoryDetailModal
        story={detailStory}
        allStories={stories}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenInEditor={(s) => {
          handleOpenEditorForStory(s);
        }}
        onOpenInCaptions={(s) => {
          handleOpenCaptionsForStory(s);
        }}
        onOpenOsintManager={handleOpenOsintManager}
      />

      {/* 5. OSINT War Manager / Converter Modal */}
      <OsintManagerModal
        story={osintStoryToManage}
        isOpen={isOsintManagerOpen}
        onClose={() => setIsOsintManagerOpen(false)}
        onSave={handleSaveOsintStory}
        onShowToast={showToast}
      />

      {/* 6. Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onShowToast={showToast}
      />
      <DraftsDrawer
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        drafts={drafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onClearAllDrafts={handleClearAllDrafts}
      />
      <WarDataVizModal
        isOpen={isDataVizOpen}
        onClose={() => setIsDataVizOpen(false)}
        stories={displayedStories}
      />
      <FeedManagerModal
        isOpen={isFeedManagerOpen}
        onClose={() => setIsFeedManagerOpen(false)}
        feedMonitors={feedMonitors}
        onUpdateFeedMonitors={handleUpdateFeedMonitors}
        onRefreshFeeds={() => fetchNews(true)}
      />

      {/* 7. Toast System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
