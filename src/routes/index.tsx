import { createFileRoute } from '@tanstack/react-router';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { useEffect, useReducer, useState } from 'react';
import NewPlanGroupPopupBox from '../components/NewPlanGroupPopupBox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlanGroups } from '../apis/supabaseAPI';
import DeletePlanGroupPopupBox from '../components/DeletePlanGroupPopupBox';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );
  const [showDeletePlanBox, toggleShowDeletePlanBox] = useReducer(
    (prev) => !prev,
    false
  );
  const [deleteID, setDeleteID] = useState<number>();

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
    if (showCreatePlanBox) toggleShowCreatePlanBox();
    if (showDeletePlanBox) toggleShowDeletePlanBox();

    if (isRefetch) {
      queryClient.invalidateQueries({ queryKey: ['getPlanGroups'] });
      setDeleteID(undefined);
      refetch();
    }
  };

  if (isRefetching) {
    console.log('Refetching');
  }

  if (isError) {
    console.error(error);
  }

  const handleClickDelete = (e: React.MouseEvent<HTMLDivElement>) => {
    setDeleteID(parseInt(e.currentTarget.id));
    toggleShowDeletePlanBox();
  };

  useEffect(() => {
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    return () =>
      window.removeEventListener('contextmenu', (e) => e.preventDefault());
  }, []);

  return (
    <>
      <div className='relative p-2 min-h-100 bg-reiseyellow'>
        {planGroups?.map((planGroup) => (
          <div
            className='w-full my-1 h-20 bg-zinc-300'
            id={planGroup.id}
            key={planGroup.id}
            onContextMenu={handleClickDelete} // run on right-click
          >
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
      {showDeletePlanBox && deleteID && (
        <DeletePlanGroupPopupBox planId={deleteID} onClose={onCloseRefetch} />
      )}
    </>
  );
}
