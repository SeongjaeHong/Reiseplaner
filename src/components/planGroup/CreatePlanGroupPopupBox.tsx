import { createPlanGroup } from '@/apis/supabase/planGroups';
import { useMutation } from '@tanstack/react-query';
import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { toast } from '../common/Toast/toast';

type createPlanGroupPopupBoxParam = {
  onClose: () => void;
  refetch: () => Promise<unknown>;
};

export default function CreatePlanGroupPopupBox({
  onClose,
  refetch,
}: createPlanGroupPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: (title: string) => createPlanGroup(title),
    onSuccess: async () => {
      toast.success('A plan group has been created.');
      await refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      throw error;
    },
  });

  return (
    <InputPopupBox
      title='Create a new plan group'
      placeholder='Titel'
      onAccept={(title: string) => mutate(title)}
      onClose={onClose}
    />
  );
}
