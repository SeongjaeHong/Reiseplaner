import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useReducer } from 'react';
import type { Database } from '@/database.types';
import ThumbnailEdit from './ThumbnailEdit';
import Calendar from './Calendar';
import { getSchedule } from '../utils/time';
import z from 'zod';
import type { DateRange } from 'react-day-picker';
import { usePlanGroupUpdate } from './utils/usePlanGroupUpdate';
import { isDefaultImage } from '@/apis/supabase/buckets';

const planGroupEditFormSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title.'),
  thumbnail: z.instanceof(File).nullable(),
  schedule: z
    .object({
      from: z.union([z.date(), z.undefined()]), // key 'from' must exist but its value can be undefined
      to: z.date().optional(),
    })
    .optional(),
});
export type PlanGroupForm = z.infer<typeof planGroupEditFormSchema>;

type PlanGroupEdit = {
  planGroup: Database['public']['Tables']['plangroups']['Row'];
  thumbnail: File | null;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};
export default function PlanGroupEdit({ planGroup, thumbnail, onClose, refetch }: PlanGroupEdit) {
  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { dirtyFields, errors, isValid },
  } = useForm<PlanGroupForm>({
    resolver: zodResolver(planGroupEditFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: planGroup.title,
      thumbnail: thumbnail,
      schedule: {
        from: planGroup.start_time ? new Date(planGroup.start_time) : undefined,
        to: planGroup.end_time ? new Date(planGroup.end_time) : undefined,
      } as DateRange,
    },
  });

  const watchedThumbnail = useWatch({ control, name: 'thumbnail' });
  const watchedSchedule = useWatch({ control, name: 'schedule' });

  const isThumbnailChanged = useMemo(() => {
    if (!watchedThumbnail) {
      if (!thumbnail) {
        return false;
      }
      return !isDefaultImage(thumbnail.name);
    }

    if (!thumbnail) {
      return true;
    }

    return (
      watchedThumbnail.name !== thumbnail.name ||
      watchedThumbnail.size !== thumbnail.size ||
      watchedThumbnail.lastModified !== thumbnail.lastModified
    );
  }, [watchedThumbnail, thumbnail]);

  const [showCalendar, toggleShowCalendar] = useReducer((prev) => !prev, false);
  const scheduleText = getSchedule(watchedSchedule);

  const { mutate: submit, isPending } = usePlanGroupUpdate({
    planGroupId: planGroup.id,
    prevThumbnail: thumbnail,
    onClose,
    refetch,
  });

  const onFormSubmit = (e: React.FormEvent) => {
    void handleSubmit(
      (value) => submit(value),
      (error) => {
        console.error('Validity check error:', error);
      }
    )(e);
  };

  const isDirty = isThumbnailChanged || !!dirtyFields.schedule || !!dirtyFields.title;
  const isSubmitDisabled = !isDirty || !isValid || isPending;

  return (
    <div className='fixed z-1 h-screen w-screen'>
      <form
        onSubmit={onFormSubmit}
        className='bg-reiseorange fixed top-50 left-1/2 flex h-70 w-3/5 -translate-x-1/2 rounded-sm p-2 xl:w-1/3'
      >
        {/* Thumbnail area */}
        <Controller
          name='thumbnail'
          control={control}
          render={({ field: { value, onChange } }) => (
            <ThumbnailEdit
              image={value ?? null}
              onChange={(file: File | null) => {
                onChange(file);
                void trigger('thumbnail');
              }}
            />
          )}
        />
        <div className='flex w-1/2 flex-col justify-between'>
          <div>
            <div className='relative mb-10'>
              <div className='rounded-sm border-1'>
                {/* Title input area */}
                <input
                  type='text'
                  defaultValue={planGroup.title}
                  {...register('title')}
                  className='w-full px-1 text-lg font-bold'
                />
              </div>
              {errors.title && (
                <div className='absolute'>
                  <span className='text-rose-500'>{errors.title.message}</span>
                </div>
              )}
            </div>

            {/* Plan schedule area */}
            <div className='inline rounded-lg border-1 hover:bg-zinc-300'>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleShowCalendar();
                }}
                disabled={showCalendar}
                className='inline-flex gap-1 px-3 py-1 text-xs'
              >
                <span>{scheduleText}</span>
              </button>
            </div>
            {showCalendar && (
              <div className='absolute top-27 left-1/2 z-1 -translate-x-1/2'>
                <Controller
                  name='schedule'
                  control={control}
                  render={({ field: { onChange } }) => (
                    <Calendar
                      range={watchedSchedule}
                      setRange={onChange}
                      onClose={toggleShowCalendar}
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* Botton button area */}
          <div className='flex justify-center gap-2'>
            <button type='button' onClick={onClose} className='rounded-lg bg-red-400 px-2 py-1'>
              Zurück
            </button>
            <button
              type='submit'
              disabled={isSubmitDisabled}
              className={`rounded-lg bg-green-300 px-2 py-1 ${
                isSubmitDisabled ? 'cursor-not-allowed opacity-50' : ''
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
