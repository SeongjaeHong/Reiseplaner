import { Link } from '@tanstack/react-router';
import { useReducer, useRef, useState } from 'react';
import { FaEllipsisVertical } from 'react-icons/fa6';
import DeletePlanGroupPopupBox from './DeletePlanGroupPopupBox';
import PlanGroupEdit from './edit/PlanGroupEdit';
import type { Database } from '@/database.types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { downloadImage } from '@/apis/supabase/buckets';
import { getSchedule } from './utils/time';
import { toast } from '../common/Toast/toast';

type typePlanGroup = {
  to: string;
  planGroup: Database['public']['Tables']['plangroups']['Row'];
  refetch: () => Promise<unknown>;
};

export default function PlanGroup({ to, planGroup, refetch }: typePlanGroup) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteBox, toggleShowDeleteBox] = useReducer((prev) => {
    setShowMenu(false);
    return !prev;
  }, false);
  const [showEditBox, toggleshowEditBox] = useReducer((prev) => {
    setShowMenu(false);
    return !prev;
  }, false);

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

  const thumbnail = useFetchImage({ imageURL: planGroup.thumbnailURL });
  const schedule = getSchedule({
    from: planGroup.start_time ? new Date(planGroup.start_time) : undefined,
    to: planGroup.end_time ? new Date(planGroup.end_time) : undefined,
  });

  return (
    <>
      <Link to={to} search={{ group_id: planGroup.id, group_title: planGroup.title }}>
        <div className='group bg-reisered relative flex h-60 truncate'>
          <div className='w-1/3 flex-shrink-0'>
            {thumbnail && (
              <img
                src={URL.createObjectURL(thumbnail)}
                alt='A thumbnail of a plan group'
                className='h-full w-full object-fill'
              />
            )}
            {!thumbnail && (
              <div className='h-full w-full bg-zinc-500 object-fill'>
                <p className='text-white'>Failed to load an image.</p>
              </div>
            )}
          </div>
          <div className='mx-2 flex-1 font-bold'>
            <div className='py-2'>
              <h1
                title={planGroup.title}
                className='line-clamp-2 text-2xl break-all whitespace-normal max-md:text-xl'
              >
                {planGroup.title}
              </h1>
            </div>
            <div className='inline-block rounded-lg border-1 px-2'>
              <span className='text-sm whitespace-normal max-md:text-xs'>{schedule}</span>
            </div>
          </div>
          <div className='invisible absolute right-1 overflow-visible group-hover:visible'>
            <button
              className='rounded-full p-2 hover:bg-green-300'
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
              toggleshowEditBox={toggleshowEditBox}
              toggleShowDeleteBox={toggleShowDeleteBox}
            />
          </div>
        </div>
      </Link>

      {showEditBox && (
        <PlanGroupEdit
          planGroup={planGroup}
          thumbnail={thumbnail}
          onClose={toggleshowEditBox}
          refetch={refetch}
        />
      )}

      {showDeleteBox && (
        <DeletePlanGroupPopupBox
          planGroupId={planGroup.id}
          thumbnail={thumbnail}
          onClose={toggleShowDeleteBox}
          refetch={refetch}
        />
      )}
    </>
  );
}

const StyleMenuGroup = (showMenu: boolean) => `absolute invisible left-[-90px] top-[-30px]
      duration-200 ease-out opacity-0 bg-zinc-500/0
      text-center
      divide-y divide-zinc-600
      ${showMenu && 'visible !top-0 !bg-zinc-500 !opacity-100'}`;

const StyleMenuItem = 'w-full px-2 py-1 hover:bg-zinc-700';

type PlanGroupMenuUIParams = {
  showMenu: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  toggleshowEditBox: () => void;
  toggleShowDeleteBox: () => void;
};
function PlanGroupMenuUI({
  showMenu,
  onMouseEnter,
  onMouseLeave,
  toggleshowEditBox,
  toggleShowDeleteBox,
}: PlanGroupMenuUIParams) {
  return (
    <ul
      className={StyleMenuGroup(showMenu)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => e.preventDefault()}
    >
      <li className={StyleMenuItem} onClick={toggleshowEditBox}>
        <span>Bearbeiten</span>
      </li>
      <li className={StyleMenuItem} onClick={toggleShowDeleteBox}>
        <span>Löschen</span>
      </li>
    </ul>
  );
}

type UseFetchImage = {
  imageURL: string | null;
};
function useFetchImage({ imageURL }: UseFetchImage) {
  const { data } = useSuspenseQuery({
    queryKey: [imageURL],
    queryFn: () => {
      try {
        return downloadImage(imageURL);
      } catch {
        toast.error('Failed to download an image from the server.');
        return null;
      }
    },
    staleTime: Infinity,
  });

  return data;
}
