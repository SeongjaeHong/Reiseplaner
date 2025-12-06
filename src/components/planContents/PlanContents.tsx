import { Suspense } from 'react';
import ScheduleTable from './ScheduleTable';
import DetailPlans from './DetailPlans';

type PlanContents = {
  planId: number;
};
export default function PlanContents({ planId }: PlanContents) {
  return (
    <Suspense fallback={<PlanContentsSkeleton />}>
      <div className='flex gap-1 py-1'>
        <ScheduleTable />
        <DetailPlans planId={planId} />
      </div>
    </Suspense>
  );
}

function PlanContentsSkeleton() {
  return (
    <div className='flex gap-1 py-1'>
      <div className='border-1 border-reiseorange bg-zinc-300 p-1 w-1/3  min-h-30 animate-pulse'></div>
      <div className='border-1 border-reiseorange bg-zinc-300 p-1 flex-1 min-h-30 animate-pulse'>
        <div className='rounded-md h-10 bg-zinc-500 animate-pulse' />
        <div className='rounded-md my-1 h-20 bg-zinc-500 animate-pulse' />
      </div>
    </div>
  );
}
