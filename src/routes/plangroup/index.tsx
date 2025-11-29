import { getPlansByGroupId } from '@/apis/supabase/plans';
import { getPlanGroupByGroupId } from '@/apis/supabase/planGroups';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FaPenToSquare } from 'react-icons/fa6';
import { PLAN } from '../-constant';
import { useReducer } from 'react';
import { z } from 'zod';
import CreatePlanPopupBox from '@/components/popupBoxes/CreatePlanPopupBox';
import Plan from '@/components/Plan';

const planGroupParam = z.object({
  group_id: z.number(),
});
type PlanGroupParam = z.infer<typeof planGroupParam>;

export const Route = createFileRoute('/plangroup/')({
  validateSearch: (search): PlanGroupParam => planGroupParam.parse(search),
  component: Index,
});

function Index() {
  const queryClient = useQueryClient();
  const { group_id: groupId } = Route.useSearch();
  const { data: groupTitle } = useFetchGroupTitle(groupId);
  const { data: plans } = useFetchPlans(groupId);

  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );

  const handleRefetchPlans = useRefetchPlans(queryClient, groupId);

  return (
    <>
      <div className='flex items-center p-2 min-h-20 bg-reiseorange'>
        <h1 className='text-2xl font-bold'>{groupTitle}</h1>
      </div>
      <div className='relative p-2 min-h-100 bg-reiseyellow'>
        {plans?.map((plan) => (
          <Plan
            to={PLAN}
            groupId={groupId}
            planId={plan.id}
            title={plan.title}
            refetch={handleRefetchPlans}
            key={plan.id}
          />
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
          onSuccess={handleRefetchPlans}
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

function useFetchGroupTitle(groupId: number) {
  const { data, refetch } = useQuery({
    queryKey: ['fetchGroupTitle', groupId],
    queryFn: () => getPlanGroupByGroupId(groupId),
    throwOnError: true,
    staleTime: Infinity,
  });

  if (!data) return { data: null, refetch };

  return { data: data.title, refetch };
}

function useRefetchPlans(queryClient: QueryClient, groupId: number) {
  const { mutate } = useMutation({
    mutationFn: () =>
      queryClient.refetchQueries({
        queryKey: ['fetchPlans', groupId],
        exact: true,
      }),
  });

  return () => mutate();
}
