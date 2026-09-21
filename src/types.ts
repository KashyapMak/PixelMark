export type AppTheme = 'dark' | 'light' | 'midnight';

export type ToolType =
  | 'select'
  | 'pan'
  | 'pen'
  | 'highlighter'
  | 'line'
  | 'arrow'
  | 'double_arrow'
  | 'curved_arrow'
  | 'orthogonal_arrow'
  | 'rect'
  | 'rounded_rect'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'polygon'
  | 'text'
  | 'speech_bubble'
  | 'thought_bubble'
  | 'blur'
  | 'pixelate'
  | 'spotlight'
  | 'loupe'
  | 'counter'
  | 'ruler'
  | 'sticker'
  | 'crop';

export type StickerType =
  | 'cursor_arrow'
  | 'cursor_pointer'
  | 'cursor_crosshair'
  | 'cursor_ibeam'
  | 'check'
  | 'cross'
  | 'warning'
  | 'info'
  | 'question'
  | 'star'
  | 'flag'
  | 'heart'
  | 'qr'
  | 'qr_code';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface ShadowSettings {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface AnnotationObject {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  fillColor: string; // hex or 'transparent'
  fillOpacity: number;
  shadow: ShadowSettings;
  locked: boolean;
  groupId?: string;
  // Freehand path points (relative to x, y)
  points?: Point[];
  // Curved / Orthogonal arrow custom handles
  controlPoint?: Point; // for curved bezier
  bendRatio?: number; // for orthogonal arrow 0 to 1
  // Specific shape settings
  cornerRadius?: number; // for rounded rect
  polygonSides?: number; // for polygon
  // Text & speech bubble
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  bgPadding?: number;
  bgBubbleColor?: string;
  tailPoint?: Point; // speech/thought bubble pointer tip
  // Redaction / filters
  blurRadius?: number; // for blur
  pixelSize?: number; // for pixelate
  dimOpacity?: number; // for spotlight
  spotlightShape?: 'rect' | 'ellipse';
  // Loupe magnifier
  loupeZoom?: number; // e.g. 2x
  loupeShape?: 'circle' | 'rect';
  targetPoint?: Point; // point being magnified
  // Auto-increment step badge
  stepNumber?: number;
  badgeShape?: 'circle' | 'square' | 'pill';
  badgeColor?: string;
  badgeTextColor?: string;
  // Ruler measurement
  rulerUnits?: 'px' | 'cm' | 'in';
  showAngle?: boolean;
  showCoordinates?: boolean;
  // Stickers / Stamps
  stickerType?: StickerType;
  stickerColor?: string;
  qrDataUrl?: string; // for rendered QR code sticker
}

export interface ImageEffectsSettings {
  // Window frame & controls
  windowFrame: 'none' | 'macos_dark' | 'macos_light' | 'windows_dark' | 'windows_light';
  windowTitle?: string;
  // Canvas padding & background
  padding: number; // in pixels
  backgroundType: 'transparent' | 'solid' | 'gradient' | 'blur';
  backgroundColor: string;
  gradientPreset: 'sunset' | 'ocean' | 'midnight' | 'neon' | 'hyper';
  // Border & shadow
  cornerRadius: number;
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowOpacity: number;
  shadowOffsetY: number;
  borderWidth: number;
  borderColor: string;
  // Watermark
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkPosition: 'top_left' | 'top_right' | 'center' | 'bottom_left' | 'bottom_right' | 'diagonal_tile';
  watermarkFontSize: number;
  watermarkColor: string;
  // Adjustments
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  grayscale: number; // 0 to 100
  sepia: number; // 0 to 100
  invert: boolean;
}

export interface ImageTransform {
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export interface HistoryState {
  annotations: AnnotationObject[];
  imageSrc: string | null;
  imageTransform: ImageTransform;
  canvasDimensions: { width: number; height: number };
}

export interface CropState {
  isCropping: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio: number | null; // null for freeform
}

export interface CanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
}
