import InputPopupBox from './InputPopupBox';
import { useMutation } from '@tanstack/react-query';
import { renamePlanByPlanId } from '@/apis/supabase/plans';

type ChangePlanNamePopupBoxParams = {
  planId: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ChangePlanNamePopupBox({
  planId,
  onClose,
  onSuccess,
}: ChangePlanNamePopupBoxParams) {
  const { mutate: changePlanName } = useMutation({
    mutationFn: (title: string) => renamePlanByPlanId(planId, title),
    onSuccess: () => {
      onSuccess();
      onClose();
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
