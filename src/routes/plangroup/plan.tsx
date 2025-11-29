import { createFileRoute, Link } from '@tanstack/react-router';
import { PLAN_GROUP } from '../-constant';
import { z } from 'zod';

const planParam = z.object({
  group_id: z.number(),
  plan_id: z.number(),
  group_title: z.string(),
  plan_title: z.string(),
});

type PlanParam = z.infer<typeof planParam>;

export const Route = createFileRoute('/plangroup/plan')({
  validateSearch: (search): PlanParam => planParam.parse(search),
  component: Plan,
});

function Plan() {
  const { group_id, plan_id, group_title } = Route.useSearch();

  return (
    <>
      <Link to={PLAN_GROUP} search={{ group_id, group_title }}>
        <div className='bg-reiseorange min-h-30'>
          <h1>
            {group_id} - {plan_id}
          </h1>
        </div>
      </Link>

      <div className='text-zinc-500'> PLAN PAGE: CONTENTS</div>
    </>
  );
}
