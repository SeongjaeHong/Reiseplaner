import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePlanGroups } from '@/apis/supabase/planGroups';
import Popupbox from '@/components/common/popupBoxes/Popupbox';
import { deleteImage } from '@/apis/supabase/buckets';
import { toast } from '../common/Toast/toast';
import { ApiError } from '@/errors/ApiError';
import { GuestError } from '@/errors/GuestError';
import { useAuth } from '../auth/AuthContext';
import { plangroupsFetchKey } from './utils/fetchPlanGroups';

type DeletePlanGroupPopupBoxParam = {
  planGroupId: number;
  thumbnail: File | null;
  onClose: () => void;
};

export default function DeletePlanGroupPopupBox({
  planGroupId,
  thumbnail,
  onClose,
}: DeletePlanGroupPopupBoxParam) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      await queryClient.refetchQueries({ queryKey: plangroupsFetchKey(user!.id) });
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
