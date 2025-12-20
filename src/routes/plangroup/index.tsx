import { getPlansByGroupId } from '@/apis/supabase/plans';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FaAngleLeft, FaPenToSquare } from 'react-icons/fa6';
import { PLAN, PLAN_GROUP } from '../-constant';
import { useReducer } from 'react';
import { z } from 'zod';
import CreatePlanPopupBox from '@/components/plan/CreatePlanPopupBox';
import Plan from '@/components/plan/Plan';

const planGroupParam = z.object({
  group_id: z.number(),
  group_title: z.string(),
});
type PlanGroupParam = z.infer<typeof planGroupParam>;

export const Route = createFileRoute(PLAN_GROUP)({
  validateSearch: (search): PlanGroupParam => planGroupParam.parse(search),
  component: Index,
});

function Index() {
  const { group_id: groupId, group_title: groupTitle } = Route.useSearch();
  const { data: plans, isLoading, refetch } = useFetchPlans(groupId);

  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );

  return (
    <div className='max-w-[1600px] mx-auto'>
      <div className='flex items-center p-2 min-h-20 bg-reiseorange'>
        <button onClick={() => window.history.back()} className='px-1 py-2'>
          <span className='text-2xl'>
            <FaAngleLeft />
          </span>
        </button>
        <h1 className='text-2xl font-bold'>{groupTitle}</h1>
      </div>
      <div className='relative p-2 min-h-100 bg-white'>
        {isLoading && <PlansSkeleton />}
        {plans?.map((plan) => (
          <Plan
            to={PLAN}
            plan={plan}
            groupTitle={groupTitle}
            refetch={refetch}
            key={plan.id}
          />
        ))}
        <div className='flex justify-end'>
          <button className='mr-1 mt-1' onClick={toggleShowCreatePlanBox}>
            <FaPenToSquare className='text-3xl text-reiseorange' />
          </button>
        </div>
      </div>
      {showCreatePlanBox && (
        <CreatePlanPopupBox
          groupId={groupId}
          onClose={toggleShowCreatePlanBox}
          refetch={refetch}
        />
      )}
    </div>
  );
}

function useFetchPlans(groupId: number) {
  return useQuery({
    queryKey: ['fetchPlans', groupId],
    queryFn: () => getPlansByGroupId(groupId),
    staleTime: Infinity,
    throwOnError: true,
  });
}

function PlansSkeleton() {
  return (
    <>
      <div className='my-1 p-3 h-20 bg-zinc-300 animate-pulse' />
      <div className='my-1 p-3 h-20 bg-zinc-300 animate-pulse' />
    </>
  );
}
