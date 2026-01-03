import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { signIn, signInWithOAuth } from '@/apis/supabase/auth';
import z from 'zod';
import { FcGoogle } from 'react-icons/fc';
import { signInGuestId } from '@/apis/supabase/users';
import { toast } from '@/components/common/Toast/toast';

export const Route = createFileRoute('/(public)/signin/')({
  component: RouteComponent,
});

const signInSchema = z.object({
  email: z.email('Not a vaild email format.'),
  password: z.string().min(8, 'Password must be longer than 8 letters.'),
});

function RouteComponent() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });
  const [signinFailed, setSigninFailed] = useState(false);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit(async (value) => {
      try {
        setSigninFailed(false);
        await signIn(value.email, value.password);
      } catch {
        setSigninFailed(true);
      }
    })(e);
  };

  return (
    <div className='fixed top-30 left-1/2 -translate-x-1/2'>
      <h1 className='text-accent mb-8 text-center text-5xl font-bold text-black'>Reiseplaner</h1>
      <div className='w-100 rounded-md bg-white p-8 text-black max-[430px]:w-80'>
        <h1 className='text-center text-xl font-bold'>Sign in to Reiseplaner</h1>
        {signinFailed && (
          <div className='my-5 bg-red-100 p-3'>
            <span className='text-sm'>
              That email and password combination didn't work. Try again.
            </span>
          </div>
        )}
        <form onSubmit={onFormSubmit}>
          <div className='my-7'>
            <label htmlFor='email' className='block text-sm font-bold text-zinc-500'>
              Email
            </label>
            <input
              id='email'
              type='email'
              {...register('email', { required: 'Email is empty.' })}
              autoFocus
              className='transition-ring focus:border-secondary-strong focus:ring-secondary-strong w-full rounded-sm border-1 border-zinc-500 leading-7 duration-300 ease-in outline-none focus:ring-2'
            />
            {errors.email && (
              <div className='absolute'>
                <span className='text-xs text-rose-500'>{errors.email.message}</span>
              </div>
            )}
          </div>
          <div className='my-7'>
            <label htmlFor='password' className='block text-sm font-bold text-zinc-500'>
              Password
            </label>
            <input
              id='password'
              type='password'
              autoComplete='off'
              {...register('password', { required: 'Password is empty.' })}
              className='transition-ring focus:border-secondary-strong focus:ring-secondary-strong w-full rounded-sm border-1 border-zinc-500 leading-7 duration-300 ease-in outline-none focus:ring-2'
            />
            {errors.password && (
              <div className='absolute'>
                <span className='text-xs text-rose-500'>{errors.password.message}</span>
              </div>
            )}
          </div>

          <button
            type='submit'
            className='bg-secondary flex w-full items-center justify-center gap-2 rounded-md py-1 hover:bg-orange-400'
          >
            <span className='text-white'>Sign in</span>
            {isSubmitting && (
              <div className='size-4 animate-spin rounded-full border-[2px] border-t-transparent text-white' />
            )}
          </button>
        </form>

        <p className='my-3 text-center text-zinc-500'>or</p>

        <div className='flex flex-col gap-1'>
          <Link
            to='/signup'
            className='block w-full rounded-md border-1 border-zinc-300 py-1 text-center hover:border-zinc-400'
          >
            <span className='w-full'>Create a new Reiseplaner accout </span>
          </Link>
          <button
            type='button'
            onClick={() => void signInWithOAuth('google')}
            className='relative flex w-full items-center rounded-md border-1 border-zinc-300 py-1 hover:border-zinc-400'
          >
            <span className='absolute left-3 text-lg'>
              <FcGoogle />
            </span>
            <span className='w-full'>Sign in with Google</span>
          </button>
          <button
            type='button'
            onClick={() => void handleSigninGuestId()}
            className='relative flex w-full items-center rounded-md border-1 border-zinc-300 py-1 hover:border-zinc-400'
          >
            <span className='absolute left-3 text-lg'>
              <FcGoogle />
            </span>
            <span className='w-full'>Sign in as a Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const handleSigninGuestId = async () => {
  try {
    await signInGuestId();
  } catch {
    toast.error('Guest sign-in is temporarily unavailable.');
  }
};
