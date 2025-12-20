import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { FaAngleLeft } from 'react-icons/fa6';
import PlanContents from '@/components/planContents/PlanContents';
import type { DetailPlansHandle } from '@/components/planContents/DetailPlans';
import { useEffect, useRef } from 'react';
import { PLAN } from '../-constant';

const planParam = z.object({
  group_title: z.string(),
  plan_id: z.number(),
  plan_title: z.string(),
});

type PlanParam = z.infer<typeof planParam>;

export const Route = createFileRoute(PLAN)({
  validateSearch: (search): PlanParam => planParam.parse(search),
  component: Plan,
});

function Plan() {
  const {
    group_title: groupTitle,
    plan_id: planId,
    plan_title: planTitle,
  } = Route.useSearch();
  const detailPlansRef = useRef<DetailPlansHandle>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (detailPlansRef.current?.contentsStatus === 'Dirty') {
        // Alert for loss of unsaved data
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleBack = async () => {
    const detailPlans = detailPlansRef.current;
    if (detailPlans?.contentsStatus === 'Dirty') {
      await detailPlans.saveChanges();
    }

    window.history.back();
  };

  return (
    <div className='max-w-[1600px] mx-auto'>
      <div className='flex items-center bg-reiseorange w-full'>
        <button onClick={() => void handleBack()} className='px-1 py-2'>
          <span className='text-2xl'>
            <FaAngleLeft />
          </span>
        </button>
        <div className='pb-2 leading-none'>
          <small className='text-sm'>{groupTitle}</small>
          <h1 className='break-all text-2xl leading-none'>{planTitle}</h1>
        </div>
      </div>

      <PlanContents planId={planId} detailPlansRef={detailPlansRef} />
    </div>
  );
}
