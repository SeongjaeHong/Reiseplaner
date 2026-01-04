import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import PageNotFound from '@/errors/PageNotFound';
import type { RouterContext } from '@/App';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: () => <PageNotFound />,
});

function RootLayout() {
  return <Outlet />;
}
