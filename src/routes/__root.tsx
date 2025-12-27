import { createRootRouteWithContext, Outlet, useNavigate } from '@tanstack/react-router';
import PageNotFound from '@/errors/PageNotFound';
import type { RouterContext } from '@/main';
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/components/auth/AuthContext';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: () => <PageNotFound />,
});

function RootLayout() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (user) {
      void navigate({ to: '/' });
    } else {
      void navigate({ to: '/signin' });
    }
  }, [user, loading, navigate]);

  return <Outlet />;
}
