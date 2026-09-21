import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AnnotationObject,
  CropState,
  HistoryState,
  ImageTransform,
  ToolType,
  AppTheme,
} from './types';
import { THEMES } from './utils/theme';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { TopBar } from './components/TopBar';
import { Toolbar } from './components/Toolbar';
import { Inspector } from './components/Inspector';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { MiniMap } from './components/MiniMap';
import { CropControls } from './components/CropControls';
import { ExportModal } from './components/ExportModal';
import { ImageOperationsModal } from './components/ImageOperationsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ScreenCaptureModal } from './components/ScreenCaptureModal';
import { ColorPickerModal } from './components/ColorPickerModal';
import { ImageEffectsModal } from './components/ImageEffectsModal';
import { QrCodeModal } from './components/QrCodeModal';
import { ImageCombinerModal } from './components/ImageCombinerModal';
import { HashCheckModal } from './components/HashCheckModal';
import { Toast } from './components/Toast';
import { copyCanvasToClipboard, generateExportCanvas, ProjectData } from './utils/exportUtils';

export default function App() {
  // Canvas & Image State
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800,
  });
  const [imageTransform, setImageTransform] = useState<ImageTransform>({
    rotation: 0,
    flipH: false,
    flipV: false,
  });

  // Annotations & Selection
  const [annotations, setAnnotations] = useState<AnnotationObject[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [nextStepNumber, setNextStepNumber] = useState<number>(1);

  // Viewport
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 60 });
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800,
  });

  // History Stacks
  const [undoStack, setUndoStack] = useState<HistoryState[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryState[]>([]);

  // Cropping
  const [cropState, setCropState] = useState<CropState>({
    isCropping: false,
    x: 100,
    y: 80,
    width: 800,
    height: 500,
    aspectRatio: null,
  });

  // Modals & Panels
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  // ShareX Tool Modals
  const [isScreenCaptureOpen, setIsScreenCaptureOpen] = useState<boolean>(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);
  const [isImageEffectsOpen, setIsImageEffectsOpen] = useState<boolean>(false);
  const [isQrCodeOpen, setIsQrCodeOpen] = useState<boolean>(false);
  const [isImageCombinerOpen, setIsImageCombinerOpen] = useState<boolean>(false);
  const [isHashCheckOpen, setIsHashCheckOpen] = useState<boolean>(false);

  // Theme Management
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('pixelmark-theme');
    if (saved === 'light' || saved === 'midnight' || saved === 'dark') return saved;
    return 'dark';
  });

  const currentTheme = THEMES[theme] || THEMES.dark;

  const handleThemeChange = useCallback((newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('pixelmark-theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Default drawing styles
  const [defaultStyle, setDefaultStyle] = useState<Partial<AnnotationObject>>({
    strokeColor: '#ef4444',
    strokeWidth: 4,
    strokeOpacity: 1,
    strokeStyle: 'solid',
    fillColor: 'transparent',
    fillOpacity: 0.2,
    shadow: { enabled: false, color: 'rgba(0,0,0,0.5)', blur: 6, offsetX: 0, offsetY: 2 },
    badgeShape: 'circle',
    badgeColor: '#0284c7',
    badgeTextColor: '#ffffff',
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2600);
  }, []);

  // Helper to record history snapshot
  const recordHistory = useCallback(
    (newAnnotations: AnnotationObject[], newDimensions = imageDimensions, newTransform = imageTransform) => {
      const snapshot: HistoryState = {
        annotations: newAnnotations,
        imageSrc: image?.src || null,
        imageTransform: { ...newTransform },
        canvasDimensions: { ...newDimensions },
      };
      setUndoStack((prev) => [...prev.slice(-30), snapshot]);
      setRedoStack([]);
    },
    [image, imageDimensions, imageTransform]
  );

  // Load an image from URL or dataUrl
  const loadImageFromSrc = useCallback(
    (src: string, name = 'Image') => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        const newDims = { width: img.naturalWidth || 1200, height: img.naturalHeight || 800 };
        setImageDimensions(newDims);
        setImageTransform({ rotation: 0, flipH: false, flipV: false });
        setAnnotations([]);
        setSelectedIds([]);
        setUndoStack([]);
        setRedoStack([]);
        setCropState({
          isCropping: false,
          x: Math.round(newDims.width * 0.1),
          y: Math.round(newDims.height * 0.1),
          width: Math.round(newDims.width * 0.8),
          height: Math.round(newDims.height * 0.8),
          aspectRatio: null,
        });

        // Auto-center and fit zoom
        const availableW = window.innerWidth - 340;
        const availableH = window.innerHeight - 120;
        const fitScale = Math.min(availableW / newDims.width, availableH / newDims.height, 1);
        const clampedZoom = Math.max(0.15, Math.min(1.5, fitScale * 0.92));
        setZoom(clampedZoom);
        setPan({
          x: Math.max(20, (availableW - newDims.width * clampedZoom) / 2 + 50),
          y: Math.max(20, (availableH - newDims.height * clampedZoom) / 2 + 60),
        });

        showToast(`Loaded ${name} (${newDims.width}×${newDims.height})`);
      };
      img.src = src;
    },
    [showToast]
  );

  // Initial mount: load first sample mockup
  useEffect(() => {
    const defaultSample = SAMPLE_IMAGES[0];
    loadImageFromSrc(defaultSample.dataUrl, defaultSample.name);
  }, []);

  // Update container size on resize
  useEffect(() => {
    const handleResize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const currentState: HistoryState = {
      annotations,
      imageSrc: image?.src || null,
      imageTransform,
      canvasDimensions: imageDimensions,
    };
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, currentState]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    setAnnotations(previous.annotations);
    setImageDimensions(previous.canvasDimensions);
    setImageTransform(previous.imageTransform);
  }, [undoStack, annotations, image, imageTransform, imageDimensions]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const currentState: HistoryState = {
      annotations,
      imageSrc: image?.src || null,
      imageTransform,
      canvasDimensions: imageDimensions,
    };
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, currentState]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));

    setAnnotations(next.annotations);
    setImageDimensions(next.canvasDimensions);
    setImageTransform(next.imageTransform);
  }, [redoStack, annotations, image, imageTransform, imageDimensions]);

  // Update annotations with optional history
  const handleUpdateAnnotations = useCallback(
    (newAnnotations: AnnotationObject[], record = true) => {
      if (record) {
        recordHistory(annotations);
      }
      setAnnotations(newAnnotations);
    },
    [annotations, recordHistory]
  );

  // Load file from device
  const handleUploadFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          loadImageFromSrc(e.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    },
    [loadImageFromSrc]
  );

  // Create New Blank Canvas
  const handleNewBlankCanvas = useCallback(() => {
    const width = 1280;
    const height = 720;
    const blankCanvas = document.createElement('canvas');
    blankCanvas.width = width;
    blankCanvas.height = height;
    const ctx = blankCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);
    }
    loadImageFromSrc(blankCanvas.toDataURL(), 'Blank Canvas (1280×720)');
  }, [loadImageFromSrc]);

  // Quick Copy to System Clipboard
  const handleQuickCopy = useCallback(async () => {
    try {
      const canvas = await generateExportCanvas({
        image,
        imageDimensions,
        imageTransform,
        annotations,
        scope: 'all',
      });
      const ok = await copyCanvasToClipboard(canvas);
      if (ok) {
        showToast('Copied full canvas to clipboard!');
      } else {
        showToast('Clipboard copy failed. Try Export menu.');
      }
    } catch {
      showToast('Copy failed.');
    }
  }, [image, imageDimensions, imageTransform, annotations, showToast]);

  // ShareX Screen Capture
  const handleScreenCaptureComplete = useCallback(
    (dataUrl: string) => {
      loadImageFromSrc(dataUrl, 'Captured Screen');
      showToast('Screen capture loaded into PixelMark!');
    },
    [loadImageFromSrc, showToast]
  );

  // ShareX Color Picker application
  const handleColorSelect = useCallback(
    (color: string, target: 'stroke' | 'fill') => {
      if (target === 'stroke') {
        setDefaultStyle((prev) => ({ ...prev, strokeColor: color }));
        if (selectedIds.length > 0) {
          setAnnotations((prev) =>
            prev.map((a) => (selectedIds.includes(a.id) ? { ...a, strokeColor: color } : a))
          );
        }
        showToast(`Applied ${color.toUpperCase()} as stroke color`);
      } else {
        setDefaultStyle((prev) => ({ ...prev, fillColor: color }));
        if (selectedIds.length > 0) {
          setAnnotations((prev) =>
            prev.map((a) => (selectedIds.includes(a.id) ? { ...a, fillColor: color } : a))
          );
        }
        showToast(`Applied ${color.toUpperCase()} as fill color`);
      }
    },
    [selectedIds, showToast]
  );

  // ShareX Image Effects Apply
  const handleImageEffectsApply = useCallback(
    (newImageDataUrl: string) => {
      recordHistory(annotations);
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageDimensions({ width: img.width, height: img.height });
        showToast('Image Effects applied to canvas!');
      };
      img.src = newImageDataUrl;
    },
    [annotations, recordHistory, showToast]
  );

  // ShareX Stamp QR code sticker
  const handleAddQrSticker = useCallback(
    (qrDataUrl: string) => {
      recordHistory(annotations);
      const size = 160;
      const centerX = Math.max(20, (imageDimensions.width - size) / 2);
      const centerY = Math.max(20, (imageDimensions.height - size) / 2);

      const qrSticker: AnnotationObject = {
        id: `qr-${Date.now()}`,
        type: 'sticker',
        x: centerX,
        y: centerY,
        width: size,
        height: size,
        rotation: 0,
        strokeColor: '#38bdf8',
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeStyle: 'solid',
        fillColor: '#ffffff',
        fillOpacity: 1,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.3)', blur: 8, offsetX: 0, offsetY: 2 },
        locked: false,
        stickerType: 'qr',
        qrDataUrl: qrDataUrl,
      };

      setAnnotations((prev) => [...prev, qrSticker]);
      setSelectedIds([qrSticker.id]);
      showToast('QR Code stamped onto canvas');
    },
    [annotations, imageDimensions, recordHistory, showToast]
  );

  // ShareX Image Combiner Apply
  const handleImageCombinerApply = useCallback(
    (combinedDataUrl: string) => {
      loadImageFromSrc(combinedDataUrl, 'Combined Image');
      showToast('Stitched images loaded into workspace!');
    },
    [loadImageFromSrc, showToast]
  );

  // Delete selected objects
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    recordHistory(annotations);
    const updated = annotations.filter((a) => !selectedIds.includes(a.id));
    setAnnotations(updated);
    setSelectedIds([]);
    showToast('Deleted selected annotation');
  }, [selectedIds, annotations, recordHistory, showToast]);

  // Duplicate selected objects
  const handleDuplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    recordHistory(annotations);
    const newItems: AnnotationObject[] = [];
    const newIds: string[] = [];

    annotations.forEach((ann) => {
      if (selectedIds.includes(ann.id)) {
        const cloned: AnnotationObject = {
          ...ann,
          id: `${ann.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          x: ann.x + 24,
          y: ann.y + 24,
        };
        newItems.push(cloned);
        newIds.push(cloned.id);
      }
    });

    setAnnotations([...annotations, ...newItems]);
    setSelectedIds(newIds);
    showToast('Duplicated layer');
  }, [selectedIds, annotations, recordHistory, showToast]);

  // Layer ordering
  const handleBringToFront = useCallback(() => {
    if (selectedIds.length === 0) return;
    recordHistory(annotations);
    const selected = annotations.filter((a) => selectedIds.includes(a.id));
    const unselected = annotations.filter((a) => !selectedIds.includes(a.id));
    setAnnotations([...unselected, ...selected]);
  }, [selectedIds, annotations, recordHistory]);

  const handleSendToBack = useCallback(() => {
    if (selectedIds.length === 0) return;
    recordHistory(annotations);
    const selected = annotations.filter((a) => selectedIds.includes(a.id));
    const unselected = annotations.filter((a) => !selectedIds.includes(a.id));
    setAnnotations([...selected, ...unselected]);
  }, [selectedIds, annotations, recordHistory]);

  const handleBringForward = useCallback(() => {
    if (selectedIds.length === 0) return;
    recordHistory(annotations);
    const list = [...annotations];
    for (let i = list.length - 2; i >= 0; i--) {
      if (selectedIds.includes(list[i].id) && !selectedIds.includes(list[i + 1].id)) {
        const temp = list[i];
        list[i] = list[i + 1];
        list[i + 1] = temp;
      }
    }
    setAnnotations(list);
  }, [selectedIds, annotations, recordHistory]);

  const handleSendBackward = useCallback(() => {
    if (selectedIds.length === 0) return;
    recordHistory(annotations);
    const list = [...annotations];
    for (let i = 1; i < list.length; i++) {
      if (selectedIds.includes(list[i].id) && !selectedIds.includes(list[i - 1].id)) {
        const temp = list[i];
        list[i] = list[i - 1];
        list[i - 1] = temp;
      }
    }
    setAnnotations(list);
  }, [selectedIds, annotations, recordHistory]);

  // Toggle Lock on selected
  const handleToggleLock = useCallback(() => {
    if (selectedIds.length === 0) return;
    recordHistory(annotations);
    const updated = annotations.map((a) =>
      selectedIds.includes(a.id) ? { ...a, locked: !a.locked } : a
    );
    setAnnotations(updated);
  }, [selectedIds, annotations, recordHistory]);

  // Alignment
  const handleAlign = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (selectedIds.length === 0) return;
      recordHistory(annotations);

      const selected = annotations.filter((a) => selectedIds.includes(a.id));
      if (selected.length === 0) return;

      const minX = Math.min(...selected.map((a) => a.x));
      const maxX = Math.max(...selected.map((a) => a.x + a.width));
      const minY = Math.min(...selected.map((a) => a.y));
      const maxY = Math.max(...selected.map((a) => a.y + a.height));
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;

      const updated = annotations.map((a) => {
        if (!selectedIds.includes(a.id) || a.locked) return a;
        switch (alignment) {
          case 'left':
            return { ...a, x: minX };
          case 'center':
            return { ...a, x: midX - a.width / 2 };
          case 'right':
            return { ...a, x: maxX - a.width };
          case 'top':
            return { ...a, y: minY };
          case 'middle':
            return { ...a, y: midY - a.height / 2 };
          case 'bottom':
            return { ...a, y: maxY - a.height };
        }
      });
      setAnnotations(updated);
    },
    [selectedIds, annotations, recordHistory]
  );

  // Rotation & Flipping
  const handleRotateCw = useCallback(() => {
    recordHistory(annotations, imageDimensions, imageTransform);
    setImageTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
    showToast('Rotated 90° Clockwise');
  }, [annotations, imageDimensions, imageTransform, recordHistory, showToast]);

  const handleRotateCcw = useCallback(() => {
    recordHistory(annotations, imageDimensions, imageTransform);
    setImageTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation - 90 + 360) % 360,
    }));
    showToast('Rotated 90° Counter-Clockwise');
  }, [annotations, imageDimensions, imageTransform, recordHistory, showToast]);

  const handleFlipH = useCallback(() => {
    recordHistory(annotations, imageDimensions, imageTransform);
    setImageTransform((prev) => ({ ...prev, flipH: !prev.flipH }));
    showToast('Flipped Horizontally');
  }, [annotations, imageDimensions, imageTransform, recordHistory, showToast]);

  const handleFlipV = useCallback(() => {
    recordHistory(annotations, imageDimensions, imageTransform);
    setImageTransform((prev) => ({ ...prev, flipV: !prev.flipV }));
    showToast('Flipped Vertically');
  }, [annotations, imageDimensions, imageTransform, recordHistory, showToast]);

  // Image Resize
  const handleApplyResize = useCallback(
    (newWidth: number, newHeight: number) => {
      recordHistory(annotations, imageDimensions, imageTransform);
      const scaleX = newWidth / imageDimensions.width;
      const scaleY = newHeight / imageDimensions.height;

      // Scale annotations proportionally
      const scaled = annotations.map((a) => ({
        ...a,
        x: Math.round(a.x * scaleX),
        y: Math.round(a.y * scaleY),
        width: Math.round(a.width * scaleX),
        height: Math.round(a.height * scaleY),
      }));

      setImageDimensions({ width: newWidth, height: newHeight });
      setAnnotations(scaled);
      showToast(`Resized canvas to ${newWidth}×${newHeight}px`);
    },
    [annotations, imageDimensions, imageTransform, recordHistory, showToast]
  );

  // Cropping actions
  const handleToggleCrop = useCallback(() => {
    setCropState((prev) => ({
      ...prev,
      isCropping: !prev.isCropping,
      x: prev.x || Math.round(imageDimensions.width * 0.1),
      y: prev.y || Math.round(imageDimensions.height * 0.1),
      width: prev.width || Math.round(imageDimensions.width * 0.8),
      height: prev.height || Math.round(imageDimensions.height * 0.8),
    }));
  }, [imageDimensions]);

  const handleApplyCrop = useCallback(async () => {
    if (cropState.width < 10 || cropState.height < 10) return;
    recordHistory(annotations, imageDimensions, imageTransform);

    // Render cropped image
    const croppedCanvas = await generateExportCanvas({
      image,
      imageDimensions,
      imageTransform,
      annotations: [],
      scope: 'crop',
      cropBox: {
        x: cropState.x,
        y: cropState.y,
        width: cropState.width,
        height: cropState.height,
      },
    });

    const newImg = new Image();
    newImg.onload = () => {
      setImage(newImg);
      setImageDimensions({ width: cropState.width, height: cropState.height });
      setImageTransform({ rotation: 0, flipH: false, flipV: false });

      // Offset existing annotations
      const shifted = annotations
        .map((a) => ({
          ...a,
          x: a.x - cropState.x,
          y: a.y - cropState.y,
        }))
        .filter(
          (a) =>
            a.x + a.width >= 0 &&
            a.x <= cropState.width &&
            a.y + a.height >= 0 &&
            a.y <= cropState.height
        );

      setAnnotations(shifted);
      setCropState((prev) => ({ ...prev, isCropping: false }));
      showToast(`Cropped to ${cropState.width}×${cropState.height}px`);
    };
    newImg.src = croppedCanvas.toDataURL();
  }, [cropState, image, imageDimensions, imageTransform, annotations, recordHistory, showToast]);

  const handleCancelCrop = useCallback(() => {
    setCropState((prev) => ({ ...prev, isCropping: false }));
  }, []);

  // Fit to screen view
  const handleFitToScreen = useCallback(() => {
    const availableW = window.innerWidth - (isInspectorOpen ? 340 : 100);
    const availableH = window.innerHeight - 120;
    const fitScale = Math.min(availableW / imageDimensions.width, availableH / imageDimensions.height, 1);
    const clampedZoom = Math.max(0.1, Math.min(3, fitScale * 0.92));
    setZoom(clampedZoom);
    setPan({
      x: (availableW - imageDimensions.width * clampedZoom) / 2 + 30,
      y: (availableH - imageDimensions.height * clampedZoom) / 2 + 50,
    });
  }, [isInspectorOpen, imageDimensions]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedIds(annotations.map((a) => a.id));
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleQuickCopy();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
        return;
      }

      if (e.key === '?') {
        setIsShortcutsModalOpen(true);
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        handleFitToScreen();
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'p':
          setActiveTool('pen');
          break;
        case 'a':
          setActiveTool(e.shiftKey ? 'double_arrow' : 'arrow');
          break;
        case 'c':
          if (!cropState.isCropping) setActiveTool('curved_arrow');
          break;
        case 'o':
          setActiveTool('orthogonal_arrow');
          break;
        case 'l':
          setActiveTool('line');
          break;
        case 'r':
          setActiveTool(e.shiftKey ? 'rounded_rect' : 'rect');
          break;
        case 'e':
          setActiveTool('ellipse');
          break;
        case 't':
          setActiveTool(e.shiftKey ? 'triangle' : 'text');
          break;
        case 'b':
          setActiveTool(e.shiftKey ? 'thought_bubble' : 'speech_bubble');
          break;
        case 'g':
          setActiveTool('blur');
          break;
        case 'm':
          setActiveTool('pixelate');
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            setActiveTool(e.shiftKey ? 'star' : 'spotlight');
          }
          break;
        case 'z':
          if (!e.ctrlKey && !e.metaKey) {
            setActiveTool('loupe');
          }
          break;
        case 'n':
          setActiveTool('counter');
          break;
        case 'u':
          setActiveTool('ruler');
          break;
        case 'k':
          setActiveTool('sticker');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleDuplicateSelected,
    handleDeleteSelected,
    handleQuickCopy,
    handleFitToScreen,
    annotations,
    cropState.isCropping,
  ]);

  // Selected object in inspector
  const activeSelectedObject =
    selectedIds.length === 1 ? annotations.find((a) => a.id === selectedIds[0]) || null : null;

  const handleUpdateSelectedObject = (updated: Partial<AnnotationObject>) => {
    // If an object is selected, update it
    if (selectedIds.length > 0) {
      const nextAnnotations = annotations.map((a) =>
        selectedIds.includes(a.id) ? { ...a, ...updated } : a
      );
      handleUpdateAnnotations(nextAnnotations, false);
    }
    // Also update defaultStyle for future tools
    setDefaultStyle((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div id="pixelmark-app" className={`flex flex-col w-screen h-screen ${currentTheme.appBackground} overflow-hidden font-sans transition-colors`}>
      {/* Top Navbar */}
      <TopBar
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitToScreen={handleFitToScreen}
        onResetZoom={() => setZoom(1)}
        isCropping={cropState.isCropping}
        onToggleCrop={handleToggleCrop}
        onRotateCw={handleRotateCw}
        onRotateCcw={handleRotateCcw}
        onFlipH={handleFlipH}
        onFlipV={handleFlipV}
        onOpenResizeModal={() => setIsResizeModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onQuickCopy={handleQuickCopy}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={selectedIds.length > 0}
        onLoadSample={(id) => {
          const sample = SAMPLE_IMAGES.find((s) => s.id === id);
          if (sample) loadImageFromSrc(sample.dataUrl, sample.name);
        }}
        onUploadFile={handleUploadFile}
        showMiniMap={showMiniMap}
        onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onNewBlankCanvas={handleNewBlankCanvas}
        onOpenScreenCapture={() => setIsScreenCaptureOpen(true)}
        onOpenColorPicker={() => setIsColorPickerOpen(true)}
        onOpenImageEffects={() => setIsImageEffectsOpen(true)}
        onOpenQrCode={() => setIsQrCodeOpen(true)}
        onOpenImageCombiner={() => setIsImageCombinerOpen(true)}
        onOpenHashCheck={() => setIsHashCheckOpen(true)}
        theme={theme}
        onThemeChange={handleThemeChange}
      />

      {/* Main Workspace Stage */}
      <div className="relative flex-1 w-full h-full flex overflow-hidden">
        {/* Left Toolbar */}
        <Toolbar
          activeTool={activeTool}
          onSelectTool={(tool) => {
            setActiveTool(tool);
            if (cropState.isCropping) handleCancelCrop();
          }}
          nextStepNumber={nextStepNumber}
          defaultStyle={defaultStyle}
          onUpdateDefaultStyle={(style) => {
            setDefaultStyle((prev) => ({ ...prev, ...style }));
            if (selectedIds.length > 0) {
              setAnnotations((prev) =>
                prev.map((a) => (selectedIds.includes(a.id) ? { ...a, ...style } : a))
              );
            }
          }}
          theme={theme}
        />

        {/* Center Interactive Canvas Stage */}
        <CanvasWorkspace
          image={image}
          imageDimensions={imageDimensions}
          imageTransform={imageTransform}
          annotations={annotations}
          onUpdateAnnotations={handleUpdateAnnotations}
          selectedIds={selectedIds}
          onSelectIds={setSelectedIds}
          activeTool={activeTool}
          defaultStyle={defaultStyle}
          zoom={zoom}
          onZoomChange={setZoom}
          pan={pan}
          onPanChange={setPan}
          cropState={cropState}
          onUpdateCropBox={(box) => setCropState((prev) => ({ ...prev, ...box }))}
          nextStepNumber={nextStepNumber}
          onIncrementStepNumber={() => setNextStepNumber((n) => n + 1)}
          onDropImage={handleUploadFile}
          theme={theme}
        />

        {/* Right Inspector Panel */}
        <Inspector
          selectedObject={activeSelectedObject}
          activeTool={activeTool}
          onUpdateObject={handleUpdateSelectedObject}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onDuplicate={handleDuplicateSelected}
          onDelete={handleDeleteSelected}
          onToggleLock={handleToggleLock}
          onAlign={handleAlign}
          isOpen={isInspectorOpen}
          onToggleOpen={() => setIsInspectorOpen(!isInspectorOpen)}
          selectedCount={selectedIds.length}
          theme={theme}
        />

        {/* Floating Mini-Map */}
        <MiniMap
          image={image}
          imageDimensions={imageDimensions}
          imageTransform={imageTransform}
          annotations={annotations}
          viewport={{ zoom, panX: pan.x, panY: pan.y }}
          containerSize={containerSize}
          onNavigatePan={(newPanX, newPanY) => setPan({ x: newPanX, y: newPanY })}
          isOpen={showMiniMap}
          onToggle={() => setShowMiniMap(false)}
          theme={theme}
        />

        {/* Cropping Control Bar when Cropping */}
        {cropState.isCropping && (
          <CropControls
            cropBox={{
              x: cropState.x,
              y: cropState.y,
              width: cropState.width,
              height: cropState.height,
            }}
            aspectRatio={cropState.aspectRatio}
            onSelectAspectRatio={(ratio) => {
              if (!ratio) {
                setCropState((prev) => ({ ...prev, aspectRatio: null }));
              } else {
                setCropState((prev) => ({
                  ...prev,
                  aspectRatio: ratio,
                  height: prev.width / ratio,
                }));
              }
            }}
            onApplyCrop={handleApplyCrop}
            onCancelCrop={handleCancelCrop}
          />
        )}
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        image={image}
        imageDimensions={imageDimensions}
        imageTransform={imageTransform}
        annotations={annotations}
        cropBox={cropState}
        selectedIds={selectedIds}
        onImportProject={(project: ProjectData) => {
          if (project.imageSrc) {
            loadImageFromSrc(project.imageSrc, 'Imported Project');
          }
          if (project.imageDimensions) setImageDimensions(project.imageDimensions);
          if (project.imageTransform) setImageTransform(project.imageTransform);
          if (project.annotations) setAnnotations(project.annotations);
        }}
        onShowToast={showToast}
      />

      <ImageOperationsModal
        isOpen={isResizeModalOpen}
        onClose={() => setIsResizeModalOpen(false)}
        currentDimensions={imageDimensions}
        imageTransform={imageTransform}
        onApplyResize={handleApplyResize}
        onRotateCw={handleRotateCw}
        onRotateCcw={handleRotateCcw}
        onFlipH={handleFlipH}
        onFlipV={handleFlipV}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* ShareX Modals */}
      <ScreenCaptureModal
        isOpen={isScreenCaptureOpen}
        onClose={() => setIsScreenCaptureOpen(false)}
        onCaptureComplete={handleScreenCaptureComplete}
        onError={(msg) => showToast(msg)}
      />

      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        currentColor={defaultStyle.strokeColor || '#ef4444'}
        onSelectColor={handleColorSelect}
      />

      <ImageEffectsModal
        isOpen={isImageEffectsOpen}
        onClose={() => setIsImageEffectsOpen(false)}
        canvasImageSrc={image?.src || null}
        onApplyToCanvas={handleImageEffectsApply}
        onShowToast={showToast}
      />

      <QrCodeModal
        isOpen={isQrCodeOpen}
        onClose={() => setIsQrCodeOpen(false)}
        canvasImageSrc={image?.src || null}
        onAddQrSticker={handleAddQrSticker}
        onShowToast={showToast}
      />

      <ImageCombinerModal
        isOpen={isImageCombinerOpen}
        onClose={() => setIsImageCombinerOpen(false)}
        currentCanvasImageSrc={image?.src || null}
        onApplyCombinedImage={handleImageCombinerApply}
        onShowToast={showToast}
      />

      <HashCheckModal
        isOpen={isHashCheckOpen}
        onClose={() => setIsHashCheckOpen(false)}
        canvasImageSrc={image?.src || null}
        dimensions={imageDimensions}
      />

      {/* Toast Feedback */}
      <Toast message={toastMessage} />
    </div>
  );
}
