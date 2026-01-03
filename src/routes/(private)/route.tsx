import { signOut } from '@/apis/supabase/auth';
import { getUser, isGuestId, updateUserName } from '@/apis/supabase/users';
import { useAuth } from '@/components/auth/AuthContext';
import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { toast } from '@/components/common/Toast/toast';
import { GuestError } from '@/errors/GuestError';
import useClickOutside from '@/utils/useClickOutside';
import type { User } from '@supabase/supabase-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { FaPen, FaRightFromBracket, FaUser } from 'react-icons/fa6';

export const Route = createFileRoute('/(private)')({
  component: RouteComponent,
  beforeLoad: () => {
    // Remove 'initial-sign-in' to prevent to come back to '/'
    // by a page refresh or a tab transition.
    sessionStorage.removeItem('initial-sign-in');
  },
});

function RouteComponent() {
  const { user: session } = useAuth();
  const { data: user } = useGetUser(session);
  const [showBox, setShowBox] = useState(false);
  const [showNameBox, setShowNameBox] = useState(false);
  const isGuest = isGuestId();

  const handleChangeName = useChangeUserName(user?.user_id);
  const handleShowNameBox = () => {
    if (isGuest) {
      return;
    }

    setShowNameBox(true);
  };

  const refOutsideClick = useClickOutside();
  const refProfile = useRef<HTMLButtonElement>(null);
  return (
    <>
      <div className='flex h-20 items-center justify-between bg-white px-5'>
        <Link to={'/'}>
          <h1 className='text-4xl font-bold text-black'>REISERPLANER</h1>
        </Link>
        <div>
          {user && (
            <div className='relative flex items-center justify-end gap-2'>
              <p className='max w-50 truncate text-right font-bold text-slate-800 max-[570px]:w-40 max-[540px]:text-sm max-[470px]:w-30 max-[420px]:hidden'>
                {user.name}
              </p>
              <button
                ref={refProfile}
                onClick={() => setShowBox((prev) => !prev)}
                className='bg-primary rounded-full p-2 text-lg'
              >
                <FaUser />
              </button>
              {showBox && (
                <div
                  ref={refOutsideClick(() => setShowBox(false), [refProfile])}
                  className='absolute top-9 z-1 w-60 rounded-md bg-zinc-600'
                >
                  <ul>
                    <li className='truncate border-b-1 border-zinc-400 px-2 py-1'>{user?.name}</li>
                    <li
                      onClick={handleShowNameBox}
                      className={`flex items-center gap-2 px-2 py-1 ${isGuest ? 'text-zinc-500' : 'cursor-pointer hover:bg-zinc-400'}`}
                    >
                      <FaPen />
                      Name ändern
                    </li>
                    <li className='flex justify-end px-2 py-1'>
                      <div
                        onClick={() => void signOut()}
                        className='flex cursor-pointer items-center gap-2 rounded-lg px-2 hover:bg-zinc-400'
                      >
                        <FaRightFromBracket />
                        Abmelden
                      </div>
                    </li>
                  </ul>
                </div>
              )}
              {showNameBox && (
                <InputPopupBox
                  title='Name ändern'
                  onAccept={handleChangeName}
                  onClose={() => setShowNameBox(false)}
                />
              )}
            </div>
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
    queryFn: () => getUser(session?.id ?? ''),
    enabled: !!session,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

const useChangeUserName = (id: string | undefined) => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async (newName: string) => {
      if (!id) {
        throw new Error('User ID is required.');
      }

      return await updateUserName(id, newName);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', id] }),
    onError: (error) => {
      if (error instanceof GuestError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to change a name.');
      }
    },
  });

  return mutate;
};
