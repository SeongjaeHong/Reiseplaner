import InputPopupBox from '@/components/popupBoxes/InputPopupBox';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renamePlanByPlanId, type TypePlans } from '@/apis/supabase/plans';

type ChangePlanNamePopupBoxParams = {
  planId: number;
  fetchKey: string[];
  onClose: () => void;
  refetch?: () => Promise<unknown>;
};

export default function ChangePlanNamePopupBox({
  planId,
  fetchKey,
  onClose,
  refetch,
}: ChangePlanNamePopupBoxParams) {
  const queryClient = useQueryClient();

  const updateTitle = (title: string) => {
    queryClient.setQueryData(fetchKey, (plans: TypePlans) =>
      plans.map((plan) =>
        plan.id === planId ? { ...plan, title: title } : plan
      )
    );
  };

  const { mutate: changePlanName } = useMutation({
    mutationFn: (title: string) => renamePlanByPlanId(planId, title),
    onSuccess: async (_, title) => {
      updateTitle(title);
      if (refetch) {
        await refetch();
      }
    },
  });

  return (
    <InputPopupBox
      title='Change the title'
      placeholder='Neu Titel'
      onAccept={changePlanName}
      onClose={onClose}
    />
  );
}
