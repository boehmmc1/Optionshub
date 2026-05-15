import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart,
} from 'recharts';
import NumSlider from '../components/NumSlider.jsx';

// ============================================================================
// Strategy presets
//
// `template` defines positions and types for the legs.
// - `strikeOffset` is added to the current spot to get a default strike.
// - `premiumGuess` is just a starting placeholder for the user to overwrite.
// - For underlying legs, `strikeOffset` of 0 means entry at spot.
// ============================================================================

const STRATEGIES = [
  {
    id: 'custom',
    name: 'Eigene Strategie',
    category: 'custom',
    description: 'Lege jede Position selbst fest',
  },

  // --- Single Leg ---
  { id: 'long-call',     name: 'Long Call',                  category: 'single', description: 'Bullish – steigende Kurse erwartet',
    template: [{ position: 1, type: 'call', strikeOffset: 0, premiumGuess: 3.0 }] },
  { id: 'short-call',    name: 'Short Call',                 category: 'single', description: 'Bearish – fallende oder stagnierende Kurse',
    template: [{ position: -1, type: 'call', strikeOffset: 5, premiumGuess: 1.5 }] },
  { id: 'long-put',      name: 'Long Put',                   category: 'single', description: 'Bearish – fallende Kurse erwartet',
    template: [{ position: 1, type: 'put', strikeOffset: 0, premiumGuess: 3.0 }] },
  { id: 'short-put',     name: 'Short Put (Cash-Secured)',   category: 'single', description: 'Bullish/neutral – Stillhalter-Klassiker',
    template: [{ position: -1, type: 'put', strikeOffset: -5, premiumGuess: 1.5 }] },

  // --- Income / Hedging ---
  { id: 'covered-call',     name: 'Covered Call',     category: 'income', description: 'Aktie halten + Call verkaufen',
    template: [
      { position: 1, type: 'underlying', strikeOffset: 0, premiumGuess: 100 },
      { position: -1, type: 'call', strikeOffset: 5, premiumGuess: 1.5 },
    ] },
  { id: 'protective-put',   name: 'Protective Put',   category: 'income', description: 'Aktie halten + Put als Versicherung',
    template: [
      { position: 1, type: 'underlying', strikeOffset: 0, premiumGuess: 100 },
      { position: 1, type: 'put', strikeOffset: -5, premiumGuess: 1.5 },
    ] },
  { id: 'collar',           name: 'Collar',           category: 'income', description: 'Aktie + schützender Put + verkaufter Call',
    template: [
      { position: 1, type: 'underlying', strikeOffset: 0, premiumGuess: 100 },
      { position: 1, type: 'put', strikeOffset: -5, premiumGuess: 1.5 },
      { position: -1, type: 'call', strikeOffset: 5, premiumGuess: 1.5 },
    ] },

  // --- Vertikale Spreads ---
  { id: 'bull-call-spread', name: 'Bull Call Spread', category: 'vertical', description: 'Bullish, Debit-Spread, begrenztes Risiko',
    template: [
      { position: 1, type: 'call', strikeOffset: 0, premiumGuess: 3.5 },
      { position: -1, type: 'call', strikeOffset: 10, premiumGuess: 1.0 },
    ] },
  { id: 'bear-call-spread', name: 'Bear Call Spread', category: 'vertical', description: 'Bearish, Credit-Spread für Stillhalter',
    template: [
      { position: -1, type: 'call', strikeOffset: 5, premiumGuess: 1.5 },
      { position: 1, type: 'call', strikeOffset: 15, premiumGuess: 0.5 },
    ] },
  { id: 'bull-put-spread',  name: 'Bull Put Spread',  category: 'vertical', description: 'Bullish, Credit-Spread für Stillhalter',
    template: [
      { position: 1, type: 'put', strikeOffset: -15, premiumGuess: 0.5 },
      { position: -1, type: 'put', strikeOffset: -5, premiumGuess: 1.5 },
    ] },
  { id: 'bear-put-spread',  name: 'Bear Put Spread',  category: 'vertical', description: 'Bearish, Debit-Spread, begrenztes Risiko',
    template: [
      { position: 1, type: 'put', strikeOffset: 0, premiumGuess: 3.5 },
      { position: -1, type: 'put', strikeOffset: -10, premiumGuess: 1.0 },
    ] },

  // --- Volatilität ---
  { id: 'long-straddle',    name: 'Long Straddle',    category: 'volatility', description: 'Starke Bewegung erwartet (Long Vola)',
    template: [
      { position: 1, type: 'call', strikeOffset: 0, premiumGuess: 3.0 },
      { position: 1, type: 'put',  strikeOffset: 0, premiumGuess: 3.0 },
    ] },
  { id: 'short-straddle',   name: 'Short Straddle',   category: 'volatility', description: 'Seitwärts erwartet, unbegrenztes Risiko',
    template: [
      { position: -1, type: 'call', strikeOffset: 0, premiumGuess: 3.0 },
      { position: -1, type: 'put',  strikeOffset: 0, premiumGuess: 3.0 },
    ] },
  { id: 'long-strangle',    name: 'Long Strangle',    category: 'volatility', description: 'Starke Bewegung, billiger als Straddle',
    template: [
      { position: 1, type: 'put',  strikeOffset: -5, premiumGuess: 1.5 },
      { position: 1, type: 'call', strikeOffset: 5,  premiumGuess: 1.5 },
    ] },
  { id: 'short-strangle',   name: 'Short Strangle',   category: 'volatility', description: 'Seitwärts mit breiterer Range als Short Straddle',
    template: [
      { position: -1, type: 'put',  strikeOffset: -5, premiumGuess: 1.5 },
      { position: -1, type: 'call', strikeOffset: 5,  premiumGuess: 1.5 },
    ] },

  // --- Stillhalter Premium ---
  { id: 'iron-condor',      name: 'Iron Condor',      category: 'premium', description: 'Seitwärts, begrenzte Prämie + begrenztes Risiko',
    template: [
      { position: 1,  type: 'put',  strikeOffset: -15, premiumGuess: 0.5 },
      { position: -1, type: 'put',  strikeOffset: -5,  premiumGuess: 1.5 },
      { position: -1, type: 'call', strikeOffset: 5,   premiumGuess: 1.5 },
      { position: 1,  type: 'call', strikeOffset: 15,  premiumGuess: 0.5 },
    ] },
  { id: 'iron-butterfly',   name: 'Iron Butterfly',   category: 'premium', description: 'Enger Iron Condor – mehr Prämie, schmaler Gewinn-Korridor',
    template: [
      { position: 1,  type: 'put',  strikeOffset: -10, premiumGuess: 0.5 },
      { position: -1, type: 'put',  strikeOffset: 0,   premiumGuess: 3.0 },
      { position: -1, type: 'call', strikeOffset: 0,   premiumGuess: 3.0 },
      { position: 1,  type: 'call', strikeOffset: 10,  premiumGuess: 0.5 },
    ] },

  // --- Butterflies ---
  { id: 'long-call-butterfly', name: 'Long Call Butterfly', category: 'butterfly', description: 'Maximaler Gewinn bei Punktlandung am mittleren Strike',
    template: [
      { position: 1,  type: 'call', strikeOffset: -5, premiumGuess: 5.5 },
      { position: -1, type: 'call', strikeOffset: 0,  premiumGuess: 3.0 },
      { position: -1, type: 'call', strikeOffset: 0,  premiumGuess: 3.0 },
      { position: 1,  type: 'call', strikeOffset: 5,  premiumGuess: 1.5 },
    ] },
  { id: 'long-put-butterfly',  name: 'Long Put Butterfly',  category: 'butterfly', description: 'Maximaler Gewinn bei Punktlandung am mittleren Strike',
    template: [
      { position: 1,  type: 'put', strikeOffset: 5,  premiumGuess: 5.5 },
      { position: -1, type: 'put', strikeOffset: 0,  premiumGuess: 3.0 },
      { position: -1, type: 'put', strikeOffset: 0,  premiumGuess: 3.0 },
      { position: 1,  type: 'put', strikeOffset: -5, premiumGuess: 1.5 },
    ] },
];

const STRATEGY_CATEGORIES = {
  custom: 'Frei',
  single: 'Einzelne Option',
  income: 'Income / Hedging',
  vertical: 'Vertikale Spreads',
  volatility: 'Volatilität',
  premium: 'Stillhalter Premium',
  butterfly: 'Butterflies',
};

// ============================================================================
// Help sections
// ============================================================================

export const HELP_SECTIONS = [
  {
    id: 'overview',
    title: 'Was zeigt der Strategy Builder?',
    content: (
      <div className="space-y-3">
        <p>Der Strategy Builder zeigt das Risiko- und Gewinnprofil einer Strategie aus mehreren Optionspositionen am Verfallstag:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Vorgefertigte Strategien wählen (Iron Condor, Bull Call Spread, Straddle, etc.)</li>
          <li>Bis zu 4 Positionen einzeln editieren: Long/Short, Call/Put/Underlying, Strike, Prämie</li>
          <li>Maximaler Gewinn, maximaler Verlust und Break-Evens sofort sichtbar</li>
          <li>Auszahlungs-Diagramm der gesamten Konstruktion</li>
        </ul>
        <p>Gedacht für alle, die nicht nur einzelne Optionen handeln, sondern strukturierte Strategien aufbauen – Spreads, Condors, Butterflies und mehr.</p>
      </div>
    ),
  },
  {
    id: 'workflow',
    title: 'Workflow in 3 Schritten',
    content: (
      <ol className="list-decimal pl-5 space-y-2">
        <li><strong className="text-slate-200">Strategie wählen.</strong> Im Dropdown eine Vorlage anklicken. Position und Type der Legs werden automatisch gesetzt, Strikes und Prämien grob vorbelegt.</li>
        <li><strong className="text-slate-200">Underlying-Preis und Legs anpassen.</strong> Trag deinen Spot ein, dann je Leg den realen Strike und die tatsächlich bezahlte/erhaltene Prämie. Die Kennzahlen und das Diagramm aktualisieren sich live.</li>
        <li><strong className="text-slate-200">Auswertung lesen.</strong> Schau dir Max Profit, Max Loss, die Break-Evens und das Reward/Risk-Verhältnis an. Im Chart siehst du, in welchem Spot-Bereich du gewinnst/verlierst.</li>
      </ol>
    ),
  },
  {
    id: 'metrics',
    title: 'Kennzahlen verstehen',
    content: (
      <dl className="space-y-2.5">
        <div>
          <dt className="font-semibold text-slate-200">Netto-Kapital</dt>
          <dd>Geld, das beim Eröffnen der Position fließt. Positiv = Credit (du bekommst Geld). Negativ = Debit (du zahlst).</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Max Profit</dt>
          <dd>Der bestmögliche Gewinn bei Verfall. Wenn das Risiko nach oben unbegrenzt ist (z.B. Long Call), zeigt sich "∞".</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Max Loss</dt>
          <dd>Der schlimmste Fall bei Verfall. Bei Short Calls etwa unbegrenzt ("∞"), bei Vertical Spreads begrenzt auf die Differenz der Strikes minus erhaltener Prämie.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Break-Even</dt>
          <dd>Die Underlying-Preise, bei denen die Strategie genau weder Gewinn noch Verlust macht. Manche Strategien haben einen, andere zwei (Iron Condor) oder mehr.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Reward / Risk</dt>
          <dd>Verhältnis von Max Loss zu Max Profit. Wert 1:3 bedeutet: für jeden möglichen Gewinn-Dollar riskierst du drei. Faustregel: niedriges Verhältnis = konservativ.</dd>
        </div>
      </dl>
    ),
  },
  {
    id: 'when',
    title: 'Wann welche Strategie?',
    content: (
      <dl className="space-y-2.5">
        <div>
          <dt className="font-semibold text-slate-200">Markterwartung: bullish</dt>
          <dd>Long Call, Bull Call Spread (begrenztes Risiko), Bull Put Spread (Credit).</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Markterwartung: bearish</dt>
          <dd>Long Put, Bear Put Spread (begrenztes Risiko), Bear Call Spread (Credit).</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Markterwartung: seitwärts (Stillhalter)</dt>
          <dd>Iron Condor, Iron Butterfly, Short Strangle/Straddle (Vorsicht: hohes Risiko).</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Markterwartung: starke Bewegung (egal welche)</dt>
          <dd>Long Straddle, Long Strangle. Profitieren von steigender Volatilität.</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-200">Punkt-Treffer erwartet</dt>
          <dd>Long Call/Put Butterfly – maximaler Gewinn nur bei sehr enger Trefferzone.</dd>
        </div>
      </dl>
    ),
  },
  {
    id: 'example-condor',
    title: 'Beispiel: Iron Condor analysieren',
    content: (
      <div className="space-y-3">
        <p>Klassischer Stillhalter-Trade auf Aktie bei 100 $, du erwartest Seitwärtsbewegung in den nächsten 30 Tagen:</p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>Dropdown: <em>Iron Condor</em> wählen. Vier Legs werden vorbelegt mit Strikes 85/95/105/115.</li>
          <li>Underlying-Preis: 100 eingeben.</li>
          <li>Trage die <em>tatsächlich</em> erzielten Prämien aus deiner Broker-Plattform ein.</li>
          <li>Lies Netto-Kapital ab: typisch +1.50 bis +3.00 (Credit).</li>
          <li>Max Profit = Netto-Kapital × 100 (pro Kontrakt). Max Loss = Differenz der Spread-Strikes − Prämie.</li>
          <li>Break-Evens: die zwei Preise, ab denen du in die Verlustzone rutschst. Halte das Underlying zwischen den beiden Werten, dann gewinnst du.</li>
        </ol>
        <p>Im Chart erkennst du den charakteristischen "Plateau"-Bereich oben – dort ist dein Gewinn maximal und konstant.</p>
      </div>
    ),
  },
  {
    id: 'limits',
    title: 'Hinweise &amp; Grenzen',
    content: (
      <div className="space-y-3">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Auszahlungs-Diagramm zeigt den Wert <strong>bei Verfall</strong>. Zwischendrin ist die Position über den Optionspreis bewegungsabhängig.</li>
          <li>Keine Vega/Theta-Aussage über die Strategie – nutze dafür den Calculator pro Leg.</li>
          <li>Kein Margin-Modell – die tatsächliche Margin-Anforderung beim Broker kann höher sein als das hier berechnete Max Loss.</li>
          <li>Steuerliche Aspekte (z.B. Stillhalter-Geschäfte vs. Termingeschäfte) sind nicht abgebildet.</li>
          <li>Das Tool ist eine <em>Bewertungs- und Visualisierungshilfe</em>, kein Trade-Signal. Eigene Risikoabwägung bleibt nötig.</li>
        </ul>
      </div>
    ),
  },
];

// ============================================================================
// Calculation engine
// ============================================================================

function legInitialCF(leg) {
  if (leg.position === 0 || leg.type === 'none') return 0;
  return -leg.position * leg.premium;
}

function legValueAtS(leg, S) {
  if (leg.position === 0 || leg.type === 'none') return 0;
  if (leg.type === 'underlying') return leg.position * S;
  if (leg.type === 'call') return leg.position * Math.max(S - leg.strike, 0);
  if (leg.type === 'put')  return leg.position * Math.max(leg.strike - S, 0);
  return 0;
}

function legPnL(leg, S) {
  return legInitialCF(leg) + legValueAtS(leg, S);
}

function totalPnL(legs, S) {
  return legs.reduce((sum, l) => sum + legPnL(l, S), 0);
}

function netCashFlow(legs) {
  return legs.reduce((sum, l) => sum + legInitialCF(l), 0);
}

// Slopes at the two tails: at S→0 (left) and S→∞ (right)
function strategySlopes(legs) {
  let slopeLeft = 0, slopeRight = 0;
  legs.forEach(l => {
    if (l.position === 0 || l.type === 'none') return;
    if (l.type === 'underlying') {
      slopeLeft += l.position;
      slopeRight += l.position;
    } else if (l.type === 'call') {
      slopeRight += l.position; // ITM on right side
    } else if (l.type === 'put') {
      slopeLeft -= l.position;  // ITM on left side
    }
  });
  return { slopeLeft, slopeRight };
}

function analyzeStrategy(legs, spot) {
  const active = legs.filter(l => l.position !== 0 && l.type !== 'none');
  if (active.length === 0) {
    return { maxProfit: 0, maxLoss: 0, breakevens: [], rr: null,
             profitUnbounded: false, lossUnbounded: false, isEmpty: true };
  }

  // Critical points: 0, all strikes, plus far-out values for tail behaviour
  const strikes = active.map(l => l.strike).filter(s => s > 0);
  const minK = strikes.length ? Math.min(...strikes) : spot;
  const maxK = strikes.length ? Math.max(...strikes) : spot;
  const range = Math.max(maxK - minK, spot * 0.2, 10);
  const points = [...new Set([0, ...strikes, maxK + range, maxK + range * 5])]
    .sort((a, b) => a - b);

  const pnls = points.map(s => ({ s, pnl: totalPnL(legs, s) }));

  const { slopeLeft, slopeRight } = strategySlopes(legs);

  let maxProfit = Math.max(...pnls.map(p => p.pnl));
  let maxLoss  = Math.min(...pnls.map(p => p.pnl));

  const profitUnbounded = slopeRight > 0;
  const lossUnbounded   = slopeRight < 0;

  // If profit is unbounded on the right, don't include the far-right sample point
  // in maxLoss check (since maxLoss is the floor)
  // Already handled because at far-right we'd have a high P/L if slope is +.

  // Break-evens between adjacent critical points
  const breakevens = [];
  for (let i = 0; i < pnls.length - 1; i++) {
    const p1 = pnls[i], p2 = pnls[i + 1];
    if ((p1.pnl < 0 && p2.pnl > 0) || (p1.pnl > 0 && p2.pnl < 0)) {
      const s0 = p1.s - p1.pnl * (p2.s - p1.s) / (p2.pnl - p1.pnl);
      if (s0 >= 0) breakevens.push(s0);
    } else if (p1.pnl === 0) {
      breakevens.push(p1.s);
    }
  }

  let rr = null;
  if (!profitUnbounded && !lossUnbounded && maxProfit > 0 && maxLoss < 0) {
    rr = Math.abs(maxLoss) / maxProfit;
  }

  return { maxProfit, maxLoss, breakevens, rr, profitUnbounded, lossUnbounded, isEmpty: false };
}

function generateChartData(legs, spot) {
  const active = legs.filter(l => l.position !== 0 && l.type !== 'none');
  const strikes = active.map(l => l.strike).filter(s => s > 0);

  let sMin, sMax;
  if (strikes.length === 0) {
    sMin = spot * 0.4;
    sMax = spot * 1.6;
  } else {
    const minK = Math.min(...strikes, spot);
    const maxK = Math.max(...strikes, spot);
    const pad  = Math.max((maxK - minK) * 0.4, spot * 0.15, 5);
    sMin = Math.max(0.01, minK - pad);
    sMax = maxK + pad;
  }

  const steps = 120;
  const step = (sMax - sMin) / steps;
  const data = [];
  for (let i = 0; i <= steps; i++) {
    const S = sMin + i * step;
    const pnl = totalPnL(legs, S);
    data.push({
      S,
      pnl,
      profitArea: pnl > 0 ? pnl : 0,
      lossArea:   pnl < 0 ? pnl : 0,
    });
  }
  return data;
}

// ============================================================================
// Preset / URL helpers
// ============================================================================

function applyPreset(presetId, spot) {
  const preset = STRATEGIES.find(s => s.id === presetId);
  const empty = { position: 0, type: 'none', strike: 0, premium: 0 };
  if (!preset || !preset.template) {
    return [empty, empty, empty, empty];
  }
  const legs = [];
  for (let i = 0; i < 4; i++) {
    if (i < preset.template.length) {
      const t = preset.template[i];
      legs.push({
        position: t.position,
        type: t.type,
        strike: t.type === 'underlying' ? 0 : Math.max(1, Math.round((spot + t.strikeOffset) * 100) / 100),
        premium: t.type === 'underlying' ? spot + t.strikeOffset : t.premiumGuess,
      });
    } else {
      legs.push({ ...empty });
    }
  }
  return legs;
}

function readInitialFromURL() {
  const defaults = {
    spot: 100,
    presetId: 'iron-condor',
    legs: applyPreset('iron-condor', 100),
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const p = new URLSearchParams(window.location.search);
    if (!p.has('sb_p') && !p.has('sb_s')) return defaults;

    const spot = parseFloat(p.get('sb_s')) || defaults.spot;
    const presetId = p.get('sb_p') || 'custom';
    const legs = [];
    for (let i = 1; i <= 4; i++) {
      const raw = p.get(`sb_l${i}`);
      if (raw) {
        const [pos, type, strike, prem] = raw.split(',');
        legs.push({
          position: parseInt(pos) || 0,
          type: type || 'none',
          strike: parseFloat(strike) || 0,
          premium: parseFloat(prem) || 0,
        });
      } else {
        legs.push({ position: 0, type: 'none', strike: 0, premium: 0 });
      }
    }
    return { spot, presetId, legs };
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
    p.set('sb_s', String(state.spot));
    p.set('sb_p', state.presetId);
    state.legs.forEach((leg, i) => {
      p.set(`sb_l${i + 1}`, `${leg.position},${leg.type},${leg.strike},${leg.premium}`);
    });
    window.history.replaceState({}, '', `?${p.toString()}`);
  } catch {}
}

// ============================================================================
// Sub-components
// ============================================================================

function FormatMoney({ value, signed = true, precision = 2 }) {
  if (!Number.isFinite(value)) return <span>–</span>;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const abs = Math.abs(value).toFixed(precision);
  return <span className="font-mono tabular-nums">{signed ? sign : ''}{abs} $</span>;
}

function LegEditor({ legs, onLegChange, spot }) {
  const updateLeg = (idx, changes) => {
    onLegChange(idx, { ...legs[idx], ...changes });
  };

  const renderLegFields = (leg, idx, isMobile) => {
    const isInactive = leg.position === 0 || leg.type === 'none';
    const isUnderlying = leg.type === 'underlying';

    const positionSelect = (
      <select
        value={leg.position}
        onChange={e => updateLeg(idx, { position: parseInt(e.target.value) })}
        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-sm text-slate-200 focus:border-cyan-700 focus:outline-none min-h-[36px]"
      >
        <option value={1}>Long</option>
        <option value={0}>Keine</option>
        <option value={-1}>Short</option>
      </select>
    );

    const typeSelect = (
      <select
        value={leg.type}
        onChange={e => {
          const newType = e.target.value;
          const changes = { type: newType };
          // Reset strike/premium sensibly when switching type
          if (newType === 'none') {
            changes.position = 0;
          } else if (newType === 'underlying') {
            changes.strike = 0;
            if (!leg.premium) changes.premium = spot;
          } else if ((leg.type === 'underlying' || leg.type === 'none') && !leg.strike) {
            changes.strike = spot;
            changes.premium = leg.premium || 1.0;
          }
          updateLeg(idx, changes);
        }}
        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-sm text-slate-200 focus:border-cyan-700 focus:outline-none min-h-[36px]"
      >
        <option value="none">–</option>
        <option value="call">Call</option>
        <option value="put">Put</option>
        <option value="underlying">Underlying</option>
      </select>
    );

    const strikeInput = (
      <input
        type="number"
        value={leg.strike || ''}
        onChange={e => updateLeg(idx, { strike: parseFloat(e.target.value) || 0 })}
        step="0.5"
        disabled={isInactive || isUnderlying}
        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-sm text-slate-200 font-mono focus:border-cyan-700 focus:outline-none disabled:opacity-30 min-h-[36px]"
        placeholder="–"
      />
    );

    const premiumInput = (
      <input
        type="number"
        value={leg.premium || ''}
        onChange={e => updateLeg(idx, { premium: parseFloat(e.target.value) || 0 })}
        step={isUnderlying ? '1' : '0.05'}
        disabled={isInactive}
        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-2 text-sm text-slate-200 font-mono focus:border-cyan-700 focus:outline-none disabled:opacity-30 min-h-[36px]"
        placeholder="–"
      />
    );

    if (isMobile) {
      const opacity = isInactive ? 'opacity-60' : '';
      return (
        <div key={idx} className={`bg-slate-950/40 border border-slate-800 rounded-lg p-3 mb-2 ${opacity}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-cyan-400/80 font-semibold">Leg {idx + 1}</span>
            {leg.position !== 0 && leg.type !== 'none' && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: leg.position > 0 ? 'rgba(52, 211, 153, 0.12)' : 'rgba(244, 114, 182, 0.12)',
                      color: leg.position > 0 ? '#34d399' : '#f472b6',
                      border: `1px solid ${leg.position > 0 ? 'rgba(52,211,153,0.3)' : 'rgba(244,114,182,0.3)'}`,
                    }}>
                {leg.position > 0 ? 'Long' : 'Short'} {leg.type === 'call' ? 'Call' : leg.type === 'put' ? 'Put' : 'Stock'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase text-slate-500 block mb-1">Position</label>
              {positionSelect}
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-500 block mb-1">Type</label>
              {typeSelect}
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-500 block mb-1">Strike</label>
              {strikeInput}
            </div>
            <div>
              <label className="text-[10px] uppercase text-slate-500 block mb-1">
                {isUnderlying ? 'Einstand' : 'Prämie'}
              </label>
              {premiumInput}
            </div>
          </div>
        </div>
      );
    }

    // Desktop: row
    const opacity = isInactive ? 'opacity-50' : '';
    return (
      <div key={idx} className={`grid grid-cols-[70px_1fr_1fr_1fr_1fr] gap-3 items-center py-2 border-b border-slate-800/40 last:border-b-0 ${opacity}`}>
        <div className="text-xs uppercase tracking-wider text-cyan-400/70 font-semibold">Leg {idx + 1}</div>
        {positionSelect}
        {typeSelect}
        {strikeInput}
        {premiumInput}
      </div>
    );
  };

  return (
    <div>
      {/* Mobile: cards */}
      <div className="sm:hidden">
        {legs.map((leg, idx) => renderLegFields(leg, idx, true))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block">
        {/* Header */}
        <div className="grid grid-cols-[70px_1fr_1fr_1fr_1fr] gap-3 mb-2 px-1 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          <div></div>
          <div>Position</div>
          <div>Type</div>
          <div>Strike</div>
          <div>Prämie / Einstand</div>
        </div>
        {legs.map((leg, idx) => renderLegFields(leg, idx, false))}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const pnl = item.pnl;
  const cls = pnl > 0 ? 'text-emerald-300' : pnl < 0 ? 'text-rose-400' : 'text-slate-300';
  return (
    <div className="bg-slate-950/95 border border-slate-700 rounded px-2.5 py-1.5 text-xs shadow-xl">
      <div className="text-slate-400">Underlying: <span className="font-mono text-slate-200">{item.S.toFixed(2)} $</span></div>
      <div className={cls}>P/L: <span className="font-mono">{pnl > 0 ? '+' : ''}{pnl.toFixed(2)} $</span></div>
    </div>
  );
}

// ============================================================================
// Main component
// ============================================================================

export default function StrategyBuilder() {
  const initial = useMemo(() => readInitialFromURL(), []);

  const [spot, setSpot]         = useState(initial.spot);
  const [presetId, setPresetId] = useState(initial.presetId);
  const [legs, setLegs]         = useState(initial.legs);

  // URL sync
  useEffect(() => {
    writeToURL({ spot, presetId, legs });
  }, [spot, presetId, legs]);

  const handlePresetChange = (newId) => {
    setPresetId(newId);
    if (newId !== 'custom') {
      setLegs(applyPreset(newId, spot));
    }
  };

  const handleSpotChange = (newSpot) => {
    setSpot(newSpot);
  };

  const handleLegChange = (idx, newLeg) => {
    const newLegs = [...legs];
    newLegs[idx] = newLeg;
    setLegs(newLegs);
  };

  const resetToPreset = () => {
    if (presetId !== 'custom') {
      setLegs(applyPreset(presetId, spot));
    }
  };

  // === Computations ===
  const analysis    = useMemo(() => analyzeStrategy(legs, spot), [legs, spot]);
  const chartData   = useMemo(() => generateChartData(legs, spot), [legs, spot]);
  const netCF       = useMemo(() => netCashFlow(legs), [legs]);
  const currentPnL  = useMemo(() => totalPnL(legs, spot), [legs, spot]);

  const activeLegCount = legs.filter(l => l.position !== 0 && l.type !== 'none').length;
  const selectedPreset = STRATEGIES.find(s => s.id === presetId) || STRATEGIES[0];

  const strikesForChart = legs
    .filter(l => l.position !== 0 && l.type !== 'none' && l.type !== 'underlying' && l.strike > 0)
    .map(l => l.strike);

  return (
    <>
      {/* ============ STRATEGIE + KENNZAHLEN (2-col grid like Calculator) ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

        {/* === LEFT: Strategy selector + Spot slider === */}
        <section className="lg:col-span-2 bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5">
          <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold mb-3">Strategie</h2>

          <select
            value={presetId}
            onChange={e => handlePresetChange(e.target.value)}
            className="w-full bg-slate-950 text-cyan-300 font-mono border border-slate-800 rounded px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all"
          >
            {Object.entries(STRATEGY_CATEGORIES).map(([catId, catLabel]) => (
              <optgroup key={catId} label={catLabel}>
                {STRATEGIES.filter(s => s.category === catId).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </optgroup>
            ))}
          </select>

          {selectedPreset.description && (
            <p className="text-xs text-slate-500 mt-2 mb-1 leading-relaxed">{selectedPreset.description}</p>
          )}

          <div className="mt-4">
            <NumSlider
              label="Underlying-Preis"
              value={spot}
              onChange={handleSpotChange}
              step={1}
              suffix="$"
              min={1}
              max={1500}
              logarithmic
            />
          </div>
        </section>

        {/* === RIGHT: Kennzahlen table === */}
        <section className="lg:col-span-3 bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold">Kennzahlen am Verfall</h2>
            <div className="flex gap-4 text-[10px] uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" />Gewinn</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-400" />Verlust</div>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                <th className="text-left py-1.5 px-3 font-medium"></th>
                <th className="text-right py-1.5 px-3 font-medium">Wert</th>
                <th className="text-left py-1.5 px-3 font-medium text-slate-600 font-normal normal-case tracking-normal italic hidden sm:table-cell">Beschreibung</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* Max Profit - highlighted */}
              <tr className="border-t border-slate-800/60 bg-slate-950/40">
                <td className="py-2.5 px-3 font-bold text-slate-200">Max Profit</td>
                <td className="font-mono text-right py-2.5 px-3 tabular-nums text-emerald-300">
                  {analysis.profitUnbounded ? '∞' : analysis.isEmpty ? '—' :
                    <FormatMoney value={analysis.maxProfit} />}
                </td>
                <td className="text-xs text-slate-500 px-3 hidden sm:table-cell">Bestmöglicher Gewinn bei Verfall</td>
              </tr>

              {/* Max Loss - highlighted */}
              <tr className="border-t border-slate-800/60 bg-slate-950/40">
                <td className="py-2.5 px-3 font-bold text-slate-200">Max Loss</td>
                <td className="font-mono text-right py-2.5 px-3 tabular-nums text-rose-400">
                  {analysis.lossUnbounded ? '−∞' : analysis.isEmpty ? '—' :
                    <FormatMoney value={analysis.maxLoss} />}
                </td>
                <td className="text-xs text-slate-500 px-3 hidden sm:table-cell">Schlimmster Fall bei Verfall</td>
              </tr>

              {/* Break-Evens */}
              <tr className="border-t border-slate-800/60">
                <td className="py-2.5 px-3 font-medium text-slate-300">Break-Evens</td>
                <td className="font-mono text-right py-2.5 px-3 tabular-nums text-cyan-300">
                  {analysis.breakevens.length === 0
                    ? <span className="text-slate-500">—</span>
                    : analysis.breakevens.map(b => b.toFixed(2)).join(' / ') + ' $'}
                </td>
                <td className="text-xs text-slate-500 px-3 hidden sm:table-cell">Spot-Preise mit P/L = 0</td>
              </tr>

              {/* Reward / Risk */}
              <tr className="border-t border-slate-800/60">
                <td className="py-2.5 px-3 font-medium text-slate-300">Reward / Risk</td>
                <td className="font-mono text-right py-2.5 px-3 tabular-nums text-slate-300">
                  {analysis.rr === null ? <span className="text-slate-500">—</span> : `1 : ${analysis.rr.toFixed(2)}`}
                </td>
                <td className="text-xs text-slate-500 px-3 hidden sm:table-cell">Verlust pro Gewinn-Dollar</td>
              </tr>

              {/* Netto-Kapital */}
              <tr className="border-t border-slate-800/60">
                <td className="py-2.5 px-3 font-medium text-slate-300">Netto-Kapital</td>
                <td className={`font-mono text-right py-2.5 px-3 tabular-nums ${
                  netCF > 0 ? 'text-emerald-300' : netCF < 0 ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  <FormatMoney value={netCF} />
                  <span className="text-[10px] text-slate-500 ml-2 font-sans">
                    {netCF > 0 ? '(Credit)' : netCF < 0 ? '(Debit)' : ''}
                  </span>
                </td>
                <td className="text-xs text-slate-500 px-3 hidden sm:table-cell">Geldfluss beim Eröffnen</td>
              </tr>

              {/* Aktueller P/L */}
              <tr className="border-t border-slate-800/60">
                <td className="py-2.5 px-3 font-medium text-slate-300">Aktueller P/L</td>
                <td className={`font-mono text-right py-2.5 px-3 tabular-nums ${
                  currentPnL > 0 ? 'text-emerald-300' : currentPnL < 0 ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  <FormatMoney value={currentPnL} />
                </td>
                <td className="text-xs text-slate-500 px-3 hidden sm:table-cell">Bei Spot {spot.toFixed(2)} $ am Verfall</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      {/* ============ POSITIONEN (Legs) ============ */}
      <section className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold">
            Positionen <span className="text-slate-600 font-normal normal-case tracking-normal ml-1">· {activeLegCount} aktiv</span>
          </h2>
          {presetId !== 'custom' && (
            <button
              onClick={resetToPreset}
              className="text-[11px] uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-slate-800 hover:border-cyan-700 hover:text-cyan-300 text-slate-400 transition-colors flex items-center gap-1.5"
              title="Auf Preset-Standardwerte zurücksetzen"
            >
              ↺ Reset
            </button>
          )}
        </div>

        <LegEditor legs={legs} onLegChange={handleLegChange} spot={spot} />
      </section>

      {/* ============ AUSZAHLUNGS-DIAGRAMM ============ */}
      <section className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 p-5">
        <h2 className="text-xs uppercase tracking-[0.2em] text-cyan-400/80 font-semibold mb-3">Auszahlungs-Diagramm</h2>

        {analysis.isEmpty ? (
          <div className="h-60 flex items-center justify-center text-slate-500 text-sm">
            Wähle eine Strategie oder konfiguriere mindestens ein Leg, um das Diagramm zu sehen.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={chartData} margin={{ top: 16, right: 20, bottom: 12, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="S"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={v => v.toFixed(0)}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(0)}`}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<ChartTooltip />} />

                <Area type="monotone" dataKey="profitArea" stroke="none" fill="#10b981" fillOpacity={0.16} isAnimationActive={false} />
                <Area type="monotone" dataKey="lossArea"   stroke="none" fill="#f43f5e" fillOpacity={0.18} isAnimationActive={false} />

                <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />

                {/* Strike markers */}
                {strikesForChart.map((k, i) => (
                  <ReferenceLine key={`k-${i}`} x={k} stroke="#475569" strokeDasharray="2 4" strokeWidth={1} />
                ))}

                {/* Spot */}
                <ReferenceLine
                  x={spot}
                  stroke="#06b6d4"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: `Spot ${spot.toFixed(0)}`, position: 'top', fill: '#06b6d4', fontSize: 11 }}
                />

                {/* Break-evens */}
                {analysis.breakevens.map((b, i) => (
                  <ReferenceLine
                    key={`be-${i}`}
                    x={b}
                    stroke="#c084fc"
                    strokeDasharray="3 3"
                    strokeWidth={1.3}
                    label={{ value: `BE ${b.toFixed(1)}`, position: 'top', fill: '#c084fc', fontSize: 10 }}
                  />
                ))}

                <Line type="monotone" dataKey="pnl" stroke="#06b6d4" strokeWidth={2.4} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
              X-Achse: Underlying-Preis am Verfallstag. Y-Achse: P/L der gesamten Position.
              Grüne Fläche = Gewinn, rote Fläche = Verlust. Cyan-gestrichelt: aktueller Spot. Lila-gestrichelt: Break-Evens.
              Strikes der Legs als graue Linien.
            </div>
          </>
        )}
      </section>
    </>
  );
}
