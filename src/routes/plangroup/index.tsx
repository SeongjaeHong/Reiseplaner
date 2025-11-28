import { getPlansByGroupId } from '@/apis/supabase/plans';
import { getPlanGroupByGroupId } from '@/apis/supabase/planGroups';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { FaEllipsisVertical, FaPenToSquare } from 'react-icons/fa6';
import { PLAN } from '../-constant';
import { useReducer } from 'react';
import { z } from 'zod';
import CreatePlanPopupBox from '@/components/popupBoxes/CreatePlanPopupBox';

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
  const { data: plans } = useFetchPlans(groupId);
  const { data: groupTitle } = useFetchGroupTitle(groupId);

  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );

  const handleRefetchPlans = async () => {
    await queryClient.refetchQueries({
      queryKey: ['fetchPlans'],
      exact: true,
    });
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
            search={{ group_id: groupId, plan_id: plan.id }}
            key={plan.id}
          >
            <div
              className='w-full my-1 h-20 bg-zinc-300'
              id={plan.id.toString()}
            >
              <div>
                <FaEllipsisVertical />
              </div>
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
        <CreatePlanPopupBox
          groupId={groupId}
          onSuccess={handleRefetchPlans}
          onClose={toggleShowCreatePlanBox}
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
