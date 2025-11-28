import { Link } from '@tanstack/react-router';
import { useReducer } from 'react';
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
  const [showMenu, toggleShowMenu] = useReducer((prev) => !prev, false);
  const [showDeleteBox, toggleShowDeleteBox] = useReducer(
    (prev) => !prev,
    false
  );
  const handleClickPlanGroupMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleShowMenu();
  };

  const [showChangeNameBox, toggleShowChangeNameBox] = useReducer(
    (prev) => !prev,
    false
  );

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
              onClick={handleClickPlanGroupMenu}
            >
              <FaEllipsisVertical />
            </button>
            <PlanGroupMenuUI
              showMenu={showMenu}
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
) => `absolute invisible left-[-90px] top-[-30px] bg-zinc-500/0
      duration-200 ease-out opacity-0
      ${showMenu && 'visible !top-0 !bg-zinc-500 !opacity-100'}`;

const StyleMenu = 'px-2 py-1 hover:bg-zinc-700';

type PlanGroupMenuUIParams = {
  showMenu: boolean;
  toggleShowChangeNameBox: () => void;
  toggleShowDeleteBox: () => void;
};
function PlanGroupMenuUI({
  showMenu,
  toggleShowChangeNameBox,
  toggleShowDeleteBox,
}: PlanGroupMenuUIParams) {
  return (
    <div className={StyleMenuClick(showMenu)}>
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
