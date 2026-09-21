import React, { useState } from 'react';
import {
  Download,
  Copy,
  FileJson,
  Upload,
  Check,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  copyCanvasToClipboard,
  exportAsRaster,
  exportProjectJson,
  generateExportCanvas,
  ProjectData,
} from '../utils/exportUtils';
import { AnnotationObject, ImageTransform } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: HTMLImageElement | null;
  imageDimensions: { width: number; height: number };
  imageTransform: ImageTransform;
  annotations: AnnotationObject[];
  cropBox?: { x: number; y: number; width: number; height: number };
  selectedIds: string[];
  onImportProject: (data: ProjectData) => void;
  onShowToast: (message: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  image,
  imageDimensions,
  imageTransform,
  annotations,
  cropBox,
  selectedIds,
  onImportProject,
  onShowToast,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(0.92);
  const [scope, setScope] = useState<'all' | 'crop' | 'selection'>('all');
  const [filename, setFilename] = useState<string>('pixelmark-annotated');
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const exportCanvas = await generateExportCanvas({
        image,
        imageDimensions,
        imageTransform,
        annotations,
        scope,
        cropBox,
        selectedIds,
      });

      await exportAsRaster(exportCanvas, format, quality, filename);
      onShowToast(`Exported ${filename}.${format === 'jpeg' ? 'jpg' : format}`);
      onClose();
    } catch (err) {
      console.error(err);
      onShowToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    setIsExporting(true);
    try {
      const exportCanvas = await generateExportCanvas({
        image,
        imageDimensions,
        imageTransform,
        annotations,
        scope,
        cropBox,
        selectedIds,
      });

      const success = await copyCanvasToClipboard(exportCanvas);
      if (success) {
        setCopied(true);
        onShowToast('Copied high-res image to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      } else {
        onShowToast('Clipboard copy not supported by browser.');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Clipboard copy failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    const project: ProjectData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      imageSrc: image?.src || null,
      imageDimensions,
      imageTransform,
      annotations,
    };
    exportProjectJson(project, `${filename}.pixelmark.json`);
    onShowToast('Saved editable project file!');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);
        if (Array.isArray(data.annotations)) {
          onImportProject(data);
          onShowToast('Loaded project file successfully!');
          onClose();
        } else {
          onShowToast('Invalid project format.');
        }
      } catch (err) {
        console.error(err);
        onShowToast('Failed to parse project JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-base text-white">Export Image & Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* File Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">File Name</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-medium focus:ring-2 focus:ring-sky-400 focus:outline-none"
            />
          </div>

          {/* Raster Format */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 rounded-xl border text-xs font-bold uppercase transition ${
                    format === fmt
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPG & WebP) */}
          {format !== 'png' && (
            <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between font-semibold">
                <span>Compression Quality</span>
                <span className="font-mono text-sky-400">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>
          )}

          {/* Export Scope */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Export Scope</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setScope('all')}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold transition ${
                  scope === 'all'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Entire Canvas
              </button>
              <button
                onClick={() => setScope('crop')}
                disabled={!cropBox || cropBox.width <= 0}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold transition ${
                  scope === 'crop'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-40'
                }`}
              >
                Cropped Bounds
              </button>
              <button
                onClick={() => setScope('selection')}
                disabled={selectedIds.length === 0}
                className={`py-2 px-1 rounded-xl border text-xs font-semibold transition ${
                  scope === 'selection'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-40'
                }`}
              >
                Selected Only
              </button>
            </div>
          </div>

          {/* Project File Import / Export */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-200">Editable Vector Project</span>
              <span className="text-[11px] text-slate-400">Save or load JSON schema with all layers</span>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="import-project-file"
                className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Import</span>
                <input
                  id="import-project-file"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJsonFile}
                />
              </label>
              <button
                onClick={handleExportJson}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition"
              >
                <FileJson className="w-3.5 h-3.5 text-amber-400" />
                <span>Save .json</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={handleCopyClipboard}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-lg shadow-sky-500/25 transition"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Download Image'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
