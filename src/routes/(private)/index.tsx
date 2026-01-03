import { createFileRoute } from '@tanstack/react-router';
import { FaPlus } from 'react-icons/fa6';
import { Suspense, useReducer } from 'react';
import CreatePlanGroupPopupBox from '@/components/planGroup/CreatePlanGroupPopupBox';
import { useQuery } from '@tanstack/react-query';
import { getPlanGroups } from '@/apis/supabase/planGroups';
import PlanGroup from '@/components/planGroup/PlanGroup';
import { useAuth } from '@/components/auth/AuthContext';

export const Route = createFileRoute('/(private)/')({
  component: Index,
});

function Index() {
  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer((prev) => !prev, false);
  const { user } = useAuth();
  const { data: planGroups, refetch } = useQuery({
    queryKey: ['getPlanGroups', user?.id],
    queryFn: getPlanGroups,
    enabled: !!user,
    staleTime: Infinity,
    throwOnError: true,
  });

  return (
    <div className='max-w-[1600px]'>
      <h1 className='text-black'></h1>
      <div className='mb-10'>
        <h1 className='mb-2 text-4xl font-extrabold text-slate-900'>Meine Reiseberichte</h1>
        <p className='text-lg font-medium text-slate-600'>
          Plane neue Abenteuer und halte deine wertvollsten Erinnerungen fest.
        </p>
      </div>
      <div className='grid grid-cols-2 gap-2 p-2 max-md:grid-cols-1 xl:grid-cols-3'>
        {planGroups?.map((planGroup) => (
          <Suspense fallback={<PlanGroupSkeleton />} key={planGroup.id}>
            <PlanGroup planGroup={planGroup} refetch={() => refetch()} />
          </Suspense>
        ))}
        <div
          onClick={toggleShowCreatePlanBox}
          className='group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 p-10 transition-colors hover:border-indigo-300 hover:bg-indigo-50'
        >
          <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600'>
            <FaPlus className='text-3xl' />
          </div>
          <p className='group-hover:text-primary font-medium text-slate-400'>
            Neue Reise hinzufügen
          </p>
        </div>
      </div>

      {showCreatePlanBox && (
        <CreatePlanGroupPopupBox refetch={() => refetch()} onClose={toggleShowCreatePlanBox} />
      )}
    </div>
  );
}

const PlanGroupSkeleton = () => (
  <div className='h-80 animate-pulse cursor-pointer rounded-3xl border border-slate-100 bg-white bg-zinc-300 shadow-sm' />
);
