import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/global.css';
import './styles/mobile-layout.css';
import App from './App';
import './styles/pearl-editorial.css';

const DevAgentation = import.meta.env.DEV
  ? React.lazy(() => import('./components/DevelopmentTools'))
  : null;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    {DevAgentation && (
      <React.Suspense fallback={null}>
        <DevAgentation />
      </React.Suspense>
    )}
  </React.StrictMode>,
);
