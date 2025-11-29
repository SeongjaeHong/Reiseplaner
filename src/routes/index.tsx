import { createFileRoute } from '@tanstack/react-router';
import { FaCirclePlus } from 'react-icons/fa6';
import { useReducer } from 'react';
import CreatePlanGroupPopupBox from '@/components/popupBoxes/CreatePlanGroupPopupBox';
import { useQuery } from '@tanstack/react-query';
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
  const { data: planGroups, refetch } = useQuery({
    queryKey: ['getPlanGroups'],
    queryFn: getPlanGroups,
    staleTime: Infinity,
    throwOnError: true,
  });

  return (
    <>
      <div className='relative p-2 min-h-100 bg-reiseyellow'>
        {planGroups?.map((planGroup) => (
          <PlanGroup
            to={PLAN_GROUP}
            groupId={planGroup.id}
            title={planGroup.title}
            refetch={() => refetch()}
            fetchKey={['getPlanGroups']}
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
          refetch={() => refetch()}
          onClose={toggleShowCreatePlanBox}
        />
      )}
    </>
  );
}
