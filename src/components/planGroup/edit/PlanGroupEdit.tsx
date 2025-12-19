import { Controller, useForm, useWatch } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
  deletePlanGroupThumbnail,
  uploadPlanGroupThumbnail,
} from '@/apis/supabase/buckets';
import { useReducer, useState } from 'react';
import { updatePlanGroupByGroupId } from '@/apis/supabase/planGroups';
import type { Database } from '@/database.types';
import ThumbnailEdit from './ThumbnailEdit';
import Calendar from './Calendar';
import type { DateRange } from 'react-day-picker';
import { getSchedule } from '../utils/time';

type PlanGroupForm = {
  title: string;
  thumbnail: File | null;
  schedule: DateRange | undefined;
};
type PlanGroupEdit = {
  planGroup: Database['public']['Tables']['plangroups']['Row'];
  thumbnail: File | null;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};
export default function PlanGroupEdit({
  planGroup,
  thumbnail,
  onClose,
  refetch,
}: PlanGroupEdit) {
  const {
    register,
    handleSubmit,
    control,
    formState: { dirtyFields },
  } = useForm<PlanGroupForm>({
    defaultValues: {
      title: planGroup.title,
      thumbnail: thumbnail,
      schedule: {
        from: planGroup.start_time ? new Date(planGroup.start_time) : undefined,
        to: planGroup.end_time ? new Date(planGroup.end_time) : undefined,
      },
    },
  });
  const currentThumbnail = useWatch({ control, name: 'thumbnail' });
  const currentSchedule = useWatch({ control, name: 'schedule' });

  const isThumbnailDirty = !(currentThumbnail === thumbnail);
  const isStartTimeDirty =
    currentSchedule?.from?.toISOString() !==
    (planGroup.start_time
      ? new Date(planGroup.start_time).toISOString()
      : undefined);
  const isEndTimeDirty =
    currentSchedule?.to?.toISOString() !==
    (planGroup.end_time
      ? new Date(planGroup.end_time).toISOString()
      : undefined);
  const isScheduleDirty = isStartTimeDirty || isEndTimeDirty;

  const isFormDirty =
    !!dirtyFields.title || isScheduleDirty || isThumbnailDirty;

  const { onChange: registerTitleOnChange, ...registerTitleRest } =
    register('title');
  const [titleEmpty, setTitleEmpty] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleEmpty(e.currentTarget.value.trim() === '');
  };

  const [showCalendar, toggleShowCalendar] = useReducer((prev) => !prev, false);
  const scheduleText = getSchedule(currentSchedule);

  const { mutate: submit, isPending } = useMutatePlanGroup({
    planGroup,
    isThumbnailDirty,
    prevThumbnail: thumbnail,
    curThumbnail: currentThumbnail,
    onClose,
    refetch,
  });

  const isSubmitDisabled = !isFormDirty || isPending || titleEmpty;

  const onFormSubmit = (e: React.FormEvent) => {
    void handleSubmit((value) => submit(value))(e);
  };

  return (
    <div className='fixed z-1 w-screen h-screen'>
      <form
        onSubmit={onFormSubmit}
        className='fixed flex top-50 left-1/2 -translate-x-1/2 w-3/5 h-70 rounded-sm p-2 bg-reiseorange xl:w-1/3'
      >
        <Controller
          name='thumbnail'
          control={control}
          render={({ field: { onChange } }) => (
            <ThumbnailEdit
              image={currentThumbnail}
              onChange={(file: File | null) => onChange(file)}
            />
          )}
        />
        <div className='flex flex-col justify-between w-1/2'>
          <div>
            <div className='relative mb-10'>
              <div className='rounded-sm border-1'>
                <input
                  type='text'
                  defaultValue={planGroup.title}
                  {...registerTitleRest}
                  onChange={(e) => {
                    void registerTitleOnChange(e);
                    handleTitleChange(e);
                  }}
                  className='w-full px-1 text-lg font-bold'
                />
              </div>
              {titleEmpty && (
                <div className='absolute'>
                  <span className='text-rose-500'>Enter a title</span>
                </div>
              )}
            </div>

            <div className='inline rounded-lg border-1 hover:bg-zinc-300'>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleShowCalendar();
                }}
                disabled={showCalendar}
                className='inline-flex gap-1 py-1 px-3 text-xs'
              >
                <span>{scheduleText}</span>
              </button>
            </div>
            {showCalendar && (
              <div className='absolute top-27 left-1/2 -translate-x-1/2 z-1'>
                <Controller
                  name='schedule'
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Calendar
                      range={currentSchedule}
                      setRange={onChange}
                      onClose={toggleShowCalendar}
                    />
                  )}
                />
              </div>
            )}
          </div>

          <div className='flex justify-center gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='py-1 px-2 rounded-lg bg-red-400'
            >
              Zurück
            </button>
            <button
              type='submit'
              disabled={isSubmitDisabled}
              className={`py-1 px-2 rounded-lg bg-green-300 ${
                isSubmitDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Speichern
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

type UseMutatePlanGroup = {
  planGroup: Database['public']['Tables']['plangroups']['Row'];
  isThumbnailDirty: boolean;
  prevThumbnail: File | null;
  curThumbnail: File | null;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};
// Update information of a plan group
function useMutatePlanGroup({
  planGroup,
  isThumbnailDirty,
  prevThumbnail,
  curThumbnail,
  onClose,
  refetch,
}: UseMutatePlanGroup) {
  return useMutation({
    mutationFn: async (data: PlanGroupForm) => {
      let thumbnailPath: string | null = null;
      if (isThumbnailDirty) {
        // Save a new thumbnail image in DB.
        if (curThumbnail) {
          const res = await uploadPlanGroupThumbnail(curThumbnail).catch(
            (e) => {
              console.log('Fail to upload a new image in db.');
              console.log(e);
              throw e;
            }
          );
          thumbnailPath = res.fullPath;
        } else {
          thumbnailPath = null;
        }

        // Remove a previously saved thumbnail image from DB.
        if (prevThumbnail) {
          await deletePlanGroupThumbnail(prevThumbnail.name).catch((e) => {
            console.log('Fail to remove an image from db.');
            console.log(e);
          });
        }
      }

      // Update a title and a thumbnail path of a plan group in DB
      await updatePlanGroupByGroupId(
        planGroup.id,
        data.title,
        thumbnailPath,
        data.schedule?.from?.toISOString() ?? null,
        data.schedule?.to?.toISOString() ?? null
      );
    },
    onSuccess: async () => {
      await refetch();
      onClose();
    },
  });
}
