import { useId, type ReactNode } from 'react';

type PearlVariant = 'cascade' | 'garland' | 'timeline';
const layouts = {
  cascade: {
    width: 200,
    height: 1000,
    count: 86,
    radius: 6.2,
    point: (t: number) => ({ x: 100 + 74 * Math.sin(t * Math.PI * 3.2), y: 12 + 976 * t }),
  },
  garland: {
    width: 1000,
    height: 180,
    count: 59,
    radius: 8.8,
    point: (t: number) => ({ x: 12 + 976 * t, y: 28 + 112 * Math.sin(t * Math.PI) }),
  },
  timeline: {
    width: 220,
    height: 1200,
    count: 125,
    radius: 6.4,
    point: (t: number) => ({ x: 110 + 76 * Math.sin(t * Math.PI * 6), y: 12 + 1176 * t }),
  },
};
function strandPoints(variant: PearlVariant) {
  const layout = layouts[variant];
  const curve = Array.from({ length: 501 }, (_, i) => layout.point(i / 500));
  const distances = [0];
  for (let i = 1; i < curve.length; i++)
    distances.push(
      distances[i - 1] + Math.hypot(curve[i].x - curve[i - 1].x, curve[i].y - curve[i - 1].y),
    );
  let segment = 1;
  return Array.from({ length: layout.count }, (_, i) => {
    const distance = (i * distances[500]) / (layout.count - 1);
    while (segment < 500 && distances[segment] < distance) segment++;
    const ratio =
      (distance - distances[segment - 1]) / (distances[segment] - distances[segment - 1]);
    return {
      x: curve[segment - 1].x + ratio * (curve[segment].x - curve[segment - 1].x),
      y: curve[segment - 1].y + ratio * (curve[segment].y - curve[segment - 1].y),
    };
  });
}
const strands = {
  cascade: strandPoints('cascade'),
  garland: strandPoints('garland'),
  timeline: strandPoints('timeline'),
};
export function PearlStrand({
  className = '',
  variant = 'cascade',
}: {
  className?: string;
  variant?: PearlVariant;
}) {
  const id = useId();
  const layout = layouts[variant];
  return (
    <div className={`pearl-strand pearl-${variant} ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${layout.width} ${layout.height}`} fill="none">
        <defs>
          <radialGradient id={id} cx="30%" cy="24%" r="78%">
            <stop stopColor="#fffef9" />
            <stop offset=".38" stopColor="#f2eadb" />
            <stop offset=".74" stopColor="#c4b8a4" />
            <stop offset="1" stopColor="#7a7163" />
          </radialGradient>
        </defs>
        <path
          d={strands[variant]
            .map(({ x, y }, i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
            .join(' ')}
          stroke="#9c8d76"
          strokeWidth="1"
        />
        {strands[variant].map(({ x, y }, i) => (
          <g key={i}>
            <circle cx={x + 0.8} cy={y + 1.3} r={layout.radius} fill="#3d30252b" />
            <circle
              cx={x}
              cy={y}
              r={layout.radius}
              fill={`url(#${id})`}
              stroke="#8e826e"
              strokeWidth=".35"
            />
            <circle
              cx={x - layout.radius * 0.28}
              cy={y - layout.radius * 0.34}
              r={layout.radius * 0.2}
              fill="#fff"
              opacity=".7"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
export function SectionLabel({ children }: { number?: string; children: ReactNode }) {
  return <p className="section-label">{children}</p>;
}
