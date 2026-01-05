import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renamePlanByPlanId } from '@/apis/supabase/plans';
import { GuestError } from '@/errors/GuestError';
import { toast } from '../common/Toast/toast';
import { plansFetchKey } from './utils/fetchPlans';

type ChangePlanNamePopupBoxParams = {
  groupId: number;
  planId: number;
  onClose: () => void;
};

export default function ChangePlanNamePopupBox({
  groupId,
  planId,
  onClose,
}: ChangePlanNamePopupBoxParams) {
  const queryClient = useQueryClient();
  const { mutate: changePlanName } = useMutation({
    mutationFn: (title: string) => renamePlanByPlanId(planId, title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: plansFetchKey(groupId) });
    },
    onError: (error) => {
      if (error instanceof GuestError) {
        toast.error(error.message);
      } else {
        toast.error('Fehler beim Umbenennen des Plans');
      }
    },
  });

  return (
    <InputPopupBox
      title='Titel ändern'
      placeholder='Neu Titel'
      onAccept={changePlanName}
      onClose={onClose}
    />
  );
}
