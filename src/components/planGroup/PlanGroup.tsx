import { Link } from '@tanstack/react-router';
import { useReducer, useRef, useState } from 'react';
import { FaEllipsisVertical } from 'react-icons/fa6';
import DeletePlanGroupPopupBox from './DeletePlanGroupPopupBox';
import ChangePlanGroupNamePopupBox from './ChangePlanGroupNamePopupBox';

type typePlanGroup = {
  to: string;
  groupId: number;
  title: string;
  refetch: () => Promise<unknown>;
  fetchKey: string[];
};

export default function PlanGroup({
  to,
  groupId,
  title,
  refetch,
  fetchKey,
}: typePlanGroup) {
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
        search={{ group_id: groupId, group_title: title }}
        mask={{ to: to, search: { group_id: groupId } }}
        key={groupId}
      >
        <div
          className='group relative flex justify-between w-full my-1 p-3 h-20 bg-zinc-300 truncate'
          id={groupId.toString()}
        >
          <h1>{title}</h1>
          <div className='absolute right-1 invisible group-hover:visible overflow-visible'>
            <button
              className='hover:bg-green-300 rounded-full p-2'
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
              onClick={(e) => e.preventDefault()}
            >
              <FaEllipsisVertical />
            </button>
            <PlanGroupMenuUI
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
        <ChangePlanGroupNamePopupBox
          planGroupId={groupId}
          onClose={toggleShowChangeNameBox}
          fetchKey={fetchKey}
        />
      )}

      {showDeleteBox && (
        <DeletePlanGroupPopupBox
          planGroupId={groupId}
          onClose={toggleShowDeleteBox}
          refetch={refetch}
        />
      )}
    </>
  );
}

const StyleMenuGroup = (
  showMenu: boolean
) => `absolute invisible left-[-90px] top-[-30px]
      duration-200 ease-out opacity-0 bg-zinc-500/0
      text-center
      divide-y divide-zinc-600
      ${showMenu && 'visible !top-0 !bg-zinc-500 !opacity-100'}`;

const StyleMenuItem = 'w-full px-2 py-1 hover:bg-zinc-700';

type PlanGroupMenuUIParams = {
  showMenu: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  toggleShowChangeNameBox: () => void;
  toggleShowDeleteBox: () => void;
};
function PlanGroupMenuUI({
  showMenu,
  onMouseEnter,
  onMouseLeave,
  toggleShowChangeNameBox,
  toggleShowDeleteBox,
}: PlanGroupMenuUIParams) {
  return (
    <ul
      className={StyleMenuGroup(showMenu)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => e.preventDefault()}
    >
      <li className={StyleMenuItem} onClick={toggleShowChangeNameBox}>
        Bearbeiten
      </li>
      <li className={StyleMenuItem} onClick={toggleShowDeleteBox}>
        Löschen
      </li>
    </ul>
  );
}
