import { createFileRoute } from '@tanstack/react-router';
import { FaCirclePlus } from 'react-icons/fa6';
import { Suspense, useReducer } from 'react';
import CreatePlanGroupPopupBox from '@/components/planGroup/CreatePlanGroupPopupBox';
import { useQuery } from '@tanstack/react-query';
import { getPlanGroups } from '@/apis/supabase/planGroups';
import { INDEX, PLAN_GROUP } from './-constant';
import PlanGroup from '@/components/planGroup/PlanGroup';

export const Route = createFileRoute(INDEX)({
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
    <div className='bg-white max-w-[1600px] mx-auto'>
      <div className='p-2 grid grid-cols-2 max-md:grid-cols-1 xl:grid-cols-3 gap-2'>
        {planGroups?.map((planGroup) => (
          <Suspense fallback={<PlanGroupSkeleton />} key={planGroup.id}>
            <PlanGroup
              to={PLAN_GROUP}
              planGroup={planGroup}
              refetch={() => refetch()}
            />
          </Suspense>
        ))}
      </div>
      <div className='flex justify-end'>
        <button className='mr-2 mb-2' onClick={toggleShowCreatePlanBox}>
          <FaCirclePlus className='text-3xl text-reiseorange' />
        </button>
      </div>

      {showCreatePlanBox && (
        <CreatePlanGroupPopupBox
          refetch={() => refetch()}
          onClose={toggleShowCreatePlanBox}
        />
      )}
    </div>
  );
}

const PlanGroupSkeleton = () => (
  <div className='h-60 bg-zinc-300 animate-pulse' />
);
