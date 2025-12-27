import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MdEmail } from 'react-icons/md';

export const Route = createFileRoute('/signup/success')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className='mx-auto w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm'>
      <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
        <MdEmail className='h-8 w-8 text-blue-600' />
      </div>

      <h2 className='mb-4 text-2xl font-bold text-gray-900'>Check your email!</h2>

      <p className='mb-8 leading-relaxed text-gray-600'>
        Registration successful! Please check your email to confirm your account and get started.
      </p>

      <button
        onClick={() => void navigate({ to: '/signin' })}
        className='mt-8 w-full rounded-lg bg-gray-800 px-4 py-3 text-white hover:bg-gray-700'
      >
        Back to sign in
      </button>
    </div>
  );
}
