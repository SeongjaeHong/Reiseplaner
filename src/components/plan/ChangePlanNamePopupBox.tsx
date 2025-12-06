import InputPopupBox from '@/components/popupBoxes/InputPopupBox';
import { useMutation } from '@tanstack/react-query';
import { renamePlanByPlanId } from '@/apis/supabase/plans';

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
