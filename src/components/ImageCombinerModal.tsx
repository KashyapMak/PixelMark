import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Columns2,
  Rows2,
  Download,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface ImageItem {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

interface ImageCombinerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCanvasImageSrc: string | null;
  onApplyCombinedImage: (combinedDataUrl: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImageCombinerModal: React.FC<ImageCombinerModalProps> = ({
  isOpen,
  onClose,
  currentCanvasImageSrc,
  onApplyCombinedImage,
  onShowToast,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [gap, setGap] = useState<number>(16);
  const [alignment, setAlignment] = useState<'start' | 'center' | 'end'>('center');
  const [bgColor, setBgColor] = useState<string>('#0f172a');
  const [combinedDimensions, setCombinedDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with current canvas image if available
  useEffect(() => {
    if (isOpen && images.length === 0 && currentCanvasImageSrc) {
      const img = new Image();
      img.src = currentCanvasImageSrc;
      img.onload = () => {
        setImages([
          {
            id: 'canvas-current',
            name: 'Current Canvas Image',
            dataUrl: currentCanvasImageSrc,
            width: img.width,
            height: img.height,
          },
        ]);
      };
    }
  }, [isOpen, currentCanvasImageSrc]);

  // Re-stitch combined preview whenever images or layout options change
  useEffect(() => {
    if (images.length === 0 || !previewCanvasRef.current) return;

    // Calculate dimensions
    let totalW = 0;
    let totalH = 0;

    if (direction === 'horizontal') {
      totalW = images.reduce((acc, img) => acc + img.width, 0) + gap * (images.length - 1);
      totalH = Math.max(...images.map((img) => img.height));
    } else {
      totalW = Math.max(...images.map((img) => img.width));
      totalH = images.reduce((acc, img) => acc + img.height, 0) + gap * (images.length - 1);
    }

    setCombinedDimensions({ width: totalW, height: totalH });

    const canvas = previewCanvasRef.current;
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalW, totalH);

    // Render each image
    let currentOffset = 0;
    const loadedCount = { current: 0 };

    images.forEach((item) => {
      const img = new Image();
      img.src = item.dataUrl;
      img.onload = () => {
        let drawX = 0;
        let drawY = 0;

        if (direction === 'horizontal') {
          drawX = currentOffset;
          if (alignment === 'center') {
            drawY = (totalH - item.height) / 2;
          } else if (alignment === 'end') {
            drawY = totalH - item.height;
          }
          currentOffset += item.width + gap;
        } else {
          drawY = currentOffset;
          if (alignment === 'center') {
            drawX = (totalW - item.width) / 2;
          } else if (alignment === 'end') {
            drawX = totalW - item.width;
          }
          currentOffset += item.height + gap;
        }

        ctx.drawImage(img, drawX, drawY, item.width, item.height);
        loadedCount.current += 1;
      };
    });
  }, [images, direction, gap, alignment, bgColor]);

  if (!isOpen) return null;

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              dataUrl,
              width: img.width,
              height: img.height,
            },
          ]);
        };
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleMove = (index: number, delta: -1 | 1) => {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setImages(next);
  };

  const handleRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    if (!previewCanvasRef.current || images.length === 0) return;
    const dataUrl = previewCanvasRef.current.toDataURL('image/png');
    onApplyCombinedImage(dataUrl);
    onShowToast(`Stitched ${images.length} images together into editor!`, 'success');
    onClose();
  };

  const handleDownload = () => {
    if (!previewCanvasRef.current || images.length === 0) return;
    const link = document.createElement('a');
    link.download = `pixelmark-combined-${Date.now()}.png`;
    link.href = previewCanvasRef.current.toDataURL('image/png');
    link.click();
    onShowToast('Downloaded combined image', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Columns2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Image Combiner & Stitcher</h3>
              <p className="text-xs text-slate-400">Merge multiple screenshots horizontally or vertically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Controls Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-4 space-y-4 overflow-y-auto text-xs shrink-0">
            {/* Direction Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Stitch Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDirection('horizontal')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-semibold transition ${
                    direction === 'horizontal'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Columns2 className="w-4 h-4" />
                  <span>Side-by-Side</span>
                </button>
                <button
                  onClick={() => setDirection('vertical')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-semibold transition ${
                    direction === 'vertical'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Rows2 className="w-4 h-4" />
                  <span>Stacked</span>
                </button>
              </div>
            </div>

            {/* Gap slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Spacing Gap
                </span>
                <span className="text-sky-400 font-mono">{gap}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="64"
                step="4"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Alignment */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Cross-Axis Alignment
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['start', 'center', 'end'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => setAlignment(align)}
                    className={`py-1.5 rounded-lg border font-medium capitalize transition ${
                      alignment === align
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Backdrop Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-slate-200"
                />
              </div>
            </div>

            {/* Image List */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Images ({images.length})
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Images
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleAddFiles}
              />

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                  >
                    <img src={item.dataUrl} alt="" className="w-9 h-9 object-cover rounded border border-slate-700" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.width} × {item.height}px
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === images.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemove(idx)}
                        className="p-1 rounded text-rose-400 hover:text-rose-300"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Area */}
          <div className="flex-1 bg-slate-950 p-4 flex flex-col min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-xs font-semibold text-slate-400">Combined Image Preview</span>
              {combinedDimensions.width > 0 && (
                <span className="text-xs text-sky-400 font-mono font-medium">
                  {combinedDimensions.width} × {combinedDimensions.height} px
                </span>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto rounded-xl bg-slate-900/50 border border-slate-800/80 p-4">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <button
            onClick={handleDownload}
            disabled={images.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 disabled:opacity-40 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={images.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-40 transition"
            >
              <Check className="w-4 h-4" />
              <span>Load into PixelMark Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
