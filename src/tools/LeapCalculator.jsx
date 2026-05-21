import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart, Legend,
} from 'recharts';
import NumSlider from '../components/NumSlider.jsx';
import RefPillLabel from '../components/RefPillLabel.jsx';

// ===== Constants =====
const SHARES_PER_CONTRACT = 100;

// ===== Slider config =====
const SLIDER_CONFIG = {
  S:      { min: 1,    max: 1500, step: 0.01 },
  K:      { min: 1,    max: 1500, step: 0.5  },
  ask:    { min: 0.01, max: 500,  step: 0.01 },
  bid:    { min: 0.01, max: 500,  step: 0.01 },
};

// ===== Date helpers =====
const todayStr = () => new Date().toISOString().split('T')[0];
const plusDaysStr = (days) =>
  new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

const daysBetween = (a, b) => {
  const start = new Date(a + 'T00:00:00');
  const end   = new Date(b + 'T00:00:00');
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
};

// ===== URL state helpers =====
function readInitialFromURL() {
  const defaults = {
    underlying: 'SNAP',
    S: 22.67,
    K: 10,
    ask: 14.0,
    bid: 13.4,
    tradeDate: '2023-04-13',
    expirationDate: '2025-01-17',
    chartMode: 'pl',         // 'pl' | 'pct' | 'cagr'
    rangeMode: 'auto',       // 'auto' | 'custom'
    xStart: 0,
    xEnd: 60,
    xStep: 1,
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const p = new URLSearchParams(window.location.search);
    const num = (k, fallback) => {
      const v = parseFloat(p.get(k));
      return Number.isFinite(v) ? v : fallback;
    };
    const str = (k, fallback) => p.get(k) || fallback;
    return {
      underlying:     str('u',  defaults.underlying),
      S:              num('s',  defaults.S),
      K:              num('k',  defaults.K),
      ask:            num('a',  defaults.ask),
      bid:            num('b',  defaults.bid),
      tradeDate:      str('td', defaults.tradeDate),
      expirationDate: str('ed', defaults.expirationDate),
      chartMode:      str('cm', defaults.chartMode),
      rangeMode:      str('rm', defaults.rangeMode),
      xStart:         num('xs', defaults.xStart),
      xEnd:           num('xe', defaults.xEnd),
      xStep:          num('xstp', defaults.xStep),
    };
  } catch {
    return defaults;
  }
}

function writeToURL(state) {
  if (typeof window === 'undefined') return;
  try {
    const existing = new URLSearchParams(window.location.search);
    const tool = existing.get('tool');

    const p = new URLSearchParams();
    if (tool) p.set('tool', tool);
    p.set('u',  state.underlying);
    p.set('s',  String(state.S));
    p.set('k',  String(state.K));
    p.set('a',  String(state.ask));
    p.set('b',  String(state.bid));
    p.set('td', state.tradeDate);
    p.set('ed', state.expirationDate);
    p.set('cm', state.chartMode);
    p.set('rm', state.rangeMode);
    if (state.rangeMode === 'custom') {
      p.set('xs',   String(state.xStart));
      p.set('xe',   String(state.xEnd));
      p.set('xstp', String(state.xStep));
    }
    window.history.replaceState({}, '', `?${p.toString()}`);
  } catch {}
}

// ===== Help drawer sections =====
export const HELP_SECTIONS = [
  {
    id: 'overview',
    title: 'Was ist ein LEAP?',
    content: (
      <div className="space-y-3">
        <p><strong>LEAPs</strong> (Long-Term Equity Anticipation Securities) sind Optionen mit einer Restlaufzeit von typischerweise <strong>9 Monaten bis 3 Jahren</strong>. Sie werden gerne als <em>Stock-Replacement</em> eingesetzt: Statt 100 Aktien direkt zu kaufen, wird ein tief im Geld liegender (deep ITM) Call gekauft.</p>
        <p>Der Rechner vergleicht zwei Szenarien Seite an Seite:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Kauf einer LEAP-Call-Option (1 Kontrakt = {SHARES_PER_CONTRACT} Aktien)</li>
          <li>Direkter Kauf von {SHARES_PER_CONTRACT} Aktien des Underlyings</li>
        </ul>
        <p>Du siehst auf einen Blick, ab welchem Kurs am Verfallstag die Option sich gegenüber der Aktie lohnt – und welcher Hebel dabei wirkt.</p>
      </div>
    ),
  },
  {
    id: 'params',
    title: 'Die Eingaben',
    content: (
      <dl className="space-y-2.5">
        <div>
          <dt className="font-semibold text-slate-200">Underlying / Kurs</dt>
          <dd>Ticker und aktueller Kurs des Basiswerts.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Datum / Expiration</dt>
          <dd>Heutiges Datum und Verfallsdatum der Option. Daraus ergibt sich die Laufzeit in Tagen.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Strike-Preis</dt>
          <dd>Ausübungspreis. Für die Stock-Replacement-Strategie wählt man üblicherweise einen Strike deutlich unter dem aktuellen Kurs (deep ITM), sodass der innere Wert die Prämie dominiert.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Kauf / Verkauf (Ask / Bid)</dt>
          <dd>Die aktuellen Marktpreise. Der Optionspreis im Rechner ist das arithmetische Mittel ((Ask + Bid) / 2), also der Mid-Preis.</dd>
        </div>
      </dl>
    ),
  },
  {
    id: 'metrics',
    title: 'Die Kennzahlen verstehen',
    content: (
      <dl className="space-y-2.5">
        <div>
          <dt className="font-semibold text-slate-200">Innerer Wert</dt>
          <dd>max(0, Kurs − Strike). Der Anteil der Prämie, der bereits durch den Kursvorteil gedeckt ist.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Extrinsic Wert (Zeitwert)</dt>
          <dd>Optionspreis − Innerer Wert. Der Anteil, der bis zum Verfall durch Zeitablauf verschwindet. Bei deep-ITM-LEAPs ist dieser idealerweise klein gegenüber dem Inneren Wert.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Ratio I/E</dt>
          <dd>Innerer Wert / Extrinsic Wert. Je höher, desto „aktienähnlicher" verhält sich die Option und desto geringer das Zeitwert-Risiko. Werte &gt; 5x gelten als komfortabel.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Break-Even-Kurs</dt>
          <dd>Strike + Optionspreis. Der Kurs, ab dem die Option am Verfallstag in den Gewinn dreht.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Notwendige Steigerung / Rendite p.a.</dt>
          <dd>Wie weit muss der Underlying-Kurs steigen, damit der Break-Even erreicht wird – gesamt und annualisiert. Eine niedrige Zahl deutet auf einen günstigen LEAP hin.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Hebel (Kapital)</dt>
          <dd>Kapitaleinsatz Aktie / Kapitaleinsatz Call. Zeigt, wie viel mehr Underlying-Exposure pro investiertem Euro die Option liefert.</dd>
        </div>
      </dl>
    ),
  },
  {
    id: 'chart',
    title: 'Das Szenario-Diagramm lesen',
    content: (
      <div className="space-y-3">
        <p>Auf der X-Achse: der Kurs des Underlyings am Verfallstag. Auf der Y-Achse je nach Modus:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>P/L ($)</strong>: absoluter Gewinn/Verlust auf Basis von {SHARES_PER_CONTRACT} Aktien</li>
          <li><strong>Rendite ges.</strong>: prozentuale Gesamtrendite über die Laufzeit</li>
          <li><strong>Rendite p.a.</strong>: annualisierte Rendite, vergleichbar gemacht über (1+r)^(365/Laufzeit) − 1</li>
        </ul>
        <p>Die grüne Fläche zeigt die Call-Option, die gelbe Linie den direkten Aktienkauf. Reference-Pills markieren Spot, Strike und Break-Even.</p>
        <p>Praxistipp: Im Bereich nahe Break-Even ist die Option der Aktie unterlegen – erst danach greift der Hebel. Bei stark fallenden Kursen ist der Verlust der Option auf die gezahlte Prämie begrenzt, während die Aktie weiter ins Minus gehen kann.</p>
      </div>
    ),
  },
  {
    id: 'example',
    title: 'Beispiel: Snap LEAP 10er Call',
    content: (
      <div className="space-y-3">
        <p>Snap notiert bei 22.67 $. Ein Januar-2025-Call mit Strike 10 wird zu 13.70 $ gehandelt (Mid). Laufzeit: 645 Tage.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Innerer Wert: 12.67 $ → Extrinsic Wert: nur 1.03 $</li>
          <li>Ratio I/E: ~12.3x → sehr aktienähnlich, niedriges Zeitwert-Risiko</li>
          <li>Break-Even: 23.70 $ → Underlying muss nur ~4.5 % steigen (2.5 % p.a.)</li>
          <li>Kapitaleinsatz: 1 370 $ (Call) statt 2 267 $ (100 Aktien) → ~1.65x Hebel</li>
        </ul>
        <p>Bei einem Kursanstieg auf 30 $ erzielt die Option ~46 % Rendite, die Aktie nur ~32 %. Bei Kursverlusten unter den Strike ist der maximale Verlust der Option auf 1 370 $ begrenzt – die Aktie könnte bis auf 0 fallen.</p>
      </div>
    ),
  },
  {
    id: 'limits',
    title: 'Grenzen des Modells',
    content: (
      <div className="space-y-3">
        <p>Der Rechner geht von der Bewertung <strong>am Verfallstag</strong> aus, nicht währenddessen:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Kein Zeitwert wird unterwegs eingepreist – der intrinsische Wert bei Verfall ist max(0, Kurs − Strike)</li>
          <li>Bid-Ask-Spread, Slippage, Steuern und Kommissionen sind nicht berücksichtigt</li>
          <li>Dividenden des Underlyings fließen nicht in die Bewertung ein (anders als beim direkten Aktienkauf, der sie vereinnahmt)</li>
          <li>Frühe Ausübung (American Style) ist nicht modelliert</li>
        </ul>
        <p>Für eine intra-period-Bewertung mit Greeks und vollständigem Black-Scholes-Modell ist der <em>Options Calculator</em> das passendere Tool.</p>
      </div>
    ),
  },
];

// ===== UI Subcomponents =====

// Stat row, styled like a Greeks-table row but single column on the right
const StatRow = ({ label, value, hint, accent = 'neutral' }) => {
  const colors = {
    neutral:  'text-slate-200',
    emerald:  'text-emerald-300',
    amber:    'text-amber-300',
    cyan:     'text-cyan-300',
    violet:   'text-violet-300',
    rose:     'text-rose-300',
  };
  return (
    <tr className="border-t border-slate-800/60">
      <td className="py-2.5 px-3 font-medium text-slate-300">{label}</td>
      <td className={`font-mono text-right py-2.5 px-3 tabular-nums ${colors[accent]}`}>
        {value}
      </td>
      <td className="text-xs text-slate-500 px-3 hidden sm:table-cell">{hint}</td>
    </tr>
  );
};

// ===== Formatters =====
const fmt$ = (v, d = 2) =>
  v === null || v === undefined || Number.isNaN(v) || !Number.isFinite(v)
    ? '—'
    : `${v < 0 ? '−' : ''}$${Math.abs(v).toLocaleString('de-DE', {
        minimumFractionDigits: d, maximumFractionDigits: d,
      })}`;

const fmtPct = (v, d = 1) =>
  v === null || v === undefined || Number.isNaN(v) || !Number.isFinite(v)
    ? '—'
    : `${(v * 100).toFixed(d)} %`;

// =============================================================================
// Main component
// =============================================================================

export default function LeapCalculator() {
  const initial = useMemo(() => readInitialFromURL(), []);

  const [underlying, setUnderlying]         = useState(initial.underlying);
  const [S, setS]                           = useState(initial.S);
  const [K, setK]                           = useState(initial.K);
  const [ask, setAsk]                       = useState(initial.ask);
  const [bid, setBid]                       = useState(initial.bid);
  const [tradeDate, setTradeDate]           = useState(initial.tradeDate);
  const [expirationDate, setExpirationDate] = useState(initial.expirationDate);
  const [chartMode, setChartMode]           = useState(initial.chartMode);
  const [rangeMode, setRangeMode]           = useState(initial.rangeMode);
  const [xStart, setXStart]                 = useState(initial.xStart);
  const [xEnd, setXEnd]                     = useState(initial.xEnd);
  const [xStep, setXStep]                   = useState(initial.xStep);

  // === URL sync ===
  useEffect(() => {
    writeToURL({
      underlying, S, K, ask, bid, tradeDate, expirationDate,
      chartMode, rangeMode, xStart, xEnd, xStep,
    });
  }, [underlying, S, K, ask, bid, tradeDate, expirationDate,
      chartMode, rangeMode, xStart, xEnd, xStep]);

  // === Derived values ===
  const derived = useMemo(() => {
    const days        = daysBetween(tradeDate, expirationDate);
    const optionPrice = (bid + ask) / 2;
    const intrinsic   = Math.max(0, S - K);
    const extrinsic   = optionPrice - intrinsic;
    const ratio       = extrinsic > 0 ? intrinsic / extrinsic : null;
    const breakEven   = K + optionPrice;                    // = S + extrinsic
    const reqMove     = S > 0 ? (breakEven - S) / S : null;
    const reqCagr     = days > 0 && S > 0
      ? Math.pow(breakEven / S, 365 / days) - 1
      : null;
    const callInvest  = optionPrice * SHARES_PER_CONTRACT;
    const stockInvest = S * SHARES_PER_CONTRACT;
    const leverage    = callInvest > 0 ? stockInvest / callInvest : null;
    return {
      days, optionPrice, intrinsic, extrinsic, ratio, breakEven,
      reqMove, reqCagr, callInvest, stockInvest, leverage,
    };
  }, [S, K, ask, bid, tradeDate, expirationDate]);

  // === Scenario range ===
  const range = useMemo(() => {
    if (rangeMode === 'custom') {
      return {
        start: xStart,
        end: Math.max(xEnd, xStart + xStep),
        step: Math.max(xStep, 0.01),
      };
    }
    const top = Math.max(60, Math.ceil(S * 2.5));
    return { start: 0, end: top, step: Math.max(1, Math.round(top / 60)) };
  }, [rangeMode, xStart, xEnd, xStep, S]);

  // === Chart data ===
  const chartData = useMemo(() => {
    const { optionPrice, callInvest, stockInvest, days } = derived;
    const out = [];
    for (let p = range.start; p <= range.end + 1e-9; p += range.step) {
      const intrAtExp = Math.max(0, p - K) * SHARES_PER_CONTRACT;
      const callPL    = intrAtExp - callInvest;
      const callRet   = callInvest > 0 ? callPL / callInvest : 0;
      const callCagr  = days > 0 && (1 + callRet) > 0
        ? Math.pow(1 + callRet, 365 / days) - 1
        : (callRet === -1 ? -1 : null);
      const stockPL   = p * SHARES_PER_CONTRACT - stockInvest;
      const stockRet  = stockInvest > 0 ? stockPL / stockInvest : 0;
      const stockCagr = days > 0 && (1 + stockRet) > 0
        ? Math.pow(1 + stockRet, 365 / days) - 1
        : (stockRet === -1 ? -1 : null);
      out.push({
        s: parseFloat(p.toFixed(4)),
        callPL, callRet, callCagr,
        stockPL, stockRet, stockCagr,
      });
    }
    return out;
  }, [derived, range, K]);

  const yKey = {
    pl:   ['callPL',   'stockPL'],
    pct:  ['callRet',  'stockRet'],
    cagr: ['callCagr', 'stockCagr'],
  }[chartMode];
  const yLabel = { pl: 'P/L ($)', pct: 'Rendite gesamt', cagr: 'Rendite p.a.' }[chartMode];
  const yFmt   = chartMode === 'pl' ? (v) => fmt$(v, 0) : (v) => fmtPct(v, 1);

  // ============================================================
  return (
    <>
      {/* ============ INPUTS + METRICS ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

        {/* INPUTS */}
        <section className="lg:col-span-2 bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold">Eingaben</h2>
            <input
              type="text"
              value={underlying}
              onChange={(e) => setUnderlying(e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="TICKER"
              className="bg-slate-950 text-cyan-300 font-mono text-right w-24 px-2 py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none text-sm uppercase"
              aria-label="Underlying Ticker"
            />
          </div>

          <NumSlider label="Underlying" value={S}   onChange={setS}   step={SLIDER_CONFIG.S.step}   suffix="$" min={SLIDER_CONFIG.S.min}   max={SLIDER_CONFIG.S.max}   logarithmic />
          <NumSlider label="Strike"     value={K}   onChange={setK}   step={SLIDER_CONFIG.K.step}   suffix="$" min={SLIDER_CONFIG.K.min}   max={SLIDER_CONFIG.K.max}   logarithmic />
          <NumSlider label="Kauf (Ask)" value={ask} onChange={setAsk} step={SLIDER_CONFIG.ask.step} suffix="$" min={SLIDER_CONFIG.ask.min} max={SLIDER_CONFIG.ask.max} logarithmic />
          <NumSlider label="Verkauf (Bid)" value={bid} onChange={setBid} step={SLIDER_CONFIG.bid.step} suffix="$" min={SLIDER_CONFIG.bid.min} max={SLIDER_CONFIG.bid.max} logarithmic />

          {/* Dates section */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm font-medium tracking-wide uppercase">Laufzeit</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-600 font-mono">
                {derived.days} Tage · {(derived.days / 365).toFixed(2)} J
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider">Datum</span>
                <input
                  type="date"
                  value={tradeDate}
                  max={expirationDate}
                  onChange={(e) => setTradeDate(e.target.value)}
                  className="bg-slate-950 text-cyan-300 font-mono text-sm px-2 py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider">Expiration</span>
                <input
                  type="date"
                  value={expirationDate}
                  min={tradeDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="bg-slate-950 text-cyan-300 font-mono text-sm px-2 py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className="lg:col-span-3 bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5">
          <div className="flex items-start sm:items-center justify-between flex-wrap gap-2 mb-3">
            <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span>Kennzahlen</span>
              <span className="normal-case tracking-normal text-slate-500 font-normal text-xs">
                {underlying || 'Underlying'} · Mid = {fmt$(derived.optionPrice)}
              </span>
            </h2>
            <div className="flex gap-4 text-[10px] uppercase tracking-wider shrink-0">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" />Call</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" />Aktie</div>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                <th className="text-left py-1.5 px-3 font-medium">Metrik</th>
                <th className="text-right py-1.5 px-3 font-medium">Wert</th>
                <th className="text-left py-1.5 px-3 font-medium text-slate-600 font-normal normal-case tracking-normal italic hidden sm:table-cell">Beschreibung</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-t border-slate-800/60 bg-slate-950/40">
                <td className="py-2.5 px-3 font-bold text-slate-200">Optionspreis (Mid)</td>
                <td className="font-mono text-right py-2.5 px-3 tabular-nums text-emerald-300">{fmt$(derived.optionPrice)}</td>
                <td className="text-xs text-slate-500 px-3 hidden sm:table-cell">(Bid + Ask) / 2 — Spread: {fmt$(ask - bid)}</td>
              </tr>
              <StatRow label="Innerer Wert"    value={fmt$(derived.intrinsic)} hint="max(0, Kurs − Strike) — der bereits durch Kursvorteil gedeckte Teil" accent="neutral" />
              <StatRow label="Extrinsic Wert"  value={fmt$(derived.extrinsic)} hint="Zeitwert — verfällt bis zur Expiration" accent="neutral" />
              <StatRow label="Ratio I/E"
                value={derived.ratio !== null ? `${derived.ratio.toFixed(2)}×` : '—'}
                hint="Innerer / Extrinsic — höher = aktienähnlicher"
                accent={derived.ratio !== null && derived.ratio >= 5 ? 'emerald' : 'amber'} />
              <StatRow label="Break-Even-Kurs"
                value={fmt$(derived.breakEven)}
                hint="Strike + Optionspreis — Kurs, ab dem die Option am Verfall im Gewinn ist"
                accent="violet" />
              <StatRow label="Notwendige Steigerung"
                value={fmtPct(derived.reqMove)}
                hint="vom aktuellen Kurs bis Break-Even"
                accent="cyan" />
              <StatRow label="Notwendige Rendite p.a."
                value={fmtPct(derived.reqCagr)}
                hint="annualisiert über die Laufzeit"
                accent="cyan" />
              <tr className="border-t border-slate-800/60 bg-slate-950/40">
                <td className="py-2.5 px-3 font-bold text-slate-200">Kapital Call</td>
                <td className="font-mono text-right py-2.5 px-3 tabular-nums text-emerald-300">{fmt$(derived.callInvest, 0)}</td>
                <td className="text-xs text-slate-500 px-3 hidden sm:table-cell">1 Kontrakt × {SHARES_PER_CONTRACT}</td>
              </tr>
              <StatRow label="Kapital Aktie"
                value={fmt$(derived.stockInvest, 0)}
                hint={`${SHARES_PER_CONTRACT} Aktien zum aktuellen Kurs`}
                accent="amber" />
              <StatRow label="Hebel"
                value={derived.leverage !== null ? `${derived.leverage.toFixed(2)}×` : '—'}
                hint="Kapital Aktie / Kapital Call — Underlying-Exposure pro Dollar"
                accent="emerald" />
            </tbody>
          </table>
        </section>
      </div>

      {/* ============ CHART CONTROLS ============ */}
      <section className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5 mb-5">
        <div className="flex items-start sm:items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span>Verfalls-Szenario</span>
            <span className="normal-case tracking-normal text-slate-500 font-normal text-xs">
              Call vs. Aktie am Verfallstag
            </span>
          </h2>
          <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5 shrink-0">
            {[
              ['pl',   'P/L ($)'],
              ['pct',  'Rendite ges.'],
              ['cagr', 'Rendite p.a.'],
            ].map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setChartMode(k)}
                className={`px-2.5 sm:px-3 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                  chartMode === k ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >{l}</button>
            ))}
          </div>
        </div>

        {/* Range controls */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setRangeMode('auto')}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                rangeMode === 'auto' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >Auto-X</button>
            <button
              type="button"
              onClick={() => setRangeMode('custom')}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                rangeMode === 'custom' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >Eigene Range</button>
          </div>
          {rangeMode === 'custom' && (
            <div className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
                <label className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Start</label>
                <input type="number" value={xStart} step="0.5" onChange={(e) => setXStart(parseFloat(e.target.value) || 0)} className="bg-slate-950 text-cyan-300 font-mono w-full sm:w-24 px-2 py-1.5 sm:py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none text-sm" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
                <label className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Ende</label>
                <input type="number" value={xEnd} step="0.5" onChange={(e) => setXEnd(parseFloat(e.target.value) || 0)} className="bg-slate-950 text-cyan-300 font-mono w-full sm:w-24 px-2 py-1.5 sm:py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none text-sm" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
                <label className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Schritt</label>
                <input type="number" value={xStep} step="0.5" min="0.01" onChange={(e) => setXStep(parseFloat(e.target.value) || 1)} className="bg-slate-950 text-cyan-300 font-mono w-full sm:w-24 px-2 py-1.5 sm:py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none text-sm" />
              </div>
            </div>
          )}
          <div className="ml-auto text-[10px] uppercase tracking-wider text-slate-600 font-mono hidden sm:block">
            {chartData.length} Pts · {range.start.toFixed(2)} → {range.end.toFixed(2)}
          </div>
        </div>
      </section>

      {/* ============ SCENARIO CHART ============ */}
      <section className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5 mb-5">
        {/* Legend strip */}
        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-2 mb-3 text-[10px] sm:text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-2" style={{ background: 'rgba(52,211,153,0.4)', borderTop: '2px solid #34d399' }} />
            Call-Option
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2" style={{ borderColor: '#fbbf24' }} />
            Aktie direkt
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-cyan-400" />
            Spot (S = {S.toFixed(2)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-slate-200" />
            Strike (K = {K.toFixed(2)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-violet-400" />
            Break-even ({derived.breakEven.toFixed(2)})
          </span>
        </div>

        <ResponsiveContainer width="100%" height={340} minHeight={300}>
          <ComposedChart data={chartData} margin={{ top: 30, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="leapCallGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="s"
              stroke="#475569"
              fontSize={11}
              tickFormatter={(v) => v.toFixed(0)}
              label={{ value: 'Kurs am Verfallstag ($)', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              stroke="#475569"
              fontSize={11}
              tickFormatter={(v) => chartMode === 'pl' ? `${(v / 1000).toFixed(1)}k` : `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, fontSize: 12 }}
              labelFormatter={(v) => `Kurs: ${v.toFixed(2)} $`}
              formatter={(v, name) => [yFmt(v), name]}
            />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
            <ReferenceLine
              x={K}
              stroke="#e2e8f0"
              strokeWidth={1.5}
              opacity={0.8}
              label={<RefPillLabel text={`K ${K.toFixed(0)}`} color="#e2e8f0" yOffset={8} />}
            />
            <ReferenceLine
              x={S}
              stroke="#22d3ee"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              opacity={0.95}
              label={<RefPillLabel text={`Spot ${S.toFixed(0)}`} color="#22d3ee" yOffset={8} />}
            />
            <ReferenceLine
              x={derived.breakEven}
              stroke="#c084fc"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              opacity={0.95}
              label={<RefPillLabel text={`BE ${derived.breakEven.toFixed(0)}`} color="#c084fc" yOffset={24} />}
            />
            <Area
              type="monotone"
              dataKey={yKey[0]}
              stroke="#34d399"
              strokeWidth={2.4}
              fill="url(#leapCallGrad)"
              name={`Call · ${yLabel}`}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey={yKey[1]}
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              name={`Aktie · ${yLabel}`}
              isAnimationActive={false}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
          Annahmen: 1 Kontrakt = {SHARES_PER_CONTRACT} Aktien. Optionspreis = (Ask + Bid) / 2.
          Alle Werte beziehen sich auf den Verfallstag — kein Zeitwert vor Verfall berücksichtigt.
          Annualisierung über (1 + r)<sup>365/{derived.days || '?'}</sup> − 1.
          Dividenden, Spread und Kommissionen sind nicht enthalten.
        </div>
      </section>
    </>
  );
}
