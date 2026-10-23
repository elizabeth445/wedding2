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

export function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="section-label">
      <span>Розділ {number}</span>
      <span>{children}</span>
    </div>
  );
}
