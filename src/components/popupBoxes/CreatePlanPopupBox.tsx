import { createPlan } from '@/apis/supabase/plans';
import { useMutation } from '@tanstack/react-query';
import InputPopupBox from './InputPopupBox';

type createPopupBoxParam = {
  groupId: number;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

export default function CreatePlanPopupBox({
  groupId,
  onClose,
  onSuccess,
}: createPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: (title: string) => createPlan(groupId, title),
    onSuccess: async () => {
      await onSuccess();
      onClose();
    },
    throwOnError: true,
  });

  return (
    <InputPopupBox
      title='Create a new plan'
      onAccept={(title: string) => mutate(title)}
      onClose={onClose}
    />
  );
}
