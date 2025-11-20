import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { INDEX } from './-constant';

const RootLayout = () => (
  <>
    <div className='flex items-center w-screen h-20 pl-5 bg-reiseblue'>
      <Link to={INDEX}>
        <h1 className='font-bold text-5xl'>Reiseplaner</h1>
      </Link>
    </div>
    <div className='m-5'>
      <Outlet />
    </div>
  </>
);

export const Route = createRootRoute({ component: RootLayout });
