import { useMutation } from '@tanstack/react-query';
import { deletePlanGroups } from '@/apis/supabase/planGroups';
import Popupbox from '@/components/common/popupBoxes/Popupbox';
import { deleteImage } from '@/apis/supabase/buckets';
import { toast } from '../common/Toast/toast';
import { ApiError } from '@/errors/ApiError';
import { GuestError } from '@/errors/GuestError';

type DeletePlanGroupPopupBoxParam = {
  planGroupId: number;
  thumbnail: File | null;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function DeletePlanGroupPopupBox({
  planGroupId,
  thumbnail,
  onClose,
  refetch,
}: DeletePlanGroupPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: async () => {
      if (thumbnail) {
        try {
          await deleteImage(thumbnail.name);
        } catch {
          console.error('Failed to delete an image from the server.');
        }
      }
      const success = await deletePlanGroups(planGroupId);
      if (!success) {
        throw new ApiError('DATABASE', {
          message: `Failed to delete the plan group: ${planGroupId}`,
        });
      }
    },
    onSuccess: async () => {
      await refetch();
      onClose();
    },
    onError: (error) => {
      if (error instanceof GuestError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete a plan group.');
      }
    },
  });

  const handleClickCancel = () => {
    onClose();
  };

  return <Popupbox text='Remove this plan.' onAccept={mutate} onCancel={handleClickCancel} />;
}
