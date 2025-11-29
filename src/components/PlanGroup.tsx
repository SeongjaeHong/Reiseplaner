import { Link } from '@tanstack/react-router';
import { useReducer, useRef, useState } from 'react';
import { FaEllipsisVertical } from 'react-icons/fa6';
import DeletePlanGroupPopupBox from './popupBoxes/DeletePlanGroupPopupBox';
import ChangePlanGroupNamePopupBox from './popupBoxes/ChangePlanGroupNamePopupBox';

type typePlanGroup = {
  to: string;
  groupId: number;
  title: string;
  refetch: () => Promise<void>;
};

export default function PlanGroup({
  to,
  groupId,
  title,
  refetch,
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
      <Link to={to} search={{ group_id: groupId }} key={groupId}>
        <div
          className='group relative flex justify-between w-full my-1 p-3 h-20 bg-zinc-300 truncate'
          id={groupId.toString()}
        >
          <h1>{title}</h1>
          <div className='absolute right-1 invisible group-hover:visible'>
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
          onSuccess={refetch}
        />
      )}

      {showDeleteBox && (
        <DeletePlanGroupPopupBox
          planGroupId={groupId}
          onClose={toggleShowDeleteBox}
          onSuccess={refetch}
        />
      )}
    </>
  );
}

//TODO: 서서히 나타났다가, 즉시 사라지도록 변경. 현재는 서서히 사라짐.
const StyleMenuClick = (
  showMenu: boolean
) => `absolute invisible left-[-85px] top-[-30px] bg-zinc-500/0
      duration-200 ease-out opacity-0
      ${showMenu && 'visible !top-0 !bg-zinc-500 !opacity-100'}`;

const StyleMenu = 'px-2 py-1 hover:bg-zinc-700';

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
