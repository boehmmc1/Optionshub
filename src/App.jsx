import { useState, useEffect } from 'react';
import OptionsCalculator, { HELP_SECTIONS as CALC_HELP } from './tools/OptionsCalculator.jsx';
import StrategyBuilder, { HELP_SECTIONS as STRAT_HELP } from './tools/StrategyBuilder.jsx';
import HelpDrawer from './components/HelpDrawer.jsx';
import TabBar from './components/TabBar.jsx';

// Each tool registers itself here. Add new tools by appending to this array.
const TOOLS = [
  {
    id: 'calculator',
    label: 'Calculator',
    title: 'Options Calculator',
    subtitle: 'Was ist die Option wert? Wie reagiert sie?',
    helpTitle: 'Anleitung',
    helpSubtitle: 'So nutzt du den Options Calculator',
    helpSections: CALC_HELP,
    Component: OptionsCalculator,
  },
  {
    id: 'strategy',
    label: 'Strategy Builder',
    title: 'Strategy Builder',
    subtitle: 'Multi-Leg-Optionsstrategien analysieren',
    helpTitle: 'Anleitung',
    helpSubtitle: 'Strategy Builder Übersicht',
    helpSections: STRAT_HELP,
    Component: StrategyBuilder,
  },
];

function readToolFromURL() {
  if (typeof window === 'undefined') return 'calculator';
  const p = new URLSearchParams(window.location.search);
  const tool = p.get('tool');
  return TOOLS.find(t => t.id === tool) ? tool : 'calculator';
}

export default function App() {
  const [activeId, setActiveId] = useState(readToolFromURL);
  const [helpOpen, setHelpOpen] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const [copied, setCopied] = useState(false);

  // First-visit pulse: shows the cyan pulse + tooltip on the Help button
  // until the user clicks it or 8 seconds pass.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('optionshub-help-seen')) {
      setFirstVisit(true);
      const t = setTimeout(() => setFirstVisit(false), 8000);
      return () => clearTimeout(t);
    }
  }, []);

  // Browser back/forward should reflect the tool change
  useEffect(() => {
    const onPop = () => setActiveId(readToolFromURL());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const switchTool = (toolId) => {
    if (toolId === activeId) return;
    setActiveId(toolId);

    // When switching tools, reset the URL to just the tool param so
    // the previous tool's state doesn't pollute the new context.
    const p = new URLSearchParams();
    p.set('tool', toolId);
    window.history.replaceState({}, '', `?${p.toString()}`);
  };

  const openHelp = () => {
    setHelpOpen(true);
    setFirstVisit(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('optionshub-help-seen', '1');
    }
  };

  const copyLink = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const active = TOOLS.find(t => t.id === activeId) || TOOLS[0];
  const ToolComponent = active.Component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { font-family: 'Manrope', system-ui, sans-serif; }
        .font-mono, input[type="number"], select, .tabular-nums { font-family: 'JetBrains Mono', monospace !important; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }

        @keyframes ohpulse {
          0%   { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.55); }
          70%  { box-shadow: 0 0 0 10px rgba(6, 182, 212, 0); }
          100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
        }
        .ohpulse { animation: ohpulse 1.8s ease-out infinite; }

        @keyframes ohfade {
          0%   { opacity: 0; transform: translateY(-4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .ohfade { animation: ohfade 0.3s ease-out; }

        /* Shared range slider styling – used by NumSlider in all tools */
        .ots-range { -webkit-appearance: none; appearance: none; background: transparent; height: 16px; cursor: pointer; }
        .ots-range::-webkit-slider-runnable-track {
          height: 3px;
          background: linear-gradient(to right, #0e7490, #06b6d4);
          border-radius: 2px;
        }
        .ots-range::-moz-range-track {
          height: 3px;
          background: linear-gradient(to right, #0e7490, #06b6d4);
          border-radius: 2px;
        }
        .ots-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          height: 14px; width: 14px;
          background: #06b6d4;
          border: 2px solid #0c4a6e;
          border-radius: 50%;
          margin-top: -5.5px;
          cursor: pointer;
          box-shadow: 0 0 0 1px rgba(6,182,212,0.4), 0 0 8px rgba(6,182,212,0.3);
          transition: transform 0.1s, box-shadow 0.15s;
        }
        .ots-range::-moz-range-thumb {
          height: 14px; width: 14px;
          background: #06b6d4;
          border: 2px solid #0c4a6e;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(6,182,212,0.3);
        }
        .ots-range:hover::-webkit-slider-thumb { transform: scale(1.15); box-shadow: 0 0 0 1px rgba(6,182,212,0.6), 0 0 12px rgba(6,182,212,0.5); }
        .ots-range:active::-webkit-slider-thumb { transform: scale(1.25); }
      `}</style>

      {/* ============ STICKY HEADER (Logo + Buttons + Tabs) ============ */}
      <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-3 sm:pt-4 pb-1 sm:pb-2 flex items-center justify-between gap-3">
          {/* Brand + Tool Subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-lg sm:text-xl font-black text-slate-950 shadow-lg shadow-cyan-500/20 shrink-0">
              σ
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold tracking-tight leading-tight">Optionshub</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-tight truncate">{active.subtitle}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0">
            <button
              onClick={copyLink}
              className="text-xs uppercase tracking-wider px-2.5 sm:px-3 py-2 rounded-md border border-slate-800 hover:border-cyan-700 hover:text-cyan-300 text-slate-400 transition-colors flex items-center gap-2 min-h-[36px]"
              aria-label="Link teilen"
            >
              {copied ? (
                <>
                  <span className="text-emerald-400">✓</span>
                  <span className="hidden sm:inline">Kopiert</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span className="hidden sm:inline">Link teilen</span>
                </>
              )}
            </button>

            <button
              onClick={openHelp}
              className={`text-xs uppercase tracking-wider px-2.5 sm:px-3 py-2 rounded-md border transition-colors flex items-center gap-2 min-h-[36px] ${
                firstVisit
                  ? 'ohpulse border-cyan-600 text-cyan-300'
                  : 'border-slate-800 hover:border-cyan-700 hover:text-cyan-300 text-slate-400'
              }`}
              aria-label="Anleitung öffnen"
            >
              <span className="font-bold">?</span>
              <span className="hidden sm:inline">Anleitung</span>
            </button>

            {firstVisit && (
              <div className="ohfade absolute top-full right-0 mt-2 px-3 py-2 bg-slate-900 border border-cyan-700/60 rounded-md text-xs text-cyan-300 whitespace-nowrap shadow-xl shadow-cyan-900/30 pointer-events-none z-20">
                Erste Schritte? → Hier klicken
                <div className="absolute -top-1 right-6 w-2 h-2 bg-slate-900 border-t border-l border-cyan-700/60 rotate-45" />
              </div>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <TabBar tabs={TOOLS} active={activeId} onChange={switchTool} />
        </div>
      </header>

      {/* ============ TOOL CONTENT ============ */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 sm:py-5">
        <ToolComponent />
      </main>

      {/* ============ CONTEXTUAL HELP DRAWER ============ */}
      <HelpDrawer
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        sections={active.helpSections}
        title={active.helpTitle}
        subtitle={active.helpSubtitle}
      />
    </div>
  );
}
