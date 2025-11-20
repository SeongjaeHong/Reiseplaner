import { createFileRoute } from '@tanstack/react-router';
import { FaPenToSquare } from 'react-icons/fa6';

export const Route = createFileRoute('/plangroup')({
  component: RouteComponent,
});

function RouteComponent() {
  const { group_id } = Route.useSearch();

  return (
    <>
      <div className='flex items-center p-2 min-h-20 bg-reiseorange'>
        <h1 className='text-2xl font-bold'>그룹명: {group_id}</h1>
      </div>
      <div className='relative p-2 min-h-100 bg-reiseyellow'>
        <button className='absolute right-5 bottom-5'>
          <FaPenToSquare className='text-3xl text-reiseorange' />
        </button>
      </div>
    </>
  );
}
