import { signUp } from '@/apis/supabase/auth';
import SimplePopupbox from '@/components/common/popupBoxes/SimplePopupbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

export const Route = createFileRoute('/(public)/signup/')({
  component: RouteComponent,
});

const signUpSchema = z
  .object({
    name: z.string().min(1, 'Name is required.'),
    email: z.email('Not a vaild email format.'),
    password: z.string().min(8, 'Password must be at least 8 letters.'),
    passwordRecheck: z.string(),
  })
  .refine((data) => data.password === data.passwordRecheck, {
    message: 'Passwords are not the same.',
    path: ['passwordRecheck'],
  });

function RouteComponent() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });
  const [showMsg, setShowMsg] = useState(false);
  const navigate = useNavigate();

  const onFormSubmit = (e: React.FormEvent) => {
    void handleSubmit(async (value) => {
      try {
        await signUp(value.name, value.email, value.password);
        void navigate({ to: '/signup/success' });
      } catch {
        setShowMsg(true);
      }
    })(e);
  };
  return (
    <>
      <div className='fixed top-30 left-1/2 -translate-x-1/2'>
        <h1 className='text-reisered mb-8 text-center text-5xl font-bold text-black'>
          Reiseplaner
        </h1>
        <div className='w-100 bg-white p-8 text-black max-[430px]:w-80'>
          <h1 className='text-center text-xl font-bold'>Sign up to Reiseplaner</h1>
          <form onSubmit={onFormSubmit}>
            <div className='my-7 flex flex-col gap-7'>
              <div>
                <label htmlFor='name' className='block text-sm font-bold text-zinc-500'>
                  Name
                </label>
                <input
                  id='name'
                  type='name'
                  {...register('name')}
                  autoFocus
                  className='transition-ring w-full rounded-sm border-1 border-zinc-500 leading-7 duration-300 ease-in outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                />
                {errors.name && (
                  <div className='absolute'>
                    <span className='text-xs text-rose-500'>{errors.name.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor='email' className='block text-sm font-bold text-zinc-500'>
                  Email
                </label>
                <input
                  id='email'
                  type='email'
                  {...register('email', { required: 'Email is empty.' })}
                  autoFocus
                  className='transition-ring w-full rounded-sm border-1 border-zinc-500 leading-7 duration-300 ease-in outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                />
                {errors.email && (
                  <div className='absolute'>
                    <span className='text-xs text-rose-500'>{errors.email.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor='password' className='block text-sm font-bold text-zinc-500'>
                  Password
                </label>
                <input
                  id='password'
                  type='password'
                  autoComplete='off'
                  {...register('password', { required: 'Password is empty.' })}
                  className='transition-ring w-full rounded-sm border-1 border-zinc-500 leading-7 duration-300 ease-in outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                />
                {errors.password && (
                  <div className='absolute'>
                    <span className='text-xs text-rose-500'>{errors.password.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor='passwordRecheck' className='block text-sm font-bold text-zinc-500'>
                  Password Validation
                </label>
                <input
                  id='passwordRecheck'
                  type='password'
                  autoComplete='off'
                  {...register('passwordRecheck', { required: 'Password must be the same.' })}
                  className='transition-ring w-full rounded-sm border-1 border-zinc-500 leading-7 duration-300 ease-in outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500'
                />
                {errors.passwordRecheck && (
                  <div className='absolute'>
                    <span className='text-xs text-rose-500'>{errors.passwordRecheck.message}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type='submit'
              className='bg-reiseorange flex w-full items-center justify-center gap-2 rounded-md py-1'
            >
              <span className='text-white'>Sign up</span>
              {isSubmitting && (
                <div className='size-4 animate-spin rounded-full border-[2px] border-t-transparent text-white' />
              )}
            </button>
          </form>

          <div className='mt-2 text-center'>
            <Link to='/signin' className='w-full text-zinc-700'>
              Go back to sign in
            </Link>
          </div>
        </div>
      </div>
      {showMsg && (
        <SimplePopupbox
          text='Signup failed. Please try it later.'
          onAccept={() => setShowMsg(false)}
        />
      )}
    </>
  );
}
