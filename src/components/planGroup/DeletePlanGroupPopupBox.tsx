import { useMutation } from '@tanstack/react-query';
import { deletePlanGroups } from '@/apis/supabase/planGroups';
import Popupbox from '@/components/common/popupBoxes/Popupbox';
import { deleteImage } from '@/apis/supabase/buckets';

type DeletePlanGroupPopupBoxParam = {
  planGroupId: number;
  thumbnail: File;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function DeletePlanGroupPopupBox({
  planGroupId,
  thumbnail,
  onClose,
  refetch,
}: DeletePlanGroupPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: async () => {
      await deleteImage(thumbnail.name);
      return await deletePlanGroups(planGroupId);
    },
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
