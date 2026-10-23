import type { ReactNode } from 'react';
export function EditorialFlourish({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`editorial-flourish ${className}`}
      viewBox="0 0 142 86"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="flourish-fill"
        d="M10 58C42 58 44 16 76 16C94 16 108 33 132 33V47C108 47 94 29 77 29C50 29 43 70 10 70Z"
      />
      <path d="M10 58C42 58 44 16 76 16C94 16 108 33 132 33M10 70C43 70 50 29 77 29C94 29 108 47 132 47M76 16L77 29" />
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
