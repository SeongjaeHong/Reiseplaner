import { createFileRoute } from '@tanstack/react-router';
import { FaCirclePlus } from 'react-icons/fa6';
import { useReducer } from 'react';
import CreatePlanGroupPopupBox from '@/components/popupBoxes/CreatePlanGroupPopupBox';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlanGroups } from '@/apis/supabase/planGroups';
import { PLAN_GROUP } from './-constant';
import PlanGroup from '@/components/PlanGroup';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );
  const queryClient = useQueryClient();
  const { data: planGroups, isRefetching } = useQuery({
    queryKey: ['getPlanGroups'],
    queryFn: getPlanGroups,
    staleTime: Infinity,
    throwOnError: true,
  });

  if (isRefetching) {
    // TODO: 3초 이상 걸리면 spin 보여주기
    console.log('Refetching');
  }

  console.log('- - - - - - - -  -');
  console.log(planGroups); // Bug: 제목 update치고 refetch하면 update친 애가 array 제일 뒤로 이동함(id는 동일한데 array 내에서만)

  const handleRefetchPlanGroups = useRefetchPlanGroups(queryClient);

  return (
    <>
      <div className='relative p-2 min-h-100 bg-reiseyellow'>
        {planGroups?.map((planGroup) => (
          <PlanGroup
            to={PLAN_GROUP}
            groupId={planGroup.id}
            title={planGroup.title}
            refetch={handleRefetchPlanGroups}
            key={planGroup.id}
          />
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
          onClose={toggleShowCreatePlanBox}
          onSuccess={handleRefetchPlanGroups}
        />
      )}
    </>
  );
}

function useRefetchPlanGroups(queryClient: QueryClient) {
  const { mutate } = useMutation({
    mutationFn: () =>
      queryClient.refetchQueries({
        queryKey: ['getPlanGroups'],
        exact: true,
      }),
  });

  return () => mutate();
}
