import { useMutation, useQueryClient } from '@tanstack/react-query';
import Popupbox from '@/components/common/popupBoxes/Popupbox';
import { deletePlan } from '@/apis/supabase/plans';
import { toast } from '../common/Toast/toast';
import { plansFetchKey } from './utils/fetchPlans';

type DeletePlanPopupBoxParam = {
  groupId: number;
  planId: number;
  onClose: () => void;
};

export default function DeletePlanPopupBox({ groupId, planId, onClose }: DeletePlanPopupBoxParam) {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async () => {
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
