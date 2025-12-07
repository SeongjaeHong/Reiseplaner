import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { FaAngleLeft } from 'react-icons/fa6';
import PlanContents from '@/components/planContents/PlanContents';

const planParam = z.object({
  group_id: z.number(),
  group_title: z.string(),
  plan_id: z.number(),
  plan_title: z.string(),
});

type PlanParam = z.infer<typeof planParam>;

export const Route = createFileRoute('/plangroup/plan')({
  validateSearch: (search): PlanParam => planParam.parse(search),
  component: Plan,
});

function Plan() {
  const {
    group_id: groupId,
    group_title: groupTitle,
    plan_id: planId,
    plan_title: planTitle,
  } = Route.useSearch();

  return (
    <>
      <div className='flex items-center bg-reiseorange w-full'>
        <button onClick={() => window.history.back()} className='px-1 py-2'>
          <span className='text-2xl'>
            <FaAngleLeft />
          </span>
        </button>
        <div className='pb-2 leading-none'>
          <small className='text-sm'>{groupTitle}</small>
          <h1 className='break-all text-2xl leading-none'>{planTitle}</h1>
        </div>
      </div>

      <PlanContents planId={planId} />
    </>
  );
}
