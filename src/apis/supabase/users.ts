import supabase from '@/supabaseClient';
import { usersSchema } from './users.types';
import { ApiError } from '@/errors/ApiError';
import { signIn } from './auth';
import { GuestError, type GuestGuardErrorType } from '@/errors/GuestError';

export const updateUserName = async (id: string, name: string) => {
  _guestGuard('UPDATE');

  const { error } = await supabase.from('users').update({ name }).eq('user_id', id);
  if (error) {
    throw error;
  }
};

export const getUser = async (id: string) => {
  const { data, error } = await supabase.from('users').select().eq('user_id', id).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new ApiError('DATABASE', { message: `No matches found in the DB: ${id}` });
  }

  const res = usersSchema.safeParse(data);
  if (!res.success) {
    throw new ApiError('VALIDATION', { cause: res.error });
  }

  return res.data;
};

export const signInGuestId = async () => {
  const email = import.meta.env.VITE_GUEST_EMAIL as string;
  const password = import.meta.env.VITE_GUEST_PASSWORD as string;

  if (!email || !password) {
    throw new Error('Guest information is missing.');
  }

  await signIn(email, password);
};

export const isGuestId = () => {
  const userId = _userId.userId;
  const guestId = (import.meta.env.VITE_GUEST_ID as string) ?? '';

  return userId === guestId;
};

// userId is set in AuthProvider component
export const _userId = { userId: null as string | null };

export const _guestGuard = (type: GuestGuardErrorType, message?: string) => {
  if (isGuestId()) {
    throw new GuestError(type, message);
  }
};
