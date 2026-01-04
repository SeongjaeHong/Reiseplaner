import { Link } from '@tanstack/react-router';
import { useReducer, useRef, useState, lazy, Suspense, useEffect } from 'react';
import { FaCalendar, FaPen } from 'react-icons/fa6';
import type { Database } from '@/database.types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getSchedule } from './utils/time';
import { getPlansCount } from '@/apis/supabase/plans';
import { useFetchImage } from '@/utils/useFetchImage';
import { EMPTY_IMAGE_NAME, getImageURL } from '@/apis/supabase/buckets';

const PlanGroupEdit = lazy(() => import('./edit/PlanGroupEdit'));
const DeletePlanGroupPopupBox = lazy(() => import('./DeletePlanGroupPopupBox'));

type typePlanGroup = {
  planGroup: Database['public']['Tables']['plangroups']['Row'];
  refetch: () => Promise<unknown>;
};

export default function PlanGroupCard({ planGroup, refetch }: typePlanGroup) {
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
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!thumbnail) return;

    const objectUrl = URL.createObjectURL(thumbnail);
    setImgSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
      setImgSrc(null);
    };
  }, [thumbnail]);

  const schedule = getSchedule({
    from: planGroup.start_time ? new Date(planGroup.start_time) : undefined,
    to: planGroup.end_time ? new Date(planGroup.end_time) : undefined,
  });

  const { data: numPlanGroups, refetch: plansRefetch } = useGetPlansCounts(planGroup.id);
  const handleRefetch = async () => {
    await refetch();
    await plansRefetch();
  };

  return (
    <>
      <Link to={'/plangroup'} search={{ group_id: planGroup.id, group_title: planGroup.title }}>
        <div className='group relative h-80 cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl'>
          <div className='h-3/5'>
            {imgSrc ? (
              <img
                src={imgSrc}
                alt='A thumbnail of a plan group'
                className='h-full w-full object-cover transition-transform duration-50 group-hover:scale-105'
              />
            ) : (
              <img
                src={getImageURL(`images/${EMPTY_IMAGE_NAME}`)}
                alt='A thumbnail of a plan group'
                className='h-full w-full object-cover transition-transform duration-50 group-hover:scale-105'
              />
            )}
          </div>
          <div className='px-6 py-3'>
            <h1
              title={planGroup.title}
              className='line-clamp-2 text-2xl break-all whitespace-normal text-slate-800 max-md:text-xl'
            >
              {planGroup.title}
            </h1>
            <div className='mb-4 flex items-center gap-2 text-sm text-slate-400'>
              <FaCalendar />
              <span className='whitespace-normal max-md:text-xs'>{schedule}</span>
            </div>
            <div className='flex items-center border-t border-slate-50 pt-3'>
              <span className='text-xs text-slate-400'>
                {numPlanGroups} {numPlanGroups > 1 ? 'Pläne' : 'Plan'}
              </span>
            </div>
          </div>

          <div className='invisible absolute top-1 right-2 z-5 overflow-visible rounded-full bg-slate-300/50 group-hover:visible'>
            <button
              className='rounded-full p-2 hover:bg-slate-500/50'
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
              onClick={(e) => e.preventDefault()}
            >
              <FaPen />
            </button>
            <ul
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
              onClick={(e) => e.preventDefault()}
              className={`invisible absolute top-[-30px] left-[-90px] divide-y divide-zinc-600 overflow-hidden rounded-md bg-zinc-500/0 text-center opacity-0 duration-200 ease-out ${showMenu && 'visible !top-0 !bg-zinc-500 !opacity-100'}`}
            >
              <li className='w-full px-2 py-1 hover:bg-zinc-700' onClick={toggleshowEditBox}>
                <span>Bearbeiten</span>
              </li>
              <li className='w-full px-2 py-1 hover:bg-zinc-700' onClick={toggleShowDeleteBox}>
                <span>Löschen</span>
              </li>
            </ul>
          </div>
        </div>
      </Link>

      {showEditBox && (
        <Suspense>
          <PlanGroupEdit
            planGroup={planGroup}
            thumbnail={thumbnail}
            onClose={toggleshowEditBox}
            refetch={handleRefetch}
          />
        </Suspense>
      )}

      {showDeleteBox && (
        <Suspense>
          <DeletePlanGroupPopupBox
            planGroupId={planGroup.id}
            thumbnail={thumbnail}
            onClose={toggleShowDeleteBox}
            refetch={handleRefetch}
          />
        </Suspense>
      )}
    </>
  );
}

function useGetPlansCounts(groupId: number) {
  return useSuspenseQuery({
    queryKey: ['useGetPlansCounts', groupId],
    queryFn: () => getPlansCount(groupId),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
