import { AuthContext } from '@/components/auth/AuthContext';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useContext, useReducer } from 'react';
import { FaPen, FaRightFromBracket, FaUser } from 'react-icons/fa6';

export const Route = createFileRoute('/(private)')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useContext(AuthContext);
  const [showBox, toggleShowBox] = useReducer((prev) => !prev, false);

  const name = (user?.user_metadata?.display_name as string) ?? user?.email;
  return (
    <>
      <div className='bg-reiseblue flex h-20 items-center justify-between px-5'>
        <Link to={'/'}>
          <h1 className='text-5xl font-bold max-[430px]:text-4xl'>Reiseplaner</h1>
        </Link>
        <div className='flex items-center gap-2'>
          <p className='font-bold text-orange-500'>{name}</p>
          {user ? (
            <div className='relative'>
              <button onClick={toggleShowBox} className='bg-reiseorange rounded-full p-2 text-lg'>
                <FaUser />
              </button>
              <div className='absolute -left-52 w-60 rounded-md bg-zinc-600'>
                <ul>
                  <li className='truncate border-b-1 border-zinc-400 px-2 py-1'>{name}</li>
                  <li className='flex items-center gap-2 px-2 py-1 hover:bg-zinc-400'>
                    <FaPen />
                    Change name
                  </li>
                  <li className='flex justify-end px-2 py-1'>
                    <div className='flex items-center gap-2 rounded-lg px-2 hover:bg-zinc-400'>
                      <FaRightFromBracket />
                      Sign out
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button className='bg-reiseorange rounded-lg px-2 py-1 font-bold hover:bg-orange-400'>
              <Link to={'/signin'}>Sign In</Link>
            </button>
          )}
        </div>
      </div>
      <div className='mx-auto mt-10 w-4/5'>
        <Outlet />
      </div>
    </>
  );
}
