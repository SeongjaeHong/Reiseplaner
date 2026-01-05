import { createPlan } from '@/apis/supabase/plans';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import InputPopupBox from '@/components/common/popupBoxes/InputPopupBox';
import { GuestError } from '@/errors/GuestError';
import { toast } from '../common/Toast/toast';
import { plansCountsFetchKey } from '../planGroup/utils/fetchPlanGroups';
import { plansFetchKey } from './utils/fetchPlans';

type createPlanPopupBoxParam = {
  groupId: number;
  onClose: () => void;
};

export default function CreatePlanPopupBox({ groupId, onClose }: createPlanPopupBoxParam) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (title: string) => createPlan(groupId, title),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: plansCountsFetchKey(groupId) }),
        queryClient.invalidateQueries({ queryKey: plansFetchKey(groupId) }),
      ]);
    },
    onError: (error) => {
      if (error instanceof GuestError) {
        toast.error(error.message);
      } else {
        toast.error('Fehler beim Erstellen der Planung.');
      }
    },
  });

  return (
    <InputPopupBox
      title='Neue Planung erstellen.'
      placeholder='Titel'
      onAccept={(title: string) => mutate(title)}
      onClose={onClose}
    />
  );
}
