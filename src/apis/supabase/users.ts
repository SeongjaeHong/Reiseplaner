import supabase from '@/supabaseClient';
import { usersSchema } from './users.types';
import { ApiError } from '@/errors/ApiError';
import { signIn } from './auth';

export const updateUserName = async (id: string, name: string) => {
  const { error } = await supabase.from('users').update({ name }).eq('user_id', id);
  if (error) {
    throw error;
  }
};

export const getUser = async () => {
  const { data, error } = await supabase.from('users').select().single();

  if (error) {
    throw error;
  }

  const res = usersSchema.safeParse(data);
  if (!res.success) {
    throw new ApiError('VALIDATION', { cause: res.error });
  }

  return res.data;
};

export const isGuestId = (id: string | undefined) => {
  const guestId = (import.meta.env.VITE_GUEST_ID as string) ?? '';

  return id === guestId;
};

export const signInGuestId = async () => {
  const email = import.meta.env.VITE_GUEST_EMAIL as string;
  const password = import.meta.env.VITE_GUEST_PASSWORD as string;

  if (!email || !password) {
    throw new Error('Guest information is missing.');
  }

  await signIn(email, password);
};
