import { Controller, useForm, useWatch } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import {
  deletePlanGroupThumbnail,
  uploadPlanGroupThumbnail,
} from '@/apis/supabase/buckets';
import { useState } from 'react';
import { updatePlanGroupByGroupId } from '@/apis/supabase/planGroups';
import type { Database } from '@/database.types';
import ThumbnailEdit from './ThumbnailEdit';

type PlanGroupForm = {
  title: string;
  thumbnail: File | null;
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
    },
  });
  const currentThumbnail = useWatch({ control, name: 'thumbnail' });
  const isThumbnailDirty = !(currentThumbnail === thumbnail);
  const isFormDirty = !!dirtyFields.title || isThumbnailDirty;

  const { onChange: registerTitleOnChange, ...registerTitleRest } =
    register('title');
  const [titleEmpty, setTitleEmpty] = useState(false);
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value === '') {
      setTitleEmpty(true);
    } else {
      setTitleEmpty(false);
    }
  };

  const { mutate: submit, isPending } = useMutatePlanGroup({
    planGroup,
    isThumbnailDirty,
    prevThumbnail: thumbnail,
    curThumbnail: currentThumbnail,
    onClose,
    refetch,
  });

  const isSubmitDisabled = !isFormDirty || isPending || titleEmpty;

  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit((value) => submit(value))}
      className='fixed flex z-1 top-50 left-1/2 -translate-x-1/2 w-3/5 h-70 rounded-sm p-2 bg-red-300'
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
                className='w-full px-1 text-lg font-bold'
                type='text'
                defaultValue={planGroup.title}
                {...registerTitleRest}
                onChange={(e) => {
                  void registerTitleOnChange(e);
                  handleTitleChange(e);
                }}
              />
            </div>
            {titleEmpty && (
              <div className='absolute'>
                <span className='text-rose-500'>Enter a title</span>
              </div>
            )}
          </div>

          {/* TODO: Add a calendar component. */}
          <div className='inline-flex gap-1 py-1 px-3 rounded-xl border-1 text-xs'>
            <span>01. Jan. 2026</span>
            <span>-</span>
            <span>23. Feb. 2026</span>
            {/* <span>Bearbeiten</span> */}
          </div>
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
      let thumbnailPath = undefined;
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
      await updatePlanGroupByGroupId(planGroup.id, data.title, thumbnailPath);
    },
    onSuccess: async () => {
      await refetch();
      onClose();
    },
  });
}
