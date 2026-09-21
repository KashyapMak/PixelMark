import React from 'react';
import { Check, X, Crop } from 'lucide-react';

interface CropControlsProps {
  cropBox: { x: number; y: number; width: number; height: number };
  aspectRatio: number | null;
  onSelectAspectRatio: (ratio: number | null) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}

export const CropControls: React.FC<CropControlsProps> = ({
  cropBox,
  aspectRatio,
  onSelectAspectRatio,
  onApplyCrop,
  onCancelCrop,
}) => {
  const ratios: { label: string; value: number | null }[] = [
    { label: 'Freeform', value: null },
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '3:2', value: 3 / 2 },
    { label: '9:16', value: 9 / 16 },
  ];

  return (
    <div
      id="pixelmark-crop-bar"
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl shadow-2xl px-4 py-2.5 flex items-center gap-3 select-none text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-center gap-1.5 font-bold text-amber-400 mr-1">
        <Crop className="w-4 h-4" />
        <span>Crop Area:</span>
        <span className="font-mono text-slate-100 font-normal">
          {Math.round(cropBox.width)} × {Math.round(cropBox.height)} px
        </span>
      </div>

      <div className="h-4 w-px bg-slate-800" />

      {/* Ratio pills */}
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
        {ratios.map((r) => (
          <button
            key={r.label}
            onClick={() => onSelectAspectRatio(r.value)}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
              aspectRatio === r.value
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-slate-800" />

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onCancelCrop}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
        <button
          onClick={onApplyCrop}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition"
        >
          <Check className="w-4 h-4" />
          <span>Apply Crop</span>
        </button>
      </div>
    </div>
  );
};
