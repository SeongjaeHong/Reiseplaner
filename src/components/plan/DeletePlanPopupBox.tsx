import { useMutation } from '@tanstack/react-query';
import Popupbox from '@/components/common/popupBoxes/Popupbox';
import { deletePlan } from '@/apis/supabase/plans';
import { useSuspenseQueryLocalContents } from '../planContents/utils/contents';
import { deleteEditorImagesFromDB } from '../planContents/utils/image';
import { toast } from '../common/Toast/toast';

type DeletePlanPopupBoxParam = {
  planId: number;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function DeletePlanPopupBox({ planId, onClose, refetch }: DeletePlanPopupBoxParam) {
  const { data } = useSuspenseQueryLocalContents(planId);

  const { mutate } = useMutation({
    mutationFn: async () => {
      const contents = data?.contents ?? [];

      await Promise.all(
        contents.map(async (content) => {
          await deleteEditorImagesFromDB(content.data);
        })
      );

      return await deletePlan(planId);
    },
    onSuccess: async (res) => {
      {
        if (res) {
          await refetch();
        } else {
          toast.error('Fail to delete a plan');
        }
        onClose();
      }
    },
    onError: () => {
      toast.error('Failed to delete a plan');
    },
  });

  const handleClickCancel = () => {
    onClose();
  };

  return <Popupbox text='Remove this plan.' onAccept={mutate} onCancel={handleClickCancel} />;
}
