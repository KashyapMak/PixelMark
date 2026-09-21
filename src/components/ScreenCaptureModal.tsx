import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  AppWindow,
  Chrome,
  Timer,
  Camera,
  X,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Play,
} from 'lucide-react';

interface ScreenCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (dataUrl: string) => void;
  onError: (msg: string) => void;
}

export const ScreenCaptureModal: React.FC<ScreenCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptureComplete,
  onError,
}) => {
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleStartCapture = async (delay: number) => {
    setIsCapturing(true);
    setStatusMessage('Preparing screen stream...');

    if (delay > 0) {
      setCountdown(delay);
      setStatusMessage(`Capturing in ${delay}s... Switch to your target window now!`);
      let remaining = delay;
      timerRef.current = window.setInterval(async () => {
        remaining -= 1;
        if (remaining > 0) {
          setCountdown(remaining);
          setStatusMessage(`Capturing in ${remaining}s...`);
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          setCountdown(null);
          await executeCapture();
        }
      }, 1000);
    } else {
      await executeCapture();
    }
  };

  const executeCapture = async () => {
    try {
      setStatusMessage('Requesting screen/window permission...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen capture API (getDisplayMedia) is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        } as MediaTrackConstraints,
        audio: false,
      });

      setStatusMessage('Extracting high-resolution frame...');
      const track = stream.getVideoTracks()[0];
      const video = document.createElement('video');
      video.playsInline = true;
      video.muted = true;
      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        video.onerror = () => reject(new Error('Failed to play capture stream video.'));
        setTimeout(() => resolve(), 1200); // fallback timeout
      });

      // Render video frame onto offscreen canvas
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas 2D context.');

      ctx.drawImage(video, 0, 0, width, height);

      // Stop stream tracks
      track.stop();
      stream.getTracks().forEach((t) => t.stop());

      const dataUrl = canvas.toDataURL('image/png');
      setIsCapturing(false);
      setCountdown(null);
      onCaptureComplete(dataUrl);
      onClose();
    } catch (err: unknown) {
      setIsCapturing(false);
      setCountdown(null);
      const msg = err instanceof Error ? err.message : 'Screen capture was cancelled or denied.';
      setStatusMessage('');
      if (msg.includes('Permission denied') || msg.includes('cancelled')) {
        onError('Screen capture cancelled by user.');
      } else {
        onError(msg);
      }
    }
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(null);
    setIsCapturing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Screen & Window Capture</h3>
              <p className="text-xs text-slate-400">Pure client-side capture engine</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Active Countdown Banner if counting down */}
          {countdown !== null ? (
            <div className="p-6 rounded-xl bg-sky-500/10 border border-sky-500/30 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-sky-500 text-slate-950 font-black text-2xl flex items-center justify-center mx-auto animate-pulse">
                {countdown}
              </div>
              <div>
                <h4 className="text-sm font-bold text-sky-300">Switch to your window now!</h4>
                <p className="text-xs text-slate-400 mt-0.5">Capturing screen frame when timer hits zero...</p>
              </div>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Abort Countdown
              </button>
            </div>
          ) : (
            <>
              {/* Delay Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Capture Timing Mode
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setDelaySeconds(0)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                      delaySeconds === 0
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Instant Capture</span>
                  </button>

                  <button
                    onClick={() => setDelaySeconds(3)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                      delaySeconds === 3
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Timer className="w-4 h-4 text-amber-400" />
                    <span>3s Countdown</span>
                  </button>

                  <button
                    onClick={() => setDelaySeconds(5)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                      delaySeconds === 5
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Timer className="w-4 h-4 text-amber-400" />
                    <span>5s Countdown</span>
                  </button>
                </div>
              </div>

              {/* Targets Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Choose what you want to capture:</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <Monitor className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Entire Screen</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <AppWindow className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Single Window</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <Chrome className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Browser Tab</span>
                  </div>
                </div>
              </div>

              {/* Status or tip */}
              <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Tip: Use delayed capture (3s or 5s) if you need to open a menu, hover over a button, or arrange your windows before taking the screenshot.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <span className="text-xs text-slate-400">{statusMessage}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              disabled={isCapturing}
              onClick={() => handleStartCapture(delaySeconds)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{delaySeconds > 0 ? `Start ${delaySeconds}s Timer` : 'Capture Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
