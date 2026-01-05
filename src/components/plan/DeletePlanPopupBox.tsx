import { useMutation, useQueryClient } from '@tanstack/react-query';
import Popupbox from '@/components/common/popupBoxes/Popupbox';
import { deletePlan } from '@/apis/supabase/plans';
import { useSuspenseQueryLocalContents } from '../planContents/utils/contents';
import { deleteEditorImagesFromDB } from '../planContents/utils/image';
import { toast } from '../common/Toast/toast';
import { plansFetchKey } from './utils/fetchPlans';

type DeletePlanPopupBoxParam = {
  groupId: number;
  planId: number;
  onClose: () => void;
};

export default function DeletePlanPopupBox({ groupId, planId, onClose }: DeletePlanPopupBoxParam) {
  const { data } = useSuspenseQueryLocalContents(planId);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async () => {
      const contents = data?.contents ?? [];

      await Promise.all(
        contents.map(async (content) => {
          await deleteEditorImagesFromDB(content.data);
        })
      );

      return await deletePlan(planId);
    },
    onSuccess: async (res) => {
      {
        if (res) {
          await queryClient.invalidateQueries({ queryKey: plansFetchKey(groupId) });
        } else {
          toast.error('Fehler beim Löschen der Planung');
        }
        onClose();
      }
    },
    onError: () => {
      toast.error('Fehler beim Löschen der Planung');
    },
  });

  return <Popupbox text='Diesen Plan löschen.' onAccept={mutate} onCancel={onClose} />;
}
