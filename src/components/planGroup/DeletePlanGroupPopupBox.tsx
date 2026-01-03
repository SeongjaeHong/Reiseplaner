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
          console.error('Fehler beim Löschen des Bildes vom Server.');
        }
      }
      const success = await deletePlanGroups(planGroupId);
      if (!success) {
        throw new ApiError('DATABASE', {
          message: `Fehler beim Löschen der Planungsgrouppe: ${planGroupId}`,
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
        toast.error('Fehler beim Löschen der Planungsgruppe.');
      }
    },
  });

  const handleClickCancel = () => {
    onClose();
  };

  return <Popupbox text='Diesen Plan löschen.' onAccept={mutate} onCancel={handleClickCancel} />;
}
