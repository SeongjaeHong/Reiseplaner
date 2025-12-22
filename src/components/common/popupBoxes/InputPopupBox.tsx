import { useState } from 'react';

type InputPopupBoxParams = {
  title: string;
  placeholder?: string;
  onAccept: (userInput: string) => void;
  onClose: () => void;
};

export default function InputPopupBox({
  title,
  placeholder = '',
  onAccept,
  onClose,
}: InputPopupBoxParams) {
  const [userInput, setUserInput] = useState('');
  const [showMsg, setShowMsg] = useState(false);

  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (userInput) {
        setShowMsg(false);
        onAccept(userInput);
        onClose();
      } else {
        setShowMsg(true);
      }
    }
  };

  const handleOnAccept = () => {
    if (userInput) {
      onAccept(userInput);
      onClose();
    } else {
      setShowMsg(true);
    }
  };

  return (
    <div className='border-reiseorange fixed top-50 left-1/2 z-1 w-70 -translate-x-1/2 rounded-md border-2 bg-zinc-100 px-3 py-2'>
      <div className='mb-2'>
        <span className='text-reiseorange text-sm font-bold'>{title}</span>
      </div>
      <div>
        <input
          className='w-full rounded-sm border-1 border-zinc-300 text-lg text-zinc-500 caret-pink-500'
          type='text'
          placeholder={placeholder}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleEnterPress}
        />
        <div>
          <span className={`${showMsg ? `visible` : `invisible`} text-red-500`}>
            Please input this field
          </span>
        </div>
      </div>
      <div className='mt-3 flex w-full justify-center gap-x-2'>
        <button className='bg-reisered rounded-lg px-5 py-1' onClick={handleOnAccept}>
          OK
        </button>
        <button className='bg-reisered rounded-lg px-5 py-1' onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
