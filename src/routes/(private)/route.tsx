import { AuthContext } from '@/components/auth/AuthContext';
import supabase from '@/supabaseClient';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useContext } from 'react';

export const Route = createFileRoute('/(private)')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useContext(AuthContext);
  return (
    <>
      <div className='bg-reiseblue flex h-20 items-center justify-between px-5'>
        <Link to={'/'}>
          <h1 className='text-5xl font-bold max-[430px]:text-4xl'>Reiseplaner</h1>
        </Link>
        <div className='flex items-center gap-2'>
          <p className='font-bold'>{user?.email}</p>
          <button className='bg-reiseorange rounded-lg px-2 py-1 font-bold hover:bg-orange-400'>
            {user ? (
              <span onClick={() => void supabase.auth.signOut()}>Sign Out</span>
            ) : (
              <Link to={'/signin'}>Sign In</Link>
            )}
          </button>
        </div>
      </div>
      <div className='mx-auto mt-10 w-4/5'>
        <Outlet />
      </div>
    </>
  );
}
