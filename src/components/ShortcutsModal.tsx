import React from 'react';
import { HelpCircle, X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'V', desc: 'Select & Transform tool' },
    { key: 'H / Space', desc: 'Pan tool / Hold space to pan' },
    { key: 'P', desc: 'Solid freehand pen' },
    { key: 'Shift + H', desc: 'Highlighter brush' },
    { key: 'A', desc: 'Straight pointer arrow' },
    { key: 'Shift + A', desc: 'Double-headed arrow' },
    { key: 'C', desc: 'Curved Bezier arrow' },
    { key: 'O', desc: 'Orthogonal 90° arrow' },
    { key: 'R', desc: 'Rectangle shape' },
    { key: 'Shift + R', desc: 'Rounded rectangle' },
    { key: 'E', desc: 'Circle / Ellipse' },
    { key: 'Shift + T', desc: 'Triangle' },
    { key: 'Shift + S', desc: '5-Point Star' },
    { key: 'T', desc: 'Text box' },
    { key: 'B', desc: 'Speech callout bubble' },
    { key: 'Shift + B', desc: 'Thought cloud bubble' },
    { key: 'G', desc: 'Gaussian blur redaction' },
    { key: 'M', desc: 'Mosaic pixelation' },
    { key: 'S', desc: 'Spotlight darkening' },
    { key: 'Z', desc: 'Loupe magnifier' },
    { key: 'N', desc: 'Auto-increment step badge (1, 2, 3...)' },
    { key: 'U', desc: 'Dimension ruler caliper' },
    { key: 'K', desc: 'Cursor & Status stickers' },
    { key: 'Ctrl + Z', desc: 'Undo modification' },
    { key: 'Ctrl + Y / Shift+Z', desc: 'Redo modification' },
    { key: 'Ctrl + C', desc: 'Quick copy composite to clipboard' },
    { key: 'Ctrl + V', desc: 'Paste image from clipboard' },
    { key: 'Ctrl + D', desc: 'Duplicate selected object' },
    { key: 'Del / Backspace', desc: 'Delete selected object' },
    { key: '+ / -', desc: 'Zoom in / Zoom out' },
    { key: 'F', desc: 'Fit canvas to viewport' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-sky-400" />
            <h2 className="font-bold text-sm text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto no-scrollbar grid grid-cols-2 gap-2 text-xs">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-slate-800/60 p-2 rounded-xl border border-slate-800/80"
            >
              <span className="text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-900 text-sky-400 font-mono text-[11px] font-bold border border-slate-700 shrink-0 ml-2">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 bg-slate-900/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
