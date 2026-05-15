/**
 * Numeric input with a paired range slider.
 * Used by both OptionsCalculator and StrategyBuilder for the signature
 * cyan-glow slider look. The `.ots-range` CSS class is defined globally
 * in App.jsx.
 *
 * Props:
 *  - label:       string shown above the value
 *  - value:       current number
 *  - onChange:    (newValue: number) => void
 *  - step:        step for the number input (default 1)
 *  - suffix:      optional unit string, e.g. "$" or "%"
 *  - min, max:    range bounds (slider hidden if either missing)
 *  - logarithmic: if true, map slider linearly through log-space (good for prices)
 */
export default function NumSlider({ label, value, onChange, step = 1, suffix, min, max, logarithmic = false }) {
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
    <div className="py-2.5 border-b border-slate-800 last:border-b-0 group">
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
}
