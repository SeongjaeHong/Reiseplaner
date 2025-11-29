import { createPlan } from '@/apis/supabase/plans';
import { useMutation } from '@tanstack/react-query';
import InputPopupBox from './InputPopupBox';

type createPlanPopupBoxParam = {
  groupId: number;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function CreatePlanPopupBox({
  groupId,
  onClose,
  refetch,
}: createPlanPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: (title: string) => createPlan(groupId, title),
    onSuccess: async () => {
      await refetch();
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
