import { signOut } from '@/apis/supabase/auth';
import { getUser, isGuestId, updateUserName } from '@/apis/supabase/users';
import { AuthContext } from '@/components/auth/AuthContext';
import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { toast } from '@/components/common/Toast/toast';
import useClickOutside from '@/utils/useClickOutside';
import type { User } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { useContext, useRef, useState } from 'react';
import { FaPen, FaRightFromBracket, FaUser } from 'react-icons/fa6';

export const Route = createFileRoute('/(private)')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const { user, loading } = context.auth;

    if (loading) {
      // supabase session has not been read yet.
      console.log('Session 로딩 중...');
      return;
    }

    if (!user) {
      return redirect({ to: '/signin' });
    }
  },
});

function RouteComponent() {
  const { user: session } = useContext(AuthContext);
  const { data: user } = useGetUser(session);
  const [showBox, setShowBox] = useState(false);
  const [showNameBox, setShowNameBox] = useState(false);
  const isGuest = isGuestId(user?.user_id);

  const handleChangeName = useChangeUserName(user?.user_id);
  const handleShowNameBox = () => {
    if (isGuest) {
      return;
    }

    setShowBox(true);
  };

  const refOutsideClick = useClickOutside();
  const refProfile = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className='bg-reiseblue flex h-20 items-center justify-between px-5'>
        <Link to={'/'}>
          <h1 className='text-5xl font-bold max-[540px]:text-4xl'>Reiseplaner</h1>
        </Link>
        <div>
          {user ? (
            <div className='relative flex items-center justify-end gap-2 bg-red-500'>
              <p className='max w-50 truncate text-right font-bold text-orange-500 max-[570px]:w-40 max-[540px]:text-sm max-[470px]:w-30 max-[420px]:hidden'>
                {user.name}
              </p>
              <button
                ref={refProfile}
                onClick={() => setShowBox((prev) => !prev)}
                className='bg-reiseorange rounded-full p-2 text-lg'
              >
                <FaUser />
              </button>
              {showBox && (
                <div
                  ref={refOutsideClick(() => setShowBox(false), [refProfile])}
                  className='absolute top-0 -left-52 w-60 rounded-md bg-zinc-600'
                >
                  <ul>
                    <li className='truncate border-b-1 border-zinc-400 px-2 py-1'>{user?.name}</li>
                    <li
                      onClick={handleShowNameBox}
                      className={`flex items-center gap-2 px-2 py-1 ${isGuest ? 'text-zinc-500' : 'cursor-pointer hover:bg-zinc-400'}`}
                    >
                      <FaPen />
                      Change name
                    </li>
                    <li className='flex justify-end px-2 py-1'>
                      <div
                        onClick={() => void signOut()}
                        className='flex cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-zinc-400'
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
