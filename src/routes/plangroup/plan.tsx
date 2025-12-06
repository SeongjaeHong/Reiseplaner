import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { FaAngleLeft } from 'react-icons/fa6';
import PlanContents from '@/components/planContents/PlanContents';

const planParam = z.object({
  group_id: z.number(),
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
    plan_id: planId,
    plan_title: planTitle,
  } = Route.useSearch();

  return (
    <>
      <div className='flex items-center bg-reiseorange text-xl w-full'>
        <button onClick={() => window.history.back()} className='p-1'>
          <span>
            <FaAngleLeft />
          </span>
        </button>
        <h1 className='break-all'>{planTitle}</h1>
      </div>

      <PlanContents planId={planId} />
    </>
  );
}
