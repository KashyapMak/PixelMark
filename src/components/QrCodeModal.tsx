import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {
  QrCode,
  Scan,
  Copy,
  Download,
  ExternalLink,
  Check,
  X,
  Upload,
  Stamp,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasImageSrc: string | null;
  onAddQrSticker: (qrDataUrl: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  canvasImageSrc,
  onAddQrSticker,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [qrText, setQrText] = useState('https://pixelmark.app');
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Scan state
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const scanFileInputRef = useRef<HTMLInputElement>(null);

  // Generate QR whenever inputs change
  useEffect(() => {
    if (!qrText.trim()) {
      setQrDataUrl('');
      return;
    }
    QRCode.toDataURL(qrText, {
      width: 400,
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: errorCorrection,
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [qrText, darkColor, lightColor, errorCorrection]);

  if (!isOpen) return null;

  // Scan from canvas image
  const handleScanFromCanvas = () => {
    if (!canvasImageSrc) {
      onShowToast('No image loaded on canvas to scan.', 'error');
      return;
    }
    setIsScanning(true);
    setScanStatus('Analyzing canvas image pixels for QR codes...');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = canvasImageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsScanning(false);
        setScanStatus('Could not read image context.');
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      setIsScanning(false);
      if (code) {
        setScannedResult(code.data);
        setScanStatus('QR Code successfully decoded from canvas!');
        onShowToast('QR code detected!', 'success');
      } else {
        setScannedResult(null);
        setScanStatus('No QR code found in current canvas image. Make sure the code is clearly visible.');
      }
    };
    img.onerror = () => {
      setIsScanning(false);
      setScanStatus('Failed to load canvas image for scanning.');
    };
  };

  // Scan from uploaded file
  const handleScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            setScannedResult(code.data);
            setScanStatus('QR code detected in uploaded file!');
            onShowToast('QR code decoded!', 'success');
          } else {
            setScannedResult(null);
            setScanStatus('No QR code found in the uploaded file.');
          }
        };
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCopyQrImage = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      onShowToast('QR Code copied to clipboard as PNG image!', 'success');
    } catch {
      onShowToast('Could not copy image to clipboard.', 'error');
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `pixelmark-qr-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
    onShowToast('QR Code downloaded.', 'success');
  };

  const handleStampOntoCanvas = () => {
    if (!qrDataUrl) return;
    onAddQrSticker(qrDataUrl);
    onShowToast('QR Code stamped onto canvas as moveable sticker!', 'success');
    onClose();
  };

  const isUrl = scannedResult && /^(https?:\/\/|www\.)/i.test(scannedResult.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">QR Code Studio</h3>
              <p className="text-[11px] text-slate-400">Generate, stamp onto image, or decode QR codes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'generate'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Generate & Stamp QR</span>
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'scan'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Decode / Scan QR</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'generate' ? (
            <div className="space-y-4">
              {/* Text Input */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Text or URL to Encode
                </label>
                <textarea
                  rows={2}
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500 resize-none font-mono"
                  placeholder="https://example.com or any text..."
                />
              </div>

              {/* QR Preview + Color controls */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="w-32 h-32 rounded-xl bg-white p-2 shrink-0 flex items-center justify-center shadow-inner overflow-hidden">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Generated QR" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Type text above</span>
                  )}
                </div>

                <div className="flex-1 space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Foreground & Background
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={darkColor}
                          onChange={(e) => setDarkColor(e.target.value)}
                          className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          title="Foreground Color"
                        />
                        <span className="text-[10px] text-slate-400">Code</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={lightColor}
                          onChange={(e) => setLightColor(e.target.value)}
                          className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                          title="Background Color"
                        />
                        <span className="text-[10px] text-slate-400">Base</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Error Correction
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setErrorCorrection(lvl)}
                          className={`py-1 rounded text-center text-[10px] font-bold border transition ${
                            errorCorrection === lvl
                              ? 'bg-sky-500 text-slate-950 border-sky-400'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleStampOntoCanvas}
                  disabled={!qrDataUrl}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 disabled:opacity-40 transition"
                  title="Insert this QR directly onto your current image"
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span>Stamp on Canvas</span>
                </button>

                <button
                  onClick={handleCopyQrImage}
                  disabled={!qrDataUrl}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 disabled:opacity-40 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Image</span>
                </button>

                <button
                  onClick={handleDownloadQr}
                  disabled={!qrDataUrl}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 disabled:opacity-40 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ) : (
            /* Decode / Scan Tab */
            <div className="space-y-4">
              <input
                ref={scanFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScanFile}
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleScanFromCanvas}
                  disabled={isScanning}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <Scan className="w-5 h-5 text-sky-400" />
                  <span>Scan Active Canvas</span>
                </button>

                <button
                  onClick={() => scanFileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  <Upload className="w-5 h-5 text-emerald-400" />
                  <span>Upload QR Image</span>
                </button>
              </div>

              {scanStatus && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  {scanStatus}
                </div>
              )}

              {scannedResult && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Decoded Data
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(scannedResult);
                        onShowToast('Copied decoded text to clipboard!', 'success');
                      }}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-200 select-all break-all bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    {scannedResult}
                  </p>

                  {isUrl && (
                    <a
                      href={scannedResult.startsWith('http') ? scannedResult : `https://${scannedResult}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Link in New Tab</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
