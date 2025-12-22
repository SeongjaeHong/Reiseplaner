import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { INDEX } from './-constant';
import PageNotFound from '@/errors/PageNotFound';

const RootLayout = () => (
  <>
    <div className='bg-reiseblue flex h-20 items-center pl-5'>
      <Link to={INDEX}>
        <h1 className='text-5xl font-bold'>Reiseplaner</h1>
      </Link>
    </div>
    <div className='m-5'>
      <Outlet />
    </div>
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: () => <PageNotFound />,
});
