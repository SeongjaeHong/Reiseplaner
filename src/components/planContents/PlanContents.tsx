import { Suspense, useEffect, useState } from 'react';
import ScheduleTable from './ScheduleTable';
import DetailPlans, { type DetailPlansHandle } from './DetailPlans';

type PlanContents = {
  planId: number;
  detailPlansRef: React.RefObject<DetailPlansHandle | null>;
};
export default function PlanContents({ planId, detailPlansRef }: PlanContents) {
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const handleScheduleClick = (id: string) => {
    setFocusedId(id);
    detailPlansRef.current?.scrollToContent(id);
  };

  useEffect(() => {
    const clearFocus = () => setFocusedId(null);
    window.addEventListener('click', clearFocus);
    return () => window.removeEventListener('click', clearFocus);
  }, []);

  return (
    <Suspense fallback={<PlanContentsSkeleton />}>
      <div className='flex min-h-30 gap-1 py-1'>
        <div className='border-reiseorange w-1/3 border-1 bg-white px-2 pb-2 2xl:w-1/5'>
          <ScheduleTable
            planId={planId}
            focusedId={focusedId}
            onSelectContent={handleScheduleClick}
          />
        </div>
        <div className='border-reiseorange min-w-0 flex-1 border-1 bg-white p-1'>
          <DetailPlans
            planId={planId}
            ref={detailPlansRef}
            focusedId={focusedId}
            setFocusedId={setFocusedId}
          />
        </div>
      </div>
    </Suspense>
  );
}

function PlanContentsSkeleton() {
  return (
    <div className='flex gap-1 py-1'>
      <div className='border-reiseorange min-h-30 w-1/3 animate-pulse border-1 bg-zinc-300 p-1'></div>
      <div className='border-reiseorange min-h-30 flex-1 animate-pulse border-1 bg-zinc-300 p-1'>
        <div className='h-10 animate-pulse rounded-md bg-zinc-500' />
        <div className='my-1 h-20 animate-pulse rounded-md bg-zinc-500' />
      </div>
    </div>
  );
}
