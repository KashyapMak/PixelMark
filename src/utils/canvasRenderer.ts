import { AnnotationObject, ImageTransform, Point, ShadowSettings } from '../types';

export interface HandleHit {
  type: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate' | 'control' | 'tail' | 'target' | 'body';
  objectId: string;
}

export function parseHexOrRgba(color: string, opacity: number): string {
  if (!color || color === 'transparent') return 'transparent';
  if (color.startsWith('rgba')) {
    // If it's already rgba, replace alpha if opacity < 1
    return color;
  }
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length >= 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
  }
  return color;
}

export function applyShadow(ctx: CanvasRenderingContext2D, shadow: ShadowSettings) {
  if (shadow && shadow.enabled && shadow.blur > 0) {
    ctx.shadowColor = shadow.color || 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

export function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

export function applyStrokeStyle(ctx: CanvasRenderingContext2D, style: 'solid' | 'dashed' | 'dotted', width: number) {
  if (style === 'dashed') {
    ctx.setLineDash([width * 3, width * 2]);
  } else if (style === 'dotted') {
    ctx.setLineDash([width, width * 1.5]);
  } else {
    ctx.setLineDash([]);
  }
}

// Draw base image onto canvas context with rotation & flip
export function renderBaseImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dimensions: { width: number; height: number },
  transform: ImageTransform
) {
  const { width, height } = dimensions;
  ctx.save();

  // Move origin to center of canvas
  ctx.translate(width / 2, height / 2);

  // Apply rotation
  if (transform.rotation !== 0) {
    ctx.rotate((transform.rotation * Math.PI) / 180);
  }

  // Apply flips
  const scaleX = transform.flipH ? -1 : 1;
  const scaleY = transform.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // For 90 or 270 deg rotation, swap width & height
  const isRotated90 = transform.rotation === 90 || transform.rotation === 270;
  const drawW = isRotated90 ? height : width;
  const drawH = isRotated90 ? width : height;

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

// Render background transparency checkers
export function renderCheckeredBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size = 16,
  darkColor = '#0f172a',
  lightColor = '#1e293b'
) {
  ctx.save();
  ctx.fillStyle = lightColor;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = darkColor;
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
        ctx.fillRect(x, y, size, size);
      }
    }
  }
  ctx.restore();
}

// Draw individual annotation object
export function renderAnnotation(
  ctx: CanvasRenderingContext2D,
  obj: AnnotationObject,
  baseCanvas?: HTMLCanvasElement // used for sampling blur, pixelate, loupe
) {
  ctx.save();

  // Handle Spotlight filter separately (darkens canvas except hole)
  if (obj.type === 'spotlight') {
    renderSpotlight(ctx, obj);
    ctx.restore();
    return;
  }

  // Handle Redaction filters (Blur & Pixelate)
  if ((obj.type === 'blur' || obj.type === 'pixelate') && baseCanvas) {
    renderRedactionFilter(ctx, obj, baseCanvas);
    ctx.restore();
    return;
  }

  // Handle Loupe magnifier
  if (obj.type === 'loupe' && baseCanvas) {
    renderLoupe(ctx, obj, baseCanvas);
    ctx.restore();
    return;
  }

  // Position and rotate
  const centerX = obj.x + obj.width / 2;
  const centerY = obj.y + obj.height / 2;

  if (obj.rotation !== 0) {
    ctx.translate(centerX, centerY);
    ctx.rotate((obj.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Stroke and fill styles
  const strokeColor = parseHexOrRgba(obj.strokeColor, obj.strokeOpacity ?? 1);
  const fillColor = parseHexOrRgba(obj.fillColor, obj.fillOpacity ?? 1);

  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = obj.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  applyStrokeStyle(ctx, obj.strokeStyle, obj.strokeWidth);
  applyShadow(ctx, obj.shadow);

  // Blend mode for highlighter
  if (obj.type === 'highlighter') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.lineCap = 'square';
  }

  switch (obj.type) {
    case 'pen':
    case 'highlighter':
      renderFreehand(ctx, obj);
      break;
    case 'line':
      renderLine(ctx, obj);
      break;
    case 'arrow':
    case 'double_arrow':
      renderArrow(ctx, obj);
      break;
    case 'curved_arrow':
      renderCurvedArrow(ctx, obj);
      break;
    case 'orthogonal_arrow':
      renderOrthogonalArrow(ctx, obj);
      break;
    case 'rect':
      renderRect(ctx, obj);
      break;
    case 'rounded_rect':
      renderRoundedRect(ctx, obj);
      break;
    case 'ellipse':
      renderEllipse(ctx, obj);
      break;
    case 'triangle':
      renderTriangle(ctx, obj);
      break;
    case 'star':
      renderStar(ctx, obj);
      break;
    case 'polygon':
      renderPolygon(ctx, obj);
      break;
    case 'text':
      renderTextBox(ctx, obj);
      break;
    case 'speech_bubble':
    case 'thought_bubble':
      renderBubble(ctx, obj);
      break;
    case 'counter':
      renderCounterBadge(ctx, obj);
      break;
    case 'ruler':
      renderRuler(ctx, obj);
      break;
    case 'sticker':
      renderSticker(ctx, obj);
      break;
  }

  ctx.restore();
}

function renderFreehand(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  if (!obj.points || obj.points.length < 2) return;
  ctx.beginPath();
  const start = obj.points[0];
  ctx.moveTo(obj.x + start.x, obj.y + start.y);

  for (let i = 1; i < obj.points.length; i++) {
    const pt = obj.points[i];
    ctx.lineTo(obj.x + pt.x, obj.y + pt.y);
  }
  ctx.stroke();
}

function renderLine(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  ctx.beginPath();
  ctx.moveTo(obj.x, obj.y);
  ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
  ctx.stroke();
}

function renderArrow(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const x1 = obj.x;
  const y1 = obj.y;
  const x2 = obj.x + obj.width;
  const y2 = obj.y + obj.height;

  // Draw main shaft
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = Math.max(14, obj.strokeWidth * 3.5);

  // Arrowhead at end
  drawArrowHead(ctx, x2, y2, angle, headLen, obj.strokeColor);

  // Double arrow head at start
  if (obj.type === 'double_arrow') {
    drawArrowHead(ctx, x1, y1, angle + Math.PI, headLen, obj.strokeColor);
  }
}

function drawArrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, length: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - length * Math.cos(angle - Math.PI / 7), y - length * Math.sin(angle - Math.PI / 7));
  ctx.lineTo(x - (length * 0.7) * Math.cos(angle), y - (length * 0.7) * Math.sin(angle));
  ctx.lineTo(x - length * Math.cos(angle + Math.PI / 7), y - length * Math.sin(angle + Math.PI / 7));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderCurvedArrow(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const x1 = obj.x;
  const y1 = obj.y;
  const x2 = obj.x + obj.width;
  const y2 = obj.y + obj.height;

  // Default control point is perpendicular bisector
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const defaultCx = midX - dy * 0.3;
  const defaultCy = midY + dx * 0.3;

  const cx = obj.controlPoint ? obj.controlPoint.x : defaultCx;
  const cy = obj.controlPoint ? obj.controlPoint.y : defaultCy;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();

  // Tangent at end of quadratic bezier
  const angle = Math.atan2(y2 - cy, x2 - cx);
  const headLen = Math.max(14, obj.strokeWidth * 3.5);
  drawArrowHead(ctx, x2, y2, angle, headLen, obj.strokeColor);
}

function renderOrthogonalArrow(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const x1 = obj.x;
  const y1 = obj.y;
  const x2 = obj.x + obj.width;
  const y2 = obj.y + obj.height;

  const bend = obj.bendRatio ?? 0.5;
  const bendX = x1 + (x2 - x1) * bend;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(bendX, y1);
  ctx.lineTo(bendX, y2);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const angle = Math.atan2(0, x2 - bendX);
  const headLen = Math.max(14, obj.strokeWidth * 3.5);
  drawArrowHead(ctx, x2, y2, angle, headLen, obj.strokeColor);
}

function renderRect(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  if (obj.fillColor && obj.fillColor !== 'transparent') {
    ctx.fillRect(norm.x, norm.y, norm.width, norm.height);
  }
  if (obj.strokeWidth > 0) {
    ctx.strokeRect(norm.x, norm.y, norm.width, norm.height);
  }
}

function renderRoundedRect(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const radius = Math.min(obj.cornerRadius ?? 16, norm.width / 2, norm.height / 2);

  ctx.beginPath();
  ctx.roundRect(norm.x, norm.y, norm.width, norm.height, radius);
  if (obj.fillColor && obj.fillColor !== 'transparent') {
    ctx.fill();
  }
  if (obj.strokeWidth > 0) {
    ctx.stroke();
  }
}

function renderEllipse(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const cx = norm.x + norm.width / 2;
  const cy = norm.y + norm.height / 2;
  const rx = Math.abs(norm.width / 2);
  const ry = Math.abs(norm.height / 2);

  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
  if (obj.fillColor && obj.fillColor !== 'transparent') {
    ctx.fill();
  }
  if (obj.strokeWidth > 0) {
    ctx.stroke();
  }
}

function renderTriangle(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  ctx.beginPath();
  ctx.moveTo(norm.x + norm.width / 2, norm.y);
  ctx.lineTo(norm.x + norm.width, norm.y + norm.height);
  ctx.lineTo(norm.x, norm.y + norm.height);
  ctx.closePath();
  if (obj.fillColor && obj.fillColor !== 'transparent') {
    ctx.fill();
  }
  if (obj.strokeWidth > 0) {
    ctx.stroke();
  }
}

function renderStar(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const cx = norm.x + norm.width / 2;
  const cy = norm.y + norm.height / 2;
  const outerR = Math.min(norm.width, norm.height) / 2;
  const innerR = outerR * 0.45;
  const points = 5;

  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (obj.fillColor && obj.fillColor !== 'transparent') {
    ctx.fill();
  }
  if (obj.strokeWidth > 0) {
    ctx.stroke();
  }
}

function renderPolygon(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const cx = norm.x + norm.width / 2;
  const cy = norm.y + norm.height / 2;
  const r = Math.min(norm.width, norm.height) / 2;
  const sides = Math.max(3, obj.polygonSides ?? 6);

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (obj.fillColor && obj.fillColor !== 'transparent') {
    ctx.fill();
  }
  if (obj.strokeWidth > 0) {
    ctx.stroke();
  }
}

function renderTextBox(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const text = obj.text || 'Double-click to edit text';
  const fontSize = obj.fontSize ?? 20;
  const fontFamily = obj.fontFamily ?? 'Plus Jakarta Sans, system-ui, sans-serif';
  const fontWeight = obj.fontWeight ?? 'bold';
  const fontStyle = obj.fontStyle ?? 'normal';
  const padding = obj.bgPadding ?? 12;

  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

  // Optional background container
  if (obj.bgBubbleColor && obj.bgBubbleColor !== 'transparent') {
    ctx.fillStyle = obj.bgBubbleColor;
    ctx.beginPath();
    ctx.roundRect(norm.x, norm.y, norm.width, norm.height, 8);
    ctx.fill();
    if (obj.strokeWidth > 0) {
      ctx.stroke();
    }
  }

  // Draw text with word wrapping
  ctx.fillStyle = obj.textColor || obj.strokeColor || '#ffffff';
  ctx.textBaseline = 'top';
  ctx.textAlign = obj.textAlign ?? 'left';

  const lines = wrapText(ctx, text, norm.width - padding * 2);
  const lineHeight = fontSize * 1.35;
  const textX = obj.textAlign === 'center'
    ? norm.x + norm.width / 2
    : obj.textAlign === 'right'
    ? norm.x + norm.width - padding
    : norm.x + padding;

  let textY = norm.y + padding;
  for (const line of lines) {
    ctx.fillText(line, textX, textY);
    textY += lineHeight;
  }
}

function renderBubble(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const tail = obj.tailPoint ?? { x: norm.x + norm.width / 2, y: norm.y + norm.height + 40 };
  const radius = 16;

  ctx.beginPath();
  // Round rect body
  ctx.roundRect(norm.x, norm.y, norm.width, norm.height, radius);

  if (obj.fillColor && obj.fillColor !== 'transparent') {
    ctx.fill();
  }
  if (obj.strokeWidth > 0) {
    ctx.stroke();
  }

  // Speech bubble pointer or Thought circles
  if (obj.type === 'speech_bubble') {
    ctx.beginPath();
    const baseCenterX = norm.x + norm.width / 2;
    const baseCenterY = norm.y + norm.height;
    ctx.moveTo(baseCenterX - 14, baseCenterY);
    ctx.lineTo(tail.x, tail.y);
    ctx.lineTo(baseCenterX + 14, baseCenterY);
    ctx.closePath();
    if (obj.fillColor && obj.fillColor !== 'transparent') {
      ctx.fill();
    }
    if (obj.strokeWidth > 0) {
      ctx.stroke();
    }
  } else if (obj.type === 'thought_bubble') {
    // 3 thought circles connecting bubble to tail
    const baseCenterX = norm.x + norm.width / 2;
    const baseCenterY = norm.y + norm.height;
    const c1 = { x: baseCenterX + (tail.x - baseCenterX) * 0.3, y: baseCenterY + (tail.y - baseCenterY) * 0.3, r: 12 };
    const c2 = { x: baseCenterX + (tail.x - baseCenterX) * 0.65, y: baseCenterY + (tail.y - baseCenterY) * 0.65, r: 8 };
    const c3 = { x: tail.x, y: tail.y, r: 5 };

    [c1, c2, c3].forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      if (obj.fillColor && obj.fillColor !== 'transparent') ctx.fill();
      if (obj.strokeWidth > 0) ctx.stroke();
    });
  }

  // Text inside bubble
  if (obj.text) {
    renderTextBox(ctx, { ...obj, bgBubbleColor: 'transparent', strokeWidth: 0 });
  }
}

function renderCounterBadge(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const size = Math.min(norm.width, norm.height);
  const cx = norm.x + norm.width / 2;
  const cy = norm.y + norm.height / 2;
  const r = size / 2;

  ctx.beginPath();
  if (obj.badgeShape === 'square') {
    ctx.roundRect(norm.x, norm.y, norm.width, norm.height, 8);
  } else if (obj.badgeShape === 'pill') {
    ctx.roundRect(norm.x, norm.y, norm.width, norm.height, r);
  } else {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }

  ctx.fillStyle = obj.badgeColor || '#0284c7';
  ctx.fill();

  if (obj.strokeWidth > 0) {
    ctx.strokeStyle = obj.strokeColor || '#ffffff';
    ctx.stroke();
  }

  // Number text
  ctx.fillStyle = obj.badgeTextColor || '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.52)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(obj.stepNumber ?? 1), cx, cy);
}

// Render technical dimension ruler (ShareX Ruler Tool)
function renderRuler(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const x1 = obj.x;
  const y1 = obj.y;
  const x2 = obj.x + obj.width;
  const y2 = obj.y + obj.height;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return;

  const angle = Math.atan2(dy, dx);
  const perpAngle = angle + Math.PI / 2;
  const tickLen = Math.max(10, obj.strokeWidth * 3);

  ctx.save();
  ctx.strokeStyle = obj.strokeColor || '#38bdf8';
  ctx.lineWidth = Math.max(1.5, obj.strokeWidth);

  // 1. Draw cross-cap perpendicular ticks at start and end
  ctx.beginPath();
  // Start cap
  ctx.moveTo(x1 - (tickLen / 2) * Math.cos(perpAngle), y1 - (tickLen / 2) * Math.sin(perpAngle));
  ctx.lineTo(x1 + (tickLen / 2) * Math.cos(perpAngle), y1 + (tickLen / 2) * Math.sin(perpAngle));
  // End cap
  ctx.moveTo(x2 - (tickLen / 2) * Math.cos(perpAngle), y2 - (tickLen / 2) * Math.sin(perpAngle));
  ctx.lineTo(x2 + (tickLen / 2) * Math.cos(perpAngle), y2 + (tickLen / 2) * Math.sin(perpAngle));
  ctx.stroke();

  // 2. Draw main dimension line
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Arrowheads pointing outward to the caps
  const arrowSize = Math.max(8, obj.strokeWidth * 2.5);
  drawRulerArrowHead(ctx, x1, y1, angle, arrowSize, obj.strokeColor || '#38bdf8');
  drawRulerArrowHead(ctx, x2, y2, angle + Math.PI, arrowSize, obj.strokeColor || '#38bdf8');

  // Intermediate ruler tick marks along the path if distance > 40px
  if (dist >= 40) {
    const tickInterval = dist > 300 ? 50 : 20;
    const numTicks = Math.floor(dist / tickInterval);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i <= numTicks; i++) {
      const curD = i * tickInterval;
      if (curD >= dist - 15) break;
      const t = curD / dist;
      const px = x1 + dx * t;
      const py = y1 + dy * t;
      const subTickLen = i % 2 === 0 ? tickLen * 0.4 : tickLen * 0.25;
      ctx.moveTo(px - (subTickLen / 2) * Math.cos(perpAngle), py - (subTickLen / 2) * Math.sin(perpAngle));
      ctx.lineTo(px + (subTickLen / 2) * Math.cos(perpAngle), py + (subTickLen / 2) * Math.sin(perpAngle));
    }
    ctx.stroke();
  }

  // 3. Draw Dimension Badge Pill at midpoint
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Format label: e.g. "248 px" or "248 px (∠ 28°)"
  let label = `${Math.round(dist)} px`;
  if (obj.showAngle) {
    let deg = Math.round((angle * 180) / Math.PI);
    if (deg < 0) deg += 360;
    label += ` • ${deg}°`;
  }
  if (obj.showCoordinates) {
    label += ` [ΔX:${Math.round(Math.abs(dx))}, ΔY:${Math.round(Math.abs(dy))}]`;
  }

  ctx.font = '600 12px "Plus Jakarta Sans", system-ui, sans-serif';
  const textWidth = ctx.measureText(label).width;
  const pillW = textWidth + 18;
  const pillH = 24;

  ctx.save();
  ctx.translate(midX, midY);

  // Draw pill background with dark slate and border
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = obj.strokeColor || '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const pr = 6;
  ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, pr);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);
  ctx.restore();

  ctx.restore();
}

function drawRulerArrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size * Math.cos(angle - Math.PI / 6), y + size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(x + size * Math.cos(angle + Math.PI / 6), y + size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Global cache for loaded sticker / QR images
const stickerImageCache = new Map<string, HTMLImageElement>();

// Render ShareX stamps & stickers (mouse pointers, badges, flags, QR)
function renderSticker(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const { x, y, width: w, height: h } = norm;
  const sticker = obj.stickerType || 'cursor_arrow';
  const color = obj.stickerColor || obj.fillColor !== 'transparent' ? obj.fillColor : '#38bdf8';

  ctx.save();

  // If it's a QR sticker with image data
  if (sticker === 'qr' && obj.qrDataUrl) {
    let img = stickerImageCache.get(obj.qrDataUrl);
    if (!img) {
      img = new Image();
      img.src = obj.qrDataUrl;
      stickerImageCache.set(obj.qrDataUrl, img);
    }
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x, y, w, h);
    } else {
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(x, y, w, h);
    }
    ctx.restore();
    return;
  }

  // Vector cursors and badges
  const cx = x + w / 2;
  const cy = y + h / 2;

  switch (sticker) {
    case 'cursor_arrow': {
      // Classic pixel-perfect mouse arrow
      ctx.save();
      ctx.translate(x, y);
      const s = Math.min(w, h) / 32;
      ctx.scale(s, s);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 26);
      ctx.lineTo(7, 20);
      ctx.lineTo(13, 31);
      ctx.lineTo(17, 29);
      ctx.lineTo(11, 18);
      ctx.lineTo(20, 18);
      ctx.closePath();

      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'cursor_pointer': {
      // Hand pointer
      ctx.save();
      ctx.translate(x, y);
      const s = Math.min(w, h) / 32;
      ctx.scale(s, s);

      ctx.beginPath();
      ctx.moveTo(8, 2);
      ctx.lineTo(8, 14);
      ctx.lineTo(4, 14);
      ctx.lineTo(1, 18);
      ctx.lineTo(9, 26);
      ctx.lineTo(22, 26);
      ctx.lineTo(25, 18);
      ctx.lineTo(23, 11);
      ctx.lineTo(18, 11);
      ctx.lineTo(18, 7);
      ctx.lineTo(13, 7);
      ctx.lineTo(13, 2);
      ctx.closePath();

      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'cursor_crosshair': {
      ctx.strokeStyle = color || '#ef4444';
      ctx.lineWidth = Math.max(2, obj.strokeWidth);
      const r = Math.min(w, h) * 0.35;
      // Outer circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // Center dot
      ctx.fillStyle = color || '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // 4 radial lines
      ctx.beginPath();
      ctx.moveTo(cx - r - 6, cy);
      ctx.lineTo(cx - r + 4, cy);
      ctx.moveTo(cx + r - 4, cy);
      ctx.lineTo(cx + r + 6, cy);
      ctx.moveTo(cx, cy - r - 6);
      ctx.lineTo(cx, cy - r + 4);
      ctx.moveTo(cx, cy + r - 4);
      ctx.lineTo(cx, cy + r + 6);
      ctx.stroke();
      break;
    }

    case 'cursor_ibeam': {
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      const beamW = Math.min(w, h) * 0.4;
      const beamH = Math.min(w, h) * 0.7;
      ctx.beginPath();
      // top serif
      ctx.moveTo(cx - beamW / 2, cy - beamH / 2);
      ctx.lineTo(cx + beamW / 2, cy - beamH / 2);
      // center line
      ctx.moveTo(cx, cy - beamH / 2);
      ctx.lineTo(cx, cy + beamH / 2);
      // bottom serif
      ctx.moveTo(cx - beamW / 2, cy + beamH / 2);
      ctx.lineTo(cx + beamW / 2, cy + beamH / 2);
      ctx.stroke();
      break;
    }

    case 'check': {
      const radius = Math.min(w, h) / 2 - 2;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      ctx.stroke();

      // White checkmark
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(3, radius * 0.22);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - radius * 0.45, cy + radius * 0.05);
      ctx.lineTo(cx - radius * 0.1, cy + radius * 0.42);
      ctx.lineTo(cx + radius * 0.45, cy - radius * 0.35);
      ctx.stroke();
      break;
    }

    case 'cross': {
      const radius = Math.min(w, h) / 2 - 2;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // White X
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(3, radius * 0.22);
      ctx.lineCap = 'round';
      const offset = radius * 0.4;
      ctx.beginPath();
      ctx.moveTo(cx - offset, cy - offset);
      ctx.lineTo(cx + offset, cy + offset);
      ctx.moveTo(cx + offset, cy - offset);
      ctx.lineTo(cx - offset, cy + offset);
      ctx.stroke();
      break;
    }

    case 'warning': {
      const size = Math.min(w, h) - 4;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx, cy - size / 2);
      ctx.lineTo(cx + size / 2, cy + size / 2);
      ctx.lineTo(cx - size / 2, cy + size / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Exclamation mark
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.rect(cx - 2, cy - size * 0.15, 4, size * 0.32);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy + size * 0.32, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'info': {
      const radius = Math.min(w, h) / 2 - 2;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2;
      ctx.stroke();

      // White "i"
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy - radius * 0.38, radius * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - radius * 0.12, cy - radius * 0.1, radius * 0.24, radius * 0.55);
      break;
    }

    case 'question': {
      const radius = Math.min(w, h) / 2 - 2;
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(radius * 1.2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', cx, cy + 1);
      break;
    }

    case 'star': {
      const rOuter = Math.min(w, h) / 2 - 2;
      const rInner = rOuter * 0.45;
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? rOuter : rInner;
        const px = cx + r * Math.cos(rad);
        const py = cy + r * Math.sin(rad);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'flag': {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      const poleX = x + w * 0.25;
      // Pole
      ctx.beginPath();
      ctx.moveTo(poleX, y + h * 0.9);
      ctx.lineTo(poleX, y + h * 0.1);
      ctx.stroke();

      // Flag triangle
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(poleX, y + h * 0.1);
      ctx.lineTo(x + w * 0.85, y + h * 0.32);
      ctx.lineTo(poleX, y + h * 0.54);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'heart': {
      const s = Math.min(w, h) * 0.42;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(0, s * 0.5);
      ctx.bezierCurveTo(s * 0.8, -s * 0.2, s * 1.1, -s * 0.9, 0, -s * 0.6);
      ctx.bezierCurveTo(-s * 1.1, -s * 0.9, -s * 0.8, -s * 0.2, 0, s * 0.5);
      ctx.fill();
      ctx.restore();
      break;
    }
  }

  ctx.restore();
}


function renderSpotlight(ctx: CanvasRenderingContext2D, obj: AnnotationObject) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const dim = obj.dimOpacity ?? 0.65;

  // Use destination-out or full overlay with hole
  ctx.fillStyle = `rgba(0, 0, 0, ${dim})`;
  // Draw darkness over entire canvas
  const canvasW = ctx.canvas.width;
  const canvasH = ctx.canvas.height;

  // We draw 4 rects around the spotlight hole or composite
  ctx.save();
  // Cutout mask
  ctx.beginPath();
  ctx.rect(0, 0, canvasW, canvasH);
  if (obj.spotlightShape === 'ellipse') {
    const cx = norm.x + norm.width / 2;
    const cy = norm.y + norm.height / 2;
    ctx.ellipse(cx, cy, Math.max(1, norm.width / 2), Math.max(1, norm.height / 2), 0, 0, Math.PI * 2, true);
  } else {
    // Cutout rect in counter-clockwise order
    ctx.rect(norm.x + norm.width, norm.y, -norm.width, norm.height);
  }
  ctx.fill();

  // Subtle border around illuminated area
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  if (obj.spotlightShape === 'ellipse') {
    const cx = norm.x + norm.width / 2;
    const cy = norm.y + norm.height / 2;
    ctx.ellipse(cx, cy, Math.max(1, norm.width / 2), Math.max(1, norm.height / 2), 0, 0, Math.PI * 2);
  } else {
    ctx.strokeRect(norm.x, norm.y, norm.width, norm.height);
  }
  ctx.stroke();
  ctx.restore();
}

function renderRedactionFilter(
  ctx: CanvasRenderingContext2D,
  obj: AnnotationObject,
  baseCanvas: HTMLCanvasElement
) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  if (norm.width <= 2 || norm.height <= 2) return;

  const sx = Math.max(0, Math.min(baseCanvas.width, norm.x));
  const sy = Math.max(0, Math.min(baseCanvas.height, norm.y));
  const sw = Math.min(baseCanvas.width - sx, norm.width);
  const sh = Math.min(baseCanvas.height - sy, norm.height);
  if (sw <= 0 || sh <= 0) return;

  if (obj.type === 'pixelate') {
    const pixelSize = Math.max(4, obj.pixelSize ?? 12);
    // Downscale then upscale with nearest-neighbor
    const tempCanvas = document.createElement('canvas');
    const smallW = Math.max(1, Math.floor(sw / pixelSize));
    const smallH = Math.max(1, Math.floor(sh / pixelSize));
    tempCanvas.width = smallW;
    tempCanvas.height = smallH;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.imageSmoothingEnabled = true;
    tempCtx.drawImage(baseCanvas, sx, sy, sw, sh, 0, 0, smallW, smallH);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, sx, sy, sw, sh);

    // Border around pixelated region
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.restore();
  } else if (obj.type === 'blur') {
    const blurRadius = Math.max(2, obj.blurRadius ?? 10);
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();
    ctx.filter = `blur(${blurRadius}px)`;
    // Draw base canvas section with blur filter applied
    ctx.drawImage(baseCanvas, 0, 0);
    ctx.restore();

    // Border around blurred region
    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.restore();
  }
}

function renderLoupe(
  ctx: CanvasRenderingContext2D,
  obj: AnnotationObject,
  baseCanvas: HTMLCanvasElement
) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const zoom = obj.loupeZoom ?? 2;
  const target = obj.targetPoint ?? { x: norm.x + norm.width / 2, y: norm.y + norm.height / 2 };
  const cx = norm.x + norm.width / 2;
  const cy = norm.y + norm.height / 2;
  const r = Math.min(norm.width, norm.height) / 2;

  ctx.save();

  // Connector line from loupe to target if distant
  const dist = Math.hypot(target.x - cx, target.y - cy);
  if (dist > r + 10) {
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();

    // Target crosshair
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw magnified image in circular lens
  ctx.beginPath();
  if (obj.loupeShape === 'rect') {
    ctx.roundRect(norm.x, norm.y, norm.width, norm.height, 12);
  } else {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.clip();

  // Draw magnified sample
  const sampleW = norm.width / zoom;
  const sampleH = norm.height / zoom;
  const sx = target.x - sampleW / 2;
  const sy = target.y - sampleH / 2;

  ctx.drawImage(baseCanvas, sx, sy, sampleW, sampleH, norm.x, norm.y, norm.width, norm.height);

  // Subtle glass vignette reflection
  const gradient = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();

  // Lens bezel frame
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (obj.loupeShape === 'rect') {
    ctx.roundRect(norm.x, norm.y, norm.width, norm.height, 12);
  } else {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.stroke();

  // Magnification badge pill (e.g. "2.0x")
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(cx - 24, norm.y + norm.height - 18, 48, 20, 10);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${zoom.toFixed(1)}x`, cx, norm.y + norm.height - 8);
  ctx.restore();
}

// Bounding box & interactive handles for selected object
export function renderSelectionBox(
  ctx: CanvasRenderingContext2D,
  obj: AnnotationObject,
  scale: number
) {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const handleSize = Math.max(8, 9 / scale);

  ctx.save();
  const centerX = norm.x + norm.width / 2;
  const centerY = norm.y + norm.height / 2;

  if (obj.rotation !== 0) {
    ctx.translate(centerX, centerY);
    ctx.rotate((obj.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  // Bounding box dashed border
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5 / scale;
  ctx.setLineDash([4 / scale, 4 / scale]);
  ctx.strokeRect(norm.x, norm.y, norm.width, norm.height);
  ctx.setLineDash([]);

  // Rotation handle stem and circle
  const rotDist = 24 / scale;
  ctx.beginPath();
  ctx.moveTo(centerX, norm.y);
  ctx.lineTo(centerX, norm.y - rotDist);
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(centerX, norm.y - rotDist, handleSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1 / scale;
  ctx.stroke();

  // 8 Scale handles
  const handles = [
    { x: norm.x, y: norm.y }, // nw
    { x: centerX, y: norm.y }, // n
    { x: norm.x + norm.width, y: norm.y }, // ne
    { x: norm.x + norm.width, y: centerY }, // e
    { x: norm.x + norm.width, y: norm.y + norm.height }, // se
    { x: centerX, y: norm.y + norm.height }, // s
    { x: norm.x, y: norm.y + norm.height }, // sw
    { x: norm.x, y: centerY }, // w
  ];

  handles.forEach((h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5 / scale;
    ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
  });

  // Extra handle for Bezier arrow control point
  if (obj.type === 'curved_arrow' && obj.controlPoint) {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(obj.controlPoint.x, obj.controlPoint.y, handleSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }

  // Extra handle for speech bubble tail
  if ((obj.type === 'speech_bubble' || obj.type === 'thought_bubble') && obj.tailPoint) {
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(obj.tailPoint.x, obj.tailPoint.y, handleSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }

  // Extra handle for Loupe target point
  if (obj.type === 'loupe' && obj.targetPoint) {
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(obj.targetPoint.x, obj.targetPoint.y, handleSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }

  ctx.restore();
}

// Render Crop overlay with 3x3 grid
export function renderCropOverlay(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  cropBox: { x: number; y: number; width: number; height: number },
  scale: number
) {
  ctx.save();
  // Dim outer canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Clear crop box hole
  ctx.clearRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

  // Crop box border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2 / scale;
  ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height);

  // Rule of Thirds grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1 / scale;
  ctx.beginPath();
  // Vertical lines
  ctx.moveTo(cropBox.x + cropBox.width / 3, cropBox.y);
  ctx.lineTo(cropBox.x + cropBox.width / 3, cropBox.y + cropBox.height);
  ctx.moveTo(cropBox.x + (cropBox.width * 2) / 3, cropBox.y);
  ctx.lineTo(cropBox.x + (cropBox.width * 2) / 3, cropBox.y + cropBox.height);
  // Horizontal lines
  ctx.moveTo(cropBox.x, cropBox.y + cropBox.height / 3);
  ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + cropBox.height / 3);
  ctx.moveTo(cropBox.x, cropBox.y + (cropBox.height * 2) / 3);
  ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + (cropBox.height * 2) / 3);
  ctx.stroke();

  // Corner heavy accents
  const cornerLen = 20 / scale;
  const cornerW = 4 / scale;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = cornerW;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(cropBox.x, cropBox.y + cornerLen);
  ctx.lineTo(cropBox.x, cropBox.y);
  ctx.lineTo(cropBox.x + cornerLen, cropBox.y);
  // Top-right
  ctx.moveTo(cropBox.x + cropBox.width - cornerLen, cropBox.y);
  ctx.lineTo(cropBox.x + cropBox.width, cropBox.y);
  ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + cornerLen);
  // Bottom-right
  ctx.moveTo(cropBox.x + cropBox.width, cropBox.y + cropBox.height - cornerLen);
  ctx.lineTo(cropBox.x + cropBox.width, cropBox.y + cropBox.height);
  ctx.lineTo(cropBox.x + cropBox.width - cornerLen, cropBox.y + cropBox.height);
  // Bottom-left
  ctx.moveTo(cropBox.x + cornerLen, cropBox.y + cropBox.height);
  ctx.lineTo(cropBox.x, cropBox.y + cropBox.height);
  ctx.lineTo(cropBox.x, cropBox.y + cropBox.height - cornerLen);
  ctx.stroke();

  ctx.restore();
}

// Helpers
export function normalizeRect(x: number, y: number, w: number, h: number) {
  return {
    x: w < 0 ? x + w : x,
    y: h < 0 ? y + h : y,
    width: Math.abs(w),
    height: Math.abs(h),
  };
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}

// Hit test for mouse pointer against an annotation object
export function isPointInsideObject(pt: Point, obj: AnnotationObject, tolerance = 8): boolean {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  // Un-rotate the point around object center to test in local axis
  const centerX = norm.x + norm.width / 2;
  const centerY = norm.y + norm.height / 2;

  let testX = pt.x;
  let testY = pt.y;

  if (obj.rotation !== 0) {
    const rad = (-obj.rotation * Math.PI) / 180;
    const dx = pt.x - centerX;
    const dy = pt.y - centerY;
    testX = centerX + dx * Math.cos(rad) - dy * Math.sin(rad);
    testY = centerY + dx * Math.sin(rad) + dy * Math.cos(rad);
  }

  // Freehand path point distance check
  if (obj.type === 'pen' || obj.type === 'highlighter') {
    if (!obj.points) return false;
    for (const p of obj.points) {
      if (Math.hypot(pt.x - (obj.x + p.x), pt.y - (obj.y + p.y)) < tolerance + obj.strokeWidth / 2) {
        return true;
      }
    }
    return false;
  }

  // Line, arrow, and ruler segment distance check
  if (obj.type === 'line' || obj.type === 'arrow' || obj.type === 'double_arrow' || obj.type === 'ruler') {
    const x1 = obj.x;
    const y1 = obj.y;
    const x2 = obj.x + obj.width;
    const y2 = obj.y + obj.height;
    const lineLenSq = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (lineLenSq > 0) {
      let t = ((pt.x - x1) * (x2 - x1) + (pt.y - y1) * (y2 - y1)) / lineLenSq;
      t = Math.max(0, Math.min(1, t));
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);
      if (Math.hypot(pt.x - projX, pt.y - projY) <= Math.max(tolerance, obj.strokeWidth * 2)) {
        return true;
      }
    }
  }

  // General bounding box check with padding
  return (
    testX >= norm.x - tolerance &&
    testX <= norm.x + norm.width + tolerance &&
    testY >= norm.y - tolerance &&
    testY <= norm.y + norm.height + tolerance
  );
}

// Detect which transform handle is clicked on a selected object
export function getHandleAtPoint(pt: Point, obj: AnnotationObject, scale: number): HandleHit | null {
  const norm = normalizeRect(obj.x, obj.y, obj.width, obj.height);
  const centerX = norm.x + norm.width / 2;
  const centerY = norm.y + norm.height / 2;
  const handleRadius = Math.max(10, 12 / scale);

  // Un-rotate click point
  let testX = pt.x;
  let testY = pt.y;
  if (obj.rotation !== 0) {
    const rad = (-obj.rotation * Math.PI) / 180;
    const dx = pt.x - centerX;
    const dy = pt.y - centerY;
    testX = centerX + dx * Math.cos(rad) - dy * Math.sin(rad);
    testY = centerY + dx * Math.sin(rad) + dy * Math.cos(rad);
  }

  // Rotation handle check
  const rotDist = 24 / scale;
  if (Math.hypot(testX - centerX, testY - (norm.y - rotDist)) <= handleRadius) {
    return { type: 'rotate', objectId: obj.id };
  }

  // Scale handles
  const handles: { type: HandleHit['type']; x: number; y: number }[] = [
    { type: 'nw', x: norm.x, y: norm.y },
    { type: 'n', x: centerX, y: norm.y },
    { type: 'ne', x: norm.x + norm.width, y: norm.y },
    { type: 'e', x: norm.x + norm.width, y: centerY },
    { type: 'se', x: norm.x + norm.width, y: norm.y + norm.height },
    { type: 's', x: centerX, y: norm.y + norm.height },
    { type: 'sw', x: norm.x, y: norm.y + norm.height },
    { type: 'w', x: norm.x, y: centerY },
  ];

  for (const h of handles) {
    if (Math.hypot(testX - h.x, testY - h.y) <= handleRadius) {
      return { type: h.type, objectId: obj.id };
    }
  }

  // Bezier arrow custom control point handle
  if (obj.type === 'curved_arrow' && obj.controlPoint) {
    if (Math.hypot(pt.x - obj.controlPoint.x, pt.y - obj.controlPoint.y) <= handleRadius) {
      return { type: 'control', objectId: obj.id };
    }
  }

  // Speech bubble tail handle
  if ((obj.type === 'speech_bubble' || obj.type === 'thought_bubble') && obj.tailPoint) {
    if (Math.hypot(pt.x - obj.tailPoint.x, pt.y - obj.tailPoint.y) <= handleRadius) {
      return { type: 'tail', objectId: obj.id };
    }
  }

  // Loupe target handle
  if (obj.type === 'loupe' && obj.targetPoint) {
    if (Math.hypot(pt.x - obj.targetPoint.x, pt.y - obj.targetPoint.y) <= handleRadius) {
      return { type: 'target', objectId: obj.id };
    }
  }

  return null;
}
