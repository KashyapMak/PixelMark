import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  AnnotationObject,
  CropState,
  ImageTransform,
  Point,
  ToolType,
  AppTheme,
} from '../types';
import { THEMES } from '../utils/theme';
import {
  getHandleAtPoint,
  HandleHit,
  isPointInsideObject,
  normalizeRect,
  renderAnnotation,
  renderBaseImage,
  renderCheckeredBackground,
  renderCropOverlay,
  renderSelectionBox,
} from '../utils/canvasRenderer';

interface CanvasWorkspaceProps {
  image: HTMLImageElement | null;
  imageDimensions: { width: number; height: number };
  imageTransform: ImageTransform;
  annotations: AnnotationObject[];
  onUpdateAnnotations: (newAnnotations: AnnotationObject[], recordHistory?: boolean) => void;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  activeTool: ToolType;
  onToolUsed?: (tool: ToolType) => void;
  defaultStyle: Partial<AnnotationObject>;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  pan: { x: number; y: number };
  onPanChange: (newPan: { x: number; y: number }) => void;
  cropState: CropState;
  onUpdateCropBox: (newCropBox: { x: number; y: number; width: number; height: number }) => void;
  nextStepNumber: number;
  onIncrementStepNumber: () => void;
  onDropImage: (file: File) => void;
  theme?: AppTheme;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  image,
  imageDimensions,
  imageTransform,
  annotations,
  onUpdateAnnotations,
  selectedIds,
  onSelectIds,
  activeTool,
  onToolUsed,
  defaultStyle,
  zoom,
  onZoomChange,
  pan,
  onPanChange,
  cropState,
  onUpdateCropBox,
  nextStepNumber,
  onIncrementStepNumber,
  onDropImage,
  theme = 'dark',
}) => {
  const currentTheme = THEMES[theme] || THEMES.dark;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction tracking
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [draftAnnotation, setDraftAnnotation] = useState<AnnotationObject | null>(null);
  const [inlineEditingTextId, setInlineEditingTextId] = useState<string | null>(null);
  const [isDraggingFileOver, setIsDraggingFileOver] = useState(false);

  // Refs for high-speed drag interaction without state stutter
  const interactionRef = useRef<{
    mode: 'none' | 'pan' | 'draw' | 'move' | 'transform' | 'crop_handle' | 'crop_move';
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
    activeHandle: HandleHit | null;
    initialObjectState: AnnotationObject | null;
    initialCropBox: { x: number; y: number; width: number; height: number } | null;
    cropHandleType: string | null;
    activePointerId: number | null;
    // Multi-touch pinch tracking
    touchPointers: Map<number, { x: number; y: number }>;
    pinchStartDist: number;
    pinchStartZoom: number;
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    activeHandle: null,
    initialObjectState: null,
    initialCropBox: null,
    cropHandleType: null,
    activePointerId: null,
    touchPointers: new Map(),
    pinchStartDist: 0,
    pinchStartZoom: 1,
  });

  // Convert client pointer coordinates to scene coordinates
  const clientToScene = useCallback(
    (clientX: number, clientY: number): Point => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      const sceneX = (localX - pan.x) / zoom;
      const sceneY = (localY - pan.y) / zoom;
      return { x: sceneX, y: sceneY };
    },
    [pan, zoom]
  );

  // Spacebar key listener for quick panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Native clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            onDropImage(file);
            return;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onDropImage]);

  // Main canvas render pass
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size matches image dimensions
    canvas.width = imageDimensions.width;
    canvas.height = imageDimensions.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Checkered background pattern
    renderCheckeredBackground(
      ctx,
      canvas.width,
      canvas.height,
      20,
      currentTheme.canvasCheckeredDark,
      currentTheme.canvasCheckeredLight
    );

    // 2. Base image
    if (image) {
      renderBaseImage(ctx, image, imageDimensions, imageTransform);
    }

    // 3. Render all existing annotations
    annotations.forEach((ann) => {
      renderAnnotation(ctx, ann, canvas);
    });

    // 4. Render draft annotation currently being drawn
    if (draftAnnotation) {
      renderAnnotation(ctx, draftAnnotation, canvas);
    }

    // 5. Render selection bounding boxes
    if (activeTool === 'select' && !cropState.isCropping) {
      selectedIds.forEach((id) => {
        const obj = annotations.find((a) => a.id === id);
        if (obj) {
          renderSelectionBox(ctx, obj, zoom);
        }
      });
    }

    // 6. Render Crop overlay if cropping
    if (cropState.isCropping) {
      renderCropOverlay(
        ctx,
        canvas.width,
        canvas.height,
        {
          x: cropState.x,
          y: cropState.y,
          width: cropState.width,
          height: cropState.height,
        },
        zoom
      );
    }
  }, [
    image,
    imageDimensions,
    imageTransform,
    annotations,
    draftAnnotation,
    selectedIds,
    activeTool,
    zoom,
    cropState,
    currentTheme.canvasCheckeredDark,
    currentTheme.canvasCheckeredLight,
  ]);

  // Pointer Down (Mouse, Stylus, Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const isTouch = e.pointerType === 'touch';
    const touchMap = interactionRef.current.touchPointers;

    if (isTouch) {
      touchMap.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // If two fingers on screen, switch to pinch-zoom and pan
      if (touchMap.size === 2) {
        const pts = Array.from(touchMap.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        interactionRef.current.pinchStartDist = dist;
        interactionRef.current.pinchStartZoom = zoom;
        interactionRef.current.mode = 'pan';
        interactionRef.current.startX = (pts[0].x + pts[1].x) / 2;
        interactionRef.current.startY = (pts[0].y + pts[1].y) / 2;
        interactionRef.current.startPanX = pan.x;
        interactionRef.current.startPanY = pan.y;
        return;
      }
    }

    // Spacebar + drag, middle mouse button, or pan tool triggers panning
    if (isSpacePressed || activeTool === 'pan' || e.button === 1) {
      interactionRef.current.mode = 'pan';
      interactionRef.current.startX = e.clientX;
      interactionRef.current.startY = e.clientY;
      interactionRef.current.startPanX = pan.x;
      interactionRef.current.startPanY = pan.y;
      setIsPanning(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Only left click for drawing and editing
    if (e.button !== 0) return;

    const scenePt = clientToScene(e.clientX, e.clientY);
    const pressure = e.pressure > 0 ? e.pressure : 0.5;

    // Handle Cropping interaction
    if (cropState.isCropping) {
      const cropNorm = normalizeRect(cropState.x, cropState.y, cropState.width, cropState.height);
      const hitTolerance = 14 / zoom;
      const isInsideCrop =
        scenePt.x >= cropNorm.x &&
        scenePt.x <= cropNorm.x + cropNorm.width &&
        scenePt.y >= cropNorm.y &&
        scenePt.y <= cropNorm.y + cropNorm.height;

      interactionRef.current.mode = isInsideCrop ? 'crop_move' : 'crop_handle';
      interactionRef.current.startX = scenePt.x;
      interactionRef.current.startY = scenePt.y;
      interactionRef.current.initialCropBox = { ...cropState };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // 1. Tool = 'select'
    if (activeTool === 'select') {
      // First check if a transform handle on the currently selected object was hit
      let handleHit: HandleHit | null = null;
      for (const id of selectedIds) {
        const obj = annotations.find((a) => a.id === id);
        if (obj && !obj.locked) {
          const hit = getHandleAtPoint(scenePt, obj, zoom);
          if (hit) {
            handleHit = hit;
            break;
          }
        }
      }

      if (handleHit) {
        const obj = annotations.find((a) => a.id === handleHit!.objectId);
        interactionRef.current.mode = 'transform';
        interactionRef.current.activeHandle = handleHit;
        interactionRef.current.startX = scenePt.x;
        interactionRef.current.startY = scenePt.y;
        interactionRef.current.initialObjectState = obj ? { ...obj } : null;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }

      // Check if clicking on an object body
      // Search in reverse z-index (topmost first)
      let clickedObj: AnnotationObject | null = null;
      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
        if (isPointInsideObject(scenePt, ann, 8 / zoom)) {
          clickedObj = ann;
          break;
        }
      }

      if (clickedObj) {
        if (!selectedIds.includes(clickedObj.id)) {
          onSelectIds([clickedObj.id]);
        }
        interactionRef.current.mode = 'move';
        interactionRef.current.startX = scenePt.x;
        interactionRef.current.startY = scenePt.y;
        interactionRef.current.initialObjectState = { ...clickedObj };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } else {
        // Deselect
        onSelectIds([]);
      }
      return;
    }

    // 2. Tool = 'counter' (Click to place auto-increment step badge!)
    if (activeTool === 'counter') {
      const size = 38;
      const newCounter: AnnotationObject = {
        id: `counter-${Date.now()}`,
        type: 'counter',
        x: scenePt.x - size / 2,
        y: scenePt.y - size / 2,
        width: size,
        height: size,
        rotation: 0,
        strokeColor: defaultStyle.strokeColor || '#ffffff',
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeStyle: 'solid',
        fillColor: defaultStyle.fillColor || '#0284c7',
        fillOpacity: 1,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', blur: 6, offsetX: 0, offsetY: 2 },
        locked: false,
        stepNumber: nextStepNumber,
        badgeShape: defaultStyle.badgeShape || 'circle',
        badgeColor: defaultStyle.badgeColor || '#0284c7',
        badgeTextColor: defaultStyle.badgeTextColor || '#ffffff',
      };
      onUpdateAnnotations([...annotations, newCounter], true);
      onSelectIds([newCounter.id]);
      onIncrementStepNumber();
      return;
    }

    // Tool = 'sticker' (Click to place ShareX cursor / status badge sticker!)
    if (activeTool === 'sticker') {
      const stickerSize = 44;
      const newSticker: AnnotationObject = {
        id: `sticker-${Date.now()}`,
        type: 'sticker',
        x: scenePt.x - stickerSize / 2,
        y: scenePt.y - stickerSize / 2,
        width: stickerSize,
        height: stickerSize,
        rotation: 0,
        strokeColor: defaultStyle.strokeColor || '#38bdf8',
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeStyle: 'solid',
        fillColor: defaultStyle.fillColor || '#0284c7',
        fillOpacity: 1,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.35)', blur: 6, offsetX: 0, offsetY: 2 },
        locked: false,
        stickerType: defaultStyle.stickerType || 'cursor_arrow',
      };
      onUpdateAnnotations([...annotations, newSticker], true);
      onSelectIds([newSticker.id]);
      if (onToolUsed) onToolUsed(activeTool);
      return;
    }

    // 3. Drawing tools
    const newId = `${activeTool}-${Date.now()}`;
    const baseNewObj: AnnotationObject = {
      id: newId,
      type: activeTool,
      x: scenePt.x,
      y: scenePt.y,
      width: 1,
      height: 1,
      rotation: 0,
      strokeColor: defaultStyle.strokeColor || '#ef4444',
      strokeWidth: defaultStyle.strokeWidth || 4,
      strokeOpacity: defaultStyle.strokeOpacity ?? 1,
      strokeStyle: defaultStyle.strokeStyle || 'solid',
      fillColor: defaultStyle.fillColor || 'transparent',
      fillOpacity: defaultStyle.fillOpacity ?? 0.2,
      shadow: defaultStyle.shadow || { enabled: false, color: 'rgba(0,0,0,0.5)', blur: 6, offsetX: 0, offsetY: 2 },
      locked: false,
    };

    // Freehand initialization
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      baseNewObj.points = [{ x: 0, y: 0, pressure }];
      if (activeTool === 'highlighter') {
        baseNewObj.strokeWidth = 24;
        baseNewObj.strokeColor = '#facc15';
        baseNewObj.strokeOpacity = 0.55;
      }
    } else if (activeTool === 'ruler') {
      baseNewObj.strokeColor = defaultStyle.strokeColor || '#38bdf8';
      baseNewObj.strokeWidth = 2;
      baseNewObj.showAngle = true;
      baseNewObj.showCoordinates = true;
    } else if (activeTool === 'text') {
      baseNewObj.width = 180;
      baseNewObj.height = 60;
      baseNewObj.text = 'Double-click to edit';
      baseNewObj.fontSize = 22;
      baseNewObj.fontFamily = 'Plus Jakarta Sans, system-ui, sans-serif';
      baseNewObj.textColor = defaultStyle.strokeColor || '#ffffff';
      baseNewObj.bgBubbleColor = 'rgba(15, 23, 42, 0.75)';
      baseNewObj.bgPadding = 10;
      baseNewObj.strokeWidth = 1;
      baseNewObj.strokeColor = '#38bdf8';
    } else if (activeTool === 'speech_bubble' || activeTool === 'thought_bubble') {
      baseNewObj.width = 200;
      baseNewObj.height = 90;
      baseNewObj.text = 'Callout note';
      baseNewObj.fontSize = 16;
      baseNewObj.tailPoint = { x: scenePt.x + 100, y: scenePt.y + 130 };
      baseNewObj.fillColor = 'rgba(15, 23, 42, 0.9)';
      baseNewObj.strokeColor = '#38bdf8';
      baseNewObj.strokeWidth = 2;
    } else if (activeTool === 'blur') {
      baseNewObj.blurRadius = 14;
      baseNewObj.strokeColor = '#3b82f6';
      baseNewObj.strokeWidth = 1.5;
    } else if (activeTool === 'pixelate') {
      baseNewObj.pixelSize = 12;
      baseNewObj.strokeColor = '#ef4444';
      baseNewObj.strokeWidth = 1.5;
    } else if (activeTool === 'spotlight') {
      baseNewObj.dimOpacity = 0.65;
      baseNewObj.spotlightShape = 'rect';
    } else if (activeTool === 'loupe') {
      baseNewObj.width = 120;
      baseNewObj.height = 120;
      baseNewObj.loupeZoom = 2;
      baseNewObj.loupeShape = 'circle';
      baseNewObj.targetPoint = { x: scenePt.x + 60, y: scenePt.y + 60 };
    }

    interactionRef.current.mode = 'draw';
    interactionRef.current.startX = scenePt.x;
    interactionRef.current.startY = scenePt.y;
    setDraftAnnotation(baseNewObj);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const isTouch = e.pointerType === 'touch';
    const touchMap = interactionRef.current.touchPointers;

    if (isTouch && touchMap.has(e.pointerId)) {
      touchMap.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // Pinch to zoom handler
      if (touchMap.size === 2) {
        const pts = Array.from(touchMap.values());
        const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const ratio = currentDist / Math.max(1, interactionRef.current.pinchStartDist);
        const newZoom = Math.max(0.1, Math.min(5, interactionRef.current.pinchStartZoom * ratio));
        onZoomChange(newZoom);

        // Center pan
        const midX = (pts[0].x + pts[1].x) / 2;
        const midY = (pts[0].y + pts[1].y) / 2;
        const dx = midX - interactionRef.current.startX;
        const dy = midY - interactionRef.current.startY;
        onPanChange({
          x: interactionRef.current.startPanX + dx,
          y: interactionRef.current.startPanY + dy,
        });
        return;
      }
    }

    const { mode, startX, startY, startPanX, startPanY, activeHandle, initialObjectState, initialCropBox } =
      interactionRef.current;

    // Pan Mode
    if (mode === 'pan') {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      onPanChange({ x: startPanX + dx, y: startPanY + dy });
      return;
    }

    const scenePt = clientToScene(e.clientX, e.clientY);
    const pressure = e.pressure > 0 ? e.pressure : 0.5;

    // Crop Move Mode
    if (mode === 'crop_move' && initialCropBox) {
      const dx = scenePt.x - startX;
      const dy = scenePt.y - startY;
      onUpdateCropBox({
        ...initialCropBox,
        x: Math.max(0, Math.min(imageDimensions.width - initialCropBox.width, initialCropBox.x + dx)),
        y: Math.max(0, Math.min(imageDimensions.height - initialCropBox.height, initialCropBox.y + dy)),
      });
      return;
    }

    // Crop Handle Mode
    if (mode === 'crop_handle' && initialCropBox) {
      const newW = Math.max(20, scenePt.x - initialCropBox.x);
      let newH = Math.max(20, scenePt.y - initialCropBox.y);
      if (cropState.aspectRatio) {
        newH = newW / cropState.aspectRatio;
      }
      onUpdateCropBox({
        ...initialCropBox,
        width: Math.min(imageDimensions.width - initialCropBox.x, newW),
        height: Math.min(imageDimensions.height - initialCropBox.y, newH),
      });
      return;
    }

    // Drawing Mode
    if (mode === 'draw' && draftAnnotation) {
      if (draftAnnotation.type === 'pen' || draftAnnotation.type === 'highlighter') {
        const nextPoints = [
          ...(draftAnnotation.points || []),
          { x: scenePt.x - draftAnnotation.x, y: scenePt.y - draftAnnotation.y, pressure },
        ];
        setDraftAnnotation({ ...draftAnnotation, points: nextPoints });
      } else {
        const width = scenePt.x - draftAnnotation.x;
        const height = scenePt.y - draftAnnotation.y;
        setDraftAnnotation({ ...draftAnnotation, width, height });
      }
      return;
    }

    // Move Selected Object Mode
    if (mode === 'move' && initialObjectState) {
      const dx = scenePt.x - startX;
      const dy = scenePt.y - startY;
      const updated = annotations.map((ann) => {
        if (selectedIds.includes(ann.id) && !ann.locked) {
          const orig = initialObjectState.id === ann.id ? initialObjectState : ann;
          return { ...ann, x: orig.x + dx, y: orig.y + dy };
        }
        return ann;
      });
      onUpdateAnnotations(updated, false);
      return;
    }

    // Transform Handle Mode (Scale, Rotate, Curve Handle, Tail Handle)
    if (mode === 'transform' && activeHandle && initialObjectState) {
      const dx = scenePt.x - startX;
      const dy = scenePt.y - startY;

      // Rotate handle
      if (activeHandle.type === 'rotate') {
        const norm = normalizeRect(initialObjectState.x, initialObjectState.y, initialObjectState.width, initialObjectState.height);
        const centerX = norm.x + norm.width / 2;
        const centerY = norm.y + norm.height / 2;
        const angleRad = Math.atan2(scenePt.y - centerY, scenePt.x - centerX);
        let degrees = Math.round((angleRad * 180) / Math.PI) + 90;
        if (degrees < 0) degrees += 360;
        // Snap to 15 degrees if shift held
        if (e.shiftKey) {
          degrees = Math.round(degrees / 15) * 15;
        }
        const updated = annotations.map((a) =>
          a.id === initialObjectState.id ? { ...a, rotation: degrees } : a
        );
        onUpdateAnnotations(updated, false);
        return;
      }

      // Curved arrow Bezier control handle
      if (activeHandle.type === 'control') {
        const updated = annotations.map((a) =>
          a.id === initialObjectState.id ? { ...a, controlPoint: { x: scenePt.x, y: scenePt.y } } : a
        );
        onUpdateAnnotations(updated, false);
        return;
      }

      // Speech bubble pointer tail handle
      if (activeHandle.type === 'tail') {
        const updated = annotations.map((a) =>
          a.id === initialObjectState.id ? { ...a, tailPoint: { x: scenePt.x, y: scenePt.y } } : a
        );
        onUpdateAnnotations(updated, false);
        return;
      }

      // Loupe target crosshair handle
      if (activeHandle.type === 'target') {
        const updated = annotations.map((a) =>
          a.id === initialObjectState.id ? { ...a, targetPoint: { x: scenePt.x, y: scenePt.y } } : a
        );
        onUpdateAnnotations(updated, false);
        return;
      }

      // Standard 8 scale handles
      const orig = initialObjectState;
      let newX = orig.x;
      let newY = orig.y;
      let newW = orig.width;
      let newH = orig.height;

      switch (activeHandle.type) {
        case 'se':
          newW = orig.width + dx;
          newH = orig.height + dy;
          break;
        case 'e':
          newW = orig.width + dx;
          break;
        case 's':
          newH = orig.height + dy;
          break;
        case 'nw':
          newX = orig.x + dx;
          newY = orig.y + dy;
          newW = orig.width - dx;
          newH = orig.height - dy;
          break;
        case 'n':
          newY = orig.y + dy;
          newH = orig.height - dy;
          break;
        case 'w':
          newX = orig.x + dx;
          newW = orig.width - dx;
          break;
        case 'ne':
          newY = orig.y + dy;
          newW = orig.width + dx;
          newH = orig.height - dy;
          break;
        case 'sw':
          newX = orig.x + dx;
          newW = orig.width - dx;
          newH = orig.height + dy;
          break;
      }

      const updated = annotations.map((a) =>
        a.id === orig.id ? { ...a, x: newX, y: newY, width: newW, height: newH } : a
      );
      onUpdateAnnotations(updated, false);
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const isTouch = e.pointerType === 'touch';
    if (isTouch) {
      interactionRef.current.touchPointers.delete(e.pointerId);
    }

    const { mode } = interactionRef.current;

    if (mode === 'pan') {
      setIsPanning(false);
    } else if (mode === 'draw' && draftAnnotation) {
      // Finalize draft annotation
      const isLinear =
        draftAnnotation.type === 'line' ||
        draftAnnotation.type === 'arrow' ||
        draftAnnotation.type === 'double_arrow' ||
        draftAnnotation.type === 'curved_arrow' ||
        draftAnnotation.type === 'ruler';

      const norm = normalizeRect(draftAnnotation.x, draftAnnotation.y, draftAnnotation.width, draftAnnotation.height);
      const isTiny =
        !isLinear &&
        norm.width < 4 &&
        norm.height < 4 &&
        (!draftAnnotation.points || draftAnnotation.points.length < 2);

      if (!isTiny) {
        const finalObj: AnnotationObject = {
          ...draftAnnotation,
          x: draftAnnotation.points || isLinear ? draftAnnotation.x : norm.x,
          y: draftAnnotation.points || isLinear ? draftAnnotation.y : norm.y,
          width: draftAnnotation.points || isLinear ? draftAnnotation.width : norm.width,
          height: draftAnnotation.points || isLinear ? draftAnnotation.height : norm.height,
        };
        onUpdateAnnotations([...annotations, finalObj], true);
        onSelectIds([finalObj.id]);
        if (onToolUsed) onToolUsed(activeTool);
      }
      setDraftAnnotation(null);
    } else if (mode === 'move' || mode === 'transform') {
      // Record history step after move or transform completes
      onUpdateAnnotations(annotations, true);
    }

    interactionRef.current.mode = 'none';
    interactionRef.current.activeHandle = null;
    interactionRef.current.initialObjectState = null;
    interactionRef.current.initialCropBox = null;
  };

  // Wheel Zoom & Pan handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Trackpad pinch or Ctrl + Wheel Zoom centered on cursor
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));

      // Adjust pan to keep cursor point fixed
      const newPanX = mouseX - ((mouseX - pan.x) / zoom) * newZoom;
      const newPanY = mouseY - ((mouseY - pan.y) / zoom) * newZoom;

      onZoomChange(newZoom);
      onPanChange({ x: newPanX, y: newPanY });
    } else {
      // Standard two-finger or wheel pan
      onPanChange({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  // Drag & Drop Image directly onto Workspace
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFileOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFileOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFileOver(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      onDropImage(files[0]);
    }
  };

  // Double click on text or bubble to edit
  const handleDoubleClick = (e: React.MouseEvent) => {
    const scenePt = clientToScene(e.clientX, e.clientY);
    for (let i = annotations.length - 1; i >= 0; i--) {
      const ann = annotations[i];
      if (
        (ann.type === 'text' || ann.type === 'speech_bubble' || ann.type === 'thought_bubble') &&
        isPointInsideObject(scenePt, ann, 8 / zoom)
      ) {
        setInlineEditingTextId(ann.id);
        break;
      }
    }
  };

  const editingObject = inlineEditingTextId
    ? annotations.find((a) => a.id === inlineEditingTextId)
    : null;

  return (
    <div
      ref={containerRef}
      id="pixelmark-workspace-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 w-full h-full overflow-hidden ${currentTheme.workspaceBackground} select-none touch-none transition-colors ${
        isSpacePressed || activeTool === 'pan'
          ? isPanning
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : activeTool === 'select'
          ? 'cursor-default'
          : 'cursor-crosshair'
      }`}
    >
      {/* Centered Canvas Container with CSS Matrix Pan/Zoom */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: imageDimensions.width,
          height: imageDimensions.height,
        }}
        className="absolute top-0 left-0 transition-none will-change-transform shadow-2xl"
      >
        <canvas
          ref={canvasRef}
          width={imageDimensions.width}
          height={imageDimensions.height}
          className="block pointer-events-none"
        />

        {/* Inline Text Editor Overlay if double clicked */}
        {editingObject && (
          <div
            style={{
              position: 'absolute',
              left: editingObject.x,
              top: editingObject.y,
              width: Math.max(160, editingObject.width),
              height: Math.max(60, editingObject.height),
            }}
            className="z-40"
          >
            <textarea
              autoFocus
              value={editingObject.text || ''}
              onChange={(e) => {
                const updated = annotations.map((a) =>
                  a.id === editingObject.id ? { ...a, text: e.target.value } : a
                );
                onUpdateAnnotations(updated, false);
              }}
              onBlur={() => setInlineEditingTextId(null)}
              className="w-full h-full bg-slate-900/90 text-white p-2 border-2 border-sky-400 rounded-lg text-xs font-bold resize-none focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Drag and Drop visual dropzone overlay */}
      {isDraggingFileOver && (
        <div className="absolute inset-0 bg-sky-500/20 backdrop-blur-sm border-4 border-dashed border-sky-400 flex flex-col items-center justify-center pointer-events-none z-50 animate-in fade-in">
          <div className="bg-slate-900/90 border border-slate-700 px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-2">
            <span className="text-3xl">🖼️</span>
            <span className="font-bold text-base text-white">Drop image to load into PixelMark</span>
            <span className="text-xs text-slate-400">Supports PNG, JPG, WEBP, SVG</span>
          </div>
        </div>
      )}
    </div>
  );
};
