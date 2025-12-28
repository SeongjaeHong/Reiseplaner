import { signOut } from '@/apis/supabase/auth';
import { getUser, updateUserName } from '@/apis/supabase/users';
import { AuthContext } from '@/components/auth/AuthContext';
import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { toast } from '@/components/common/Toast/toast';
import useClickOutside from '@/utils/useClickOutside';
import type { User } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useContext, useState } from 'react';
import { FaPen, FaRightFromBracket, FaUser } from 'react-icons/fa6';

export const Route = createFileRoute('/(private)')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user: sessionn } = useContext(AuthContext);
  const { data: user } = useGetUser(sessionn);
  const [showBox, setShowBox] = useState(false);
  const [showNameBox, setShowNameBox] = useState(false);
  const handleChangeName = useChangeUserName(user?.user_id);

  const refOutsideClick = useClickOutside();

  return (
    <>
      <div className='bg-reiseblue flex h-20 items-center justify-between px-5'>
        <Link to={'/'}>
          <h1 className='text-5xl font-bold max-[540px]:text-4xl'>Reiseplaner</h1>
        </Link>
        <div className='flex w-50 items-center justify-end gap-2 max-[540px]:text-sm'>
          <p className='max truncate font-bold text-orange-500 max-[470px]:w-30 max-[420px]:hidden'>
            {user?.name}
          </p>
          {user ? (
            <div className='relative'>
              <button
                onClick={() => setShowBox(true)}
                className='bg-reiseorange rounded-full p-2 text-lg'
              >
                <FaUser />
              </button>
              {showBox && (
                <div
                  ref={refOutsideClick(() => setShowBox(false))}
                  className='absolute -left-52 w-60 rounded-md bg-zinc-600'
                >
                  <ul>
                    <li className='truncate border-b-1 border-zinc-400 px-2 py-1'>{user?.name}</li>
                    <li
                      onClick={() => setShowNameBox(true)}
                      className='flex items-center gap-2 px-2 py-1 hover:bg-zinc-400'
                    >
                      <FaPen />
                      Change name
                    </li>
                    <li className='flex justify-end px-2 py-1'>
                      <div
                        onClick={() => void signOut()}
                        className='flex items-center gap-2 rounded-lg px-2 hover:cursor-pointer hover:bg-zinc-400'
                      >
                        <FaRightFromBracket />
                        Sign out
                      </div>
                    </li>
                  </ul>
                </div>
              )}
              {showNameBox && (
                <InputPopupBox
                  title='Change name'
                  onAccept={handleChangeName}
                  onClose={() => setShowNameBox(false)}
                />
              )}
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

const useGetUser = (session: User | null) => {
  return useQuery({
    queryKey: ['user', session?.id],
    queryFn: getUser,
    enabled: !!session,
  });
};

const useChangeUserName = (id: string | undefined) => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (newName: string) => {
      if (!id) {
        throw new Error('User ID is required');
      }

      return await updateUserName(id, newName);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', id] }),
    onError: () => {
      toast.error('Failed to change a name.');
    },
  });

  return mutate;
};
