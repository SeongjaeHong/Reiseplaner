import { useMutation } from '@tanstack/react-query';
import Popupbox from './Popupbox';
import { deletePlan } from '@/apis/supabase/plans';

type DeletePlanPopupBoxParam = {
  planId: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DeletePlanPopupBox({
  planId,
  onClose,
  onSuccess,
}: DeletePlanPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: () => deletePlan(planId),
    onSuccess: (res) => {
      {
        if (res.status === 204) {
          onSuccess();
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
