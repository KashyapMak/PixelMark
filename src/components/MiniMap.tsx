import React, { useEffect, useRef } from 'react';
import { AnnotationObject, ImageTransform, AppTheme } from '../types';
import { THEMES } from '../utils/theme';
import { renderAnnotation, renderBaseImage } from '../utils/canvasRenderer';
import { Eye, EyeOff, Maximize } from 'lucide-react';

interface MiniMapProps {
  image: HTMLImageElement | null;
  imageDimensions: { width: number; height: number };
  imageTransform: ImageTransform;
  annotations: AnnotationObject[];
  viewport: { zoom: number; panX: number; panY: number };
  containerSize: { width: number; height: number };
  onNavigatePan: (newPanX: number, newPanY: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  theme?: AppTheme;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  image,
  imageDimensions,
  imageTransform,
  annotations,
  viewport,
  containerSize,
  onNavigatePan,
  isOpen,
  onToggle,
  theme = 'dark',
}) => {
  const currentTheme = THEMES[theme] || THEMES.dark;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);

  const miniMapWidth = 180;
  const miniMapHeight = Math.round(
    (imageDimensions.height / Math.max(1, imageDimensions.width)) * miniMapWidth
  );
  const clampedHeight = Math.min(180, Math.max(80, miniMapHeight));

  // Render mini-map canvas thumbnail
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = miniMapWidth;
    canvas.height = clampedHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale from actual image dimensions to mini-map
    const scaleX = miniMapWidth / Math.max(1, imageDimensions.width);
    const scaleY = clampedHeight / Math.max(1, imageDimensions.height);
    const scale = Math.min(scaleX, scaleY);

    ctx.save();
    ctx.scale(scale, scale);

    if (image) {
      renderBaseImage(ctx, image, imageDimensions, imageTransform);
    }

    // Render annotations
    annotations.forEach((ann) => {
      renderAnnotation(ctx, ann);
    });
    ctx.restore();

    // Now calculate and draw visible viewport rectangle
    // Visible box in canvas coordinates:
    // Left = -panX / zoom
    // Top = -panY / zoom
    // Width = containerWidth / zoom
    // Height = containerHeight / zoom
    const visX = (-viewport.panX / viewport.zoom) * scale;
    const visY = (-viewport.panY / viewport.zoom) * scale;
    const visW = (containerSize.width / viewport.zoom) * scale;
    const visH = (containerSize.height / viewport.zoom) * scale;

    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(visX, visY, visW, visH);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(visX, visY, visW, visH);
    ctx.restore();
  }, [
    isOpen,
    image,
    imageDimensions,
    imageTransform,
    annotations,
    viewport,
    containerSize,
    miniMapWidth,
    clampedHeight,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to normalized ratio
    const ratioX = clickX / canvas.width;
    const ratioY = clickY / canvas.height;

    // Target scene center coordinates
    const targetSceneX = ratioX * imageDimensions.width;
    const targetSceneY = ratioY * imageDimensions.height;

    // Pan required to center targetSceneX, targetSceneY in container
    const newPanX = containerSize.width / 2 - targetSceneX * viewport.zoom;
    const newPanY = containerSize.height / 2 - targetSceneY * viewport.zoom;

    onNavigatePan(newPanX, newPanY);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  if (!isOpen) return null;

  return (
    <div
      id="pixelmark-minimap"
      className={`absolute bottom-4 right-4 z-20 backdrop-blur border rounded-xl shadow-2xl p-2 select-none flex flex-col gap-1.5 transition ${currentTheme.miniMap}`}
    >
      <div className="flex items-center justify-between px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span>Overview</span>
        <button
          onClick={onToggle}
          className="text-slate-500 hover:text-slate-300"
          title="Minimize Mini-Map"
        >
          <EyeOff className="w-3 h-3" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={miniMapWidth}
        height={clampedHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="rounded-lg border border-slate-800 cursor-crosshair"
      />
    </div>
  );
};
