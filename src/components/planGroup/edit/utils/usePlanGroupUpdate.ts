import { useMutation } from '@tanstack/react-query';
import { deleteImage, uploadImage } from '@/apis/supabase/buckets';
import { updatePlanGroupByGroupId } from '@/apis/supabase/planGroups';
import type { PlanGroupForm } from '../PlanGroupEdit';
import { toast } from '@/components/common/Toast/toast';
import { GuestError } from '@/errors/GuestError';

type UsePlanGroupUpdate = {
  planGroupId: number;
  prevThumbnail: File | null;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};
// Update a plan group
export function usePlanGroupUpdate({
  planGroupId,
  prevThumbnail,
  onClose,
  refetch,
}: UsePlanGroupUpdate) {
  return useMutation({
    mutationFn: async (data: PlanGroupForm) => {
      let thumbnailPath: string | null = null;

      // Save a new thumbnail image in DB.
      if (data.thumbnail) {
        const res = await uploadImage(data.thumbnail);
        thumbnailPath = res.fullPath;
      } else {
        thumbnailPath = null;
      }

      // Remove a previously saved thumbnail image from DB.
      if (prevThumbnail) {
        try {
          await deleteImage(prevThumbnail.name);
        } catch {
          console.error('Fail to delete an image from the server.');
        }
      }

      // Update a title and a thumbnail path of a plan group in DB
      await updatePlanGroupByGroupId(
        planGroupId,
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
    onError: (error) => {
      if (error instanceof GuestError) {
        toast.error("Guest can't update a plan group.");
      } else {
        toast.error('Failed to update a plan group.');
      }
    },
  });
}
