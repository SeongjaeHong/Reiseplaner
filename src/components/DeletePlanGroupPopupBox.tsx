import { deletePlanGroups } from '../apis/supabase/planGroups';

type DeletePlanGroupPopupBoxParam = {
  planId: number;
  onClose: (isRefetch?: boolean) => void;
};

export default function DeletePlanGroupPopupBox({
  planId,
  onClose,
}: DeletePlanGroupPopupBoxParam) {
  const handleClickOK = async () => {
    await deletePlanGroups(planId);
    onClose(true);
  };

  const handleClickCancel = () => {
    onClose();
  };

  return (
    <div className='fixed top-50 left-1/2 -translate-x-1/2 py-2 px-3 w-70 bg-zinc-100 border-2 border-reiseorange rounded-md'>
      <div>
        <span className='text-reiseorange text-sm font-bold'>
          Remove the plan.
        </span>
      </div>
      <div className='flex justify-center pt-3 w-full'>
        <button
          className='py-1 px-5 mx-3 rounded-lg bg-reisered'
          onClick={handleClickOK}
        >
          OK
        </button>
        <button
          className='py-1 px-5 rounded-lg bg-reisered'
          onClick={handleClickCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
