import { createPlan } from '@/apis/supabase/plans';
import { useMutation } from '@tanstack/react-query';
import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { GuestError } from '@/errors/GuestError';
import { toast } from '../common/Toast/toast';

type createPlanPopupBoxParam = {
  groupId: number;
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function CreatePlanPopupBox({ groupId, onClose, refetch }: createPlanPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: (title: string) => createPlan(groupId, title),
    onSuccess: async () => {
      await refetch();
    },
    onError: (error) => {
      if (error instanceof GuestError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create a plan');
      }
    },
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
