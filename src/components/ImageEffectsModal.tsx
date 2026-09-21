import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  AppWindow,
  Layers,
  Shield,
  Palette,
  Check,
  Copy,
  Download,
  X,
  RotateCcw,
} from 'lucide-react';
import { ImageEffectsSettings } from '../types';
import { DEFAULT_IMAGE_EFFECTS, renderImageEffects, GRADIENT_PRESETS } from '../utils/effectsUtils';

interface ImageEffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasImageSrc: string | null;
  onApplyToCanvas: (newImageDataUrl: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImageEffectsModal: React.FC<ImageEffectsModalProps> = ({
  isOpen,
  onClose,
  canvasImageSrc,
  onApplyToCanvas,
  onShowToast,
}) => {
  const [settings, setSettings] = useState<ImageEffectsSettings>(DEFAULT_IMAGE_EFFECTS);
  const [activeTab, setActiveTab] = useState<'frame' | 'backdrop' | 'watermark' | 'adjustments'>('frame');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Load source image element
  useEffect(() => {
    if (canvasImageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = canvasImageSrc;
      img.onload = () => {
        sourceImageRef.current = img;
        updatePreview();
      };
    }
  }, [canvasImageSrc]);

  // Re-render preview whenever settings change
  const updatePreview = () => {
    if (!sourceImageRef.current || !previewCanvasRef.current) return;
    const rendered = renderImageEffects(sourceImageRef.current, settings);
    const canvas = previewCanvasRef.current;
    canvas.width = rendered.width;
    canvas.height = rendered.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(rendered, 0, 0);
    }
  };

  useEffect(() => {
    updatePreview();
  }, [settings]);

  if (!isOpen) return null;

  // Preset Styles
  const applyPreset = (preset: 'macos_showcase' | 'clean_shadow' | 'confidential' | 'retro') => {
    switch (preset) {
      case 'macos_showcase':
        setSettings({
          ...DEFAULT_IMAGE_EFFECTS,
          windowFrame: 'macos_dark',
          padding: 40,
          backgroundType: 'gradient',
          gradientPreset: 'sunset',
          cornerRadius: 14,
          shadowEnabled: true,
          shadowBlur: 32,
          shadowOpacity: 0.5,
        });
        break;
      case 'clean_shadow':
        setSettings({
          ...DEFAULT_IMAGE_EFFECTS,
          windowFrame: 'none',
          padding: 32,
          backgroundType: 'solid',
          backgroundColor: '#0f172a',
          cornerRadius: 16,
          shadowEnabled: true,
          shadowBlur: 28,
          shadowOpacity: 0.6,
        });
        break;
      case 'confidential':
        setSettings({
          ...DEFAULT_IMAGE_EFFECTS,
          watermarkEnabled: true,
          watermarkText: 'CONFIDENTIAL • DO NOT SHARE',
          watermarkPosition: 'diagonal_tile',
          watermarkOpacity: 0.3,
          padding: 16,
          borderWidth: 2,
          borderColor: '#ef4444',
        });
        break;
      case 'retro':
        setSettings({
          ...DEFAULT_IMAGE_EFFECTS,
          grayscale: 80,
          sepia: 40,
          contrast: 15,
          padding: 24,
          backgroundType: 'solid',
          backgroundColor: '#1c1917',
          cornerRadius: 8,
        });
        break;
    }
  };

  const handleApply = () => {
    if (!sourceImageRef.current) return;
    const rendered = renderImageEffects(sourceImageRef.current, settings);
    const dataUrl = rendered.toDataURL('image/png');
    onApplyToCanvas(dataUrl);
    onShowToast('Image Effects successfully applied to canvas!', 'success');
    onClose();
  };

  const handleCopy = async () => {
    if (!sourceImageRef.current) return;
    const rendered = renderImageEffects(sourceImageRef.current, settings);
    rendered.toBlob(async (blob) => {
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        onShowToast('Composited image copied to clipboard!', 'success');
      }
    });
  };

  const handleDownload = () => {
    if (!sourceImageRef.current) return;
    const rendered = renderImageEffects(sourceImageRef.current, settings);
    const link = document.createElement('a');
    link.download = `pixelmark-effects-${Date.now()}.png`;
    link.href = rendered.toDataURL('image/png');
    link.click();
    onShowToast('Downloaded styled image', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Image Effects Studio</h3>
              <p className="text-xs text-slate-400">Add window frames, elevation shadow, canvas padding & watermark</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettings(DEFAULT_IMAGE_EFFECTS)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset to default settings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preset quick pills */}
        <div className="px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('macos_showcase')}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition shrink-0"
          >
            🍎 macOS Showcase
          </button>
          <button
            onClick={() => applyPreset('clean_shadow')}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0"
          >
            ☁️ Clean Shadow Card
          </button>
          <button
            onClick={() => applyPreset('confidential')}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 transition shrink-0"
          >
            🔒 Confidential Watermark
          </button>
          <button
            onClick={() => applyPreset('retro')}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition shrink-0"
          >
            📷 Retro Vintage
          </button>
        </div>

        {/* Middle Body: Sidebar Controls + Interactive Live Preview */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Controls Sidebar */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 flex flex-col shrink-0">
            {/* Tabs */}
            <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-900/60 text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveTab('frame')}
                className={`py-2.5 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'frame'
                    ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AppWindow className="w-3.5 h-3.5" />
                <span>Frame</span>
              </button>
              <button
                onClick={() => setActiveTab('backdrop')}
                className={`py-2.5 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'backdrop'
                    ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Padding</span>
              </button>
              <button
                onClick={() => setActiveTab('watermark')}
                className={`py-2.5 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'watermark'
                    ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Watermark</span>
              </button>
              <button
                onClick={() => setActiveTab('adjustments')}
                className={`py-2.5 flex flex-col items-center gap-1 border-b-2 transition ${
                  activeTab === 'adjustments'
                    ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {activeTab === 'frame' && (
                <>
                  {/* Window Frame Style */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Window Frame Mockup
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: 'None' },
                        { id: 'macos_dark', label: 'macOS Dark 🔴🟡🟢' },
                        { id: 'macos_light', label: 'macOS Light' },
                        { id: 'windows_dark', label: 'Windows Dark' },
                        { id: 'windows_light', label: 'Windows Light' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettings({ ...settings, windowFrame: item.id as any })}
                          className={`p-2 rounded-lg border text-left font-medium transition ${
                            settings.windowFrame === item.id
                              ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Window Title */}
                  {settings.windowFrame !== 'none' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Window Title Text
                      </label>
                      <input
                        type="text"
                        value={settings.windowTitle || ''}
                        onChange={(e) => setSettings({ ...settings, windowTitle: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                        placeholder="e.g. Chrome / App Window"
                      />
                    </div>
                  )}

                  {/* Corner Radius */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Corner Radius
                      </span>
                      <span className="text-sky-400 font-mono">{settings.cornerRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="36"
                      value={settings.cornerRadius}
                      onChange={(e) => setSettings({ ...settings, cornerRadius: Number(e.target.value) })}
                      className="w-full accent-sky-500"
                    />
                  </div>

                  {/* Drop Shadow Toggle */}
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">Desktop Elevation Shadow</span>
                      <input
                        type="checkbox"
                        checked={settings.shadowEnabled}
                        onChange={(e) => setSettings({ ...settings, shadowEnabled: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                    </div>

                    {settings.shadowEnabled && (
                      <div className="space-y-2.5 pl-2 border-l-2 border-slate-800">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] text-slate-400">Shadow Blur</span>
                            <span className="text-slate-300 font-mono">{settings.shadowBlur}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="64"
                            value={settings.shadowBlur}
                            onChange={(e) => setSettings({ ...settings, shadowBlur: Number(e.target.value) })}
                            className="w-full accent-sky-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] text-slate-400">Shadow Opacity</span>
                            <span className="text-slate-300 font-mono">{Math.round(settings.shadowOpacity * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={settings.shadowOpacity}
                            onChange={(e) => setSettings({ ...settings, shadowOpacity: Number(e.target.value) })}
                            className="w-full accent-sky-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'backdrop' && (
                <>
                  {/* Padding */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Canvas Padding
                      </span>
                      <span className="text-sky-400 font-mono">{settings.padding}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="4"
                      value={settings.padding}
                      onChange={(e) => setSettings({ ...settings, padding: Number(e.target.value) })}
                      className="w-full accent-sky-500"
                    />
                  </div>

                  {/* Backdrop Type */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Backdrop Background Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'gradient', label: 'Gradient' },
                        { id: 'solid', label: 'Solid Color' },
                        { id: 'blur', label: 'Blurred Image' },
                        { id: 'transparent', label: 'Transparent' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettings({ ...settings, backgroundType: item.id as any })}
                          className={`p-2 rounded-lg border text-left font-medium transition ${
                            settings.backgroundType === item.id
                              ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* If Gradient, select preset */}
                  {settings.backgroundType === 'gradient' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Gradient Theme
                      </label>
                      <div className="space-y-1.5">
                        {(Object.keys(GRADIENT_PRESETS) as (keyof typeof GRADIENT_PRESETS)[]).map((key) => {
                          const p = GRADIENT_PRESETS[key];
                          return (
                            <button
                              key={key}
                              onClick={() => setSettings({ ...settings, gradientPreset: key })}
                              className={`w-full flex items-center justify-between p-2 rounded-lg border transition ${
                                settings.gradientPreset === key
                                  ? 'border-sky-500 bg-slate-800 ring-1 ring-sky-500'
                                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                              }`}
                            >
                              <span className="font-medium text-slate-200">{p.name}</span>
                              <div
                                className="w-16 h-4 rounded-md shadow-inner"
                                style={{
                                  background: `linear-gradient(to right, ${p.stops[0]}, ${p.stops[1]}, ${p.stops[2]})`,
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* If Solid, select color */}
                  {settings.backgroundType === 'solid' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Backdrop Solid Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                          className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.backgroundColor}
                          onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs uppercase"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'watermark' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Enable Watermark</span>
                    <input
                      type="checkbox"
                      checked={settings.watermarkEnabled}
                      onChange={(e) => setSettings({ ...settings, watermarkEnabled: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {settings.watermarkEnabled && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Watermark Text
                        </label>
                        <input
                          type="text"
                          value={settings.watermarkText}
                          onChange={(e) => setSettings({ ...settings, watermarkText: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                          placeholder="e.g. CONFIDENTIAL or {{date}}"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Tip: Use &#123;&#123;date&#125;&#125; or &#123;&#123;time&#125;&#125; for automatic timestamps.
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Position
                        </label>
                        <select
                          value={settings.watermarkPosition}
                          onChange={(e) => setSettings({ ...settings, watermarkPosition: e.target.value as any })}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                        >
                          <option value="bottom_right">Bottom Right</option>
                          <option value="bottom_left">Bottom Left</option>
                          <option value="top_right">Top Right</option>
                          <option value="top_left">Top Left</option>
                          <option value="center">Center</option>
                          <option value="diagonal_tile">Diagonal 45° Tile Pattern</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] text-slate-400">Opacity</span>
                          <span className="text-slate-300 font-mono">{Math.round(settings.watermarkOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={settings.watermarkOpacity}
                          onChange={(e) => setSettings({ ...settings, watermarkOpacity: Number(e.target.value) })}
                          className="w-full accent-sky-500"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'adjustments' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-slate-400">Brightness</span>
                      <span className="text-slate-300 font-mono">{settings.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="-80"
                      max="80"
                      value={settings.brightness}
                      onChange={(e) => setSettings({ ...settings, brightness: Number(e.target.value) })}
                      className="w-full accent-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-slate-400">Contrast</span>
                      <span className="text-slate-300 font-mono">{settings.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="-80"
                      max="80"
                      value={settings.contrast}
                      onChange={(e) => setSettings({ ...settings, contrast: Number(e.target.value) })}
                      className="w-full accent-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-slate-400">Saturation</span>
                      <span className="text-slate-300 font-mono">{settings.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.saturation}
                      onChange={(e) => setSettings({ ...settings, saturation: Number(e.target.value) })}
                      className="w-full accent-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-slate-400">Grayscale</span>
                      <span className="text-slate-300 font-mono">{settings.grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.grayscale}
                      onChange={(e) => setSettings({ ...settings, grayscale: Number(e.target.value) })}
                      className="w-full accent-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] text-slate-400">Sepia</span>
                      <span className="text-slate-300 font-mono">{settings.sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.sepia}
                      onChange={(e) => setSettings({ ...settings, sepia: Number(e.target.value) })}
                      className="w-full accent-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Area */}
          <div className="flex-1 bg-slate-950 flex flex-col min-w-0 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Real-time Effects Preview</span>
              <span className="text-[11px] text-slate-500">Auto-updates live</span>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto rounded-xl bg-slate-900/50 border border-slate-800/80 p-4">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Copy result to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Image</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Download image with effects applied"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition"
            >
              <Check className="w-4 h-4" />
              <span>Apply to Current Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
