import { useMutation } from '@tanstack/react-query';
import { savePlanGroup } from '../apis/supabaseAPI';
import { useState } from 'react';

type NewPlanGroupPopupBoxParam = {
  onClose: (isRefetch?: boolean) => void;
};

export default function NewPlanGroupPopupBox({
  onClose,
}: NewPlanGroupPopupBoxParam) {
  const [title, setTitle] = useState('');
  const { error, isError, mutate } = useMutation({
    mutationFn: (title: string) => savePlanGroup(title),
    onSuccess: () => onClose(true),
  });

  if (isError) console.log(error);

  const handleSavePlanGroup = () => {
    mutate(title);
  };

  const handleClick = () => {
    if (title) {
      handleSavePlanGroup();
    } else {
      onClose();
    }
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && title) {
      if (title) {
        handleSavePlanGroup();
      } else {
        onClose();
      }
    }
  };

  return (
    <div className='fixed top-50 left-1/2 -translate-x-1/2 py-2 px-3 w-70 bg-zinc-100 border-2 border-reiseorange rounded-md'>
      <div>
        <span className='text-reiseorange text-sm font-bold'>
          Create a new plan
        </span>
      </div>
      <input
        className='w-full text-xl border-1 border-zinc-300 rounded-sm text-zinc-500'
        type='text'
        placeholder='Titel'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleEnterPress}
      />
      <div className='flex justify-center pt-3 w-full'>
        <button
          className='py-1 px-5 rounded-lg bg-reisered'
          type='submit'
          onClick={handleClick}
        >
          OK
        </button>
      </div>
    </div>
  );
}
