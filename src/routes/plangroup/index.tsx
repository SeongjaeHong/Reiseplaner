import { getPlansByGroupId } from '@/apis/supabase/plans';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FaPenToSquare } from 'react-icons/fa6';
import { PLAN } from '../-constant';
import { useReducer } from 'react';
import { z } from 'zod';
import CreatePlanPopupBox from '@/components/plan/CreatePlanPopupBox';
import Plan from '@/components/plan/Plan';

const planGroupParam = z.object({
  group_id: z.number(),
  group_title: z.string(),
});
type PlanGroupParam = z.infer<typeof planGroupParam>;

export const Route = createFileRoute('/plangroup/')({
  validateSearch: (search): PlanGroupParam => planGroupParam.parse(search),
  component: Index,
});

function Index() {
  const { group_id: groupId, group_title: groupTitle } = Route.useSearch();
  const { data: plans, refetch } = useFetchPlans(groupId);

  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );

  return (
    <>
      <div className='flex items-center p-2 min-h-20 bg-reiseorange'>
        <h1 className='text-2xl font-bold'>{groupTitle}</h1>
      </div>
      <div className='relative p-2 min-h-100 bg-reiseyellow'>
        {plans?.map((plan) => (
          <Plan to={PLAN} plan={plan} refetch={refetch} key={plan.id} />
        ))}
        <button
          className='absolute right-5 bottom-5'
          onClick={toggleShowCreatePlanBox}
        >
          <FaPenToSquare className='text-3xl text-reiseorange' />
        </button>
      </div>
      {showCreatePlanBox && (
        <CreatePlanPopupBox
          groupId={groupId}
          onClose={toggleShowCreatePlanBox}
          refetch={refetch}
        />
      )}
    </>
  );
}

function useFetchPlans(groupId: number) {
  const { data, refetch } = useQuery({
    queryKey: ['fetchPlans', groupId],
    queryFn: () => getPlansByGroupId(groupId),
    staleTime: Infinity,
    throwOnError: true,
  });

  return { data, refetch };
}
