import { createPlanGroup } from '@/apis/supabase/planGroups';
import { useMutation } from '@tanstack/react-query';
import InputPopupBox from './InputPopupBox';

type createPopupBoxParam = {
  onClose: (isRefetch?: boolean) => void;
  onSuccess: () => Promise<void>;
};

export default function CreatePlanGroupPopupBox({
  onClose,
  onSuccess,
}: createPopupBoxParam) {
  const { mutate } = useMutation({
    mutationFn: (title: string) => createPlanGroup(title),
    onSuccess: async () => {
      await onSuccess();
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
