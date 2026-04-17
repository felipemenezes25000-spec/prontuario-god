/**
 * Decorative molecular structure of CBD (cannabidiol) — drawn as SVG.
 * Animates stroke-dashoffset on mount for "drawing in" effect.
 *
 * Highly stylized; not chemically perfect, but visually evokes the molecule.
 */
export function CbdMolecule({
  className = "",
  size = 480,
  accent = "currentColor",
  stroke = "currentColor",
}: {
  className?: string;
  size?: number;
  accent?: string;
  stroke?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 480"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Concentric circles like atomic field */}
      <g opacity="0.18">
        <circle cx="240" cy="240" r="220" strokeDasharray="2 6" />
        <circle cx="240" cy="240" r="170" strokeDasharray="1 8" />
        <circle cx="240" cy="240" r="120" />
      </g>

      {/* Hexagonal ring 1 (left) */}
      <g style={{ strokeDasharray: 1000 }} className="animate-drawIn">
        <polygon points="120,200 160,170 220,200 220,260 160,290 120,260" />
        <polygon points="220,200 260,170 320,200 320,260 260,290 220,260" />
        <polygon points="320,200 360,170 410,200 410,260 360,290 320,260" />
      </g>

      {/* Bonds — small lines */}
      <g style={{ strokeDasharray: 600 }} className="animate-drawIn" stroke={accent}>
        <line x1="160" y1="170" x2="160" y2="140" />
        <line x1="160" y1="290" x2="160" y2="320" />
        <line x1="260" y1="170" x2="260" y2="140" />
        <line x1="360" y1="170" x2="360" y2="140" />
        <line x1="120" y1="200" x2="90" y2="180" />
        <line x1="120" y1="260" x2="90" y2="280" />
        <line x1="410" y1="200" x2="440" y2="180" />
        <line x1="410" y1="260" x2="440" y2="280" />
      </g>

      {/* Atoms */}
      <g fill={accent} stroke="none">
        <circle cx="160" cy="140" r="3" />
        <circle cx="260" cy="140" r="3" />
        <circle cx="360" cy="140" r="3" />
        <circle cx="160" cy="320" r="3" />
        <circle cx="90" cy="180" r="3" />
        <circle cx="90" cy="280" r="3" />
        <circle cx="440" cy="180" r="3" />
        <circle cx="440" cy="280" r="3" />
      </g>

      {/* OH groups */}
      <g
        style={{ strokeDasharray: 200 }}
        className="animate-drawIn"
        opacity="0.85"
      >
        <text x="78" y="173" fontSize="11" fill={accent} stroke="none">OH</text>
        <text x="78" y="298" fontSize="11" fill={accent} stroke="none">OH</text>
        <text x="448" y="180" fontSize="11" fill={stroke} stroke="none">OH</text>
        <text x="155" y="135" fontSize="11" fill={stroke} stroke="none">CH₃</text>
      </g>

      {/* Label */}
      <text
        x="240"
        y="430"
        textAnchor="middle"
        fontSize="10"
        letterSpacing="0.3em"
        fill={stroke}
        stroke="none"
        opacity="0.5"
      >
        C₂₁H₃₀O₂ · CANNABIDIOL · MW 314.46
      </text>
    </svg>
  );
}
