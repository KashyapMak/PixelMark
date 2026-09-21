import React from 'react';
import {
  AnnotationObject,
  ShadowSettings,
  ToolType,
  AppTheme,
} from '../types';
import { THEMES } from '../utils/theme';
import {
  Layers,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Sparkles,
  ChevronRight,
  Sliders,
  SunMedium,
  Grid,
  Search,
  Hash,
  Shapes,
} from 'lucide-react';

interface InspectorProps {
  selectedObject: AnnotationObject | null;
  activeTool: ToolType;
  onUpdateObject: (updated: Partial<AnnotationObject>) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  selectedCount: number;
  theme?: AppTheme;
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#0284c7', // Sky
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
  '#64748b', // Slate
  '#0f172a', // Dark
];

export const Inspector: React.FC<InspectorProps> = ({
  selectedObject,
  activeTool,
  onUpdateObject,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onDuplicate,
  onDelete,
  onToggleLock,
  onAlign,
  isOpen,
  onToggleOpen,
  selectedCount,
  theme = 'dark',
}) => {
  const currentTheme = THEMES[theme] || THEMES.dark;

  if (!isOpen) {
    return (
      <button
        id="btn-open-inspector"
        onClick={onToggleOpen}
        className={`absolute top-16 right-3 z-20 p-2.5 rounded-xl backdrop-blur border shadow-xl flex items-center gap-1.5 text-xs font-semibold transition ${currentTheme.toolbar}`}
        title="Open Inspector Panel"
      >
        <Sliders className="w-4 h-4 text-sky-400" />
        <span>Properties</span>
      </button>
    );
  }

  const isLocked = selectedObject?.locked ?? false;

  return (
    <aside
      id="pixelmark-inspector"
      className={`absolute top-16 right-3 z-20 w-72 backdrop-blur-md border rounded-2xl shadow-2xl p-4 flex flex-col gap-4 text-xs select-none max-h-[calc(100vh-5.5rem)] overflow-y-auto no-scrollbar transition ${currentTheme.inspector}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span className="font-bold text-sm tracking-tight text-white">
            {selectedObject ? `Edit ${selectedObject.type.replace('_', ' ')}` : 'Tool Defaults'}
          </span>
          {selectedCount > 1 && (
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold text-[10px]">
              {selectedCount} selected
            </span>
          )}
        </div>
        <button
          onClick={onToggleOpen}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          title="Close Inspector"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Actions (Front/Back/Lock/Delete/Duplicate) */}
      {selectedObject && (
        <div className="flex items-center justify-between bg-slate-800/60 p-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1">
            <button
              onClick={onBringToFront}
              title="Bring to Front"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
              <ArrowUpToLine className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onBringForward}
              title="Bring Forward"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onSendBackward}
              title="Send Backward"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onSendToBack}
              title="Send to Back"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleLock}
              title={isLocked ? 'Unlock Layer' : 'Lock Layer'}
              className={`p-1.5 rounded-lg transition ${
                isLocked ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onDuplicate}
              title="Duplicate (Ctrl+D)"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              title="Delete (Del)"
              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Alignment Tools (useful when multi-selecting or placing) */}
      {selectedObject && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400">Canvas Alignment</span>
          <div className="grid grid-cols-6 gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onAlign('left')}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 flex justify-center"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlign('center')}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 flex justify-center"
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlign('right')}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 flex justify-center"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlign('top')}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
              title="Align Top"
            >
              TOP
            </button>
            <button
              onClick={() => onAlign('middle')}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
              title="Align Middle"
            >
              MID
            </button>
            <button
              onClick={() => onAlign('bottom')}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
              title="Align Bottom"
            >
              BOT
            </button>
          </div>
        </div>
      )}

      {/* STROKE SECTION */}
      <div className="space-y-2.5 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">Stroke / Border</span>
          <span className="text-slate-400 font-mono text-[11px]">
            {selectedObject?.strokeWidth ?? 4}px
          </span>
        </div>

        {/* Preset colors */}
        <div className="grid grid-cols-6 gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onUpdateObject({ strokeColor: c })}
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-lg border transition ${
                (selectedObject?.strokeColor ?? '#ef4444') === c
                  ? 'border-white ring-2 ring-sky-400/50 scale-110'
                  : 'border-transparent hover:scale-105'
              }`}
            />
          ))}
        </div>

        {/* Custom stroke color input */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedObject?.strokeColor || '#ef4444'}
            onChange={(e) => onUpdateObject({ strokeColor: e.target.value })}
            className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
          />
          <input
            type="text"
            value={selectedObject?.strokeColor || '#ef4444'}
            onChange={(e) => onUpdateObject({ strokeColor: e.target.value })}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 font-mono text-[11px] text-slate-200"
          />
        </div>

        {/* Stroke Width Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Width</span>
            <span>{selectedObject?.strokeWidth ?? 4}px</span>
          </div>
          <input
            type="range"
            min={1}
            max={60}
            value={selectedObject?.strokeWidth ?? 4}
            onChange={(e) => onUpdateObject({ strokeWidth: Number(e.target.value) })}
            className="w-full accent-sky-400 cursor-pointer"
          />
        </div>

        {/* Stroke Style: Solid, Dashed, Dotted */}
        <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          {(['solid', 'dashed', 'dotted'] as const).map((style) => (
            <button
              key={style}
              onClick={() => onUpdateObject({ strokeStyle: style })}
              className={`py-1 rounded-md text-[11px] font-semibold capitalize transition ${
                (selectedObject?.strokeStyle ?? 'solid') === style
                  ? 'bg-sky-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* FILL SECTION (for shapes, text background, bubbles) */}
      <div className="space-y-2.5 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">Fill Color</span>
          <button
            onClick={() =>
              onUpdateObject({
                fillColor: selectedObject?.fillColor === 'transparent' ? '#0284c7' : 'transparent',
              })
            }
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
              selectedObject?.fillColor === 'transparent'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {selectedObject?.fillColor === 'transparent' ? 'No Fill (Transparent)' : 'Fill Enabled'}
          </button>
        </div>

        {selectedObject?.fillColor !== 'transparent' && (
          <>
            <div className="grid grid-cols-6 gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => onUpdateObject({ fillColor: c })}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-lg border transition ${
                    (selectedObject?.fillColor ?? 'transparent') === c
                      ? 'border-white ring-2 ring-sky-400/50 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                />
              ))}
            </div>

            {/* Fill opacity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Fill Opacity</span>
                <span>{Math.round((selectedObject?.fillOpacity ?? 0.2) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={selectedObject?.fillOpacity ?? 0.2}
                onChange={(e) => onUpdateObject({ fillOpacity: Number(e.target.value) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </>
        )}
      </div>

      {/* SHADOW & DEPTH SECTION */}
      <div className="space-y-2 border-t border-slate-800 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">Drop Shadow</span>
          <input
            type="checkbox"
            checked={selectedObject?.shadow?.enabled ?? false}
            onChange={(e) => {
              const currentShadow: ShadowSettings = selectedObject?.shadow || {
                enabled: false,
                color: 'rgba(0,0,0,0.6)',
                blur: 8,
                offsetX: 0,
                offsetY: 4,
              };
              onUpdateObject({
                shadow: { ...currentShadow, enabled: e.target.checked },
              });
            }}
            className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
          />
        </div>

        {selectedObject?.shadow?.enabled && (
          <div className="space-y-2 bg-slate-800/50 p-2 rounded-xl border border-slate-800">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Shadow Blur</span>
              <span>{selectedObject.shadow.blur}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={selectedObject.shadow.blur}
              onChange={(e) =>
                onUpdateObject({
                  shadow: { ...selectedObject.shadow, blur: Number(e.target.value) },
                })
              }
              className="w-full accent-sky-400"
            />
          </div>
        )}
      </div>

      {/* SPECIFIC TYPE CONTROLS */}
      {/* 1. Text & Speech Bubble */}
      {(selectedObject?.type === 'text' ||
        selectedObject?.type === 'speech_bubble' ||
        selectedObject?.type === 'thought_bubble') && (
        <div className="space-y-2.5 border-t border-slate-800 pt-3">
          <span className="font-semibold text-slate-300">Typography & Content</span>
          <textarea
            rows={2}
            value={selectedObject.text || ''}
            placeholder="Type text label here..."
            onChange={(e) => onUpdateObject({ text: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 font-medium text-slate-100 text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />

          <div className="flex items-center gap-1.5">
            <select
              value={selectedObject.fontFamily || 'Plus Jakarta Sans, system-ui, sans-serif'}
              onChange={(e) => onUpdateObject({ fontFamily: e.target.value })}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
            >
              <option value="Plus Jakarta Sans, system-ui, sans-serif">Sans-Serif (Modern)</option>
              <option value="Merriweather, serif">Serif (Formal)</option>
              <option value="Fira Code, monospace">Monospace (Code)</option>
              <option value="Bangers, cursive">Comic Bangers</option>
            </select>

            <input
              type="number"
              min={10}
              max={120}
              value={selectedObject.fontSize || 20}
              onChange={(e) => onUpdateObject({ fontSize: Number(e.target.value) })}
              className="w-16 bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-center text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() =>
                onUpdateObject({
                  fontWeight: selectedObject.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              className={`flex-1 py-1 rounded flex justify-center ${
                selectedObject.fontWeight === 'bold' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                onUpdateObject({
                  fontStyle: selectedObject.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`flex-1 py-1 rounded flex justify-center ${
                selectedObject.fontStyle === 'italic' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-300'
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateObject({ textAlign: 'left' })}
              className={`flex-1 py-1 rounded flex justify-center ${
                selectedObject.textAlign === 'left' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateObject({ textAlign: 'center' })}
              className={`flex-1 py-1 rounded flex justify-center ${
                selectedObject.textAlign === 'center' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateObject({ textAlign: 'right' })}
              className={`flex-1 py-1 rounded flex justify-center ${
                selectedObject.textAlign === 'right' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Redaction Blur / Pixelate */}
      {selectedObject?.type === 'blur' && (
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>Gaussian Blur Softness</span>
            <span>{selectedObject.blurRadius ?? 12}px</span>
          </div>
          <input
            type="range"
            min={3}
            max={35}
            value={selectedObject.blurRadius ?? 12}
            onChange={(e) => onUpdateObject({ blurRadius: Number(e.target.value) })}
            className="w-full accent-sky-400"
          />
        </div>
      )}

      {selectedObject?.type === 'pixelate' && (
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>Mosaic Grid Cell Size</span>
            <span>{selectedObject.pixelSize ?? 12}px</span>
          </div>
          <input
            type="range"
            min={4}
            max={36}
            step={2}
            value={selectedObject.pixelSize ?? 12}
            onChange={(e) => onUpdateObject({ pixelSize: Number(e.target.value) })}
            className="w-full accent-sky-400"
          />
        </div>
      )}

      {/* 3. Loupe Magnifier */}
      {selectedObject?.type === 'loupe' && (
        <div className="space-y-2.5 border-t border-slate-800 pt-3">
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>Loupe Magnification</span>
            <span className="font-mono text-sky-400">{(selectedObject.loupeZoom ?? 2).toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={1.2}
            max={4.0}
            step={0.1}
            value={selectedObject.loupeZoom ?? 2}
            onChange={(e) => onUpdateObject({ loupeZoom: Number(e.target.value) })}
            className="w-full accent-sky-400"
          />
          <div className="grid grid-cols-2 gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => onUpdateObject({ loupeShape: 'circle' })}
              className={`py-1 rounded text-xs font-semibold ${
                (selectedObject.loupeShape ?? 'circle') === 'circle' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              Circular Lens
            </button>
            <button
              onClick={() => onUpdateObject({ loupeShape: 'rect' })}
              className={`py-1 rounded text-xs font-semibold ${
                selectedObject.loupeShape === 'rect' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
              }`}
            >
              Rectangular Lens
            </button>
          </div>
        </div>
      )}

      {/* 4. Auto-increment Step Badge */}
      {selectedObject?.type === 'counter' && (
        <div className="space-y-2.5 border-t border-slate-800 pt-3">
          <span className="font-semibold text-slate-300">Step Badge Number</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={999}
              value={selectedObject.stepNumber ?? 1}
              onChange={(e) => onUpdateObject({ stepNumber: Number(e.target.value) })}
              className="w-20 bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-center font-bold text-sm"
            />
            <div className="grid grid-cols-3 gap-1 flex-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              {(['circle', 'square', 'pill'] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => onUpdateObject({ badgeShape: shape })}
                  className={`py-1 rounded text-[10px] font-semibold capitalize ${
                    (selectedObject.badgeShape ?? 'circle') === shape
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-300'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Spotlight */}
      {selectedObject?.type === 'spotlight' && (
        <div className="space-y-2.5 border-t border-slate-800 pt-3">
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>Surrounding Darkness</span>
            <span>{Math.round((selectedObject.dimOpacity ?? 0.65) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.2}
            max={0.95}
            step={0.05}
            value={selectedObject.dimOpacity ?? 0.65}
            onChange={(e) => onUpdateObject({ dimOpacity: Number(e.target.value) })}
            className="w-full accent-sky-400"
          />
          <div className="grid grid-cols-2 gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => onUpdateObject({ spotlightShape: 'rect' })}
              className={`py-1 rounded text-xs font-semibold ${
                (selectedObject.spotlightShape ?? 'rect') === 'rect'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-300'
              }`}
            >
              Rect Hole
            </button>
            <button
              onClick={() => onUpdateObject({ spotlightShape: 'ellipse' })}
              className={`py-1 rounded text-xs font-semibold ${
                selectedObject.spotlightShape === 'ellipse'
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-300'
              }`}
            >
              Oval Hole
            </button>
          </div>
        </div>
      )}

      {/* 6. Ruler (Dimension & Caliper) */}
      {selectedObject?.type === 'ruler' && (
        <div className="space-y-2.5 border-t border-slate-800 pt-3">
          <span className="font-semibold text-slate-300 block">Ruler Measurement Options</span>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Show Angle (Degrees)</span>
              <input
                type="checkbox"
                checked={selectedObject.showAngle ?? true}
                onChange={(e) => onUpdateObject({ showAngle: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-sky-500 w-4 h-4 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Show Coordinates (ΔX, ΔY)</span>
              <input
                type="checkbox"
                checked={selectedObject.showCoordinates ?? true}
                onChange={(e) => onUpdateObject({ showCoordinates: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-sky-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* 7. Sticker / Mouse Cursor / Status Badge */}
      {selectedObject?.type === 'sticker' && (
        <div className="space-y-2.5 border-t border-slate-800 pt-3">
          <span className="font-semibold text-slate-300 block">Sticker & Cursor Type</span>
          <div className="grid grid-cols-4 gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            {[
              { id: 'cursor_arrow', label: 'Arrow', icon: '↖️' },
              { id: 'cursor_pointer', label: 'Hand', icon: '👆' },
              { id: 'cursor_crosshair', label: 'Cross', icon: '➕' },
              { id: 'cursor_ibeam', label: 'Text', icon: 'I' },
              { id: 'check', label: 'Check', icon: '✅' },
              { id: 'cross', label: 'Cross', icon: '❌' },
              { id: 'warning', label: 'Warn', icon: '⚠️' },
              { id: 'info', label: 'Info', icon: 'ℹ️' },
              { id: 'star', label: 'Star', icon: '⭐' },
              { id: 'flag', label: 'Flag', icon: '🚩' },
              { id: 'heart', label: 'Heart', icon: '❤️' },
              { id: 'question', label: 'Help', icon: '❓' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => onUpdateObject({ stickerType: st.id as any })}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition ${
                  (selectedObject.stickerType ?? 'cursor_arrow') === st.id
                    ? 'bg-sky-500/20 border-sky-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={st.label}
              >
                <span className="text-sm">{st.icon}</span>
                <span className="text-[9px] mt-0.5">{st.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Rounded rect corner radius */}
      {selectedObject?.type === 'rounded_rect' && (
        <div className="space-y-2 border-t border-slate-800 pt-3">
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>Corner Radius</span>
            <span>{selectedObject.cornerRadius ?? 16}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={64}
            value={selectedObject.cornerRadius ?? 16}
            onChange={(e) => onUpdateObject({ cornerRadius: Number(e.target.value) })}
            className="w-full accent-sky-400"
          />
        </div>
      )}
    </aside>
  );
};
