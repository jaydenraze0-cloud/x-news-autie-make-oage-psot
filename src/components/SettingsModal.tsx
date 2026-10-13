import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Settings,
  Upload,
  Check,
  RotateCcw,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { AppSettings } from '../types';
import { removeBlackBackground } from '../utils/imageRemoval';
import { DEFAULT_SETTINGS } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [rawLogoUrl, setRawLogoUrl] = useState<string>(settings.logoDataUrl);
  const [newConflict, setNewConflict] = useState('');
  const logoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(settings);
    setRawLogoUrl(settings.logoDataUrl);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setRawLogoUrl(dataUrl);
        if (formData.removeLogoBackground) {
          const processed = await removeBlackBackground(dataUrl);
          setFormData((prev) => ({ ...prev, logoDataUrl: processed }));
        } else {
          setFormData((prev) => ({ ...prev, logoDataUrl: dataUrl }));
        }
        onShowToast('Logo loaded successfully', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleRemoveBackground = async (removeBg: boolean) => {
    setFormData((prev) => ({ ...prev, removeLogoBackground: removeBg }));
    if (removeBg && rawLogoUrl) {
      const processed = await removeBlackBackground(rawLogoUrl);
      setFormData((prev) => ({ ...prev, logoDataUrl: processed }));
    } else {
      setFormData((prev) => ({ ...prev, logoDataUrl: rawLogoUrl }));
    }
  };

  const handleAddConflict = () => {
    if (newConflict.trim() && !formData.trackedConflicts.includes(newConflict.trim())) {
      setFormData((prev) => ({
        ...prev,
        trackedConflicts: [...prev.trackedConflicts, newConflict.trim()],
      }));
      setNewConflict('');
    }
  };

  const handleRemoveConflict = (conflict: string) => {
    setFormData((prev) => ({
      ...prev,
      trackedConflicts: prev.trackedConflicts.filter((c) => c !== conflict),
    }));
  };

  const handleSaveAll = () => {
    onSave(formData);
    onClose();
    onShowToast('Settings saved successfully', 'success');
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_SETTINGS);
    setRawLogoUrl(DEFAULT_SETTINGS.logoDataUrl);
    onShowToast('Settings reset to defaults', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-white/20 bg-black text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-white" />
            <h2 className="font-extrabold tracking-wider text-base">STUDIO & BRAND SETTINGS</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-xs space-y-6">
          {/* 1. CHANNEL IDENTITY & LOGO */}
          <div className="space-y-3">
            <h3 className="font-bold tracking-wider text-neutral-300 uppercase">
              1. Brand Identity & Logo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 mb-1">Channel Name</label>
                <input
                  type="text"
                  value={formData.channelName}
                  onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                  className="w-full rounded border border-white/20 bg-neutral-950 p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Handle (@username)</label>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="w-full rounded border border-white/20 bg-neutral-950 p-2 text-white"
                />
              </div>
            </div>

            {/* Logo Upload & Background Removal Algorithm */}
            <div className="rounded-lg border border-white/15 bg-neutral-950 p-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-white/30 bg-black shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                    {formData.logoDataUrl ? (
                      <img
                        src={formData.logoDataUrl}
                        alt="Logo Preview"
                        className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                      />
                    ) : (
                      <span className="text-sm font-black">S</span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-white block">Channel Watermark Logo</span>
                    <span className="text-[11px] text-neutral-400">
                      Standard: white stylized "S" in vertical capsule outline
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => logoFileRef.current?.click()}
                    className="flex items-center gap-1 rounded bg-white px-3 py-1.5 font-bold text-black shadow-[0_0_10px_rgba(255,255,255,0.5)] transition hover:bg-neutral-200"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      let processed = '/brand/logo.svg';
                      if (formData.removeLogoBackground) {
                        try {
                          processed = await removeBlackBackground('/brand/logo.svg');
                        } catch {
                          // fallback
                        }
                      }
                      setFormData({ ...formData, logoDataUrl: processed });
                    }}
                    title="Reset to Stark News 'S' logo"
                    className="flex items-center gap-1 rounded border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:border-white/50 hover:text-white"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset Default</span>
                  </button>
                  <input
                    type="file"
                    ref={logoFileRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
              {/* Black background removal toggle */}
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <div>
                  <span className="font-semibold text-white block">Auto Black-Background Removal</span>
                  <span className="text-[11px] text-neutral-400">
                    Converts black background pixels to full transparency via canvas algorithm.
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.removeLogoBackground}
                    onChange={(e) => handleToggleRemoveBackground(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-5 w-9 rounded-full bg-neutral-800 peer-checked:bg-white after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-black after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                </label>
              </div>
            </div>
          </div>

          {/* 2. GLOBAL GLOW SYSTEM DEFAULTS */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h3 className="font-bold tracking-wider text-neutral-300 uppercase">
              2. Glow Signature Lighting
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Glow Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.glowDefaults.color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        glowDefaults: { ...formData.glowDefaults, color: e.target.value },
                      })
                    }
                    className="h-7 w-9 cursor-pointer rounded border border-white/20 bg-black"
                  />
                  <span className="font-mono text-white">{formData.glowDefaults.color}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Intensity</span>
                  <span className="text-white font-mono">{formData.glowDefaults.intensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.glowDefaults.intensity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      glowDefaults: { ...formData.glowDefaults, intensity: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Spread</span>
                  <span className="text-white font-mono">{formData.glowDefaults.spread}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={formData.glowDefaults.spread}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      glowDefaults: { ...formData.glowDefaults, spread: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-white"
                />
              </div>
            </div>
          </div>

          {/* 3. CAPTIONS & PLATFORM TARGETS */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h3 className="font-bold tracking-wider text-neutral-300 uppercase">
              3. Captions & Social Distribution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-400 mb-1">Default Caption Language</label>
                <select
                  value="en"
                  disabled
                  className="w-full rounded border border-white/20 bg-neutral-950 p-2 text-white opacity-80 cursor-not-allowed"
                >
                  <option value="en">English (International Broadcast - EN)</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Live Feed Polling Interval</label>
                <select
                  value={formData.pollInterval}
                  onChange={(e) =>
                    setFormData({ ...formData, pollInterval: Number(e.target.value) })
                  }
                  className="w-full rounded border border-white/20 bg-neutral-950 p-2 text-white"
                >
                  <option value={15}>15 Seconds (Rapid)</option>
                  <option value={30}>30 Seconds (Default Standard)</option>
                  <option value={60}>60 Seconds (Conservative)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Default Hashtags</label>
              <input
                type="text"
                value={formData.defaultHashtags}
                onChange={(e) => setFormData({ ...formData, defaultHashtags: e.target.value })}
                className="w-full rounded border border-white/20 bg-neutral-950 p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">YouTube Closing Sentence</label>
              <input
                type="text"
                value={formData.closingSentence}
                onChange={(e) => setFormData({ ...formData, closingSentence: e.target.value })}
                className="w-full rounded border border-white/20 bg-neutral-950 p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">YouTube Channel Posts Page URL</label>
              <input
                type="url"
                value={formData.youtubePostsUrl}
                onChange={(e) => setFormData({ ...formData, youtubePostsUrl: e.target.value })}
                placeholder="https://www.youtube.com/@Stark-News-x/posts"
                className="w-full rounded border border-white/20 bg-neutral-950 p-2 text-white"
              />
            </div>
          </div>

          {/* 4. TRACKED CONFLICTS & RADAR TOPICS */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h3 className="font-bold tracking-wider text-neutral-300 uppercase">
              4. Tracked Geopolitical Conflicts & Theatres
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newConflict}
                onChange={(e) => setNewConflict(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddConflict()}
                placeholder="Add conflict (e.g. Baltic Sea, Armenia-Azerbaijan)..."
                className="flex-1 rounded border border-white/20 bg-neutral-950 p-2 text-white"
              />
              <button
                onClick={handleAddConflict}
                className="flex items-center gap-1 rounded bg-white px-3 font-bold text-black"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.trackedConflicts.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-neutral-900 px-2.5 py-1 text-[11px] text-white"
                >
                  <span>{c}</span>
                  <button
                    onClick={() => handleRemoveConflict(c)}
                    className="text-neutral-400 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded border border-white/20 px-3 py-1.5 font-medium text-neutral-300 hover:bg-neutral-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 rounded bg-white px-4 py-1.5 font-extrabold text-black shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            >
              <Check className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
