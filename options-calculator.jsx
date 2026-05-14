import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

// ===== Black-Scholes Engine =====

// Abramowitz & Stegun approximation of the normal CDF (max error ~7.5e-8)
function normCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1.0 + sign * y);
}

function normPDF(x) {
  return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
}

function blackScholes(S, K, sigma, r, q, tYears) {
  if (tYears <= 0 || S <= 0 || K <= 0 || sigma <= 0) {
    const callPrice = Math.max(S - K, 0);
    const putPrice = Math.max(K - S, 0);
    return {
      callPrice, putPrice,
      callDelta: callPrice > 0 ? 1 : 0,
      putDelta: putPrice > 0 ? -1 : 0,
      gamma: 0,
      callTheta: 0, putTheta: 0,
      vega: 0,
      callRho: 0, putRho: 0,
    };
  }

  const sqrtT = Math.sqrt(tYears);
  const d1 = (Math.log(S / K) + (r - q + sigma * sigma / 2) * tYears) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const Nd1 = normCDF(d1);
  const Nd2 = normCDF(d2);
  const NmD1 = normCDF(-d1);
  const NmD2 = normCDF(-d2);
  const nPrimeD1 = normPDF(d1);

  const eRt = Math.exp(-r * tYears);
  const eQt = Math.exp(-q * tYears);

  const callPrice = S * eQt * Nd1 - K * eRt * Nd2;
  const putPrice  = K * eRt * NmD2 - S * eQt * NmD1;

  const callDelta = eQt * Nd1;
  const putDelta  = -eQt * NmD1;

  const gamma = (eQt * nPrimeD1) / (S * sigma * sqrtT);

  const commonTheta = -(S * eQt * nPrimeD1 * sigma) / (2 * sqrtT);
  const callThetaY = commonTheta - r * K * eRt * Nd2  + q * S * eQt * Nd1;
  const putThetaY  = commonTheta + r * K * eRt * NmD2 - q * S * eQt * NmD1;

  const callTheta = callThetaY / 365;
  const putTheta  = putThetaY  / 365;

  const vega = (S * eQt * nPrimeD1 * sqrtT) / 100;

  const callRho = (K * tYears * eRt * Nd2)  / 100;
  const putRho  = -(K * tYears * eRt * NmD2) / 100;

  return { callPrice, putPrice, callDelta, putDelta, gamma, callTheta, putTheta, vega, callRho, putRho };
}

// ===== Time Units =====
const TIME_UNITS = {
  days:    { label: 'Kalendertage',  perYear: 365 },
  trading: { label: 'Handelstage',   perYear: 252 },
  weeks:   { label: 'Wochen',        perYear: 52.142857142857146 },
  months:  { label: 'Monate',        perYear: 12 },
  hours:   { label: 'Stunden',       perYear: 8760 },
};

// ===== Variables (X-axis options for charts) =====
const VARIABLES = {
  S:     { label: 'Underlying-Preis',    unit: '$',    defaultRange: (S) => ({ start: Math.max(1, S*0.5),   end: S*1.5,   step: S*0.02 }) },
  K:     { label: 'Strike-Preis',        unit: '$',    defaultRange: (S) => ({ start: Math.max(1, S*0.5),   end: S*1.5,   step: S*0.02 }) },
  sigma: { label: 'Volatilität',         unit: '%',    defaultRange: ()  => ({ start: 5,                    end: 200,     step: 5 }) },
  r:     { label: 'Zinssatz',            unit: '%',    defaultRange: ()  => ({ start: 0,                    end: 15,      step: 0.5 }) },
  q:     { label: 'Dividendenrendite',   unit: '%',    defaultRange: ()  => ({ start: 0,                    end: 15,      step: 0.5 }) },
  t:     { label: 'Restlaufzeit',        unit: 'Tage', defaultRange: ()  => ({ start: 1,                    end: 365,     step: 5 }) },
};

const GREEKS = {
  price: { label: 'Preis',  callKey: 'callPrice', putKey: 'putPrice' },
  delta: { label: 'Delta',  callKey: 'callDelta', putKey: 'putDelta' },
  gamma: { label: 'Gamma',  callKey: 'gamma',     putKey: 'gamma' },
  theta: { label: 'Theta',  callKey: 'callTheta', putKey: 'putTheta' },
  vega:  { label: 'Vega',   callKey: 'vega',      putKey: 'vega' },
  rho:   { label: 'Rho',    callKey: 'callRho',   putKey: 'putRho' },
};

// ===== Slider config per variable =====
const SLIDER_CONFIG = {
  S:        { min: 1,   max: 1500, step: 1 },
  K:        { min: 1,   max: 1500, step: 1 },
  sigmaPct: { min: 1,   max: 200, step: 1 },
  rPct:     { min: -5,  max: 20,  step: 0.25 },
  qPct:     { min: 0,   max: 15,  step: 0.25 },
};

// ===== URL state helpers =====
function readInitialFromURL() {
  const defaults = {
    S: 100, K: 90, sigmaPct: 61, rPct: 4.5, qPct: 0,
    timeValue: 11, timeUnit: 'days', timeMode: 'duration',
    pricingDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
    effectOf: 'K', yUpper: 'gamma', yLower: 'delta',
    optType: 'put', direction: 'short',
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
      S: num('s', defaults.S),
      K: num('k', defaults.K),
      sigmaPct: num('sigma', defaults.sigmaPct),
      rPct: num('r', defaults.rPct),
      qPct: num('q', defaults.qPct),
      timeValue: num('t', defaults.timeValue),
      timeUnit: str('unit', defaults.timeUnit),
      timeMode: str('mode', defaults.timeMode),
      pricingDate: str('pd', defaults.pricingDate),
      expirationDate: str('ed', defaults.expirationDate),
      effectOf: str('eff', defaults.effectOf),
      yUpper: str('y1', defaults.yUpper),
      yLower: str('y2', defaults.yLower),
      optType: str('opt', defaults.optType),
      direction: str('dir', defaults.direction),
    };
  } catch {
    return defaults;
  }
}

function writeToURL(state) {
  if (typeof window === 'undefined') return;
  try {
    const p = new URLSearchParams();
    p.set('s', String(state.S));
    p.set('k', String(state.K));
    p.set('sigma', String(state.sigmaPct));
    p.set('r', String(state.rPct));
    p.set('q', String(state.qPct));
    p.set('t', String(state.timeValue));
    p.set('unit', state.timeUnit);
    p.set('mode', state.timeMode);
    if (state.timeMode === 'date') {
      p.set('pd', state.pricingDate);
      p.set('ed', state.expirationDate);
    }
    p.set('eff', state.effectOf);
    p.set('y1', state.yUpper);
    p.set('y2', state.yLower);
    p.set('opt', state.optType);
    p.set('dir', state.direction);
    window.history.replaceState({}, '', `?${p.toString()}`);
  } catch {}
}

// ===== Help drawer sections =====
const HELP_SECTIONS = [
  {
    id: 'overview',
    title: 'Was zeigt der Calculator?',
    content: (
      <div className="space-y-3">
        <p>Der Rechner zeigt dir auf einen Blick:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Den theoretisch fairen Preis einer Option nach dem Black-Scholes-Modell</li>
          <li>Alle Greeks (Delta, Gamma, Theta, Vega, Rho) sowie den inneren Wert für Call und Put</li>
          <li>Wie sich Preis und Greeks ändern, wenn du einen Parameter variierst</li>
          <li>Das Auszahlungsprofil bei Verfall – wahlweise aus Long- oder Short-Perspektive</li>
        </ul>
        <p>Gedacht für Stillhalter und Optionshändler, die nicht nur einzelne Werte ausrechnen, sondern auch verstehen wollen, wie sensitiv ihre Position auf Marktbewegungen reagiert.</p>
      </div>
    ),
  },
  {
    id: 'params',
    title: 'Die Eingabeparameter',
    content: (
      <dl className="space-y-2.5">
        <div>
          <dt className="font-semibold text-slate-200">Underlying-Preis (S)</dt>
          <dd>Aktueller Kurs des Basiswerts (Aktie, ETF, Index).</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Strike-Preis (K)</dt>
          <dd>Ausübungspreis der Option.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Volatilität (σ)</dt>
          <dd>Erwartete annualisierte Schwankungsbreite des Underlyings. Liquide Aktien: typisch 20-50 %. Biotech, Krypto, Small-Caps: deutlich darüber.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Zinssatz (r)</dt>
          <dd>Risikoloser Zinssatz – meist Tagesgeld- oder Kurzläufer-Zins der Bezugswährung.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Dividendenrendite (q)</dt>
          <dd>Jährliche Dividendenrendite des Underlyings. Bei dividendenlosen Werten (viele Tech-Werte, Krypto) 0 %.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Restlaufzeit (t)</dt>
          <dd>Zeit bis zum Verfall. Eingabe wahlweise als Zeitraum (Tage, Wochen, Monate) oder als konkretes Verfallsdatum.</dd>
        </div>
      </dl>
    ),
  },
  {
    id: 'greeks',
    title: 'Greeks verstehen',
    content: (
      <dl className="space-y-2.5">
        <div>
          <dt className="font-semibold text-slate-200">Delta</dt>
          <dd>Preisänderung der Option bei +1&nbsp;$ im Underlying. Ein Stillhalter mit Short Put liest hier die Wahrscheinlichkeit, ins Geld zu rutschen.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Gamma</dt>
          <dd>Wie stark Delta selbst auf Kursbewegungen reagiert. Hoch in der Nähe des Strikes und kurz vor Verfall – dort tobt das Risiko.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Theta</dt>
          <dd>Wertverlust pro Tag durch Zeitverfall. Der natürliche Freund des Stillhalters: positiv für ihn, negativ für den Long-Halter.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Vega</dt>
          <dd>Preisänderung pro 1&nbsp;% mehr Volatilität. Short-Positionen profitieren, wenn die Vola sinkt.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Rho</dt>
          <dd>Preisänderung pro 1&nbsp;% mehr Zinssatz. Bei kurzlaufenden Optionen meist vernachlässigbar.</dd>
        </div>
      </dl>
    ),
  },
  {
    id: 'sens-chart',
    title: 'Sensitivitäts-Chart lesen',
    content: (
      <div className="space-y-3">
        <p>Du wählst eine Variable für die X-Achse (z.B. Underlying-Preis oder Strike) und zwei Greeks für die beiden gestapelten Charts. Beide Greeks werden dann über den gleichen X-Bereich aufgetragen.</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Cyan-gestrichelte Vertikale</strong>: zeigt deinen aktuellen Parameterwert an</li>
          <li><strong>Auto-X</strong>: passt den X-Bereich sinnvoll an die Variable an</li>
          <li><strong>Option Call/Put/Beide</strong>: bestimmt, was geplottet wird</li>
        </ul>
        <p>Praxistipp: Stell mal Strike auf die X-Achse und Theta + Delta auf die Y-Achsen. Du siehst auf einen Blick, welche Strikes für Stillhalter den besten Theta-pro-Delta-Trade liefern.</p>
      </div>
    ),
  },
  {
    id: 'payoff',
    title: 'Auszahlungs-Diagramm lesen',
    content: (
      <div className="space-y-3">
        <p>Das Diagramm zeigt deinen Gewinn/Verlust in Abhängigkeit vom Underlying-Preis am Verfallstag. Mit dem Toggle oben rechts wählst du zwischen Long (du kaufst die Option) und Short (du verkaufst, klassischer Stillhalter).</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Durchgezogene Linie</strong>: Auszahlung bei Verfall (klassischer Hockeystick)</li>
          <li><strong>Gestrichelte Linie</strong>: aktueller Wert der Position laut BS-Modell (also: wo wärst du, wenn du heute schließt?)</li>
          <li><strong>Spot, Strike, Break-even</strong>: farbige Pill-Labels markieren die kritischen Preispunkte</li>
        </ul>
        <p>Der Abstand zwischen "Heute"- und "Verfall"-Linie ist genau der Zeitwert deiner Position – das, was bis zum Verfall noch verfallen kann (Stillhalter-Sicht: Gewinn) oder verloren geht (Long-Sicht: Risiko).</p>
      </div>
    ),
  },
  {
    id: 'example',
    title: 'Beispiel: Short Put OTM analysieren',
    content: (
      <div className="space-y-3">
        <p>Du willst einen Short Put auf eine Aktie bei 100 $ schreiben, Strike 92, 30 Tage Restlaufzeit, Vola 35 %. Vorgehen im Calculator:</p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Parameter setzen: S=100, K=92, σ=35 %, r=4.5 %, t=30 Tage</li>
          <li>Option auf <em>Put</em>, Auszahlungs-Toggle auf <em>Short</em></li>
          <li>In Bewertung &amp; Greeks: Put-Preis ablesen (deine Prämie pro Kontrakt × 100)</li>
          <li>Delta beachten: niedriger negativer Wert = niedrige Wahrscheinlichkeit, ins Geld zu rutschen</li>
          <li>Theta beachten: positiv im Short – täglicher Gewinn allein durch Zeitablauf</li>
          <li>Auszahlungs-Diagramm: Max-Gewinn = Prämie, Verlustzone links vom Break-even</li>
        </ol>
        <p>Variiere dann den Strike-Slider und beobachte, wie sich Prämie, Delta und Break-even mitbewegen – so findest du das Sweet Spot für dein Risikoempfinden.</p>
      </div>
    ),
  },
  {
    id: 'limits',
    title: 'Modellannahmen &amp; Grenzen',
    content: (
      <div className="space-y-3">
        <p>Der Rechner ist ein <strong>Bewertungswerkzeug</strong>, kein Trading-Signal. Folgende Annahmen liegen Black-Scholes zugrunde:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Europäische Option (Ausübung nur am Verfallstag) – US-Style-Optionen können vor Verfall ausgeübt werden, was leichte Bewertungsunterschiede ergibt</li>
          <li>Konstante Volatilität über die Laufzeit – die Realität kennt Vol-Smiles und -Skews</li>
          <li>Kontinuierlicher Handel ohne Sprünge – Earnings-Gaps oder Crashes verletzen das</li>
          <li>Risikoloser Zins konstant – stimmt für kurze Laufzeiten gut</li>
        </ul>
        <p>Praktisch heißt das: Die ausgegebenen Werte sind theoretische Referenz. Tatsächliche Marktpreise weichen ab, vor allem durch die implizite Vola, die der Markt aktuell einpreist. Das Tool ersetzt keinen Live-Datenfeed und keine eigene Risikobewertung.</p>
      </div>
    ),
  },
];

// ===== UI Subcomponents =====

const NumSlider = ({ label, value, onChange, step = 1, suffix, min, max, logarithmic = false }) => {
  // Map between actual value and slider position
  const safe = Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min;
  const sliderValue = (logarithmic && min > 0)
    ? 100 * Math.log(safe / min) / Math.log(max / min)
    : safe;

  const handleSliderChange = (e) => {
    const raw = parseFloat(e.target.value);
    if (logarithmic && min > 0) {
      const v = min * Math.pow(max / min, raw / 100);
      // Adaptive precision: integer for large values, 0.1 for mid, 0.01 for small
      const rounded = v >= 100 ? Math.round(v)
                    : v >= 10  ? Math.round(v * 10) / 10
                    :            Math.round(v * 100) / 100;
      onChange(rounded);
    } else {
      onChange(raw);
    }
  };

  return (
    <div className="py-2.5 border-b border-slate-800 group">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-slate-400 text-sm font-medium tracking-wide uppercase">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="bg-slate-950 text-cyan-300 font-mono text-right w-24 px-2 py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all text-sm"
          />
          {suffix && <span className="text-slate-500 text-xs font-mono w-5">{suffix}</span>}
        </div>
      </div>
      {min !== undefined && max !== undefined && (
        <input
          type="range"
          min={logarithmic ? 0 : min}
          max={logarithmic ? 100 : max}
          step={logarithmic ? 0.1 : step}
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full ots-range"
        />
      )}
    </div>
  );
};

const SelectInput = ({ label, value, onChange, options, compact }) => (
  <label className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${compact ? '' : 'py-1 sm:py-2 sm:border-b sm:border-slate-800'}`}>
    {label && <span className="text-slate-400 text-xs sm:text-sm font-medium tracking-wide uppercase">{label}</span>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-950 text-cyan-300 font-mono w-full sm:w-auto px-3 py-2.5 sm:py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none text-sm sm:text-right"
    >
      {Object.entries(options).map(([k, v]) => (
        <option key={k} value={k}>{typeof v === 'string' ? v : v.label}</option>
      ))}
    </select>
  </label>
);

// Table cell for Greek values
const GreekCell = ({ value, decimals = 4, accent }) => (
  <td className={`font-mono text-right py-2.5 px-3 tabular-nums ${
    accent === 'call' ? 'text-emerald-300' :
    accent === 'put'  ? 'text-amber-300' : 'text-slate-300'
  }`}>
    {Number.isFinite(value) ? value.toFixed(decimals) : '—'}
  </td>
);

// Pill-style label for chart reference lines
const RefPillLabel = ({ viewBox, text, color, yOffset = 8 }) => {
  if (!viewBox) return null;
  const padding = 7;
  const charWidth = 6.2;
  const textWidth = text.length * charWidth + padding * 2;
  const x = viewBox.x;
  const y = viewBox.y - yOffset;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect
        x={x - textWidth / 2}
        y={y - 14}
        width={textWidth}
        height={14}
        rx={3}
        fill={color}
      />
      <text
        x={x}
        y={y - 4}
        textAnchor="middle"
        fill="#0a0e1a"
        fontSize={10}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
      >
        {text}
      </text>
    </g>
  );
};

// Accordion section in the help drawer
const HelpSection = ({ section, isOpen, onToggle }) => (
  <div className="border-b border-slate-800/60 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-slate-800/30 -mx-2 px-2 rounded transition-colors"
    >
      <span className="text-sm font-semibold text-slate-200">{section.title}</span>
      <span className={`text-cyan-500/70 text-xs transition-transform shrink-0 ${isOpen ? 'rotate-90' : ''}`}>▶</span>
    </button>
    {isOpen && (
      <div className="pb-4 text-sm text-slate-400 leading-relaxed">
        {section.content}
      </div>
    )}
  </div>
);

// ===== Main Component =====

export default function OptionsCalculator() {
  const initial = useMemo(() => readInitialFromURL(), []);

  const [S, setS]                           = useState(initial.S);
  const [K, setK]                           = useState(initial.K);
  const [sigmaPct, setSigmaPct]             = useState(initial.sigmaPct);
  const [rPct, setRPct]                     = useState(initial.rPct);
  const [qPct, setQPct]                     = useState(initial.qPct);
  const [timeValue, setTimeValue]           = useState(initial.timeValue);
  const [timeUnit, setTimeUnit]             = useState(initial.timeUnit);
  const [timeMode, setTimeMode]             = useState(initial.timeMode);
  const [pricingDate, setPricingDate]       = useState(initial.pricingDate);
  const [expirationDate, setExpirationDate] = useState(initial.expirationDate);

  const [effectOf, setEffectOf]   = useState(initial.effectOf);
  const [yUpper, setYUpper]       = useState(initial.yUpper);
  const [yLower, setYLower]       = useState(initial.yLower);
  const [optType, setOptType]     = useState(initial.optType);
  const [direction, setDirection] = useState(initial.direction);
  const [autoX, setAutoX]         = useState(true);

  const autoRange = useMemo(() => VARIABLES[effectOf].defaultRange(S), [effectOf, S]);
  const [xStart, setXStart] = useState(autoRange.start);
  const [xEnd, setXEnd]     = useState(autoRange.end);
  const [xStep, setXStep]   = useState(autoRange.step);
  const range = autoX ? autoRange : { start: xStart, end: xEnd, step: xStep };

  // === URL sync ===
  useEffect(() => {
    writeToURL({
      S, K, sigmaPct, rPct, qPct, timeValue, timeUnit, timeMode,
      pricingDate, expirationDate, effectOf, yUpper, yLower, optType, direction,
    });
  }, [S, K, sigmaPct, rPct, qPct, timeValue, timeUnit, timeMode,
      pricingDate, expirationDate, effectOf, yUpper, yLower, optType, direction]);

  // === Time -> years ===
  const tYears = useMemo(() => {
    if (timeMode === 'date') {
      const start = new Date(pricingDate + 'T00:00:00');
      const end   = new Date(expirationDate + 'T00:00:00');
      const days  = (end.getTime() - start.getTime()) / 86400000;
      return Math.max(0, days) / 365;
    }
    return timeValue / TIME_UNITS[timeUnit].perYear;
  }, [timeMode, timeValue, timeUnit, pricingDate, expirationDate]);

  // === Current Greeks ===
  const greeks = useMemo(
    () => blackScholes(S, K, sigmaPct / 100, rPct / 100, qPct / 100, tYears),
    [S, K, sigmaPct, rPct, qPct, tYears]
  );

  const callIntrinsic = Math.max(S - K, 0);
  const putIntrinsic  = Math.max(K - S, 0);

  // === Sensitivity chart data ===
  const chartData = useMemo(() => {
    const data = [];
    const safeStep = range.step > 0 ? range.step : (range.end - range.start) / 50;
    for (let x = range.start; x <= range.end + 1e-9; x += safeStep) {
      const p = {
        S, K,
        sigma: sigmaPct / 100,
        r: rPct / 100,
        q: qPct / 100,
        t: tYears
      };
      if (effectOf === 'S')     p.S = x;
      if (effectOf === 'K')     p.K = x;
      if (effectOf === 'sigma') p.sigma = x / 100;
      if (effectOf === 'r')     p.r = x / 100;
      if (effectOf === 'q')     p.q = x / 100;
      if (effectOf === 't')     p.t = x / 365;

      const g = blackScholes(p.S, p.K, p.sigma, p.r, p.q, p.t);
      data.push({
        x: parseFloat(x.toFixed(4)),
        callPrice: g.callPrice, putPrice: g.putPrice,
        callDelta: g.callDelta, putDelta: g.putDelta,
        gamma: g.gamma,
        callTheta: g.callTheta, putTheta: g.putTheta,
        vega: g.vega,
        callRho: g.callRho, putRho: g.putRho,
      });
    }
    return data;
  }, [S, K, sigmaPct, rPct, qPct, tYears, effectOf, range.start, range.end, range.step]);

  // Reference x value (current parameter)
  const currentXValue = useMemo(() => {
    if (effectOf === 'S')     return S;
    if (effectOf === 'K')     return K;
    if (effectOf === 'sigma') return sigmaPct;
    if (effectOf === 'r')     return rPct;
    if (effectOf === 'q')     return qPct;
    if (effectOf === 't')     return tYears * 365;
    return 0;
  }, [effectOf, S, K, sigmaPct, rPct, qPct, tYears]);

  // === Payoff data (at expiration + today's BS value, P&L view) ===
  const payoffData = useMemo(() => {
    const center = K;
    const halfWidth = Math.max(S, K) * 0.5;
    const minS = Math.max(0.01, center - halfWidth);
    const maxS = center + halfWidth;
    const N = 81;
    const step = (maxS - minS) / (N - 1);

    const callPremium = greeks.callPrice;
    const putPremium  = greeks.putPrice;
    const sign = direction === 'long' ? 1 : -1;

    const data = [];
    for (let i = 0; i < N; i++) {
      const s = minS + i * step;
      const intrCall = Math.max(s - K, 0);
      const intrPut  = Math.max(K - s, 0);
      const todayG = blackScholes(s, K, sigmaPct/100, rPct/100, qPct/100, tYears);

      data.push({
        s: parseFloat(s.toFixed(4)),
        callExp:   sign * (intrCall - callPremium),
        putExp:    sign * (intrPut  - putPremium),
        callToday: sign * (todayG.callPrice - callPremium),
        putToday:  sign * (todayG.putPrice  - putPremium),
      });
    }
    return data;
  }, [S, K, sigmaPct, rPct, qPct, tYears, direction, greeks.callPrice, greeks.putPrice]);

  const breakeven = useMemo(() => {
    if (optType === 'call') return K + greeks.callPrice;
    if (optType === 'put')  return K - greeks.putPrice;
    return null;
  }, [optType, K, greeks.callPrice, greeks.putPrice]);

  // === Copy link ===
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // === Help drawer ===
  const [helpOpen, setHelpOpen] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const [openHelpSections, setOpenHelpSections] = useState({ overview: true });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('optionshub-help-seen')) {
      setFirstVisit(true);
      // Pulse stops after 8 seconds even if user ignores it
      const t = setTimeout(() => setFirstVisit(false), 8000);
      return () => clearTimeout(t);
    }
  }, []);

  const openHelp = () => {
    setHelpOpen(true);
    setFirstVisit(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('optionshub-help-seen', '1');
    }
  };

  useEffect(() => {
    if (!helpOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setHelpOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [helpOpen]);

  const toggleHelpSection = (id) => {
    setOpenHelpSections(s => ({ ...s, [id]: !s[id] }));
  };

  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { font-family: 'Manrope', system-ui, sans-serif; }
        .font-mono, input[type="number"], select, .tabular-nums { font-family: 'JetBrains Mono', monospace !important; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }

        /* Custom range slider styling */
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

        /* Help button first-visit pulse */
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
      `}</style>

      <div className="max-w-7xl mx-auto">

        {/* ============ HEADER ============ */}
        <header className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-2xl font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              σ
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Options Calculator</h1>
              <p className="text-sm text-slate-500 mt-1">Was ist die Option wert? Wie reagiert sie?</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={copyLink}
              className="text-xs uppercase tracking-wider px-3 py-2 rounded-md border border-slate-800 hover:border-cyan-700 hover:text-cyan-300 text-slate-400 transition-colors flex items-center gap-2"
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
              className={`text-xs uppercase tracking-wider px-3 py-2 rounded-md border transition-colors flex items-center gap-2 ${
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
              <div className="ohfade absolute top-full right-0 mt-2 px-3 py-2 bg-slate-900 border border-cyan-700/60 rounded-md text-xs text-cyan-300 whitespace-nowrap shadow-xl shadow-cyan-900/30 pointer-events-none">
                Erste Schritte? → Hier klicken
                <div className="absolute -top-1 right-6 w-2 h-2 bg-slate-900 border-t border-l border-cyan-700/60 rotate-45" />
              </div>
            )}
          </div>
        </header>

        {/* ============ INPUTS + GREEKS ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

          {/* INPUTS */}
          <section className="lg:col-span-2 bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5">
            <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold mb-3">Parameter</h2>
            <NumSlider label="Underlying"     value={S}        onChange={setS}        step={1}    suffix="$" min={SLIDER_CONFIG.S.min}        max={SLIDER_CONFIG.S.max} logarithmic />
            <NumSlider label="Strike"         value={K}        onChange={setK}        step={1}    suffix="$" min={SLIDER_CONFIG.K.min}        max={SLIDER_CONFIG.K.max} logarithmic />
            <NumSlider label="Volatilität"    value={sigmaPct} onChange={setSigmaPct} step={1}    suffix="%" min={SLIDER_CONFIG.sigmaPct.min} max={SLIDER_CONFIG.sigmaPct.max} />
            <NumSlider label="Zinssatz"       value={rPct}     onChange={setRPct}     step={0.25} suffix="%" min={SLIDER_CONFIG.rPct.min}     max={SLIDER_CONFIG.rPct.max} />
            <NumSlider label="Dividenden"     value={qPct}     onChange={setQPct}     step={0.25} suffix="%" min={SLIDER_CONFIG.qPct.min}     max={SLIDER_CONFIG.qPct.max} />

            {/* Time section */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm font-medium tracking-wide uppercase">Restlaufzeit</span>
                <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => setTimeMode('duration')}
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                      timeMode === 'duration' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >Zeitraum</button>
                  <button
                    type="button"
                    onClick={() => setTimeMode('date')}
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                      timeMode === 'date' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >Datum</button>
                </div>
              </div>

              {timeMode === 'duration' ? (
                <div className="flex items-center justify-end gap-1.5 py-1">
                  <input
                    type="number"
                    value={timeValue}
                    min={0}
                    step={1}
                    onChange={(e) => setTimeValue(parseFloat(e.target.value) || 0)}
                    className="bg-slate-950 text-cyan-300 font-mono text-right w-20 px-2 py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none text-sm"
                  />
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value)}
                    className="bg-slate-950 text-cyan-300 font-mono text-xs px-2 py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none"
                  >
                    {Object.entries(TIME_UNITS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 text-xs uppercase tracking-wider">Bewertung</span>
                    <input
                      type="date"
                      value={pricingDate}
                      max={expirationDate}
                      onChange={(e) => setPricingDate(e.target.value)}
                      className="bg-slate-950 text-cyan-300 font-mono text-sm px-2 py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 text-xs uppercase tracking-wider">Verfall</span>
                    <input
                      type="date"
                      value={expirationDate}
                      min={pricingDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="bg-slate-950 text-cyan-300 font-mono text-sm px-2 py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
              )}
              <div className="text-[10px] uppercase tracking-wider text-slate-600 font-mono text-right mt-2">
                = {(tYears * 365).toFixed(2)} Tage = {tYears.toFixed(6)} Jahre
              </div>
            </div>
          </section>

          {/* GREEKS TABLE */}
          <section className="lg:col-span-3 bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold">Bewertung &amp; Greeks</h2>
              <div className="flex gap-4 text-[10px] uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" />Call</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" />Put</div>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="text-left py-1.5 px-3 font-medium"></th>
                  <th className="text-right py-1.5 px-3 font-medium">Call</th>
                  <th className="text-right py-1.5 px-3 font-medium">Put</th>
                  <th className="text-left py-1.5 px-3 font-medium text-slate-600 font-normal normal-case tracking-normal italic">Beschreibung</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-t border-slate-800/60 bg-slate-950/40">
                  <td className="py-2.5 px-3 font-bold text-slate-200">Preis</td>
                  <GreekCell value={greeks.callPrice} decimals={4} accent="call" />
                  <GreekCell value={greeks.putPrice}  decimals={4} accent="put" />
                  <td className="text-xs text-slate-500 px-3">Fairer Preis laut Black-Scholes-Modell</td>
                </tr>
                <tr className="border-t border-slate-800/60">
                  <td className="py-2.5 px-3 font-medium text-slate-300">Innerer Wert</td>
                  <GreekCell value={callIntrinsic} decimals={4} accent="call" />
                  <GreekCell value={putIntrinsic}  decimals={4} accent="put" />
                  <td className="text-xs text-slate-500 px-3">Wert bei sofortiger Ausübung (sonst 0)</td>
                </tr>
                <tr className="border-t border-slate-800/60">
                  <td className="py-2.5 px-3 font-medium text-slate-300">Delta</td>
                  <GreekCell value={greeks.callDelta} decimals={4} accent="call" />
                  <GreekCell value={greeks.putDelta}  decimals={4} accent="put" />
                  <td className="text-xs text-slate-500 px-3">Preisänderung bei +1 $ im Basiswert</td>
                </tr>
                <tr className="border-t border-slate-800/60">
                  <td className="py-2.5 px-3 font-medium text-slate-300">Gamma</td>
                  <GreekCell value={greeks.gamma} decimals={5} accent="call" />
                  <GreekCell value={greeks.gamma} decimals={5} accent="put" />
                  <td className="text-xs text-slate-500 px-3">Wie stark Delta auf Kursbewegungen reagiert</td>
                </tr>
                <tr className="border-t border-slate-800/60">
                  <td className="py-2.5 px-3 font-medium text-slate-300">Theta</td>
                  <GreekCell value={greeks.callTheta} decimals={4} accent="call" />
                  <GreekCell value={greeks.putTheta}  decimals={4} accent="put" />
                  <td className="text-xs text-slate-500 px-3">Wertverlust pro Tag durch Zeitverfall</td>
                </tr>
                <tr className="border-t border-slate-800/60">
                  <td className="py-2.5 px-3 font-medium text-slate-300">Vega</td>
                  <GreekCell value={greeks.vega} decimals={4} accent="call" />
                  <GreekCell value={greeks.vega} decimals={4} accent="put" />
                  <td className="text-xs text-slate-500 px-3">Preisänderung bei +1 % höherer Volatilität</td>
                </tr>
                <tr className="border-t border-slate-800/60">
                  <td className="py-2.5 px-3 font-medium text-slate-300">Rho</td>
                  <GreekCell value={greeks.callRho} decimals={4} accent="call" />
                  <GreekCell value={greeks.putRho}  decimals={4} accent="put" />
                  <td className="text-xs text-slate-500 px-3">Preisänderung bei +1 % höherem Zinssatz</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* ============ CHART CONTROLS ============ */}
        <section className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5 mb-5">
          <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold mb-4">Sensitivitäts-Chart</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 sm:gap-y-3">
            <SelectInput label="X-Achse" value={effectOf} onChange={setEffectOf} options={VARIABLES} />
            <SelectInput label="Oberes Y" value={yUpper}  onChange={setYUpper}   options={GREEKS} />
            <SelectInput label="Unteres Y" value={yLower} onChange={setYLower}   options={GREEKS} />
            <SelectInput label="Option"   value={optType} onChange={setOptType}  options={{ call: 'Call', put: 'Put', both: 'Beide' }} />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" checked={autoX} onChange={(e) => setAutoX(e.target.checked)} className="accent-cyan-500 w-4 h-4" />
              <span className="uppercase tracking-wider text-xs">Auto-X</span>
            </label>
            {!autoX && (
              <div className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
                  <label className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Start</label>
                  <input type="number" value={xStart} onChange={(e) => setXStart(parseFloat(e.target.value) || 0)} className="bg-slate-950 text-cyan-300 font-mono w-full sm:w-24 px-2 py-1.5 sm:py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none text-sm" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
                  <label className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Ende</label>
                  <input type="number" value={xEnd} onChange={(e) => setXEnd(parseFloat(e.target.value) || 0)} className="bg-slate-950 text-cyan-300 font-mono w-full sm:w-24 px-2 py-1.5 sm:py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none text-sm" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
                  <label className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500">Schritt</label>
                  <input type="number" value={xStep} onChange={(e) => setXStep(parseFloat(e.target.value) || 1)} className="bg-slate-950 text-cyan-300 font-mono w-full sm:w-24 px-2 py-1.5 sm:py-1 rounded border border-slate-800 focus:border-cyan-500 focus:outline-none text-sm" />
                </div>
              </div>
            )}
            <div className="ml-auto text-[10px] uppercase tracking-wider text-slate-600 font-mono hidden sm:block">
              {chartData.length} Pts · {range.start.toFixed(2)} → {range.end.toFixed(2)}
            </div>
          </div>
        </section>

        {/* ============ SENSITIVITY CHARTS ============ */}
        <section className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5 mb-5">
          {/* Upper chart */}
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">
              <span className="text-cyan-400">{GREEKS[yUpper].label}</span>
              <span className="text-slate-500 font-normal ml-2">vs. {VARIABLES[effectOf].label}</span>
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="x" stroke="#475569" fontSize={11} tickFormatter={(v) => v.toFixed(VARIABLES[effectOf].unit === '%' ? 0 : 1)} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={(v) => v.toFixed(3)} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, fontSize: 12 }}
                  labelFormatter={(v) => `${VARIABLES[effectOf].label}: ${v.toFixed(2)} ${VARIABLES[effectOf].unit}`}
                  formatter={(v) => v.toFixed(5)}
                />
                <ReferenceLine x={currentXValue} stroke="#06b6d4" strokeDasharray="4 4" opacity={0.6} label={{ value: 'Aktuell', position: 'top', fill: '#06b6d4', fontSize: 10 }} />
                {optType === 'both' ? (
                  <>
                    <Line type="monotone" dataKey={GREEKS[yUpper].callKey} stroke="#34d399" strokeWidth={2} dot={false} name={`Call ${GREEKS[yUpper].label}`} />
                    <Line type="monotone" dataKey={GREEKS[yUpper].putKey}  stroke="#fbbf24" strokeWidth={2} dot={false} name={`Put ${GREEKS[yUpper].label}`} />
                  </>
                ) : (
                  <Line type="monotone" dataKey={optType === 'call' ? GREEKS[yUpper].callKey : GREEKS[yUpper].putKey} stroke={optType === 'call' ? '#34d399' : '#fbbf24'} strokeWidth={2.2} dot={false} name={`${optType === 'call' ? 'Call' : 'Put'} ${GREEKS[yUpper].label}`} />
                )}
                {optType === 'both' && <Legend wrapperStyle={{ fontSize: 11 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Lower chart */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">
              <span className="text-cyan-400">{GREEKS[yLower].label}</span>
              <span className="text-slate-500 font-normal ml-2">vs. {VARIABLES[effectOf].label}</span>
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="x" stroke="#475569" fontSize={11} tickFormatter={(v) => v.toFixed(VARIABLES[effectOf].unit === '%' ? 0 : 1)} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={(v) => v.toFixed(3)} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, fontSize: 12 }}
                  labelFormatter={(v) => `${VARIABLES[effectOf].label}: ${v.toFixed(2)} ${VARIABLES[effectOf].unit}`}
                  formatter={(v) => v.toFixed(5)}
                />
                <ReferenceLine x={currentXValue} stroke="#06b6d4" strokeDasharray="4 4" opacity={0.6} />
                {optType === 'both' ? (
                  <>
                    <Line type="monotone" dataKey={GREEKS[yLower].callKey} stroke="#34d399" strokeWidth={2} dot={false} name={`Call ${GREEKS[yLower].label}`} />
                    <Line type="monotone" dataKey={GREEKS[yLower].putKey}  stroke="#fbbf24" strokeWidth={2} dot={false} name={`Put ${GREEKS[yLower].label}`} />
                  </>
                ) : (
                  <Line type="monotone" dataKey={optType === 'call' ? GREEKS[yLower].callKey : GREEKS[yLower].putKey} stroke={optType === 'call' ? '#34d399' : '#fbbf24'} strokeWidth={2.2} dot={false} name={`${optType === 'call' ? 'Call' : 'Put'} ${GREEKS[yLower].label}`} />
                )}
                {optType === 'both' && <Legend wrapperStyle={{ fontSize: 11 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ============ PAYOFF DIAGRAM ============ */}
        <section className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5 mb-5">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold">
              Auszahlungs-Diagramm
              <span className="ml-2 normal-case tracking-normal text-slate-500 font-normal text-xs">
                Gewinn/Verlust über Underlying am Verfallstag
              </span>
            </h2>
            <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5">
              <button
                type="button"
                onClick={() => setDirection('long')}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                  direction === 'long' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >Long</button>
              <button
                type="button"
                onClick={() => setDirection('short')}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded transition-colors ${
                  direction === 'short' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >Short (Stillhalter)</button>
            </div>
          </div>

          {/* Legend strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5" style={{ background: optType === 'call' ? '#34d399' : '#fbbf24' }} />
              Bei Verfall
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 border-t border-dashed" style={{ borderColor: optType === 'call' ? '#34d399' : '#fbbf24' }} />
              Heute (BS-Modell)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 border-t border-dashed border-cyan-400" />
              Aktueller Spot (S = {S.toFixed(2)})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 border-t border-slate-200" />
              Strike (K = {K.toFixed(2)})
            </span>
            {breakeven !== null && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-4 border-t border-dashed border-violet-400" />
                Break-even ({breakeven.toFixed(2)})
              </span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={payoffData} margin={{ top: 30, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="s" stroke="#475569" fontSize={11} tickFormatter={(v) => v.toFixed(0)} />
              <YAxis stroke="#475569" fontSize={11} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, fontSize: 12 }}
                labelFormatter={(v) => `Underlying: ${v.toFixed(2)} $`}
                formatter={(v, name) => [v.toFixed(3) + ' $', name]}
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
              {breakeven !== null && (
                <ReferenceLine
                  x={breakeven}
                  stroke="#c084fc"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  opacity={0.95}
                  label={<RefPillLabel text={`BE ${breakeven.toFixed(0)}`} color="#c084fc" yOffset={24} />}
                />
              )}

              {(optType === 'call' || optType === 'both') && (
                <>
                  <Line type="monotone" dataKey="callExp"   stroke="#34d399" strokeWidth={2.4} dot={false} name="Call · Verfall" />
                  <Line type="monotone" dataKey="callToday" stroke="#34d399" strokeWidth={1.4} strokeDasharray="5 5" dot={false} name="Call · Heute" />
                </>
              )}
              {(optType === 'put' || optType === 'both') && (
                <>
                  <Line type="monotone" dataKey="putExp"   stroke="#fbbf24" strokeWidth={2.4} dot={false} name="Put · Verfall" />
                  <Line type="monotone" dataKey="putToday" stroke="#fbbf24" strokeWidth={1.4} strokeDasharray="5 5" dot={false} name="Put · Heute" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            Annahme: Position wurde heute zum aktuellen fairen Preis eröffnet
            ({optType === 'call' ? `Prämie ${greeks.callPrice.toFixed(2)} $` : optType === 'put' ? `Prämie ${greeks.putPrice.toFixed(2)} $` : `Call: ${greeks.callPrice.toFixed(2)} $, Put: ${greeks.putPrice.toFixed(2)} $`}).
            {direction === 'short' && ' Im Short-Modus wird die Prämie vereinnahmt, das maximale Verlustrisiko ist (theoretisch) unbegrenzt nach oben (Short Call) bzw. begrenzt auf Strike − Prämie (Short Put).'}
          </div>
        </section>

      </div>

      {/* ============ HELP DRAWER ============ */}
      {helpOpen && (
        <div
          onClick={() => setHelpOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-slate-900/95 backdrop-blur-md border-l border-cyan-800/40 z-50 transition-transform duration-300 flex flex-col shadow-2xl shadow-black/50 ${
          helpOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-hidden={!helpOpen}
        aria-label="Anleitung"
      >
        {/* Drawer header */}
        <header className="flex items-start justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Anleitung</h2>
            <p className="text-xs text-slate-500 mt-0.5">So nutzt du den Options Calculator</p>
          </div>
          <button
            onClick={() => setHelpOpen(false)}
            className="w-9 h-9 rounded-md hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-lg"
            aria-label="Anleitung schließen"
          >
            ✕
          </button>
        </header>

        {/* Drawer scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {HELP_SECTIONS.map(section => (
            <HelpSection
              key={section.id}
              section={section}
              isOpen={!!openHelpSections[section.id]}
              onToggle={() => toggleHelpSection(section.id)}
            />
          ))}
          <div className="text-[10px] uppercase tracking-wider text-slate-600 font-mono text-center mt-6 mb-2 pb-2">
            Esc oder Klick außerhalb schließt
          </div>
        </div>
      </aside>

    </div>
  );
}
