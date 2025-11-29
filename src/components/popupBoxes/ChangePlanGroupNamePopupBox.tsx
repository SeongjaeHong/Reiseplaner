import { renamePlanGroupByGroupId } from '@/apis/supabase/planGroups';
import InputPopupBox from './InputPopupBox';
import { useMutation } from '@tanstack/react-query';

type ChangePlanGroupNamePopupBoxParams = {
  planGroupId: number;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ChangePlanGroupNamePopupBox({
  planGroupId,
  onClose,
  onSuccess,
}: ChangePlanGroupNamePopupBoxParams) {
  const { mutate: changePlanGroupName } = useMutation({
    mutationFn: (title: string) => renamePlanGroupByGroupId(planGroupId, title),
    onSuccess: () => {
      onSuccess();
      onClose();
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
