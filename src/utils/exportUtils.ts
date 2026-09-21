import { AnnotationObject, ImageTransform } from '../types';
import {
  renderAnnotation,
  renderBaseImage,
} from './canvasRenderer';

export interface ProjectData {
  version: string;
  timestamp: string;
  imageSrc: string | null;
  imageDimensions: { width: number; height: number };
  imageTransform: ImageTransform;
  annotations: AnnotationObject[];
}

export async function generateExportCanvas(options: {
  image: HTMLImageElement | null;
  imageDimensions: { width: number; height: number };
  imageTransform: ImageTransform;
  annotations: AnnotationObject[];
  scope: 'all' | 'crop' | 'selection';
  cropBox?: { x: number; y: number; width: number; height: number };
  selectedIds?: string[];
  backgroundColor?: string;
}): Promise<HTMLCanvasElement> {
  const {
    image,
    imageDimensions,
    imageTransform,
    annotations,
    scope,
    cropBox,
    selectedIds = [],
    backgroundColor = 'transparent',
  } = options;

  // Step 1: Render base composite
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = imageDimensions.width;
  baseCanvas.height = imageDimensions.height;
  const baseCtx = baseCanvas.getContext('2d');
  if (!baseCtx) throw new Error('Could not create canvas context');

  if (backgroundColor !== 'transparent') {
    baseCtx.fillStyle = backgroundColor;
    baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
  }

  if (image) {
    renderBaseImage(baseCtx, image, imageDimensions, imageTransform);
  }

  // Filter annotations based on scope
  const targetAnnotations =
    scope === 'selection' && selectedIds.length > 0
      ? annotations.filter((a) => selectedIds.includes(a.id))
      : annotations;

  // Render all annotations onto base canvas
  for (const ann of targetAnnotations) {
    renderAnnotation(baseCtx, ann, baseCanvas);
  }

  // If scope is crop, create a cropped sub-canvas
  if (scope === 'crop' && cropBox && cropBox.width > 0 && cropBox.height > 0) {
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropBox.width;
    croppedCanvas.height = cropBox.height;
    const cropCtx = croppedCanvas.getContext('2d');
    if (!cropCtx) return baseCanvas;

    cropCtx.drawImage(
      baseCanvas,
      cropBox.x,
      cropBox.y,
      cropBox.width,
      cropBox.height,
      0,
      0,
      cropBox.width,
      cropBox.height
    );
    return croppedCanvas;
  }

  return baseCanvas;
}

export async function exportAsRaster(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp',
  quality: number,
  filename = 'pixelmark-export'
): Promise<void> {
  const mimeType = `image/${format}`;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  const link = document.createElement('a');
  link.download = `${filename}.${format === 'jpeg' ? 'jpg' : format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        resolve(true);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
        resolve(false);
      }
    }, 'image/png');
  });
}

export function exportProjectJson(project: ProjectData, filename = 'pixelmark-project.json'): void {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseProjectJson(jsonString: string): ProjectData {
  const data = JSON.parse(jsonString);
  if (!data.annotations || !Array.isArray(data.annotations)) {
    throw new Error('Invalid project file format: missing annotations array.');
  }
  return data as ProjectData;
}
