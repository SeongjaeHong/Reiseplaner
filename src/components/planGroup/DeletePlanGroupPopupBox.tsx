import { useMutation } from '@tanstack/react-query';
import { deletePlanGroups } from '@/apis/supabase/planGroups';
import Popupbox from '@/components/common/popupBoxes/Popupbox';

type DeletePlanGroupPopupBoxParam = {
  planGroupId: number;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function DeletePlanGroupPopupBox({
  planGroupId,
  onClose,
  refetch,
}: DeletePlanGroupPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: () => deletePlanGroups(planGroupId),
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
