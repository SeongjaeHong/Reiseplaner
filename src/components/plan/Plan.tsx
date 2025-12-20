import { Link } from '@tanstack/react-router';
import { useReducer, useRef, useState } from 'react';
import { FaEllipsisVertical } from 'react-icons/fa6';
import DeletePlanPopupBox from './DeletePlanPopupBox';
import ChangePlanNamePopupBox from './ChangePlanNamePopupBox';
import type { Database } from '@/database.types';

type Plan = {
  to: string;
  plan: Database['public']['Tables']['plans']['Row'];
  groupTitle: string;
  refetch: () => Promise<unknown>;
};

export default function Plan({ to, plan, groupTitle, refetch }: Plan) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteBox, toggleShowDeleteBox] = useReducer(
    (prev) => !prev,
    false
  );
  const [showChangeNameBox, toggleShowChangeNameBox] = useReducer(
    (prev) => !prev,
    false
  );

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
        to={to}
        search={{
          group_title: groupTitle,
          plan_id: plan.id,
          plan_title: plan.title,
        }}
        key={plan.id}
      >
        <div
          className='group relative flex justify-between my-1 p-3 h-20 bg-reisered'
          id={plan.id.toString()}
        >
          <h1 className='font-bold truncate'>{plan.title}</h1>
          <div className='absolute right-1 invisible group-hover:visible'>
            <button
              className='hover:bg-green-300 rounded-full p-2'
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
              onClick={(e) => e.preventDefault()}
            >
              <FaEllipsisVertical />
            </button>
            <PlanMenuUI
              showMenu={showMenu}
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
              toggleShowChangeNameBox={toggleShowChangeNameBox}
              toggleShowDeleteBox={toggleShowDeleteBox}
            />
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
        <DeletePlanPopupBox
          planId={plan.id}
          onClose={toggleShowDeleteBox}
          refetch={refetch}
        />
      )}
    </>
  );
}

const StyleMenuClick = (
  showMenu: boolean
) => `absolute invisible left-[-85px] top-[-30px] bg-zinc-500/0
      duration-200 ease-out opacity-0
      ${showMenu && 'visible !top-0 !bg-zinc-500 !opacity-100'}`;

const StyleMenu = 'px-2 py-1 hover:bg-zinc-700';

type PlanMenuUIParams = {
  showMenu: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  toggleShowChangeNameBox: () => void;
  toggleShowDeleteBox: () => void;
};
function PlanMenuUI({
  showMenu,
  onMouseEnter,
  onMouseLeave,
  toggleShowChangeNameBox,
  toggleShowDeleteBox,
}: PlanMenuUIParams) {
  return (
    <div
      className={StyleMenuClick(showMenu)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => e.preventDefault()}
    >
      <div
        className={`${StyleMenu} border-b-1 border-zinc-600`}
        onClick={toggleShowChangeNameBox}
      >
        <span>이름 변경</span>
      </div>
      <div className={StyleMenu} onClick={toggleShowDeleteBox}>
        <span>삭제</span>
      </div>
    </div>
  );
}
