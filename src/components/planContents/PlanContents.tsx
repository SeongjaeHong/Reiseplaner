import { Suspense } from 'react';
import ScheduleTable from './ScheduleTable';
import DetailPlans, { type DetailPlansHandle } from './DetailPlans';

type PlanContents = {
  planId: number;
  detailPlansRef: React.RefObject<DetailPlansHandle | null>;
};
export default function PlanContents({ planId, detailPlansRef }: PlanContents) {
  return (
    <Suspense fallback={<PlanContentsSkeleton />}>
      <div className='flex gap-1 py-1'>
        <ScheduleTable />
        <DetailPlans planId={planId} ref={detailPlansRef} />
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
