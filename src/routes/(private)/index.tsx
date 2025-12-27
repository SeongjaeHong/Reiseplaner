import { createFileRoute, redirect } from '@tanstack/react-router';
import { FaCirclePlus } from 'react-icons/fa6';
import { Suspense, useReducer } from 'react';
import CreatePlanGroupPopupBox from '@/components/planGroup/CreatePlanGroupPopupBox';
import { useQuery } from '@tanstack/react-query';
import { getPlanGroups } from '@/apis/supabase/planGroups';
import PlanGroup from '@/components/planGroup/PlanGroup';

export const Route = createFileRoute('/(private)/')({
  component: Index,
  beforeLoad: ({ context }) => {
    const { user, loading } = context.auth;

    if (loading) {
      // supabase session has not been read yet.
      return;
    }

    if (!user) {
      return redirect({ to: '/signin' });
    }
  },
});

function Index() {
  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer((prev) => !prev, false);
  const { data: planGroups, refetch } = useQuery({
    queryKey: ['getPlanGroups'],
    queryFn: getPlanGroups,
    staleTime: Infinity,
    throwOnError: true,
  });

  return (
    <>
      <div className='max-w-[1600px] bg-white'>
        <div className='grid grid-cols-2 gap-2 p-2 max-md:grid-cols-1 xl:grid-cols-3'>
          {planGroups?.map((planGroup) => (
            <Suspense fallback={<PlanGroupSkeleton />} key={planGroup.id}>
              <PlanGroup planGroup={planGroup} refetch={() => refetch()} />
            </Suspense>
          ))}
        </div>
        <div className='flex justify-end'>
          <button className='mr-2 mb-2' onClick={toggleShowCreatePlanBox}>
            <FaCirclePlus className='text-reiseorange text-3xl' />
          </button>
        </div>

        {showCreatePlanBox && (
          <CreatePlanGroupPopupBox refetch={() => refetch()} onClose={toggleShowCreatePlanBox} />
        )}
      </div>
    </>
  );
}

const PlanGroupSkeleton = () => <div className='h-60 animate-pulse bg-zinc-300' />;
