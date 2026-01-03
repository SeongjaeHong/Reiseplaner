import { createRouter, RouterProvider } from '@tanstack/react-router';
import { useAuth, type AuthState } from './components/auth/AuthContext';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PageNotFound from './errors/PageNotFound';
import { routeTree } from './routeTree.gen';

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
  queryClient: QueryClient;
};

const router = createRouter({
  routeTree,
  context: { auth: undefined as unknown as RouterContext['auth'], queryClient },
  defaultNotFoundComponent: () => <PageNotFound />,
});

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth: { user, loading }, queryClient }} />
    </QueryClientProvider>
  );
}
