import type { TypePlangroups } from '@/apis/supabase/planGroups';
import { renamePlanGroupByGroupId } from '@/apis/supabase/planGroups';
import InputPopupBox from '@/components/popupBoxes/InputPopupBox';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type ChangePlanGroupNamePopupBoxParams = {
  planGroupId: number;
  fetchKey: string[];
  onClose: () => void;
  refetch?: () => Promise<void>;
};

export default function ChangePlanGroupNamePopupBox({
  planGroupId,
  fetchKey,
  onClose,
  refetch,
}: ChangePlanGroupNamePopupBoxParams) {
  const queryClient = useQueryClient();

  const updateTitle = (title: string) => {
    queryClient.setQueryData(fetchKey, (planGroups: TypePlangroups) =>
      planGroups.map((planGroup) =>
        planGroup.id === planGroupId
          ? { ...planGroup, title: title }
          : planGroup
      )
    );
  };

  const { mutate: changePlanGroupName } = useMutation({
    mutationFn: (title: string) => renamePlanGroupByGroupId(planGroupId, title),
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
      onAccept={changePlanGroupName}
      onClose={onClose}
    />
  );
}
