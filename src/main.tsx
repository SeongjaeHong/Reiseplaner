import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from './components/common/Toast/ToastContainer';
import { ErrorBoundary } from 'react-error-boundary';
import UnhandledError from './errors/UnhandledError';
import { logError } from './errors/log';
import { AuthProvider } from './components/auth/AuthProvider';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import PageNotFound from './errors/PageNotFound';
import { routeTree } from './routeTree.gen';
import type { AuthState } from './components/auth/AuthContext';

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _onMutateResult, mutation) => {
      console.error('Mutation Error:', error);
      console.error(mutation);
    },
  }),
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error('Query Error:', error);
      console.error(query);
    },
  }),
});

export type RouterContext = {
  auth: AuthState;
};

const router = createRouter({
  routeTree,
  context: { auth: undefined as unknown as RouterContext['auth'] },
  defaultNotFoundComponent: () => <PageNotFound />,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<UnhandledError />} onError={logError}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
      <ToastContainer />
    </ErrorBoundary>
  </StrictMode>
);
