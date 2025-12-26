import { createFileRoute, useBlocker, useRouter } from '@tanstack/react-router';
import { z } from 'zod';
import { FaAngleLeft } from 'react-icons/fa6';
import PlanContents from '@/components/planContents/PlanContents';
import { useEffect, useRef, useState } from 'react';
import { PLAN } from '../-constant';
import type { DetailPlansHandle } from '@/components/planContents/components/DetailPlans/DetailPlans';
import { toast } from '@/components/common/Toast/toast';

const planParam = z.object({
  group_title: z.string(),
  plan_id: z.coerce.number(),
  plan_title: z.string(),
});

type PlanParam = z.infer<typeof planParam>;

export const Route = createFileRoute(PLAN)({
  validateSearch: (search): PlanParam => planParam.parse(search),
  component: Plan,
});

function Plan() {
  const { group_title: groupTitle, plan_id: planId, plan_title: planTitle } = Route.useSearch();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const detailPlansRef = useRef<DetailPlansHandle>(null);
  const { status, proceed, reset } = useBlocker({
    shouldBlockFn: () => detailPlansRef.current?.contentsStatus === 'Dirty',
    withResolver: true,
    enableBeforeUnload: () => detailPlansRef.current?.contentsStatus === 'Dirty',
  });

  const isHandlingRef = useRef(false);
  const handleBlockedNavigation = async () => {
    if (isHandlingRef.current) return;
    isHandlingRef.current = true;

    const detailPlans = detailPlansRef.current;
    if (!detailPlans) {
      if (proceed) {
        proceed();
      }
      return;
    }

    try {
      setIsSaving(true);
      await detailPlans.saveChanges();
      if (proceed) {
        proceed();
      }
    } catch {
      toast.error('Failed to save changes. Try it again.');
      if (reset) {
        reset();
      }
    } finally {
      isHandlingRef.current = false;
    }
  };

  useEffect(() => {
    // When a user try to move to another page,
    // save current change first.
    if (status === 'blocked') {
      void handleBlockedNavigation();
    }
  }, [status]);

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

  return (
    <div className='mx-auto max-w-[1600px]'>
      <div className='bg-reiseorange flex justify-between'>
        <div className='flex items-center'>
          <button onClick={() => router.history.back()} className='px-1 py-2'>
            <span className='text-2xl'>
              <FaAngleLeft />
            </span>
          </button>
          <div className='pb-2 leading-none'>
            <small className='text-sm'>{groupTitle}</small>
            <h1 className='text-2xl leading-none break-all'>{planTitle}</h1>
          </div>
        </div>
        {isSaving && (
          <div className='mr-5 flex items-center'>
            <p>saving...</p>
            <div className='size-4 animate-spin rounded-full border-[2px] border-t-transparent text-white' />
          </div>
        )}
      </div>

      <PlanContents planId={planId} detailPlansRef={detailPlansRef} />
    </div>
  );
}
