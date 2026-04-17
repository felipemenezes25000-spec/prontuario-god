/**
 * Cannabis sativa folha — woodcut-style botanical illustration.
 * Reduzida ao essencial: 7 folíolos, traço mineral, sem cliché verde.
 */
export function CannabisLeaf({
  className = "",
  size = 120,
  stroke = "currentColor",
}: {
  className?: string;
  size?: number;
  stroke?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Stem */}
      <line x1="100" y1="100" x2="100" y2="180" />
      {/* 7 leaflets — symmetric */}
      <g>
        <path d="M100,100 C95,80 70,40 50,30 C45,55 60,90 100,100 Z" />
        <path d="M100,100 C95,75 60,55 30,55 C30,80 55,105 100,100 Z" />
        <path d="M100,100 C90,90 50,90 25,110 C40,125 75,125 100,100 Z" />
        <path d="M100,100 C95,98 75,140 70,170 C90,160 105,130 100,100 Z" />
        <path d="M100,100 C100,98 100,140 100,180" />
        <path d="M100,100 C105,98 125,140 130,170 C110,160 95,130 100,100 Z" />
        <path d="M100,100 C110,90 150,90 175,110 C160,125 125,125 100,100 Z" />
        <path d="M100,100 C105,75 140,55 170,55 C170,80 145,105 100,100 Z" />
        <path d="M100,100 C105,80 130,40 150,30 C155,55 140,90 100,100 Z" />
      </g>
      {/* Veins */}
      <g opacity="0.5">
        <line x1="100" y1="100" x2="55" y2="40" />
        <line x1="100" y1="100" x2="35" y2="65" />
        <line x1="100" y1="100" x2="35" y2="110" />
        <line x1="100" y1="100" x2="80" y2="160" />
        <line x1="100" y1="100" x2="120" y2="160" />
        <line x1="100" y1="100" x2="165" y2="110" />
        <line x1="100" y1="100" x2="165" y2="65" />
        <line x1="100" y1="100" x2="145" y2="40" />
      </g>
    </svg>
  );
}
