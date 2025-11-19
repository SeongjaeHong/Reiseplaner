import { createRootRoute, Outlet } from '@tanstack/react-router';

const RootLayout = () => (
  <>
    <div className='flex items-center w-screen h-20 pl-5 bg-reiseblue'>
      <h1 className='font-bold text-5xl'>Reiseplaner</h1>
    </div>
    <div className='m-5'>
      <Outlet />
    </div>
  </>
);

export const Route = createRootRoute({ component: RootLayout });
