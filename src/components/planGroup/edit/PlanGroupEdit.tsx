import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import ThumbnailEdit from './ThumbnailEdit';
import Calendar from './Calendar';
import { getSchedule } from '../utils/time';
import z from 'zod';
import type { DateRange } from 'react-day-picker';
import { usePlanGroupUpdate } from './utils/usePlanGroupUpdate';
import { isDefaultImage } from '@/apis/supabase/buckets';
import { FaCalendar } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import type { PlanGroupResponseSchema } from '@/apis/supabase/planGroups.types';

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
  planGroup: PlanGroupResponseSchema;
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
    formState: { dirtyFields, isValid },
  } = usePlanGroupEditForm(planGroup, thumbnail);

  const watchedThumbnail = useWatch({ control, name: 'thumbnail' });
  const watchedSchedule = useWatch({ control, name: 'schedule' });

  const [showCalendar, setShowCalendar] = useState(false);
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

  const isThumbnailChanged = useIsThumbnailChanged(watchedThumbnail, thumbnail);
  const isDirty = isThumbnailChanged || !!dirtyFields.schedule || !!dirtyFields.title;
  const isSubmitDisabled = !isDirty || !isValid || isPending || showCalendar;

  return (
    <div className='fixed inset-0 z-1 flex justify-center pt-20'>
      <div className='absolute inset-0 bg-slate-900/30 backdrop-blur-xs' onClick={onClose}></div>
      <form
        onSubmit={onFormSubmit}
        className='animate-in relative h-fit w-3/5 max-w-lg rounded-3xl bg-white shadow-2xl duration-200'
      >
        <div className='p-8 max-[600px]:text-sm max-[504px]:text-xs'>
          <div className='mb-6 flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-slate-800 max-[600px]:text-sm max-[504px]:text-xs'>
              Reiseinformationen bearbeiten
            </h1>
            <button
              onClick={onClose}
              className='absolute top-3 right-3 rounded-full p-2 text-xl text-slate-400 transition-colors hover:bg-slate-100'
            >
              <IoClose />
            </button>
          </div>

          {/* Thumbnail area */}
          <div className='mb-8 h-40 w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50'>
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
          </div>

          <div className='space-y-5'>
            {/* Title area */}
            <div>
              <p className='mb-2 ml-1 block text-sm font-bold text-slate-700 max-[504px]:text-xs'>
                Reisetitel
              </p>
              <input
                type='text'
                defaultValue={planGroup.title}
                {...register('title')}
                className='w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none max-[504px]:text-xs'
              />
            </div>

            {/* Schedule area */}
            <div>
              <p className='mb-2 ml-1 block text-sm font-bold text-slate-700 max-[504px]:text-xs'>
                Reisezeitraum
              </p>
              <div
                onClick={() => setShowCalendar(true)}
                className='flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 max-[504px]:text-xs'
              >
                <FaCalendar />
                <span>{scheduleText}</span>

                {showCalendar && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCalendar(false);
                    }}
                    className='fixed inset-0 z-1 flex justify-center pt-30'
                  >
                    <Controller
                      name='schedule'
                      control={control}
                      render={({ field: { onChange } }) => (
                        <Calendar
                          range={watchedSchedule}
                          setRange={onChange}
                          onClose={() => setShowCalendar(false)}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom button area */}
          <div className='mt-10 flex gap-3 max-[500px]:flex-col'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 rounded-2xl bg-slate-100 px-6 py-4 font-bold text-slate-600 transition-colors hover:bg-slate-200'
            >
              Zurück
            </button>
            <button
              type='submit'
              disabled={isSubmitDisabled}
              className={`bg-primary hover:bg-primary-strong flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold text-white transition-all ${
                isSubmitDisabled ? 'cursor-not-allowed opacity-30' : ''
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

const usePlanGroupEditForm = (planGroup: PlanGroupResponseSchema, thumbnail: File | null) => {
  return useForm<PlanGroupForm>({
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
};

const useIsThumbnailChanged = (watchedThumbnail: File | null, thumbnail: File | null) => {
  return useMemo(() => {
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
};
