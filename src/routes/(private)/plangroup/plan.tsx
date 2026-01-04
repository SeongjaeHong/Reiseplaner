import { useEffect, useRef, useState } from 'react';
import { createFileRoute, useBlocker, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { toast } from '@/components/common/Toast/toast';
import type { DetailPlansHandle } from '@/components/planContents/components/DetailPlans/DetailPlans';
import PlanContents from '@/components/planContents/PlanContents';

const planParam = z.object({
  group_id: z.number(),
  group_title: z.string(),
  plan_id: z.coerce.number(),
  plan_title: z.string(),
});

type PlanParam = z.infer<typeof planParam>;

export const Route = createFileRoute('/(private)/plangroup/plan')({
  validateSearch: (search): PlanParam => planParam.parse(search),
  component: Plan,
});

function Plan() {
  const {
    group_title: groupTitle,
    plan_id: planId,
    plan_title: planTitle,
    group_id: groupId,
  } = Route.useSearch();
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
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

  const handleMoveToPlanGroup = () =>
    void navigate({ to: '/plangroup', search: { group_id: groupId, group_title: groupTitle } });

  return (
    <div className='mx-auto max-w-[1600px]'>
      <div className='mb-3 flex justify-between'>
        <div>
          <div className='ml-8 flex items-center gap-1 text-sm font-bold text-slate-400'>
            <button onClick={handleMoveToPlanGroup} className='hover:text-indigo-600'>
              {groupTitle}
            </button>
            <FaAngleRight size={12} className='text-slate-400' />
            <small className='text-sm font-bold text-slate-400'>{planTitle}</small>
          </div>
          <div className='flex'>
            <button onClick={handleMoveToPlanGroup} className='px-1 py-2'>
              <FaAngleLeft size={24} className='text-slate-400 hover:text-indigo-600' />
            </button>
            <h1 className='pb-2 text-4xl leading-none font-black break-all text-slate-900'>
              {planTitle}
            </h1>
          </div>
        </div>
        {isSaving && (
          <div className='mr-5 flex items-center text-slate-800'>
            <p>saving...</p>
            <div className='size-3 animate-spin rounded-full border-[1px] border-t-transparent' />
          </div>
        )}
      </div>

      <PlanContents planId={planId} detailPlansRef={detailPlansRef} />
    </div>
  );
}
