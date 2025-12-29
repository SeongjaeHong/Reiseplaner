import { StrictMode, useContext } from 'react';
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
import { useAuth, type AuthState } from './components/auth/AuthContext';

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation Error:', error);
    },
  }),
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query Error:', error);
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

export function RouterContextProvider() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<UnhandledError />} onError={logError}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterContextProvider />
        </QueryClientProvider>
      </AuthProvider>
      <ToastContainer />
    </ErrorBoundary>
  </StrictMode>
);
