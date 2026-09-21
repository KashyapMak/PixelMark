import React, { useRef, useState } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Copy,
  Trash2,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  MapPin,
  FileCode,
  Image as ImageIcon,
  FolderOpen,
  HelpCircle,
  Sparkles,
  Camera,
  Pipette,
  QrCode,
  Columns2,
  FileSearch,
  Wand2,
  Sun,
  Moon,
  Palette,
  Check,
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { AppTheme } from '../types';
import { THEMES } from '../utils/theme';

interface TopBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onFitToScreen: () => void;
  onResetZoom: () => void;
  isCropping: boolean;
  onToggleCrop: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onOpenResizeModal: () => void;
  onOpenExportModal: () => void;
  onQuickCopy: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onLoadSample: (sampleId: string) => void;
  onUploadFile: (file: File) => void;
  showMiniMap: boolean;
  onToggleMiniMap: () => void;
  onOpenShortcuts: () => void;
  onNewBlankCanvas: () => void;
  onOpenScreenCapture: () => void;
  onOpenColorPicker: () => void;
  onOpenImageEffects: () => void;
  onOpenQrCode: () => void;
  onOpenImageCombiner: () => void;
  onOpenHashCheck: () => void;
  theme: AppTheme;
  onThemeChange: (newTheme: AppTheme) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  onFitToScreen,
  onResetZoom,
  isCropping,
  onToggleCrop,
  onRotateCw,
  onRotateCcw,
  onFlipH,
  onFlipV,
  onOpenResizeModal,
  onOpenExportModal,
  onQuickCopy,
  onDeleteSelected,
  hasSelection,
  onLoadSample,
  onUploadFile,
  showMiniMap,
  onToggleMiniMap,
  onOpenShortcuts,
  onNewBlankCanvas,
  onOpenScreenCapture,
  onOpenColorPicker,
  onOpenImageEffects,
  onOpenQrCode,
  onOpenImageCombiner,
  onOpenHashCheck,
  theme,
  onThemeChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);
  const [showTransformMenu, setShowTransformMenu] = useState(false);
  const [showAdditionalToolsMenu, setShowAdditionalToolsMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const currentTheme = THEMES[theme] || THEMES.dark;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <header
      id="pixelmark-topbar"
      className={`h-14 backdrop-blur border-b px-3 md:px-4 flex items-center justify-between z-30 shrink-0 select-none transition-colors ${currentTheme.topbar}`}
    >
      {/* Left: Brand & File Operations */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Brand badge */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-black text-lg">
            P
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">PixelMark</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
                OFFLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Local Canvas Vector Markup</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload Image Button */}
        <button
          id="btn-upload-image"
          title="Open Image (Ctrl+O)"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Open</span>
        </button>

        {/* New Blank Button */}
        <button
          id="btn-new-canvas"
          title="Create New Blank Canvas"
          onClick={onNewBlankCanvas}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">Blank Canvas</span>
        </button>

        {/* Samples Dropdown */}
        <div className="relative">
          <button
            id="btn-samples-menu"
            onClick={() => setShowSamplesMenu(!showSamplesMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Samples</span>
          </button>

          {showSamplesMenu && (
            <div className="absolute left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Instant Mockups
              </div>
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    onLoadSample(sample.id);
                    setShowSamplesMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700/80 flex flex-col transition"
                >
                  <span className="text-xs font-semibold text-slate-200">{sample.name}</span>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{sample.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Base Transform Operations dropdown */}
        <div className="relative">
          <button
            id="btn-transform-menu"
            onClick={() => setShowTransformMenu(!showTransformMenu)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-slate-800 text-slate-300 text-xs transition"
            title="Image Transformations & Resize"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">Transform</span>
          </button>

          {showTransformMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 z-50">
              <button
                onClick={() => {
                  onRotateCw();
                  setShowTransformMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                Rotate 90° Clockwise
              </button>
              <button
                onClick={() => {
                  onRotateCcw();
                  setShowTransformMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                Rotate 90° Counter-CW
              </button>
              <div className="h-px bg-slate-700 my-1" />
              <button
                onClick={() => {
                  onFlipH();
                  setShowTransformMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-amber-400" />
                Flip Horizontally
              </button>
              <button
                onClick={() => {
                  onFlipV();
                  setShowTransformMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                <FlipVertical className="w-3.5 h-3.5 text-amber-400" />
                Flip Vertically
              </button>
              <div className="h-px bg-slate-700 my-1" />
              <button
                onClick={() => {
                  onOpenResizeModal();
                  setShowTransformMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Resize Dimensions...
              </button>
            </div>
          )}
        </div>

        {/* Crop tool toggle */}
        <button
          id="btn-crop-tool"
          onClick={onToggleCrop}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition ${
            isCropping
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Crop Workspace (C)"
        >
          <Crop className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isCropping ? 'Cropping...' : 'Crop'}</span>
        </button>

        {/* Additional Tools Dropdown (Renamed from ShareX Tools) */}
        <div className="relative">
          <button
            id="btn-additional-tools-menu"
            onClick={() => setShowAdditionalToolsMenu(!showAdditionalToolsMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gradient-to-r from-sky-500/15 to-indigo-500/15 hover:from-sky-500/25 hover:to-indigo-500/25 text-sky-400 text-xs font-semibold border border-sky-500/30 transition shadow-sm"
            title="Additional Power Tools (Capture, Effects, QR, Color Picker, Stitcher)"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Additional Tools</span>
          </button>

          {showAdditionalToolsMenu && (
            <div className={`absolute left-0 mt-1 w-64 border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 ${currentTheme.toolbarFlyout}`}>
              <div className="px-3 py-1 text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
                <span>Additional Tools (Offline)</span>
                <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-300">Client-Side</span>
              </div>

              <button
                onClick={() => {
                  onOpenScreenCapture();
                  setShowAdditionalToolsMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-sky-500/10 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-md bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold">Screen & Window Capture</div>
                  <div className="text-[10px] opacity-70">Timer delay (3s, 5s), window & tab grab</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenColorPicker();
                  setShowAdditionalToolsMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-rose-500/10 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
                  <Pipette className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold">Screen Color Picker</div>
                  <div className="text-[10px] opacity-70">Eyedropper, RGB/HSL/HSV/CMYK copy</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenImageEffects();
                  setShowAdditionalToolsMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-purple-500/10 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold">Image Effects Studio</div>
                  <div className="text-[10px] opacity-70">Frames, shadows, padding & watermark</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenQrCode();
                  setShowAdditionalToolsMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-emerald-500/10 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold">QR Code Studio</div>
                  <div className="text-[10px] opacity-70">Generate, stamp sticker, scan canvas</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenImageCombiner();
                  setShowAdditionalToolsMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-amber-500/10 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Columns2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold">Image Combiner / Stitcher</div>
                  <div className="text-[10px] opacity-70">Side-by-side or stacked multi-screenshot merge</div>
                </div>
              </button>

              <div className={`h-px my-1 ${currentTheme.divider}`} />

              <button
                onClick={() => {
                  onOpenHashCheck();
                  setShowAdditionalToolsMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-cyan-500/10 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <FileSearch className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold">Hash & Technical Specs</div>
                  <div className="text-[10px] opacity-70">SHA-256, MD5 checksum, pixel aspect</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Undo / Redo / History & Selection actions */}
      <div className="flex items-center gap-1 md:gap-2">
        <button
          id="btn-undo"
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded-md text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          id="btn-redo"
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          className="p-1.5 rounded-md text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {hasSelection && (
          <button
            id="btn-delete-selected"
            onClick={onDeleteSelected}
            title="Delete Selected Object (Del / Backspace)"
            className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/20 transition ml-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Divider */}
        <div className="h-5 w-px bg-slate-800 mx-1" />

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-800/80 rounded-md border border-slate-700 p-0.5">
          <button
            id="btn-zoom-out"
            onClick={() => onZoomChange(Math.max(0.1, zoom - 0.15))}
            title="Zoom Out (-)"
            className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-zoom-reset"
            onClick={onResetZoom}
            title="Reset Zoom to 100%"
            className="px-2 text-xs font-semibold text-slate-200 hover:text-white"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            id="btn-zoom-in"
            onClick={() => onZoomChange(Math.min(5, zoom + 0.15))}
            title="Zoom In (+)"
            className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          id="btn-fit-screen"
          onClick={onFitToScreen}
          title="Fit Canvas to Viewport (F)"
          className="p-1.5 rounded-md text-slate-300 hover:bg-slate-800 transition hidden sm:flex"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          id="btn-toggle-minimap"
          onClick={onToggleMiniMap}
          title={showMiniMap ? 'Hide Mini-Map' : 'Show Mini-Map'}
          className={`p-1.5 rounded-md transition hidden md:flex ${
            showMiniMap ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Export & Copy & Shortcuts & Theme */}
      <div className="flex items-center gap-2">
        {/* Theme Selector Dropdown */}
        <div className="relative">
          <button
            id="btn-theme-switcher"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title={`Active Theme: ${THEMES[theme]?.name || 'Theme'}`}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-slate-500/10 text-xs font-semibold transition"
          >
            {theme === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : theme === 'midnight' ? (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="hidden xl:inline text-[11px] font-medium">{THEMES[theme]?.name}</span>
          </button>

          {showThemeMenu && (
            <div className={`absolute right-0 mt-1 w-44 border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 ${currentTheme.toolbarFlyout}`}>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Interface Theme
              </div>

              {(['dark', 'light', 'midnight'] as AppTheme[]).map((tId) => {
                const tObj = THEMES[tId];
                const isSelected = theme === tId;
                return (
                  <button
                    key={tId}
                    id={`btn-theme-${tId}`}
                    onClick={() => {
                      onThemeChange(tId);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition ${
                      isSelected ? 'font-bold text-sky-400 bg-sky-500/10' : 'hover:bg-sky-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tId === 'light' ? (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      ) : tId === 'midnight' ? (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-sky-400" />
                      )}
                      <span>{tObj.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          id="btn-shortcuts"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          className="p-1.5 rounded-md text-slate-400 hover:bg-slate-500/10 transition hidden sm:flex"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          id="btn-quick-copy"
          onClick={onQuickCopy}
          title="Copy Image to System Clipboard (Ctrl+C)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <Copy className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline">Copy</span>
        </button>

        <button
          id="btn-open-export"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
