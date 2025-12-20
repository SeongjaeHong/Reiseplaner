import { useMutation } from '@tanstack/react-query';
import Popupbox from '@/components/common/popupBoxes/Popupbox';
import { deletePlan } from '@/apis/supabase/plans';

type DeletePlanPopupBoxParam = {
  planId: number;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function DeletePlanPopupBox({
  planId,
  onClose,
  refetch,
}: DeletePlanPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: () => deletePlan(planId),
    onSuccess: async (res) => {
      {
        if (res) {
          await refetch();
        } else {
          console.log('Fail to delete the plan');
        }
        onClose();
      }
    },
    throwOnError: true,
  });

  const handleClickCancel = () => {
    onClose();
  };

  return (
    <Popupbox
      text='Remove this plan.'
      onAccept={mutate}
      onCancel={handleClickCancel}
    />
  );
}
