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
      } else {
        setShowMsg(true);
      }
    }
  };

  const handleOnAccept = () => {
    if (userInput) {
      onAccept(userInput);
    } else {
      setShowMsg(true);
    }
  };

  return (
    <div className='fixed z-1 top-50 left-1/2 -translate-x-1/2 py-2 px-3 w-70 bg-zinc-100 border-2 border-reiseorange rounded-md'>
      <div className='mb-2'>
        <span className='text-reiseorange text-sm font-bold'>{title}</span>
      </div>
      <div>
        <input
          className='w-full text-lg border-1 border-zinc-300 rounded-sm text-zinc-500 caret-pink-500'
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
      <div className='flex justify-center mt-3 w-full gap-x-2'>
        <button
          className='py-1 px-5 rounded-lg bg-reisered'
          onClick={handleOnAccept}
        >
          OK
        </button>
        <button className='py-1 px-5 rounded-lg bg-reisered' onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
