import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PageNotFound from './errors/PageNotFound';
import { ToastContainer } from './components/common/Toast/ToastContainer';
import { ErrorBoundary } from 'react-error-boundary';
import UnhandledError from './errors/UnhandledError';
import { logError } from './errors/log';

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <PageNotFound />,
});
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<UnhandledError />} onError={logError}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
      <ToastContainer />
    </ErrorBoundary>
  </StrictMode>
);
