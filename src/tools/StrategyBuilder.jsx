export const HELP_SECTIONS = [
  {
    id: 'overview',
    title: 'Was wird der Strategy Builder können?',
    content: (
      <div className="space-y-3">
        <p>Der Strategy Builder ist gerade in Entwicklung. Hier wirst du bald Multi-Leg-Optionsstrategien aufbauen und analysieren können:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Vorgefertigte Strategien wählen (Iron Condor, Bull Call Spread, Butterfly, etc.)</li>
          <li>Bis zu 4 Legs einzeln konfigurieren: Position (Long/Short), Type (Call/Put/Underlying), Strike, Prämie</li>
          <li>Max Profit, Max Loss, Break-Evens und Reward/Risk automatisch berechnet</li>
          <li>Auszahlungs-Diagramm der gesamten Strategie auf einen Blick</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'difference',
    title: 'Unterschied zum Calculator',
    content: (
      <div className="space-y-3">
        <p>Beide Tools ergänzen sich:</p>
        <p><strong className="text-slate-200">Calculator</strong> beantwortet: <em>Was ist EINE einzelne Option wert? Wie reagiert sie auf Marktbewegungen?</em></p>
        <p><strong className="text-slate-200">Strategy Builder</strong> beantwortet: <em>Wie sieht das Gesamtrisiko aus, wenn ich MEHRERE Optionen kombiniere?</em></p>
        <p>Du nutzt den Calculator typischerweise vor dem Trade zur Bewertung. Den Strategy Builder, wenn du Spreads oder Multi-Leg-Konstruktionen planst.</p>
      </div>
    ),
  },
  {
    id: 'when',
    title: 'Wann ist er fertig?',
    content: (
      <p>
        In den kommenden Tagen. Sobald die Grundfunktionen stehen, ist er hier verfügbar.
        Bis dahin: nutze den <strong className="text-slate-200">Calculator</strong>-Tab für die Einzeloption-Bewertung.
      </p>
    ),
  },
];

export default function StrategyBuilder() {
  return (
    <div className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-6 sm:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-700/20 border border-cyan-700/40 items-center justify-center text-2xl sm:text-3xl mb-4">
            🛠️
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Strategy Builder</h2>
          <p className="text-sm sm:text-base text-slate-400">Multi-Leg-Optionsstrategien aufbauen und bewerten</p>
          <span className="inline-block mt-3 text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-700/30 font-semibold">
            Coming Soon
          </span>
        </div>

        <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold mb-3">Geplante Features</h3>
        <div className="space-y-2.5 text-sm text-slate-400">
          <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4">
            <strong className="text-slate-200 block mb-1">📋 Strategie-Presets</strong>
            <span>30+ vorgefertigte Strategien: Bull/Bear Call/Put Spread, Iron Condor, Long/Short Butterfly, Ratio Spreads, Ladders, Collars, Protective Puts und mehr.</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4">
            <strong className="text-slate-200 block mb-1">⚙️ Bis zu 4 Legs konfigurieren</strong>
            <span>Jede Position einzeln einstellbar: Long/Short, Call/Put/Underlying, Strike und vereinnahmte oder gezahlte Prämie.</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4">
            <strong className="text-slate-200 block mb-1">📊 Kennzahlen auf einen Blick</strong>
            <span>Max Profit, Max Loss, Break-Evens und Reward-to-Risk automatisch berechnet. Sofort sichtbar, wie risikoreich oder konservativ eine Strategie ist.</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 rounded-lg p-4">
            <strong className="text-slate-200 block mb-1">📈 Auszahlungs-Diagramm</strong>
            <span>Hockeystick-Chart der gesamten Strategie mit Markern für Spot, Strikes und Break-Even-Punkten.</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-8 text-center">
          Bis dahin: probier den <strong className="text-cyan-400">Options Calculator</strong> aus.
        </p>
      </div>
    </div>
  );
}
