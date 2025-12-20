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
        if (res) {
          await refetch();
        } else {
          console.error('Fail to delete the plan group: ', planGroupId);
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
