import { createFileRoute } from '@tanstack/react-router';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { useReducer } from 'react';
import NewPlanGroupPopupBox from '../components/NewPlanGroupPopupBox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlanGroups } from '../apis/supabaseAPI';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );

  const queryClient = useQueryClient();

  const {
    data: planGroups,
    error,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['getPlanGroups'],
    queryFn: getPlanGroups,
    staleTime: Infinity,
  });

  const handleCreatePlan = () => {
    toggleShowCreatePlanBox();
  };

  const onCloseRefetch = (isRefetch: boolean = false) => {
    toggleShowCreatePlanBox();

    if (isRefetch) {
      queryClient.invalidateQueries({ queryKey: ['getPlanGroups'] });
      refetch();
    }
  };

  if (isRefetching) {
    console.log('Refetching');
  }

  if (isError) {
    console.error(error);
  }

  return (
    <>
      <div className='relative p-2 min-h-100 bg-reiseyellow'>
        {planGroups?.map((planGroup) => (
          <div className='w-full my-1 h-20 bg-zinc-300' key={planGroup.id}>
            <h1>{planGroup.title}</h1>
          </div>
        ))}
        <button
          className='absolute right-5 bottom-5'
          onClick={handleCreatePlan}
        >
          <IoIosAddCircleOutline className='text-3xl text-reiseorange' />
        </button>
      </div>
      {showCreatePlanBox && <NewPlanGroupPopupBox onClose={onCloseRefetch} />}
    </>
  );
}
