import { createPlanGroup } from '@/apis/supabase/planGroups';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { toast } from '../common/Toast/toast';
import { GuestError } from '@/errors/GuestError';
import { useAuth } from '../auth/AuthContext';
import { plangroupsFetchKey } from './utils/fetchPlanGroups';

type createPlanGroupPopupBoxParam = {
  onClose: () => void;
};

export default function CreatePlanGroupPopupBox({ onClose }: createPlanGroupPopupBoxParam) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { mutate } = useMutation({
    mutationFn: (title: string) => createPlanGroup(title),
    onSuccess: async () => {
      toast.success('Planungsgruppe wurde erstellt.');
      await queryClient.refetchQueries({ queryKey: plangroupsFetchKey(user!.id) });
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
