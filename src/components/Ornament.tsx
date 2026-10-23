import { useId, type ReactNode } from 'react';

const pearls = Array.from({ length: 32 }, (_, i) => {
  const t = i / 31;
  return { x: 37 + 19 * Math.sin(t * Math.PI * 2.3), y: 5 + t * 164 };
});

export function PearlStrand({ className = '' }: { className?: string }) {
  const id = useId();
  return (
    <svg className={`pearl-strand ${className}`} viewBox="0 0 74 174" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="32%" cy="25%" r="76%">
          <stop stopColor="#fff" />
          <stop offset=".38" stopColor="#f0eeea" />
          <stop offset=".72" stopColor="#c3c1bd" />
          <stop offset="1" stopColor="#858582" />
        </radialGradient>
      </defs>
      {pearls.map(({ x, y }, i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3.6"
          fill={`url(#${id})`}
          stroke="#92928d"
          strokeWidth=".25"
        />
      ))}
    </svg>
  );
}

export function Chandelier({ className = '' }: { className?: string }) {
  return (
    <svg className={`chandelier ${className}`} viewBox="0 0 140 188" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M70 0V41M66 9h8M66 20h8M66 31h8M64 43h12M70 43v80M64 57h12M60 73h20M65 106h10M62 123h16" />
        <path d="M70 76C58 76 58 106 44 106C32 106 29 97 29 91M70 76C82 76 82 106 96 106C108 106 111 97 111 91M70 102C55 102 52 132 31 132C15 132 13 119 13 111M70 102C85 102 88 132 109 132C125 132 127 119 127 111M70 116C54 116 54 149 44 149C34 149 33 141 33 136M70 116C86 116 86 149 96 149C106 149 107 141 107 136" />
        <path d="M22 91h14M104 91h14M6 111h14M120 111h14M26 136h14M100 136h14M63 73h14M29 80v11M111 80v11M13 100v11M127 100v11M33 125v11M107 125v11M70 62v11" />
        <path d="M29 70c-5 7-4 10 0 10s5-3 0-10ZM111 70c-5 7-4 10 0 10s5-3 0-10ZM13 90c-5 7-4 10 0 10s5-3 0-10ZM127 90c-5 7-4 10 0 10s5-3 0-10ZM33 115c-5 7-4 10 0 10s5-3 0-10ZM107 115c-5 7-4 10 0 10s5-3 0-10ZM70 52c-5 7-4 10 0 10s5-3 0-10Z" />
        <path
          d="M29 106q41 28 82 0M13 130q57 44 114 0M44 149q26 24 52 0M70 145v23M44 118v10M96 118v10M31 143v12M109 143v12"
          strokeDasharray="1 3"
        />
      </g>
      <g fill="currentColor">
        <path d="m70 165 4 8-4 8-4-8ZM44 127l3 6-3 6-3-6ZM96 127l3 6-3 6-3-6ZM31 154l3 6-3 6-3-6ZM109 154l3 6-3 6-3-6Z" />
        <circle cx="70" cy="45" r="3" />
      </g>
    </svg>
  );
}
export function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="section-label">
      <span>Розділ {number}</span>
      <span>{children}</span>
    </div>
  );
}
