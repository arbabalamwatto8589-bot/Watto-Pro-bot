import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAntiCopyProtection } from './utils/antiCopyProtection.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Global error handlers to prevent unhandled rejection / DOM warning crashes
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  });

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
  });

  window.onerror = function() {
    return true;
  };
}

// Initialize anti-copy protection safely
initAntiCopyProtection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
