import { INDEX } from '@/routes/-constant';
import { useNavigate } from '@tanstack/react-router';

export default function PageNotFound() {
  const navigate = useNavigate();
  const handleNavigateHome = () => void navigate({ to: INDEX });

  return (
    <div className='absolute top-1/5 left-1/2 -translate-x-1/2 p-5 text-reisered font-bold'>
      <h1 className='text-6xl mb-5'>Reiseplaner</h1>
      <p className='text-xl mb-5'>The requested URL was not found.</p>
      <div className='text-center'>
        <button
          onClick={handleNavigateHome}
          className='bg-reisered hover:bg-red-500 text-white rounded-md py-1 px-2'
        >
          Go back home
        </button>
      </div>
    </div>
  );
}
