import { useMutation } from '@tanstack/react-query';
import Popupbox from '@/components/common/popupBoxes/Popupbox';
import { deletePlan } from '@/apis/supabase/plans';
import { useSuspenseQueryLocalContents } from '../planContents/utils/contents';
import { deleteEditorImagesFromDB } from '../planContents/utils/image';

type DeletePlanPopupBoxParam = {
  planId: number;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function DeletePlanPopupBox({ planId, onClose, refetch }: DeletePlanPopupBoxParam) {
  const { data } = useSuspenseQueryLocalContents(planId);

  const { mutate } = useMutation({
    mutationFn: () => {
      data?.contents.forEach((content) => {
        void deleteEditorImagesFromDB(content.data);
      });
      return deletePlan(planId);
    },
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

  return <Popupbox text='Remove this plan.' onAccept={mutate} onCancel={handleClickCancel} />;
}
