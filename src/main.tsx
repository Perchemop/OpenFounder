import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Register the offline shell only in production builds; the dev server must
// never serve a stale cached bundle to the person editing it.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(new URL('sw.js', document.baseURI).href)
      .catch((error) => console.warn('Service worker registration failed:', error));
  });
}

/**
 * Visual-evidence hook. Appending `?__forceError=1` renders the *real* error
 * boundary so the error state can be captured as a CI artefact (guide §II.27.12,
 * which asks for the empty *and* error states). It is inert without the query
 * parameter, so it cannot affect a normal visit. See `tests/visual.spec.ts`.
 */
function ForceRenderError(): never {
  throw new Error('Simulated render failure for visual evidence');
}

const forceError =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('__forceError') === '1';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="OpenFounder crashed">
      {forceError ? <ForceRenderError /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);
