import { createPlan } from '@/apis/supabase/plans';
import { useMutation } from '@tanstack/react-query';
import InputPopupBox from './InputPopupBox';

type createPlanPopupBoxParam = {
  groupId: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreatePlanPopupBox({
  groupId,
  onClose,
  onSuccess,
}: createPlanPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: (title: string) => createPlan(groupId, title),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    throwOnError: true,
  });

  return (
    <InputPopupBox
      title='Create a new plan'
      placeholder='Titel'
      onAccept={(title: string) => mutate(title)}
      onClose={onClose}
    />
  );
}
