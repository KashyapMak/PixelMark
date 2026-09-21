import { AppTheme } from '../types';

export interface ThemeStyles {
  id: AppTheme;
  name: string;
  iconName: string;
  appBackground: string;
  workspaceBackground: string;
  topbar: string;
  toolbar: string;
  toolbarFlyout: string;
  inspector: string;
  miniMap: string;
  cardBackground: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  buttonDefault: string;
  buttonActive: string;
  divider: string;
  canvasCheckeredDark: string;
  canvasCheckeredLight: string;
}

export const THEMES: Record<AppTheme, ThemeStyles> = {
  dark: {
    id: 'dark',
    name: 'Dark Studio',
    iconName: 'Moon',
    appBackground: 'bg-slate-950 text-slate-100',
    workspaceBackground: 'bg-slate-950',
    topbar: 'bg-slate-900/95 border-slate-800 text-slate-200',
    toolbar: 'bg-slate-900/95 border-slate-800 text-slate-300',
    toolbarFlyout: 'bg-slate-900 border-slate-700 text-slate-200 shadow-2xl',
    inspector: 'bg-slate-900/95 border-slate-800 text-slate-200',
    miniMap: 'bg-slate-900/90 border-slate-700',
    cardBackground: 'bg-slate-800',
    cardBorder: 'border-slate-700',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    buttonDefault: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700',
    buttonActive: 'bg-sky-500 text-slate-950 font-bold shadow-sky-500/20',
    divider: 'bg-slate-800',
    canvasCheckeredDark: '#0f172a',
    canvasCheckeredLight: '#1e293b',
  },
  light: {
    id: 'light',
    name: 'Light Modern',
    iconName: 'Sun',
    appBackground: 'bg-slate-100 text-slate-850 text-slate-900',
    workspaceBackground: 'bg-slate-100',
    topbar: 'bg-white/95 border-slate-200 text-slate-800 shadow-sm',
    toolbar: 'bg-white/95 border-slate-200 text-slate-700 shadow-xl',
    toolbarFlyout: 'bg-white border-slate-200 text-slate-800 shadow-2xl',
    inspector: 'bg-white/95 border-slate-200 text-slate-800 shadow-xl',
    miniMap: 'bg-white/90 border-slate-300 shadow-md',
    cardBackground: 'bg-slate-50',
    cardBorder: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    buttonDefault: 'bg-slate-100 hover:bg-slate-200 text-slate-850 text-slate-800 border-slate-300',
    buttonActive: 'bg-sky-500 text-white font-bold shadow-sky-500/20',
    divider: 'bg-slate-200',
    canvasCheckeredDark: '#e2e8f0',
    canvasCheckeredLight: '#f8fafc',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Indigo',
    iconName: 'Sparkles',
    appBackground: 'bg-[#090b16] text-indigo-100',
    workspaceBackground: 'bg-[#090b16]',
    topbar: 'bg-[#101328]/95 border-indigo-950 text-indigo-100 shadow-md',
    toolbar: 'bg-[#101328]/95 border-indigo-950 text-indigo-200 shadow-2xl',
    toolbarFlyout: 'bg-[#141834] border-indigo-900/80 text-indigo-100 shadow-2xl',
    inspector: 'bg-[#101328]/95 border-indigo-950 text-indigo-100 shadow-xl',
    miniMap: 'bg-[#101328]/90 border-indigo-900',
    cardBackground: 'bg-[#191e40]',
    cardBorder: 'border-indigo-900/60',
    textPrimary: 'text-indigo-50',
    textSecondary: 'text-indigo-200',
    textMuted: 'text-indigo-400',
    buttonDefault: 'bg-[#191e40] hover:bg-[#202752] text-indigo-200 border-indigo-900/60',
    buttonActive: 'bg-indigo-500 text-white font-bold shadow-indigo-500/20',
    divider: 'bg-indigo-950',
    canvasCheckeredDark: '#0f132a',
    canvasCheckeredLight: '#181d3f',
  },
};
