import { createPlanGroup } from '@/apis/supabase/planGroups';
import { useMutation } from '@tanstack/react-query';
import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { toast } from '../common/Toast/toast';
import { GuestError } from '@/errors/GuestError';

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
      toast.success('Planungsgruppe wurde erstellt.');
      await refetch();
    },
    onError: (error) => {
      if (error instanceof GuestError) {
        toast.error(error.message);
      } else {
        toast.error('Fehler beim Erstellen der Planungsgruppe.');
      }
    },
  });

  return (
    <InputPopupBox
      title='Neue Planungsgruppe erstellen'
      placeholder='Titel'
      onAccept={(title: string) => mutate(title)}
      onClose={onClose}
    />
  );
}
