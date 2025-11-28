import { useMutation } from '@tanstack/react-query';
import { deletePlanGroups } from '../../apis/supabase/planGroups';
import Popupbox from './Popupbox';

type DeletePlanGroupPopupBoxParam = {
  planGroupId: number;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

export default function DeletePlanGroupPopupBox({
  planGroupId,
  onClose,
  onSuccess,
}: DeletePlanGroupPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: () => deletePlanGroups(planGroupId),
    onSuccess: async (res) => {
      {
        if (res.status === 204) {
          await onSuccess();
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
