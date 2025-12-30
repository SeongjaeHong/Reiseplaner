import { createRootRouteWithContext, Outlet, useNavigate } from '@tanstack/react-router';
import PageNotFound from '@/errors/PageNotFound';
import type { RouterContext } from '@/main';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: () => <PageNotFound />,
});

function RootLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (user) {
      // 'app-alive' prevents to go back to '/' in case of a page refresh and a tab transition.
      // When a user sign-in with a new account after sign-out another account in the same tab,
      // 'initial-sign-in' tells if this is an initial sign-in with a new account.
      if (!sessionStorage.getItem('app-alive') || sessionStorage.getItem('initial-sign-in')) {
        void navigate({ to: '/' });
      }
    } else {
      void navigate({ to: '/signin' });
    }
  }, [user, loading, navigate]);

  return <Outlet />;
}
