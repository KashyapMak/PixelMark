import React, { useState, useEffect } from 'react';
import {
  Pipette,
  Copy,
  Check,
  X,
  Sparkles,
  History,
  Paintbrush,
  Palette,
  Eye,
} from 'lucide-react';
import { getFullColorInfo, ColorComponents, getContrastTextColor } from '../utils/colorUtils';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: string;
  onSelectColor: (color: string, target: 'stroke' | 'fill') => void;
  onCanvasEyedropperTrigger?: () => void;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  currentColor,
  onSelectColor,
  onCanvasEyedropperTrigger,
}) => {
  const [activeHex, setActiveHex] = useState(currentColor || '#38bdf8');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [colorHistory, setColorHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pixelmark_color_history');
      return saved ? JSON.parse(saved) : ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff', '#0f172a'];
    } catch {
      return ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff', '#0f172a'];
    }
  });

  const hasSystemEyedropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  useEffect(() => {
    if (currentColor) {
      setActiveHex(currentColor);
    }
  }, [currentColor]);

  if (!isOpen) return null;

  const colorInfo: ColorComponents = getFullColorInfo(activeHex);

  const saveToHistory = (hex: string) => {
    const next = [hex, ...colorHistory.filter((c) => c.toLowerCase() !== hex.toLowerCase())].slice(0, 14);
    setColorHistory(next);
    try {
      localStorage.setItem('pixelmark_color_history', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handlePickWithSystemEyedropper = async () => {
    try {
      if (hasSystemEyedropper) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          setActiveHex(result.sRGBHex);
          saveToHistory(result.sRGBHex);
        }
      }
    } catch (err) {
      // User pressed ESC or cancelled
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const formats = [
    { key: 'hex', label: 'HEX', value: colorInfo.hex.toUpperCase() },
    { key: 'rgb', label: 'RGB', value: `rgb(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b})` },
    { key: 'rgba', label: 'RGBA', value: `rgba(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b}, 1.0)` },
    { key: 'hsl', label: 'HSL', value: `hsl(${colorInfo.h}, ${colorInfo.s}%, ${colorInfo.l}%)` },
    { key: 'hsv', label: 'HSV / HSB', value: `${colorInfo.h}°, ${colorInfo.s}%, ${colorInfo.v}%` },
    { key: 'cmyk', label: 'CMYK', value: `cmyk(${colorInfo.c}%, ${colorInfo.m}%, ${colorInfo.y}%, ${colorInfo.k}%)` },
    { key: 'int', label: 'Decimal Int', value: `${(colorInfo.r << 16) + (colorInfo.g << 8) + colorInfo.b}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Pipette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Screen Color Picker</h3>
              <p className="text-[11px] text-slate-400">Precision color analyzer & palette manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Eyedropper Action Buttons */}
          <div className="flex items-center gap-2">
            {hasSystemEyedropper ? (
              <button
                onClick={handlePickWithSystemEyedropper}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition"
              >
                <Pipette className="w-4 h-4" />
                <span>Sample Screen Pixel (Eyedropper)</span>
              </button>
            ) : (
              <div className="flex-1 text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                System EyeDropper supported on Chrome/Edge. Use custom HEX input or click below.
              </div>
            )}

            {onCanvasEyedropperTrigger && (
              <button
                onClick={() => {
                  onCanvasEyedropperTrigger();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                title="Pick from current canvas drawing"
              >
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Canvas</span>
              </button>
            )}
          </div>

          {/* Color Preview & Native Input */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div
              className="w-14 h-14 rounded-xl border border-white/20 shadow-inner shrink-0 relative overflow-hidden flex items-center justify-center font-bold text-xs"
              style={{
                backgroundColor: colorInfo.hex,
                color: getContrastTextColor(colorInfo.hex),
              }}
            >
              <input
                type="color"
                value={colorInfo.hex}
                onChange={(e) => {
                  setActiveHex(e.target.value);
                  saveToHistory(e.target.value);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Open native color picker"
              />
              <Paintbrush className="w-4 h-4 opacity-70 pointer-events-none" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Current Color</span>
                <span className="text-[11px] text-slate-500 font-mono">Click swatch to edit</span>
              </div>
              <div className="font-mono font-bold text-lg text-white tracking-wider uppercase">
                {colorInfo.hex}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                RGB({colorInfo.r}, {colorInfo.g}, {colorInfo.b})
              </div>
            </div>
          </div>

          {/* Formats List */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Color Format Values
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {formats.map((fmt) => (
                <div
                  key={fmt.key}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-xs font-mono transition"
                >
                  <span className="text-slate-400 font-medium w-16">{fmt.label}</span>
                  <span className="text-slate-200 truncate flex-1 text-left px-2 select-all">
                    {fmt.value}
                  </span>
                  <button
                    onClick={() => copyToClipboard(fmt.value, fmt.key)}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title={`Copy ${fmt.label}`}
                  >
                    {copiedKey === fmt.key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Color History / Palette */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <History className="w-3 h-3" /> Recent Swatches
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {colorHistory.map((hex, idx) => (
                <button
                  key={`${hex}-${idx}`}
                  onClick={() => setActiveHex(hex)}
                  style={{ backgroundColor: hex }}
                  className={`w-7 h-7 rounded-lg border transition transform hover:scale-110 ${
                    activeHex.toLowerCase() === hex.toLowerCase()
                      ? 'border-white ring-2 ring-sky-500'
                      : 'border-slate-700'
                  }`}
                  title={hex}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Apply actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelectColor(colorInfo.hex, 'stroke');
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              Set as Stroke
            </button>
            <button
              onClick={() => {
                onSelectColor(colorInfo.hex, 'fill');
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition shadow-md shadow-sky-500/20"
            >
              Set as Fill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
