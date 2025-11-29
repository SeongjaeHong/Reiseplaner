import { createPlanGroup } from '@/apis/supabase/planGroups';
import { useMutation } from '@tanstack/react-query';
import InputPopupBox from './InputPopupBox';

type createPlanGroupPopupBoxParam = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreatePlanGroupPopupBox({
  onClose,
  onSuccess,
}: createPlanGroupPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: (title: string) => createPlanGroup(title),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    throwOnError: true,
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
