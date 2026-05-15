/**
 * Pill-style label for Recharts ReferenceLine.
 * Renders a colored rounded rectangle with bold mono text — used for
 * Spot / Strike / Break-even markers on payoff charts.
 *
 * Used as a render prop on ReferenceLine:
 *   <ReferenceLine
 *     x={spot}
 *     label={<RefPillLabel text={`Spot ${spot}`} color="#22d3ee" yOffset={8} />}
 *   />
 *
 * Props:
 *  - text:    string to render inside the pill
 *  - color:   pill background color (use semantically: cyan=spot, lila=BE, etc.)
 *  - yOffset: pixels above the chart top to draw (8 = top of chart, 24 = lower band)
 */
export default function RefPillLabel({ viewBox, text, color, yOffset = 8 }) {
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
}
