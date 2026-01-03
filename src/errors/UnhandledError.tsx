import { useNavigate } from '@tanstack/react-router';

export default function UnhandledError() {
  const navigate = useNavigate();
  const handleNavigateHome = () => void navigate({ to: '/' });

  return (
    <div className='text-accent absolute top-1/5 left-1/2 -translate-x-1/2 p-5 font-bold'>
      <h1 className='mb-5 text-6xl max-sm:text-4xl'>Reiseplaner</h1>
      <p className='mb-5 text-xl max-sm:text-lg'>Something went wrong.</p>
      <div className='text-center'>
        <button
          onClick={handleNavigateHome}
          className='bg-accent rounded-md px-2 py-1 text-white hover:bg-red-500'
        >
          Go back home
        </button>
      </div>
    </div>
  );
}
