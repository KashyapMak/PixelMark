import React from 'react';
import { CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      id="pixelmark-toast"
      className="fixed bottom-6 left-6 z-50 bg-slate-900 border border-sky-500/50 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 select-none"
    >
      <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
