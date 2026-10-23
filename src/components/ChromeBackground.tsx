import { lazy, Suspense } from 'react';

const LiquidChrome = lazy(() => import('./effects/LiquidChrome'));

export function ChromeBackground({ active, paused }: { active: boolean; paused: boolean }) {
  return (
    <div className="hero-chrome" aria-hidden="true">
      {active && (
        <Suspense fallback={null}>
          <LiquidChrome
            color="#ffffff"
            speed={paused ? 0 : 0.12}
            amplitude={0.22}
            frequencyX={1.8}
            frequencyY={2.2}
            detail={3}
            thickness={1.8}
            depth={0.65}
            roughness={0.45}
            exposure={1.15}
            interactive={false}
            tilt={0}
            intro={false}
            lightMode={false}
            maxDevicePixelRatio={1}
          />
        </Suspense>
      )}
    </div>
  );
}
