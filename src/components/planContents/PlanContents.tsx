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
      <div className='flex gap-1 py-1 min-h-30'>
        <div className='w-1/3 2xl:w-1/5 border-1 border-reiseorange bg-white px-2 pb-2'>
          <ScheduleTable
            planId={planId}
            focusedId={focusedId}
            onSelectContent={handleScheduleClick}
          />
        </div>
        <div className='flex-1 min-w-0 border-1 border-reiseorange bg-white p-1'>
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
      <div className='border-1 border-reiseorange bg-zinc-300 p-1 w-1/3  min-h-30 animate-pulse'></div>
      <div className='border-1 border-reiseorange bg-zinc-300 p-1 flex-1 min-h-30 animate-pulse'>
        <div className='rounded-md h-10 bg-zinc-500 animate-pulse' />
        <div className='rounded-md my-1 h-20 bg-zinc-500 animate-pulse' />
      </div>
    </div>
  );
}
