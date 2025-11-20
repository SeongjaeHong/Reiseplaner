import { createPlan, getPlansByGroupId } from '@/apis/supabase/plans';
import { getPlanGroupByGroupId } from '@/apis/supabase/planGroups';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { FaPenToSquare } from 'react-icons/fa6';
import { PLAN } from '../-constant';
import { useReducer } from 'react';
import NewPlanGroupPopupBox from '@/components/CreatePopupBox';

export const Route = createFileRoute('/plangroup/')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const { group_id } = Route.useSearch();
  const { data: plans, refetch: refetchPlans } = useFetchPlans(group_id);
  const { data: groupTitle } = useFetchGroupTitle(group_id);

  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );

  const onCloseRefetch = (isRefetch: boolean = false) => {
    if (showCreatePlanBox) toggleShowCreatePlanBox();

    if (isRefetch) {
      queryClient.invalidateQueries({ queryKey: ['fetchPlans'] });
      refetchPlans();
    }
  };

  return (
    <>
      <div className='flex items-center p-2 min-h-20 bg-reiseorange'>
        <h1 className='text-2xl font-bold'>{groupTitle}</h1>
      </div>
      <div className='relative p-2 min-h-100 bg-reiseyellow'>
        {plans?.map((plan) => (
          <Link
            to={PLAN}
            search={{ group_id: group_id, plan_id: plan.id }}
            key={plan.id}
          >
            <div className='w-full my-1 h-20 bg-zinc-300' id={plan.id}>
              <h1>{plan.title}</h1>
            </div>
          </Link>
        ))}
        <button
          className='absolute right-5 bottom-5'
          onClick={toggleShowCreatePlanBox}
        >
          <FaPenToSquare className='text-3xl text-reiseorange' />
        </button>
      </div>
      {showCreatePlanBox && (
        <NewPlanGroupPopupBox
          onCreate={(title) => createPlan(group_id, title)}
          onClose={onCloseRefetch}
        />
      )}
    </>
  );
}

function useFetchPlans(groupId: number) {
  const { data, error, isError, refetch } = useQuery({
    queryKey: ['fetchPlans', groupId],
    queryFn: () => getPlansByGroupId(groupId),
    staleTime: Infinity,
  });

  if (isError) throw error;

  return { data, refetch };
}

function useFetchGroupTitle(groupId: number) {
  const { data, error, isError, refetch } = useQuery({
    queryKey: ['fetchGroupTitle', groupId],
    queryFn: () => getPlanGroupByGroupId(groupId),
    throwOnError: true,
    staleTime: Infinity,
  });

  if (isError) throw error;

  if (!data) return { data: undefined, refetch };

  return { data: data.title, refetch };
}
