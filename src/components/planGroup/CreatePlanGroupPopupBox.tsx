import { createPlanGroup } from '@/apis/supabase/planGroups';
import { useMutation } from '@tanstack/react-query';
import InputPopupBox from '@/components/popupBoxes/InputPopupBox';

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
      await refetch();
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
