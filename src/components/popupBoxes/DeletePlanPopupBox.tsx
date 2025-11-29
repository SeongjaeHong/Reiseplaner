import { useMutation } from '@tanstack/react-query';
import Popupbox from './Popupbox';
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
        if (res.status === 204) {
          await refetch();
        } else {
          console.log('Delete 실패');
          console.log(res);
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
