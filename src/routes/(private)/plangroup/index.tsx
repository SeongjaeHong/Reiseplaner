import { getPlansByGroupId } from '@/apis/supabase/plans';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FaCalendar, FaPen, FaPlus } from 'react-icons/fa6';
import { useReducer } from 'react';
import { z } from 'zod';
import CreatePlanPopupBox from '@/components/plan/CreatePlanPopupBox';
import Plan from '@/components/plan/Plan';
import { getPlanGroupById } from '@/apis/supabase/planGroups';
import { useFetchImage } from '@/utils/useFetchImage';
import type { PlanGroupResponseSchema } from '@/apis/supabase/planGroups.types';
import PlanGroupEdit from '@/components/planGroup/edit/PlanGroupEdit';
import { getPlanGroupsFetchKey } from '@/utils/fetchKeys';
import { getSchedule } from '@/components/planGroup/utils/time';

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
  const { data: planGroup, refetch: planGroupRefetch } = useFetchPlanGroup(groupId);
  const { data: plans, isLoading: isPlansLoading, refetch: plansRefetch } = useFetchPlans(groupId);
  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer((prev) => !prev, false);

  return (
    <div className='mx-auto max-w-[1600px]'>
      {planGroup ? (
        <PlanGroupHead planGroup={planGroup} refetch={planGroupRefetch} />
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
        <CreatePlanPopupBox
          groupId={groupId}
          onClose={toggleShowCreatePlanBox}
          refetch={plansRefetch}
        />
      )}
    </div>
  );
}

function useFetchPlans(groupId: number) {
  return useQuery({
    queryKey: ['fetchPlans', groupId],
    queryFn: async () => {
      const data = await getPlansByGroupId(groupId);
      return data ?? [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    throwOnError: true,
  });
}

function useFetchPlanGroup(groupId: number) {
  return useQuery({
    queryKey: [useFetchPlanGroup, groupId],
    queryFn: () => getPlanGroupById(groupId),
    staleTime: Infinity,
    gcTime: Infinity,
    throwOnError: true,
  });
}

function PlansSkeleton() {
  return (
    <>
      <div className='my-1 h-20 animate-pulse bg-zinc-300 p-3' />
      <div className='my-1 h-20 animate-pulse bg-zinc-300 p-3' />
    </>
  );
}

type PlanGroupHead = {
  planGroup: PlanGroupResponseSchema;
  refetch: () => Promise<unknown>;
};
function PlanGroupHead({ planGroup, refetch }: PlanGroupHead) {
  const [showEditBox, toggleshowEditBox] = useReducer((prev) => !prev, false);
  const queryClient = useQueryClient();
  const planGroupsFetchKey = getPlanGroupsFetchKey();
  const handleRefetch = async () => {
    void queryClient.refetchQueries({ queryKey: [planGroupsFetchKey] });
    await refetch();
  };
  const thumbnail = useFetchImage({ imageURL: planGroup?.thumbnailURL });
  const schedule = {
    from: planGroup.start_time ? new Date(planGroup.start_time) : undefined,
    to: planGroup.end_time ? new Date(planGroup.end_time) : undefined,
  };
  const scheduleText = getSchedule(schedule);

  return (
    <div className='relative mb-12 h-80 overflow-hidden rounded-[40px] shadow-2xl'>
      {thumbnail ? (
        <img
          src={URL.createObjectURL(thumbnail)}
          alt='A thumbnail of a plan group'
          className='h-full w-full object-cover transition-transform duration-50 group-hover:scale-105'
        />
      ) : (
        <div className='h-full w-full bg-zinc-500 object-fill'>
          <p className='text-white'>Failed to load an image.</p>
        </div>
      )}
      <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10'>
        <div className='flex items-end justify-between'>
          <div>
            <h2 className='mb-4 text-5xl font-black tracking-tight text-white'>
              {planGroup?.title}
            </h2>
            <div className='flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 font-medium text-white/90 backdrop-blur-md'>
              <FaCalendar className='text-indigo-300' /> {scheduleText}
            </div>
          </div>
          <button
            onClick={toggleshowEditBox}
            className='rounded-2xl border border-white/20 bg-white/20 p-4 text-white backdrop-blur-md transition-all hover:bg-white/30'
          >
            <FaPen />
          </button>
        </div>
      </div>
      {showEditBox && (
        <PlanGroupEdit
          planGroup={planGroup}
          thumbnail={thumbnail}
          onClose={toggleshowEditBox}
          refetch={handleRefetch}
        />
      )}
    </div>
  );
}
