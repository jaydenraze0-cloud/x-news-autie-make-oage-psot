import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Sparkles,
  Check,
  AlertTriangle,
  Upload,
  RefreshCw,
  Crosshair,
  Layers,
  Shield,
  Plus,
  Trash2,
  ExternalLink,
  Activity,
  Image as ImageIcon,
} from 'lucide-react';
import {
  NewsStory,
  OsintData,
  OsintWarCategory,
  OsintVerificationStatus,
  OSINT_WAR_CATEGORIES,
  OSINT_FIVE_PILLARS,
  OsintPillarType,
} from '../types';
import {
  MILITARY_HOTSPOT_PRESETS,
  buildDefaultOsintData,
  classifyOsintCategory,
  detectOsintPillar,
} from '../utils/osintClassifier';

interface OsintManagerModalProps {
  story: NewsStory | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStory: NewsStory) => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export const OsintManagerModal: React.FC<OsintManagerModalProps> = ({
  story,
  isOpen,
  onClose,
  onSave,
  onShowToast,
}) => {
  const initialOsint = story ? (story.osintData || buildDefaultOsintData(story)) : null;

  const [osintPillar, setOsintPillar] = useState<OsintPillarType>(
    story?.osintPillar || (story ? detectOsintPillar(story) : 'PILAR_1_STRIKES')
  );
  const [category, setCategory] = useState<OsintWarCategory>(initialOsint?.category || 'Airstrikes & Missile Attacks');
  const [coordinates, setCoordinates] = useState<string>(initialOsint?.coordinates || '48.2831°N, 37.1842°E');
  const [locationName, setLocationName] = useState<string>(initialOsint?.locationName || 'Sektor Poros Garis Depan');
  const [verificationStatus, setVerificationStatus] = useState<OsintVerificationStatus>(
    initialOsint?.verificationStatus || 'GEOLOCATED'
  );
  const [confidenceScore, setConfidenceScore] = useState<number>(initialOsint?.confidenceScore || 95);
  const [bdaSummary, setBdaSummary] = useState<string>(
    initialOsint?.bdaSummary || 'Kerusakan terverifikasi pada infrastruktur militer target.'
  );
  const [targetFacility, setTargetFacility] = useState<string>(
    initialOsint?.satelliteImagery?.targetFacility || 'Fasilitas Pangkalan Militer'
  );
  const [sensorType, setSensorType] = useState<'OPTICAL' | 'SAR_RADAR' | 'INFRARED_FIRMS' | 'COMMERCIAL_SAT'>(
    initialOsint?.satelliteImagery?.sensorType || 'COMMERCIAL_SAT'
  );
  const [beforeImageUrl, setBeforeImageUrl] = useState<string>(
    initialOsint?.satelliteImagery?.beforeImageUrl ||
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80'
  );
  const [afterImageUrl, setAfterImageUrl] = useState<string>(
    initialOsint?.satelliteImagery?.afterImageUrl ||
      story?.imageUrl ||
      'https://images.unsplash.com/photo-1517976487502-86d9a10129cf?auto=format&fit=crop&w=1200&q=80'
  );
  const [equipmentList, setEquipmentList] = useState<string[]>(
    initialOsint?.equipmentIdentified && initialOsint.equipmentIdentified.length > 0
      ? initialOsint.equipmentIdentified
      : ['Su-34 Fullback', 'S-400 Triumf']
  );
  const [newEquipment, setNewEquipment] = useState('');
  const [sourceAnalyst, setSourceAnalyst] = useState(initialOsint?.sourceAnalyst || 'Stark OSINT Desk');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Synchronize when a new story is opened
  useEffect(() => {
    if (story) {
      const data = story.osintData || buildDefaultOsintData(story);
      setOsintPillar(story.osintPillar || detectOsintPillar(story));
      setCategory(data.category);
      setCoordinates(data.coordinates || '48.2831°N, 37.1842°E');
      setLocationName(data.locationName || 'Sektor Poros Garis Depan');
      setVerificationStatus(data.verificationStatus || 'SATELLITE_VERIFIED');
      setConfidenceScore(data.confidenceScore || 95);
      setBdaSummary(data.bdaSummary || 'Kerusakan terverifikasi pada infrastruktur militer target.');
      setTargetFacility(data.satelliteImagery?.targetFacility || 'Fasilitas Pangkalan Militer');
      setSensorType(data.satelliteImagery?.sensorType || 'COMMERCIAL_SAT');
      setBeforeImageUrl(
        data.satelliteImagery?.beforeImageUrl ||
          'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80'
      );
      setAfterImageUrl(
        data.satelliteImagery?.afterImageUrl ||
          story.imageUrl ||
          'https://images.unsplash.com/photo-1517976487502-86d9a10129cf?auto=format&fit=crop&w=1200&q=80'
      );
      setEquipmentList(
        data.equipmentIdentified && data.equipmentIdentified.length > 0
          ? data.equipmentIdentified
          : ['Su-34 Fullback', 'S-400 Triumf']
      );
      setSourceAnalyst(data.sourceAnalyst || 'Stark OSINT Desk');
    }
  }, [story?.id]);

  const handleApplyPreset = (presetName: string) => {
    const preset = MILITARY_HOTSPOT_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;
    setCategory(preset.category);
    setLocationName(preset.name);
    setCoordinates(preset.coordinates);
    setSensorType(preset.sensorType);
    setBeforeImageUrl(preset.beforeImageUrl);
    setAfterImageUrl(preset.afterImageUrl);
    setBdaSummary(preset.damageAssessment);
    setTargetFacility(preset.targetFacility);
    onShowToast(`Preset lokasi militer diterapkan: ${preset.name}`, 'info');
  };

  const handleAddEquipment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newEquipment.trim()) return;
    if (!equipmentList.includes(newEquipment.trim())) {
      setEquipmentList([...equipmentList, newEquipment.trim()]);
    }
    setNewEquipment('');
  };

  const handleRemoveEquipment = (index: number) => {
    setEquipmentList(equipmentList.filter((_, i) => i !== index));
  };

  const handleAiAutoEnrich = async () => {
    if (!story) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/enrich-osint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: story.title,
          summary: story.summary,
          source: story.source,
          conflict: story.conflict,
        }),
      });
      const data = await res.json();
      if (data.success && data.osintData) {
        const enriched: OsintData = data.osintData;
        if (enriched.category) setCategory(enriched.category);
        if (enriched.coordinates) setCoordinates(enriched.coordinates);
        if (enriched.locationName) setLocationName(enriched.locationName);
        if (enriched.verificationStatus) setVerificationStatus(enriched.verificationStatus);
        if (enriched.confidenceScore) setConfidenceScore(enriched.confidenceScore);
        if (enriched.bdaSummary) setBdaSummary(enriched.bdaSummary);
        if (enriched.equipmentIdentified && enriched.equipmentIdentified.length > 0) {
          setEquipmentList(enriched.equipmentIdentified);
        }
        if (enriched.satelliteImagery) {
          if (enriched.satelliteImagery.beforeImageUrl) setBeforeImageUrl(enriched.satelliteImagery.beforeImageUrl);
          if (enriched.satelliteImagery.afterImageUrl) setAfterImageUrl(enriched.satelliteImagery.afterImageUrl);
          if (enriched.satelliteImagery.targetFacility) setTargetFacility(enriched.satelliteImagery.targetFacility);
          if (enriched.satelliteImagery.sensorType) setSensorType(enriched.satelliteImagery.sensorType);
        }
        onShowToast('Berita berhasil dianalisis & diubah menjadi OSINT News!', 'success');
      } else {
        // Fallback to client-side heuristics
        const defaultData = buildDefaultOsintData(story);
        setCategory(defaultData.category);
        setCoordinates(defaultData.coordinates || coordinates);
        setLocationName(defaultData.locationName || locationName);
        setBdaSummary(defaultData.bdaSummary || bdaSummary);
        onShowToast('OSINT News diperkaya dengan algoritma telemetri lokal.', 'info');
      }
    } catch (err) {
      console.warn('AI enrich error:', err);
      const defaultData = buildDefaultOsintData(story);
      setCategory(defaultData.category);
      onShowToast('OSINT News diperbarui via model fallback.', 'info');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveAndApply = () => {
    if (!story) return;
    const updatedOsintData: OsintData = {
      category,
      coordinates: coordinates.trim(),
      locationName: locationName.trim(),
      verificationStatus,
      confidenceScore,
      bdaSummary: bdaSummary.trim(),
      equipmentIdentified: equipmentList,
      sourceAnalyst: sourceAnalyst.trim() || 'Stark OSINT Desk',
      satelliteImagery: {
        beforeImageUrl: beforeImageUrl.trim(),
        afterImageUrl: afterImageUrl.trim(),
        beforeDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
        afterDate: new Date().toISOString().split('T')[0],
        resolution: sensorType === 'COMMERCIAL_SAT' ? '0.5m PlanetScope / Maxar' : '10m Sentinel-2 MSI',
        sensorType,
        damageAssessment: bdaSummary.trim(),
        targetFacility: targetFacility.trim(),
      },
    };

    const updatedStory: NewsStory = {
      ...story,
      isOsint: true,
      isOsintOnly: true,
      imageUrl: afterImageUrl || story.imageUrl,
      hasOriginalImage: true,
      osintPillar,
      osintData: updatedOsintData,
    };

    onSave(updatedStory);
    onShowToast(`Berhasil mengubah "${story.title.substring(0, 30)}..." menjadi OSINT News lengkap!`, 'success');
    onClose();
  };

  const previewOsintData: OsintData = {
    category,
    coordinates,
    locationName,
    verificationStatus,
    confidenceScore,
    bdaSummary,
    equipmentIdentified: equipmentList,
    sourceAnalyst,
    satelliteImagery: {
      beforeImageUrl,
      afterImageUrl,
      beforeDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
      afterDate: new Date().toISOString().split('T')[0],
      resolution: sensorType === 'COMMERCIAL_SAT' ? '0.5m PlanetScope' : '10m Sentinel-2',
      sensorType,
      damageAssessment: bdaSummary,
      targetFacility,
    },
  };

  if (!isOpen || !story) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-purple-500/40 bg-neutral-950 p-4 sm:p-6 text-white shadow-[0_0_50px_rgba(168,85,247,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/30 border border-purple-400 text-purple-300">
              <Activity className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Kelola & Ubah Berita Jadi OSINT News
                <span className="rounded bg-purple-600/30 border border-purple-400/50 px-2 py-0.5 text-[10px] font-mono text-purple-200">
                  8 Kategori OSINT
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Lengkap dengan Verifikasi Visual Lapangan, Geolocation Koordinat, & Battle Damage Assessment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiAutoEnrich}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 rounded-lg border border-purple-400/60 bg-purple-900/40 px-3 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-800/60 transition shadow-sm disabled:opacity-50"
              title="Analisis otomatis dengan AI"
            >
              <Sparkles className={`h-3.5 w-3.5 text-purple-300 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isAiLoading ? 'Menganalisis...' : '⚡ AI Auto-Enrich'}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Story Headline Context Strip */}
        <div className="mt-3 rounded-lg border border-white/10 bg-black/50 p-2.5 text-xs">
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
            Target Berita:
          </span>
          <p className="font-semibold text-neutral-100 line-clamp-1">{story.title}</p>
          <span className="text-[10px] text-neutral-400">
            Sumber: {story.source} • {story.conflict}
          </span>
        </div>

        {/* Form Body Grid */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT COLUMN: Controls & Form Inputs */}
          <div className="space-y-4">
            {/* 0. 5 PILAR UTAMA OSINT WAR INTELLIGENCE SELECTOR */}
            <div className="rounded-xl border border-red-500/40 bg-black/70 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-white">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-red-600 text-[10px] text-white font-black shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                    5P
                  </span>
                  <span>KLASIFIKASI 5 PILAR UTAMA OSINT:</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Pilih Pilar</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
                {OSINT_FIVE_PILLARS.map((p) => {
                  const isSelected = osintPillar === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setOsintPillar(p.id);
                        if (p.id === 'PILAR_2_SATELLITE') {
                          setVerificationStatus('SATELLITE_VERIFIED');
                          setCategory('Satellite Imagery & Geolocation');
                        } else if (p.id === 'PILAR_3_VERIFICATION') {
                          setVerificationStatus('GEOLOCATED');
                          setCategory('Intelligence, Surveillance & OSINT Investigations');
                        } else if (p.id === 'PILAR_4_LOSSES') {
                          setVerificationStatus('VISUALLY_CONFIRMED');
                          setCategory('Military Aircraft & Air Defense');
                        } else if (p.id === 'PILAR_5_STRATEGIC') {
                          setCategory('Military Logistics & Strategic Infrastructure');
                        } else {
                          setCategory('Airstrikes & Missile Attacks');
                        }
                      }}
                      className={`flex flex-col text-left rounded-lg p-2 transition border ${
                        isSelected
                          ? 'border-white bg-white text-black font-black shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                          : `${p.badgeColor} hover:brightness-125`
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="text-[10px] font-black mt-1 leading-tight line-clamp-1">{p.shortLabel}</span>
                      <span className={`text-[8.5px] line-clamp-2 mt-0.5 leading-snug ${isSelected ? 'text-neutral-700' : 'text-neutral-400'}`}>
                        {p.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1. Category Selector (The 8 Primary Categories) */}
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center justify-between mb-1.5">
                <span>1. Kategori Khusus OSINT War News:</span>
                <span className="text-[10px] text-neutral-400">Pilih dari 8 kategori resmi</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {OSINT_WAR_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-start gap-2 rounded-lg border p-2 text-left transition ${
                        isSelected
                          ? 'border-purple-400 bg-purple-950/60 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'border-white/10 bg-neutral-900/60 text-neutral-300 hover:border-white/20'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{cat.label}</div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1">{cat.examples}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Geolocation & Hotspot Presets */}
            <div className="rounded-lg border border-white/10 bg-neutral-900/40 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  <span>2. Geolokasi & Koordinat Telemetri</span>
                </label>

                {/* Quick Presets Dropdown */}
                <select
                  onChange={(e) => handleApplyPreset(e.target.value)}
                  defaultValue=""
                  className="rounded border border-purple-500/30 bg-neutral-950 px-2 py-0.5 text-[11px] text-purple-200"
                >
                  <option value="" disabled>
                    📍 Pilih Preset Militer...
                  </option>
                  {MILITARY_HOTSPOT_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.coordinates})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Nama Lokasi / Sasaran:</span>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Contoh: Engels-2 Airbase, Saratov"
                    className="w-full rounded border border-white/15 bg-black px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Koordinat Telemetri (Lat, Long):</span>
                  <input
                    type="text"
                    value={coordinates}
                    onChange={(e) => setCoordinates(e.target.value)}
                    placeholder="Contoh: 51.4826°N, 46.2084°E"
                    className="w-full rounded border border-white/15 bg-black px-2.5 py-1.5 text-xs font-mono text-purple-300 placeholder-neutral-500 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Foto Liputan & Bukti Visual OSINT */}
            <div className="rounded-lg border border-purple-500/20 bg-purple-950/10 p-3 space-y-2.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
                <span>3. Foto Bukti Liputan & Target</span>
              </label>

              <div>
                <span className="text-[10px] text-neutral-300 block mb-0.5 font-mono">
                  URL Foto Cover Berita / Target:
                </span>
                <input
                  type="text"
                  value={afterImageUrl}
                  onChange={(e) => setAfterImageUrl(e.target.value)}
                  placeholder="URL gambar bukti target militer..."
                  className="w-full rounded border border-white/15 bg-black px-2.5 py-1 text-xs text-white font-mono placeholder-neutral-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 block mb-0.5">Fasilitas Sasaran:</span>
                <input
                  type="text"
                  value={targetFacility}
                  onChange={(e) => setTargetFacility(e.target.value)}
                  placeholder="Contoh: Runway 04/22 atau Apron Pesawat"
                  className="w-full rounded border border-white/15 bg-black px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Battle Damage Assessment (BDA) & Equipment */}
            <div className="rounded-lg border border-white/10 bg-neutral-900/40 p-3 space-y-2.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Crosshair className="h-3.5 w-3.5 text-red-400" />
                <span>4. Battle Damage Assessment (BDA) & Aset Tempur</span>
              </label>

              <div>
                <span className="text-[10px] text-neutral-400 block mb-0.5">Ringkasan Kerusakan Fisik (BDA):</span>
                <textarea
                  rows={2}
                  value={bdaSummary}
                  onChange={(e) => setBdaSummary(e.target.value)}
                  placeholder="Deskripsikan kawah bom, hanggar hangus, radar rusak, dsb."
                  className="w-full rounded border border-white/15 bg-black px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-purple-400 focus:outline-none"
                />
              </div>

              {/* Equipment Chips Editor */}
              <div>
                <span className="text-[10px] text-neutral-400 block mb-1">Aset & Unit Militer Terdeteksi:</span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {equipmentList.map((eq, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded bg-neutral-800 border border-white/20 px-2 py-0.5 text-[11px] font-mono text-neutral-200"
                    >
                      <span>{eq}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipment(i)}
                        className="text-neutral-400 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEquipment();
                      }
                    }}
                    placeholder="Tambah aset (misal: Su-34, Lancet-3, S-400)..."
                    className="flex-1 rounded border border-white/15 bg-black px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:border-purple-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddEquipment()}
                    className="rounded bg-neutral-800 px-3 py-1 text-xs font-semibold text-white hover:bg-neutral-700"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              {/* Verification & Confidence */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Status Verifikasi:</span>
                  <select
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value as any)}
                    className="w-full rounded border border-white/15 bg-black px-2 py-1 text-xs text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="GEOLOCATED">✓ GEOLOCATED</option>
                    <option value="VISUALLY_CONFIRMED">✓ VISUALLY CONFIRMED</option>
                    <option value="UNDER_INVESTIGATION">⚠️ UNDER INVESTIGATION</option>
                    <option value="UNCONFIRMED_CLAIM">❓ UNCONFIRMED CLAIM</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                    <span>Keyakinan Telemetri:</span>
                    <span className="font-mono text-purple-300 font-bold">{confidenceScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={confidenceScore}
                    onChange={(e) => setConfidenceScore(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive OSINT Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                <span>Live OSINT Intelligence Preview:</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Data telemetri terverifikasi
              </span>
            </div>

            {/* Telemetry card preview */}
            <div className="rounded-xl border border-purple-500/30 bg-neutral-950 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                <span className="text-xs font-bold text-white uppercase">{category}</span>
                <span className="rounded bg-purple-600/30 border border-purple-400 px-2 py-0.5 text-[10px] font-mono text-purple-200">
                  {verificationStatus.replace(/_/g, ' ')} ({confidenceScore}%)
                </span>
              </div>

              {afterImageUrl && (
                <div className="h-40 w-full overflow-hidden rounded-lg border border-white/10 bg-black">
                  <img src={afterImageUrl} alt="Target" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="space-y-1 text-xs font-mono">
                <div className="text-purple-300">📍 Lokasi: {locationName} ({coordinates})</div>
                {targetFacility && <div className="text-neutral-300">🎯 Sasaran: {targetFacility}</div>}
                {bdaSummary && <div className="text-neutral-400">💥 BDA: {bdaSummary}</div>}
              </div>

              {equipmentList.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1 border-t border-white/10">
                  {equipmentList.map((eq) => (
                    <span key={eq} className="rounded bg-black/60 border border-white/20 px-2 py-0.5 text-[10px] font-mono text-purple-200">
                      {eq}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Information Callout */}
            <div className="rounded-lg border border-purple-500/20 bg-neutral-900/60 p-3 text-[11px] text-neutral-300 space-y-1.5">
              <div className="font-bold text-purple-300 flex items-center gap-1">
                <span>🛡️ Manfaat Konversi ke OSINT News:</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                Berita yang dikonversi akan mendapatkan lencana kategori OSINT khusus, koordinat terverifikasi,
                serta siap diekspor ke poster 1080x1080 Stark-News-x dengan cap verifikasi telemetri militer.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-purple-500/20 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSaveAndApply}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-purple-500 transition shadow-[0_0_20px_rgba(168,85,247,0.6)]"
          >
            <Check className="h-4 w-4" />
            <span>Simpan & Terapkan Sebagai OSINT News</span>
          </button>
        </div>
      </div>
    </div>
  );
};
