import { lazy, Suspense, useEffect, useReducer, useState } from 'react';
import { getPlanGroupsFetchKey } from '@/utils/fetchKeys';
import { useFetchImage } from '@/utils/useFetchImage';
import { useQueryClient } from '@tanstack/react-query';
import { getSchedule } from './utils/time';
import { EMPTY_IMAGE_NAME, getImageURL } from '@/apis/supabase/buckets';
import { FaCalendar, FaPen } from 'react-icons/fa6';
import type { PlanGroupResponseSchema } from '@/apis/supabase/planGroups.types';

const PlanGroupEdit = lazy(() => import('@/components/planGroup/edit/PlanGroupEdit'));

type PlanGroupHead = {
  planGroup: PlanGroupResponseSchema;
  refetch: () => Promise<unknown>;
};

export function PlanGroupHeader({ planGroup, refetch }: PlanGroupHead) {
  const [showEditBox, toggleshowEditBox] = useReducer((prev) => !prev, false);
  const queryClient = useQueryClient();
  const planGroupsFetchKey = getPlanGroupsFetchKey();
  const handleRefetch = async () => {
    void queryClient.refetchQueries({ queryKey: [planGroupsFetchKey] });
    await refetch();
  };

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const thumbnail = useFetchImage({ imageURL: planGroup?.thumbnailURL });

  useEffect(() => {
    if (!thumbnail) return;

    const objectUrl = URL.createObjectURL(thumbnail);
    setImgSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
      setImgSrc(null);
    };
  }, [thumbnail]);

  const schedule = {
    from: planGroup.start_time ? new Date(planGroup.start_time) : undefined,
    to: planGroup.end_time ? new Date(planGroup.end_time) : undefined,
  };
  const scheduleText = getSchedule(schedule);

  return (
    <div className='relative mb-12 h-80 overflow-hidden rounded-[40px] shadow-2xl'>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt='A thumbnail of a plan group'
          className='h-full w-full object-cover transition-transform duration-50 group-hover:scale-105'
        />
      ) : thumbnail === null ? (
        <img
          src={getImageURL(`images/${EMPTY_IMAGE_NAME}`)}
          alt='Default thumbnail'
          className='h-full w-full object-cover'
        />
      ) : (
        <div className='h-full w-full animate-pulse bg-zinc-300' />
      )}

      <div className='absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10'>
        <div className='flex items-end justify-between'>
          <div>
            <h2 className='mb-4 text-5xl font-black tracking-tight text-white'>
              {planGroup?.title}
            </h2>
            <div className='flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 font-medium text-white/90 backdrop-blur-md'>
              <FaCalendar className='text-indigo-300' /> {scheduleText}
            </div>
          </div>
          <button
            onClick={toggleshowEditBox}
            className='rounded-2xl border border-white/20 bg-white/20 p-4 text-white backdrop-blur-md transition-all hover:bg-white/30'
          >
            <FaPen />
          </button>
        </div>
      </div>
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
    </div>
  );
}
