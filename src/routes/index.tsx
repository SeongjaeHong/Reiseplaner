import { createFileRoute } from '@tanstack/react-router';
import { FaCirclePlus } from 'react-icons/fa6';
import { Suspense, useReducer } from 'react';
import CreatePlanGroupPopupBox from '@/components/planGroup/CreatePlanGroupPopupBox';
import { useQuery } from '@tanstack/react-query';
import { getPlanGroups } from '@/apis/supabase/planGroups';
import { PLAN_GROUP } from './-constant';
import PlanGroup from '@/components/planGroup/PlanGroup';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );
  const { data: planGroups, refetch } = useQuery({
    queryKey: ['getPlanGroups'],
    queryFn: getPlanGroups,
    staleTime: Infinity,
    throwOnError: true,
  });

  return (
    <>
      <div className='relative p-2 min-h-100 bg-reiseyellow grid grid-cols-2 max-sm:grid-cols-1 xl:grid-cols-3 gap-4'>
        {planGroups?.map((planGroup) => (
          <Suspense fallback={<PlanGroupSkeleton />} key={planGroup.id}>
            <PlanGroup
              to={PLAN_GROUP}
              planGroup={planGroup}
              refetch={() => refetch()}
            />
          </Suspense>
        ))}
        <button
          className='absolute right-5 bottom-5'
          onClick={toggleShowCreatePlanBox}
        >
          <FaCirclePlus className='text-3xl text-reiseorange' />
        </button>
      </div>

      {showCreatePlanBox && (
        <CreatePlanGroupPopupBox
          refetch={() => refetch()}
          onClose={toggleShowCreatePlanBox}
        />
      )}
    </>
  );
}

const PlanGroupSkeleton = () => (
  <div className='h-60 bg-zinc-300 animate-pulse' />
);
