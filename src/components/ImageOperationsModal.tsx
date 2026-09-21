import React, { useState } from 'react';
import {
  Sliders,
  X,
  Lock,
  Unlock,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Check,
} from 'lucide-react';
import { ImageTransform } from '../types';

interface ImageOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDimensions: { width: number; height: number };
  imageTransform: ImageTransform;
  onApplyResize: (newWidth: number, newHeight: number) => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
}

export const ImageOperationsModal: React.FC<ImageOperationsModalProps> = ({
  isOpen,
  onClose,
  currentDimensions,
  imageTransform,
  onApplyResize,
  onRotateCw,
  onRotateCcw,
  onFlipH,
  onFlipV,
}) => {
  const [width, setWidth] = useState<number>(currentDimensions.width);
  const [height, setHeight] = useState<number>(currentDimensions.height);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const aspectRatio = currentDimensions.width / Math.max(1, currentDimensions.height);

  if (!isOpen) return null;

  const handleWidthChange = (newW: number) => {
    setWidth(newW);
    if (lockAspect && aspectRatio > 0) {
      setHeight(Math.round(newW / aspectRatio));
    }
  };

  const handleHeightChange = (newH: number) => {
    setHeight(newH);
    if (lockAspect && aspectRatio > 0) {
      setWidth(Math.round(newH * aspectRatio));
    }
  };

  const applyPreset = (scale: number) => {
    const newW = Math.round(currentDimensions.width * scale);
    const newH = Math.round(currentDimensions.height * scale);
    setWidth(newW);
    setHeight(newH);
  };

  const handleApply = () => {
    onApplyResize(Math.max(50, width), Math.max(50, height));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm text-white">Resize & Canvas Geometry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          {/* Quick presets */}
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-200">Scale Preset</span>
            <div className="grid grid-cols-5 gap-1.5">
              {[0.5, 0.75, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => applyPreset(s)}
                  className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 border border-slate-700 transition"
                >
                  {Math.round(s * 100)}%
                </button>
              ))}
            </div>
          </div>

          {/* Width & Height inputs */}
          <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">Pixel Dimensions</span>
              <button
                onClick={() => setLockAspect(!lockAspect)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition ${
                  lockAspect
                    ? 'bg-sky-500/20 text-sky-400 border-sky-400/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {lockAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span>{lockAspect ? 'Locked' : 'Unlocked'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Width (px)</label>
                <input
                  type="number"
                  min={50}
                  max={8000}
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Height (px)</label>
                <input
                  type="number"
                  min={50}
                  max={8000}
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-slate-100 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Rotation & Flip tools */}
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-200">Quick Transform</span>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={onRotateCw}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                <RotateCw className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] font-medium">+90° CW</span>
              </button>
              <button
                onClick={onRotateCcw}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] font-medium">-90° CCW</span>
              </button>
              <button
                onClick={onFlipH}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition ${
                  imageTransform.flipH
                    ? 'bg-amber-500/20 text-amber-400 border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
                <span className="text-[10px] font-medium">Flip H</span>
              </button>
              <button
                onClick={onFlipV}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition ${
                  imageTransform.flipV
                    ? 'bg-amber-500/20 text-amber-400 border-amber-400'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <FlipVertical className="w-4 h-4" />
                <span className="text-[10px] font-medium">Flip V</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 transition"
          >
            <Check className="w-4 h-4" />
            <span>Apply Resize</span>
          </button>
        </div>
      </div>
    </div>
  );
};
