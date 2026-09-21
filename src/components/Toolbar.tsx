import React, { useState, useRef, useEffect } from 'react';
import {
  MousePointer2,
  Hand,
  PenTool,
  Highlighter,
  Sparkles,
  ArrowRight,
  MoveRight,
  Spline,
  GitCommit,
  Minus,
  Square,
  RectangleHorizontal,
  Circle,
  Triangle,
  Star,
  Hexagon,
  Diamond,
  Type,
  MessageSquare,
  Cloud,
  EyeOff,
  Grid,
  SunMedium,
  Search,
  Hash,
  Ruler,
  Stamp,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { ToolType, AnnotationObject, AppTheme, StickerType } from '../types';
import { THEMES } from '../utils/theme';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  nextStepNumber: number;
  defaultStyle?: Partial<AnnotationObject>;
  onUpdateDefaultStyle?: (style: Partial<AnnotationObject>) => void;
  theme?: AppTheme;
}

// S-curve squiggle component matching the user's reference screenshot
const SquiggleIcon: React.FC<{ strokeWidth: number }> = ({ strokeWidth }) => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none" stroke="currentColor">
    <path
      d="M 14 4.5 C 9 8, 15 15.5, 10 19.5"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LINE_WIDTHS = [
  { width: 2, label: 'Thin (2px)', iconWidth: 2 },
  { width: 4, label: 'Medium (4px)', iconWidth: 4 },
  { width: 8, label: 'Thick (8px)', iconWidth: 7 },
  { width: 14, label: 'Heavy (14px)', iconWidth: 11 },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  nextStepNumber,
  defaultStyle = {
    strokeWidth: 4,
    strokeStyle: 'solid',
    fillColor: 'transparent',
    fillOpacity: 0.2,
  },
  onUpdateDefaultStyle,
  theme = 'dark',
}) => {
  const [openFlyout, setOpenFlyout] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [hoveredTip, setHoveredTip] = useState<string | null>(null);
  const [hoverTipPos, setHoverTipPos] = useState<{ top: number; left: number } | null>(null);

  // Close flyout on click outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node) &&
        flyoutRef.current &&
        !flyoutRef.current.contains(e.target as Node)
      ) {
        setOpenFlyout(null);
        setHoveredTip(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenFlyout(null);
        setHoveredTip(null);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const currentTheme = THEMES[theme] || THEMES.dark;

  // Primary Tool Groups
  const groups = [
    {
      id: 'general',
      name: 'General',
      primaryId: 'select' as ToolType,
      hasFlyout: false,
      items: [
        { id: 'select' as ToolType, name: 'Select & Transform', icon: MousePointer2, shortcut: 'V' },
        { id: 'pan' as ToolType, name: 'Pan Workspace', icon: Hand, shortcut: 'H / Space' },
      ],
    },
    {
      id: 'draw',
      name: 'Draw',
      primaryId: 'pen' as ToolType,
      hasFlyout: true,
      items: [
        { id: 'pen' as ToolType, name: 'Solid Pen', icon: PenTool, shortcut: 'P' },
        { id: 'highlighter' as ToolType, name: 'Highlighter', icon: Highlighter, shortcut: 'Shift+H' },
      ],
    },
    {
      id: 'arrows',
      name: 'Arrows & Lines',
      primaryId: 'arrow' as ToolType,
      hasFlyout: true,
      items: [
        { id: 'arrow' as ToolType, name: 'Arrow', icon: ArrowRight, shortcut: 'A' },
        { id: 'double_arrow' as ToolType, name: 'Double Arrow', icon: MoveRight, shortcut: 'Shift+A' },
        { id: 'curved_arrow' as ToolType, name: 'Curved Arrow', icon: Spline, shortcut: 'C' },
        { id: 'orthogonal_arrow' as ToolType, name: 'Orthogonal Arrow', icon: GitCommit, shortcut: 'O' },
        { id: 'line' as ToolType, name: 'Line', icon: Minus, shortcut: 'L' },
      ],
    },
    {
      id: 'shapes',
      name: 'Shapes',
      primaryId: 'rect' as ToolType,
      hasFlyout: true,
      items: [
        { id: 'rect' as ToolType, name: 'Rectangle', icon: Square, shortcut: 'R' },
        { id: 'rounded_rect' as ToolType, name: 'Rounded Rect', icon: RectangleHorizontal, shortcut: 'Shift+R' },
        { id: 'ellipse' as ToolType, name: 'Circle / Ellipse', icon: Circle, shortcut: 'E' },
        { id: 'triangle' as ToolType, name: 'Triangle', icon: Triangle, shortcut: 'Shift+T' },
        { id: 'star' as ToolType, name: '5-Point Star', icon: Star, shortcut: 'Shift+S' },
        { id: 'polygon' as ToolType, name: 'Polygon', icon: Hexagon, shortcut: 'Shift+P' },
      ],
    },
    {
      id: 'text_bubbles',
      name: 'Text & Callouts',
      primaryId: 'text' as ToolType,
      hasFlyout: true,
      items: [
        { id: 'text' as ToolType, name: 'Text Box', icon: Type, shortcut: 'T' },
        { id: 'speech_bubble' as ToolType, name: 'Speech Bubble', icon: MessageSquare, shortcut: 'B' },
        { id: 'thought_bubble' as ToolType, name: 'Thought Bubble', icon: Cloud, shortcut: 'Shift+B' },
      ],
    },
    {
      id: 'redaction',
      name: 'Redact & Focus',
      primaryId: 'blur' as ToolType,
      hasFlyout: true,
      items: [
        { id: 'blur' as ToolType, name: 'Gaussian Blur', icon: EyeOff, shortcut: 'G' },
        { id: 'pixelate' as ToolType, name: 'Mosaic Pixelate', icon: Grid, shortcut: 'M' },
        { id: 'spotlight' as ToolType, name: 'Spotlight Focus', icon: SunMedium, shortcut: 'S' },
        { id: 'loupe' as ToolType, name: 'Loupe Magnifier', icon: Search, shortcut: 'Z' },
      ],
    },
    {
      id: 'workflow',
      name: 'Additional Tools',
      primaryId: 'counter' as ToolType,
      hasFlyout: true,
      items: [
        { id: 'counter' as ToolType, name: `Step Badge (#${nextStepNumber})`, icon: Hash, shortcut: 'N' },
        { id: 'ruler' as ToolType, name: 'Dimension Ruler', icon: Ruler, shortcut: 'U' },
        { id: 'sticker' as ToolType, name: 'Sticker & Cursor', icon: Stamp, shortcut: 'K' },
      ],
    },
  ];

  const handleToolClick = (group: (typeof groups)[0]) => {
    // If clicking general select or pan
    if (!group.hasFlyout) {
      onSelectTool(group.primaryId);
      setOpenFlyout(null);
      return;
    }

    // Determine target tool in this group
    const activeInGroup = group.items.find((item) => item.id === activeTool);
    const targetTool = activeInGroup ? activeInGroup.id : group.primaryId;

    // Activate the tool
    onSelectTool(targetTool);

    // Toggle or open the flyout
    if (openFlyout === group.id) {
      setOpenFlyout(null);
    } else {
      setOpenFlyout(group.id);
    }
  };

  const handleApplyLineWidth = (w: number) => {
    onUpdateDefaultStyle?.({ strokeWidth: w });
  };

  const handleApplyStrokeStyle = (style: 'solid' | 'dashed' | 'dotted') => {
    onUpdateDefaultStyle?.({ strokeStyle: style });
  };

  const handleApplyShapeVariant = (
    toolId: ToolType,
    fillMode: 'outline' | 'tinted' | 'solid'
  ) => {
    onSelectTool(toolId);
    if (fillMode === 'outline') {
      onUpdateDefaultStyle?.({ fillColor: 'transparent', fillOpacity: 0 });
    } else if (fillMode === 'tinted') {
      onUpdateDefaultStyle?.({ fillColor: defaultStyle.strokeColor || '#ef4444', fillOpacity: 0.25 });
    } else {
      onUpdateDefaultStyle?.({ fillColor: defaultStyle.strokeColor || '#ef4444', fillOpacity: 1 });
    }
  };

  const handleApplySticker = (stickerType: StickerType) => {
    onSelectTool('sticker');
    onUpdateDefaultStyle?.({ stickerType });
  };

  const showTooltip = (e: React.MouseEvent, tip: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverTipPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    setHoveredTip(tip);
  };

  const hideTooltip = () => {
    setHoveredTip(null);
    setHoverTipPos(null);
  };

  return (
    <>
      <aside
        ref={toolbarRef}
        id="pixelmark-toolbar"
        className={`absolute top-16 left-3 z-20 flex flex-col items-center backdrop-blur-md rounded-2xl p-1.5 shadow-2xl select-none max-h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar border transition-colors ${currentTheme.toolbar}`}
      >
        {groups.map((group, gIdx) => {
          const activeInGroup = group.items.find((item) => item.id === activeTool);
          const primaryItem = activeInGroup || group.items[0];
          const IconComponent = primaryItem.icon;
          const isGroupActive = Boolean(activeInGroup);
          const isFlyoutOpen = openFlyout === group.id;

          return (
            <div key={group.id} className="relative">
              {/* Primary Tool Button with expand chevron */}
              <button
                id={`tool-group-${group.id}`}
                onClick={() => handleToolClick(group)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all relative ${
                  isGroupActive
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30'
                    : theme === 'light'
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={`${primaryItem.name} (${primaryItem.shortcut})`}
              >
                <IconComponent className="w-5 h-5" />

                {/* If counter, show badge preview number */}
                {primaryItem.id === 'counter' && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-sm">
                    {nextStepNumber}
                  </span>
                )}

                {/* Sub-item / Flyout expand indicator */}
                {group.hasFlyout && (
                  <span
                    className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full transition-all ${
                      isFlyoutOpen
                        ? 'bg-white scale-125'
                        : isGroupActive
                        ? 'bg-white/70'
                        : 'bg-slate-500/70'
                    }`}
                  />
                )}
              </button>

              {/* Group separator */}
              {gIdx < groups.length - 1 && (
                <div
                  className={`w-6 h-px my-1 mx-auto transition-colors ${
                    theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          );
        })}
      </aside>

      {/* Interactive Floating Flyout Panel */}
      {openFlyout && (
        <div
          ref={flyoutRef}
          id="toolbar-expanded-flyout"
          className={`absolute left-[4.5rem] top-16 z-30 w-72 rounded-2xl p-3.5 shadow-2xl border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 transition-colors ${currentTheme.toolbarFlyout}`}
        >
          {/* DRAW FLYOUT (Matching the user's reference screenshot) */}
          {openFlyout === 'draw' && (
            <div className="space-y-3.5">
              {/* Draw Header & Tools */}
              <div>
                <div className="text-xs font-bold tracking-wide mb-2 flex items-center justify-between text-slate-300 dark:text-slate-200">
                  <span>Draw</span>
                  <button
                    onClick={() => setOpenFlyout(null)}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* 1. Solid Pen */}
                  <button
                    onClick={() => {
                      onSelectTool('pen');
                      handleApplyStrokeStyle('solid');
                      onUpdateDefaultStyle?.({
                        shadow: { enabled: false, color: 'rgba(0,0,0,0.5)', blur: 0, offsetX: 0, offsetY: 0 },
                      });
                    }}
                    onMouseEnter={(e) => showTooltip(e, 'Solid pen')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'pen' && defaultStyle.strokeStyle !== 'dashed' && !defaultStyle.shadow?.enabled
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <PenTool className="w-5 h-5" />
                  </button>

                  {/* 2. Vanishing / Dashed Pen */}
                  <button
                    onClick={() => {
                      onSelectTool('pen');
                      handleApplyStrokeStyle('dashed');
                      onUpdateDefaultStyle?.({
                        shadow: { enabled: false, color: 'rgba(0,0,0,0.5)', blur: 0, offsetX: 0, offsetY: 0 },
                      });
                    }}
                    onMouseEnter={(e) => showTooltip(e, 'Vanishing pen')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border relative ${
                      activeTool === 'pen' && defaultStyle.strokeStyle === 'dashed'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <PenTool className="w-5 h-5" />
                    {/* Dotted underline indicator */}
                    <span className="absolute bottom-1.5 w-4 border-b-2 border-dotted border-current" />
                  </button>

                  {/* 3. Marker / Highlighter */}
                  <button
                    onClick={() => {
                      onSelectTool('highlighter');
                      onUpdateDefaultStyle?.({ strokeWidth: Math.max(16, defaultStyle.strokeWidth || 16) });
                    }}
                    onMouseEnter={(e) => showTooltip(e, 'Highlighter marker')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'highlighter'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Highlighter className="w-5 h-5" />
                  </button>

                  {/* 4. Magic / Glow Laser Pen */}
                  <button
                    onClick={() => {
                      onSelectTool('pen');
                      handleApplyStrokeStyle('solid');
                      onUpdateDefaultStyle?.({
                        shadow: {
                          enabled: true,
                          color: defaultStyle.strokeColor || '#38bdf8',
                          blur: 12,
                          offsetX: 0,
                          offsetY: 0,
                        },
                      });
                    }}
                    onMouseEnter={(e) => showTooltip(e, 'Laser glow pen')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'pen' && defaultStyle.shadow?.enabled
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Line Width Header & Squiggles */}
              <div>
                <div className="text-xs font-bold tracking-wide mb-2 text-slate-300 dark:text-slate-200">
                  Line width
                </div>
                <div className="flex items-center gap-2">
                  {LINE_WIDTHS.map((lw) => {
                    const isCurrentWidth = defaultStyle.strokeWidth === lw.width;
                    return (
                      <button
                        key={lw.width}
                        onClick={() => handleApplyLineWidth(lw.width)}
                        onMouseEnter={(e) => showTooltip(e, lw.label)}
                        onMouseLeave={hideTooltip}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                          isCurrentWidth
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                            : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/50'
                        }`}
                      >
                        <SquiggleIcon strokeWidth={lw.iconWidth} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Shapes Palette (as shown in user's image) */}
              <div>
                <div className="text-xs font-bold tracking-wide mb-2 text-slate-300 dark:text-slate-200">
                  Shapes
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {/* Row 1: Line, Rect outline, Circle outline, Diamond outline */}
                  <button
                    onClick={() => onSelectTool('line')}
                    onMouseEnter={(e) => showTooltip(e, 'Line')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'line'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Minus className="w-5 h-5 rotate-45" />
                  </button>
                  <button
                    onClick={() => handleApplyShapeVariant('rect', 'outline')}
                    onMouseEnter={(e) => showTooltip(e, 'Rectangle (Outline)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'rect' && defaultStyle.fillOpacity === 0
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Square className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleApplyShapeVariant('ellipse', 'outline')}
                    onMouseEnter={(e) => showTooltip(e, 'Circle (Outline)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'ellipse' && defaultStyle.fillOpacity === 0
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Circle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleApplyShapeVariant('triangle', 'outline')}
                    onMouseEnter={(e) => showTooltip(e, 'Diamond (Outline)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'triangle' && defaultStyle.fillOpacity === 0
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Diamond className="w-5 h-5" />
                  </button>

                  {/* Row 2: Arrow, Tinted Rect, Tinted Circle, Tinted Diamond */}
                  <button
                    onClick={() => onSelectTool('arrow')}
                    onMouseEnter={(e) => showTooltip(e, 'Arrow')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'arrow'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <ArrowRight className="w-5 h-5 -rotate-45" />
                  </button>
                  <button
                    onClick={() => handleApplyShapeVariant('rect', 'tinted')}
                    onMouseEnter={(e) => showTooltip(e, 'Rectangle (Tinted)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'rect' && (defaultStyle.fillOpacity ?? 0) > 0 && (defaultStyle.fillOpacity ?? 0) < 0.8
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <div className="w-5 h-5 border-2 border-current bg-current/30 rounded-sm" />
                  </button>
                  <button
                    onClick={() => handleApplyShapeVariant('ellipse', 'tinted')}
                    onMouseEnter={(e) => showTooltip(e, 'Circle (Tinted)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'ellipse' && (defaultStyle.fillOpacity ?? 0) > 0 && (defaultStyle.fillOpacity ?? 0) < 0.8
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <div className="w-5 h-5 border-2 border-current bg-current/30 rounded-full" />
                  </button>
                  <button
                    onClick={() => handleApplyShapeVariant('triangle', 'tinted')}
                    onMouseEnter={(e) => showTooltip(e, 'Diamond (Tinted)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'triangle' && (defaultStyle.fillOpacity ?? 0) > 0 && (defaultStyle.fillOpacity ?? 0) < 0.8
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <div className="w-4 h-4 border-2 border-current bg-current/30 rotate-45" />
                  </button>

                  {/* Row 3: Double Arrow, Solid Rect, Solid Circle, Solid Diamond */}
                  <button
                    onClick={() => onSelectTool('double_arrow')}
                    onMouseEnter={(e) => showTooltip(e, 'Double arrow')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'double_arrow'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <MoveRight className="w-5 h-5 -rotate-45" />
                  </button>
                  <button
                    onClick={() => handleApplyShapeVariant('rect', 'solid')}
                    onMouseEnter={(e) => showTooltip(e, 'Rectangle (Solid)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'rect' && (defaultStyle.fillOpacity ?? 0) >= 0.8
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <div className="w-5 h-5 bg-current rounded-sm" />
                  </button>
                  <button
                    onClick={() => handleApplyShapeVariant('ellipse', 'solid')}
                    onMouseEnter={(e) => showTooltip(e, 'Circle (Solid)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'ellipse' && (defaultStyle.fillOpacity ?? 0) >= 0.8
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <div className="w-5 h-5 bg-current rounded-full" />
                  </button>
                  <button
                    onClick={() => handleApplyShapeVariant('triangle', 'solid')}
                    onMouseEnter={(e) => showTooltip(e, 'Diamond (Solid)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'triangle' && (defaultStyle.fillOpacity ?? 0) >= 0.8
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <div className="w-4 h-4 bg-current rotate-45" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SHAPES FLYOUT */}
          {openFlyout === 'shapes' && (
            <div className="space-y-3.5">
              <div className="text-xs font-bold tracking-wide mb-2 flex items-center justify-between text-slate-300 dark:text-slate-200">
                <span>Shapes Gallery</span>
                <button
                  onClick={() => setOpenFlyout(null)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-100 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Shapes Grid: Outlined, Tinted, Solid */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Geometry</div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleApplyShapeVariant('rect', 'outline')}
                    onMouseEnter={(e) => showTooltip(e, 'Box (Outline)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'rect' && defaultStyle.fillOpacity === 0
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Square className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleApplyShapeVariant('rounded_rect', 'outline')}
                    onMouseEnter={(e) => showTooltip(e, 'Rounded Rect')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'rounded_rect'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <RectangleHorizontal className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleApplyShapeVariant('ellipse', 'outline')}
                    onMouseEnter={(e) => showTooltip(e, 'Circle / Ellipse')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'ellipse' && defaultStyle.fillOpacity === 0
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Circle className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleApplyShapeVariant('triangle', 'outline')}
                    onMouseEnter={(e) => showTooltip(e, 'Triangle')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'triangle' && defaultStyle.fillOpacity === 0
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Triangle className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleApplyShapeVariant('star', 'outline')}
                    onMouseEnter={(e) => showTooltip(e, 'Star')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'star'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleApplyShapeVariant('polygon', 'outline')}
                    onMouseEnter={(e) => showTooltip(e, 'Hexagon')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'polygon'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <Hexagon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleApplyShapeVariant('rect', 'tinted')}
                    onMouseEnter={(e) => showTooltip(e, 'Tinted Box (25% fill)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'rect' && (defaultStyle.fillOpacity ?? 0) > 0 && (defaultStyle.fillOpacity ?? 0) < 0.8
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <div className="w-5 h-5 border-2 border-current bg-current/30 rounded-sm" />
                  </button>

                  <button
                    onClick={() => handleApplyShapeVariant('rect', 'solid')}
                    onMouseEnter={(e) => showTooltip(e, 'Solid Box (100% fill)')}
                    onMouseLeave={hideTooltip}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                      activeTool === 'rect' && (defaultStyle.fillOpacity ?? 0) >= 0.8
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                    }`}
                  >
                    <div className="w-5 h-5 bg-current rounded-sm" />
                  </button>
                </div>
              </div>

              {/* Line Width */}
              <div>
                <div className="text-xs font-bold tracking-wide mb-2 text-slate-300 dark:text-slate-200">
                  Line width
                </div>
                <div className="flex items-center gap-2">
                  {LINE_WIDTHS.map((lw) => (
                    <button
                      key={lw.width}
                      onClick={() => handleApplyLineWidth(lw.width)}
                      onMouseEnter={(e) => showTooltip(e, lw.label)}
                      onMouseLeave={hideTooltip}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                        defaultStyle.strokeWidth === lw.width
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/50'
                      }`}
                    >
                      <SquiggleIcon strokeWidth={lw.iconWidth} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ARROWS & LINES FLYOUT */}
          {openFlyout === 'arrows' && (
            <div className="space-y-3.5">
              <div className="text-xs font-bold tracking-wide mb-2 flex items-center justify-between text-slate-300 dark:text-slate-200">
                <span>Arrows & Connectors</span>
                <button
                  onClick={() => setOpenFlyout(null)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-100 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                <button
                  onClick={() => onSelectTool('arrow')}
                  onMouseEnter={(e) => showTooltip(e, 'Straight Arrow (A)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'arrow'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('double_arrow')}
                  onMouseEnter={(e) => showTooltip(e, 'Double Arrow (Shift+A)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'double_arrow'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <MoveRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('curved_arrow')}
                  onMouseEnter={(e) => showTooltip(e, 'Curved Bezier Arrow (C)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'curved_arrow'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <Spline className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('orthogonal_arrow')}
                  onMouseEnter={(e) => showTooltip(e, 'Elbow 90° Connector (O)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'orthogonal_arrow'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <GitCommit className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('line')}
                  onMouseEnter={(e) => showTooltip(e, 'Straight Line (L)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'line'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>

              {/* Line Width */}
              <div>
                <div className="text-xs font-bold tracking-wide mb-2 text-slate-300 dark:text-slate-200">
                  Line width
                </div>
                <div className="flex items-center gap-2">
                  {LINE_WIDTHS.map((lw) => (
                    <button
                      key={lw.width}
                      onClick={() => handleApplyLineWidth(lw.width)}
                      onMouseEnter={(e) => showTooltip(e, lw.label)}
                      onMouseLeave={hideTooltip}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition border ${
                        defaultStyle.strokeWidth === lw.width
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/50'
                      }`}
                    >
                      <SquiggleIcon strokeWidth={lw.iconWidth} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Style: Solid, Dashed, Dotted */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Stroke Pattern</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleApplyStrokeStyle('solid')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      defaultStyle.strokeStyle === 'solid' || !defaultStyle.strokeStyle
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    Solid
                  </button>
                  <button
                    onClick={() => handleApplyStrokeStyle('dashed')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      defaultStyle.strokeStyle === 'dashed'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    Dashed
                  </button>
                  <button
                    onClick={() => handleApplyStrokeStyle('dotted')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      defaultStyle.strokeStyle === 'dotted'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    Dotted
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TEXT & CALLOUTS FLYOUT */}
          {openFlyout === 'text_bubbles' && (
            <div className="space-y-3.5">
              <div className="text-xs font-bold tracking-wide mb-2 flex items-center justify-between text-slate-300 dark:text-slate-200">
                <span>Text & Callouts</span>
                <button
                  onClick={() => setOpenFlyout(null)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-100 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSelectTool('text')}
                  onMouseEnter={(e) => showTooltip(e, 'Rich Text Box (T)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'text'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <Type className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('speech_bubble')}
                  onMouseEnter={(e) => showTooltip(e, 'Speech Bubble (B)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'speech_bubble'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('thought_bubble')}
                  onMouseEnter={(e) => showTooltip(e, 'Thought Cloud Bubble (Shift+B)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'thought_bubble'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <Cloud className="w-5 h-5" />
                </button>
              </div>

              {/* Font Size Presets */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Preset Text Size</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[14, 20, 32, 48].map((fs) => (
                    <button
                      key={fs}
                      onClick={() => onUpdateDefaultStyle?.({ fontSize: fs })}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                        defaultStyle.fontSize === fs
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {fs}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REDACTION & FOCUS FLYOUT */}
          {openFlyout === 'redaction' && (
            <div className="space-y-3.5">
              <div className="text-xs font-bold tracking-wide mb-2 flex items-center justify-between text-slate-300 dark:text-slate-200">
                <span>Redact & Focus</span>
                <button
                  onClick={() => setOpenFlyout(null)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-100 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => onSelectTool('blur')}
                  onMouseEnter={(e) => showTooltip(e, 'Gaussian Blur (G)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'blur'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <EyeOff className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('pixelate')}
                  onMouseEnter={(e) => showTooltip(e, 'Mosaic Pixelate (M)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'pixelate'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('spotlight')}
                  onMouseEnter={(e) => showTooltip(e, 'Spotlight Cutout (S)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'spotlight'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <SunMedium className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('loupe')}
                  onMouseEnter={(e) => showTooltip(e, 'Loupe Magnifier (Z)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'loupe'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Redaction Intensity */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Blur / Pixel Strength</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onUpdateDefaultStyle?.({ blurRadius: 8, pixelSize: 8 })}
                    className="py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    Fine
                  </button>
                  <button
                    onClick={() => onUpdateDefaultStyle?.({ blurRadius: 16, pixelSize: 16 })}
                    className="py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white border border-blue-500 transition"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => onUpdateDefaultStyle?.({ blurRadius: 28, pixelSize: 28 })}
                    className="py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    Strong
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADDITIONAL TOOLS FLYOUT (Renamed from ShareX Tools) */}
          {openFlyout === 'workflow' && (
            <div className="space-y-3.5">
              <div className="text-xs font-bold tracking-wide mb-2 flex items-center justify-between text-slate-300 dark:text-slate-200">
                <span>Additional Tools</span>
                <button
                  onClick={() => setOpenFlyout(null)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-100 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onSelectTool('counter')}
                  onMouseEnter={(e) => showTooltip(e, `Step Badge (#${nextStepNumber})`)}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'counter'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <Hash className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('ruler')}
                  onMouseEnter={(e) => showTooltip(e, 'Dimension Ruler Caliper (U)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'ruler'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <Ruler className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectTool('sticker')}
                  onMouseEnter={(e) => showTooltip(e, 'Cursor & Status Stickers (K)')}
                  onMouseLeave={hideTooltip}
                  className={`h-11 rounded-xl flex items-center justify-center transition border ${
                    activeTool === 'sticker'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700/50'
                  }`}
                >
                  <Stamp className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Stickers */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Stamp Presets</div>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'cursor_arrow', label: 'Mouse Arrow' },
                    { id: 'cursor_pointer', label: 'Hand Pointer' },
                    { id: 'check', label: 'Checkmark' },
                    { id: 'warning', label: 'Warning' },
                    { id: 'heart', label: 'Heart' },
                    { id: 'star', label: 'Star' },
                    { id: 'cross', label: 'Cross' },
                    { id: 'info', label: 'Info' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => handleApplySticker(st.id as StickerType)}
                      onMouseEnter={(e) => showTooltip(e, st.label)}
                      onMouseLeave={hideTooltip}
                      className="py-1 px-1.5 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition truncate text-center"
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Tooltip matching Image 2 ("Vanishing pen" tooltip) */}
      {hoveredTip && hoverTipPos && (
        <div
          style={{ top: `${hoverTipPos.top}px`, left: `${hoverTipPos.left}px`, transform: 'translateY(-50%)' }}
          className="fixed z-50 px-2.5 py-1 rounded-md bg-slate-900/95 text-white text-xs font-semibold shadow-xl border border-slate-700 pointer-events-none whitespace-nowrap animate-in fade-in duration-100"
        >
          {hoveredTip}
        </div>
      )}
    </>
  );
};
