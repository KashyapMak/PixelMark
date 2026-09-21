import React, { useState, useEffect } from 'react';
import {
  Hash,
  Copy,
  Check,
  X,
  FileSearch,
  HardDrive,
  Cpu,
  Ratio,
} from 'lucide-react';
import { computeSha256, computeMd5FromBytes, getAspectRatioString, formatBytes } from '../utils/hashUtils';

interface HashCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasImageSrc: string | null;
  dimensions: { width: number; height: number };
}

export const HashCheckModal: React.FC<HashCheckModalProps> = ({
  isOpen,
  onClose,
  canvasImageSrc,
  dimensions,
}) => {
  const [sha256, setSha256] = useState<string>('Computing...');
  const [md5, setMd5] = useState<string>('Computing...');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pngEstimatedSize, setPngEstimatedSize] = useState<number>(0);

  useEffect(() => {
    if (!isOpen || !canvasImageSrc) return;

    // Convert dataUrl to bytes
    fetch(canvasImageSrc)
      .then((res) => res.arrayBuffer())
      .then(async (buffer) => {
        const bytes = new Uint8Array(buffer);
        setPngEstimatedSize(bytes.length);

        const sha = await computeSha256(bytes);
        setSha256(sha);

        const md5Hash = computeMd5FromBytes(bytes);
        setMd5(md5Hash);
      })
      .catch(() => {
        setSha256('Error computing hash');
        setMd5('Error computing hash');
      });
  }, [isOpen, canvasImageSrc]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const totalPixels = dimensions.width * dimensions.height;
  const megapixels = (totalPixels / 1000000).toFixed(2);
  const rawRgbaBytes = totalPixels * 4;
  const aspectRatioStr = getAspectRatioString(dimensions.width, dimensions.height);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FileSearch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Hash & Image Metrics</h3>
              <p className="text-[11px] text-slate-400">Cryptographic checksums and technical image specs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Dimensions</span>
              <span className="font-mono font-bold text-slate-200 mt-1">
                {dimensions.width} × {dimensions.height}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Ratio className="w-3 h-3 text-sky-400" /> Ratio
              </span>
              <span className="font-mono font-bold text-slate-200 mt-1">{aspectRatioStr}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3 h-3 text-amber-400" /> Megapixels
              </span>
              <span className="font-mono font-bold text-slate-200 mt-1">{megapixels} MP</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-emerald-400" /> RAM Buffer
              </span>
              <span className="font-mono font-bold text-slate-200 mt-1">{formatBytes(rawRgbaBytes)}</span>
            </div>
          </div>

          {/* Hashes Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* SHA-256 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-sky-400" /> SHA-256 Checksum
                </span>
                <button
                  onClick={() => copyToClipboard(sha256, 'sha256')}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sha256' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                {sha256}
              </div>
            </div>

            {/* MD5 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" /> MD5 Checksum
                </span>
                <button
                  onClick={() => copyToClipboard(md5, 'md5')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'md5' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'md5' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                {md5}
              </div>
            </div>

            {/* File size estimate */}
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Compressed PNG File Size:</span>
                <span className="font-mono text-slate-200">{formatBytes(pngEstimatedSize)}</span>
              </div>
              <div className="flex justify-between">
                <span>Uncompressed 32-bit RGBA Memory:</span>
                <span className="font-mono text-slate-200">{formatBytes(rawRgbaBytes)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
