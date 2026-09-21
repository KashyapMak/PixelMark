import { ImageEffectsSettings } from '../types';

export const DEFAULT_IMAGE_EFFECTS: ImageEffectsSettings = {
  windowFrame: 'none',
  windowTitle: 'PixelMark Capture',
  padding: 32,
  backgroundType: 'gradient',
  backgroundColor: '#0f172a',
  gradientPreset: 'sunset',
  cornerRadius: 12,
  shadowEnabled: true,
  shadowBlur: 24,
  shadowOpacity: 0.45,
  shadowOffsetY: 12,
  borderWidth: 0,
  borderColor: '#334155',
  watermarkEnabled: false,
  watermarkText: 'PIXELMARK • CONFIDENTIAL',
  watermarkOpacity: 0.35,
  watermarkPosition: 'bottom_right',
  watermarkFontSize: 16,
  watermarkColor: '#ffffff',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  grayscale: 0,
  sepia: 0,
  invert: false,
};

export const GRADIENT_PRESETS: Record<
  ImageEffectsSettings['gradientPreset'],
  { name: string; stops: [string, string, string] }
> = {
  sunset: { name: 'Sunset Glow', stops: ['#f43f5e', '#a855f7', '#3b82f6'] },
  ocean: { name: 'Deep Ocean', stops: ['#06b6d4', '#3b82f6', '#1e1b4b'] },
  midnight: { name: 'Midnight Aurora', stops: ['#0f172a', '#1e1b4b', '#312e81'] },
  neon: { name: 'Cyber Neon', stops: ['#ec4899', '#8b5cf6', '#06b6d4'] },
  hyper: { name: 'Hyper Warmth', stops: ['#f97316', '#ef4444', '#7c3aed'] },
};

export function renderImageEffects(
  sourceCanvasOrImg: HTMLCanvasElement | HTMLImageElement,
  settings: ImageEffectsSettings
): HTMLCanvasElement {
  const srcW = 'videoWidth' in sourceCanvasOrImg ? 0 : sourceCanvasOrImg.width;
  const srcH = 'videoWidth' in sourceCanvasOrImg ? 0 : sourceCanvasOrImg.height;

  // Window titlebar height
  const titleBarHeight = settings.windowFrame !== 'none' ? 36 : 0;
  const innerW = srcW;
  const innerH = srcH + titleBarHeight;

  // Total canvas dimensions with padding
  const totalW = innerW + settings.padding * 2;
  const totalH = innerH + settings.padding * 2;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = totalW;
  outCanvas.height = totalH;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return outCanvas;

  // 1. Draw Outer Background
  if (settings.backgroundType === 'solid') {
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, totalW, totalH);
  } else if (settings.backgroundType === 'gradient') {
    const preset = GRADIENT_PRESETS[settings.gradientPreset] || GRADIENT_PRESETS.sunset;
    const grad = ctx.createLinearGradient(0, 0, totalW, totalH);
    grad.addColorStop(0, preset.stops[0]);
    grad.addColorStop(0.5, preset.stops[1]);
    grad.addColorStop(1, preset.stops[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, totalW, totalH);
  } else if (settings.backgroundType === 'blur') {
    // Draw blurred, scaled version of image as background
    ctx.save();
    ctx.filter = 'blur(28px) brightness(0.65)';
    ctx.drawImage(sourceCanvasOrImg, -20, -20, totalW + 40, totalH + 40);
    ctx.restore();
    // Dark overlay tint for readability
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(0, 0, totalW, totalH);
  } // if transparent, leave blank

  // Coords for inner window/image card
  const cardX = settings.padding;
  const cardY = settings.padding;

  // 2. Draw Shadow behind window/image card
  if (settings.shadowEnabled && settings.shadowBlur > 0) {
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${settings.shadowOpacity})`;
    ctx.shadowBlur = settings.shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = settings.shadowOffsetY;
    ctx.fillStyle = '#000000';
    drawRoundedRectPath(ctx, cardX, cardY, innerW, innerH, settings.cornerRadius);
    ctx.fill();
    ctx.restore();
  }

  // 3. Draw Window & Image (Clipped to rounded corners)
  ctx.save();
  drawRoundedRectPath(ctx, cardX, cardY, innerW, innerH, settings.cornerRadius);
  ctx.clip();

  // Draw Window Title Bar if enabled
  if (settings.windowFrame.startsWith('macos')) {
    const isDark = settings.windowFrame === 'macos_dark';
    ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
    ctx.fillRect(cardX, cardY, innerW, titleBarHeight);

    // Title text
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(settings.windowTitle || 'PixelMark', cardX + innerW / 2, cardY + titleBarHeight / 2);

    // macOS Traffic Lights (Close, Minimize, Maximize)
    const btnY = cardY + titleBarHeight / 2;
    const btnRadius = 5.5;
    const startBtnX = cardX + 16;
    const gap = 18;

    // Red
    ctx.fillStyle = '#ff5f56';
    ctx.beginPath();
    ctx.arc(startBtnX, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fill();

    // Yellow
    ctx.fillStyle = '#ffbd2e';
    ctx.beginPath();
    ctx.arc(startBtnX + gap, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fill();

    // Green
    ctx.fillStyle = '#27c93f';
    ctx.beginPath();
    ctx.arc(startBtnX + gap * 2, btnY, btnRadius, 0, Math.PI * 2);
    ctx.fill();
  } else if (settings.windowFrame.startsWith('windows')) {
    const isDark = settings.windowFrame === 'windows_dark';
    ctx.fillStyle = isDark ? '#18181b' : '#e4e4e7';
    ctx.fillRect(cardX, cardY, innerW, titleBarHeight);

    // Title
    ctx.fillStyle = isDark ? '#a1a1aa' : '#52525b';
    ctx.font = '500 12px "Segoe UI", Tahoma, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(settings.windowTitle || 'PixelMark', cardX + 14, cardY + titleBarHeight / 2);

    // Windows controls on right: Minimize, Maximize, Close
    const iconColor = isDark ? '#d4d4d8' : '#3f3f46';
    ctx.strokeStyle = iconColor;
    ctx.lineWidth = 1.2;
    const rightX = cardX + innerW - 14;
    const midY = cardY + titleBarHeight / 2;

    // Close X
    ctx.beginPath();
    ctx.moveTo(rightX - 8, midY - 4);
    ctx.lineTo(rightX, midY + 4);
    ctx.moveTo(rightX, midY - 4);
    ctx.lineTo(rightX - 8, midY + 4);
    ctx.stroke();

    // Maximize square
    ctx.strokeRect(rightX - 30, midY - 4, 8, 8);

    // Minimize line
    ctx.beginPath();
    ctx.moveTo(rightX - 52, midY + 3);
    ctx.lineTo(rightX - 44, midY + 3);
    ctx.stroke();
  }

  // 4. Draw Image with Filter Adjustments
  ctx.save();
  const filterParts: string[] = [];
  if (settings.brightness !== 0) filterParts.push(`brightness(${100 + settings.brightness}%)`);
  if (settings.contrast !== 0) filterParts.push(`contrast(${100 + settings.contrast}%)`);
  if (settings.saturation !== 0) filterParts.push(`saturate(${100 + settings.saturation}%)`);
  if (settings.grayscale > 0) filterParts.push(`grayscale(${settings.grayscale}%)`);
  if (settings.sepia > 0) filterParts.push(`sepia(${settings.sepia}%)`);
  if (settings.invert) filterParts.push('invert(100%)');

  if (filterParts.length > 0) {
    ctx.filter = filterParts.join(' ');
  }

  const imgY = cardY + titleBarHeight;
  ctx.drawImage(sourceCanvasOrImg, cardX, imgY, srcW, srcH);
  ctx.restore();

  // Draw Card Outline Border if requested
  if (settings.borderWidth > 0) {
    ctx.strokeStyle = settings.borderColor;
    ctx.lineWidth = settings.borderWidth;
    drawRoundedRectPath(ctx, cardX, cardY, innerW, innerH, settings.cornerRadius);
    ctx.stroke();
  }

  ctx.restore(); // end clip

  // 5. Watermark Rendering
  if (settings.watermarkEnabled && settings.watermarkText.trim()) {
    renderWatermark(ctx, settings, cardX, cardY + titleBarHeight, srcW, srcH);
  }

  return outCanvas;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function renderWatermark(
  ctx: CanvasRenderingContext2D,
  settings: ImageEffectsSettings,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number
) {
  ctx.save();
  const rawText = settings.watermarkText
    .replace(/\{\{date\}\}/gi, new Date().toLocaleDateString())
    .replace(/\{\{time\}\}/gi, new Date().toLocaleTimeString());

  ctx.fillStyle = settings.watermarkColor;
  ctx.globalAlpha = settings.watermarkOpacity;
  ctx.font = `700 ${settings.watermarkFontSize}px "Plus Jakarta Sans", sans-serif`;

  if (settings.watermarkPosition === 'diagonal_tile') {
    // 45 degree repeating tile pattern
    ctx.save();
    ctx.translate(imgX + imgW / 2, imgY + imgH / 2);
    ctx.rotate((-35 * Math.PI) / 180);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const stepX = 260;
    const stepY = 120;
    const bound = Math.max(imgW, imgH) * 1.5;
    for (let x = -bound; x <= bound; x += stepX) {
      for (let y = -bound; y <= bound; y += stepY) {
        ctx.fillText(rawText, x, y);
      }
    }
    ctx.restore();
  } else {
    const pad = 20;
    ctx.textBaseline = 'bottom';
    switch (settings.watermarkPosition) {
      case 'top_left':
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(rawText, imgX + pad, imgY + pad);
        break;
      case 'top_right':
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(rawText, imgX + imgW - pad, imgY + pad);
        break;
      case 'center':
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rawText, imgX + imgW / 2, imgY + imgH / 2);
        break;
      case 'bottom_left':
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(rawText, imgX + pad, imgY + imgH - pad);
        break;
      case 'bottom_right':
      default:
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(rawText, imgX + imgW - pad, imgY + imgH - pad);
        break;
    }
  }

  ctx.restore();
}
