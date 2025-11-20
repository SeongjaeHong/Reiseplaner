import { createFileRoute, Link } from '@tanstack/react-router';
import { PLAN_GROUP } from '../-constant';

export const Route = createFileRoute('/plangroup/plan')({
  component: plan,
});

export default function plan() {
  const { group_id, plan_id } = Route.useSearch();

  return (
    <>
      <Link to={PLAN_GROUP} search={{ group_id }}>
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
