import { Link } from '@tanstack/react-router';
import { useReducer, useRef, useState } from 'react';
import { FaPen } from 'react-icons/fa6';
import DeletePlanPopupBox from './DeletePlanPopupBox';
import ChangePlanNamePopupBox from './ChangePlanNamePopupBox';
import type { Database } from '@/database.types';

type Plan = {
  plan: Database['public']['Tables']['plans']['Row'];
  groupTitle: string;
  refetch: () => Promise<unknown>;
};

export default function Plan({ plan, groupTitle, refetch }: Plan) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteBox, toggleShowDeleteBox] = useReducer((prev) => !prev, false);
  const [showChangeNameBox, toggleShowChangeNameBox] = useReducer((prev) => !prev, false);

  const refTimer = useRef<number | null>(null);
  const handleMenuMouseEnter = () => {
    if (refTimer.current) {
      clearTimeout(refTimer.current);
      refTimer.current = null;
    }

    setShowMenu(true);
  };

  const handleMenuMouseLeave = () => {
    if (refTimer.current) {
      clearTimeout(refTimer.current);
    }

    refTimer.current = setTimeout(() => setShowMenu(false), 300);
  };

  return (
    <>
      <Link
        to={'/plangroup/plan'}
        search={{
          group_title: groupTitle,
          plan_id: plan.id,
          plan_title: plan.title,
        }}
        key={plan.id}
      >
        <div
          className='group relative mb-2 flex cursor-pointer items-center justify-between rounded-3xl border border-slate-100 bg-white p-7 transition-all hover:-translate-x-1 hover:border-indigo-200 hover:shadow-xl'
          id={plan.id.toString()}
        >
          <h1 className='mb-1 truncate text-xl font-bold text-slate-800'>{plan.title}</h1>
          <div className='invisible absolute top-6 right-10 rounded-full bg-slate-500/30 group-hover:visible'>
            <button
              className='rounded-full p-2 hover:bg-slate-500'
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
              onClick={(e) => e.preventDefault()}
            >
              <FaPen />
            </button>
            <div
              className={`invisible absolute top-[-30px] left-[-115px] overflow-hidden rounded-md opacity-0 duration-200 ease-out ${showMenu && 'visible !top-[-5px] !bg-zinc-500 !opacity-100'}`}
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
              onClick={(e) => e.preventDefault()}
            >
              <div
                className='border-b-1 border-zinc-600 px-2 py-1 hover:bg-zinc-700'
                onClick={toggleShowChangeNameBox}
              >
                <span>Umbenennen</span>
              </div>
              <div className='px-2 py-1 hover:bg-zinc-700' onClick={toggleShowDeleteBox}>
                <span>Löschen</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {showChangeNameBox && (
        <ChangePlanNamePopupBox
          planId={plan.id}
          onClose={toggleShowChangeNameBox}
          refetch={refetch}
        />
      )}

      {showDeleteBox && (
        <DeletePlanPopupBox planId={plan.id} onClose={toggleShowDeleteBox} refetch={refetch} />
      )}
    </>
  );
}
