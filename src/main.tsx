import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ToastContainer } from './components/common/Toast/ToastContainer';
import { ErrorBoundary } from 'react-error-boundary';
import { logError } from './errors/log';
import { AuthProvider } from './components/auth/AuthProvider';
import { UnhandledError } from './errors/UnhandledError';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={UnhandledError} onError={logError}>
      <AuthProvider>
        <App />
      </AuthProvider>
      <ToastContainer />
    </ErrorBoundary>
  </StrictMode>
);
