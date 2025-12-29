import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { useMutation } from '@tanstack/react-query';
import { renamePlanByPlanId } from '@/apis/supabase/plans';
import { GuestError } from '@/errors/GuestError';
import { toast } from '../common/Toast/toast';

type ChangePlanNamePopupBoxParams = {
  planId: number;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function ChangePlanNamePopupBox({
  planId,
  onClose,
  refetch,
}: ChangePlanNamePopupBoxParams) {
  const { mutate: changePlanName } = useMutation({
    mutationFn: (title: string) => renamePlanByPlanId(planId, title),
    onSuccess: async () => {
      await refetch();
    },
    onError: (error) => {
      if (error instanceof GuestError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to rename a plan');
      }
    },
  });

  return (
    <InputPopupBox
      title='Change the title'
      placeholder='Neu Titel'
      onAccept={changePlanName}
      onClose={onClose}
    />
  );
}
