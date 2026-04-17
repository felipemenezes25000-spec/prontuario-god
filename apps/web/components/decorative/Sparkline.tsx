/**
 * Tufte-style sparkline. Tiny, dense, no axes.
 * Marca o último ponto com um pequeno círculo + label opcional.
 */
export function Sparkline({
  values,
  width = 160,
  height = 36,
  color = "currentColor",
  showLast = true,
  showRange = false,
  className = "",
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  showLast?: boolean;
  showRange?: boolean;
  className?: string;
}) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const dx = width / Math.max(values.length - 1, 1);
  const points = values.map((v, i) => {
    const x = i * dx;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");

  const lastX = points[points.length - 1]?.[0] ?? 0;
  const lastY = points[points.length - 1]?.[1] ?? 0;
  const lastVal = values[values.length - 1] ?? 0;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      {showRange && (
        <g opacity="0.25">
          <line x1="0" y1="0" x2={width} y2="0" stroke={color} strokeWidth="0.5" />
          <line
            x1="0"
            y1={height}
            x2={width}
            y2={height}
            stroke={color}
            strokeWidth="0.5"
          />
        </g>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      {showLast && (
        <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
      )}
      {showLast && (
        <text
          x={lastX - 6}
          y={lastY - 6}
          textAnchor="end"
          fontSize="9"
          fill={color}
          fontFamily="var(--font-mono)"
        >
          {lastVal.toFixed(1)}
        </text>
      )}
    </svg>
  );
}
