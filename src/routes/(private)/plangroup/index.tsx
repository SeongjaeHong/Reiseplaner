import { getPlansByGroupId } from '@/apis/supabase/plans';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FaPlus } from 'react-icons/fa6';
import { useReducer } from 'react';
import { z } from 'zod';
import CreatePlanPopupBox from '@/components/plan/CreatePlanPopupBox';
import Plan from '@/components/plan/Plan';
import { PlanGroupHeader } from '@/components/planGroup/PlanGroupHeader';
import { useFetchPlanGroupByGroupId } from '@/components/planGroup/utils/fetchPlanGroups';
import { useFetchPlans } from '@/components/plan/utils/fetchPlans';

const planGroupParam = z.object({
  group_id: z.coerce.number(),
  group_title: z.string(),
});
type PlanGroupParam = z.infer<typeof planGroupParam>;

export const Route = createFileRoute('/(private)/plangroup/')({
  validateSearch: (search): PlanGroupParam => planGroupParam.parse(search),
  component: Index,
});

function Index() {
  const { group_id: groupId, group_title: groupTitle } = Route.useSearch();
  const planGroup = useFetchPlanGroupByGroupId(groupId);
  const { data: plans, isLoading: isPlansLoading, refetch: plansRefetch } = useFetchPlans(groupId);
  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer((prev) => !prev, false);

  return (
    <div className='mx-auto max-w-[1600px]'>
      {planGroup ? (
        <PlanGroupHeader planGroup={planGroup} />
      ) : (
        <div className='mb-12 h-80 animate-pulse rounded-[40px] bg-zinc-300 shadow-2xl' />
      )}

      {isPlansLoading && <PlansSkeleton />}
      {plans && (
        <>
          <div className='mb-8 flex items-center justify-between'>
            <h3 className='text-2xl font-bold text-slate-800'>
              Gesamtplan <span className='ml-2 text-indigo-600'>{plans.length}</span>
            </h3>
            <button
              onClick={toggleShowCreatePlanBox}
              className='flex items-center gap-2 rounded-2xl bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100'
            >
              <FaPlus size={24} /> Plan hinzufügen
            </button>
          </div>

          {plans.map((plan) => (
            <Plan
              plan={plan}
              groupId={groupId}
              groupTitle={groupTitle}
              refetch={plansRefetch}
              key={plan.id}
            />
          ))}
        </>
      )}

      {showCreatePlanBox && (
        <CreatePlanPopupBox groupId={groupId} onClose={toggleShowCreatePlanBox} />
      )}
    </div>
  );
}

function PlansSkeleton() {
  return (
    <>
      <div className='my-1 h-20 animate-pulse bg-zinc-300 p-3' />
      <div className='my-1 h-20 animate-pulse bg-zinc-300 p-3' />
    </>
  );
}
