import useClickOutside from '@/utils/useClickOutside';
import { useEffect, useRef, useState } from 'react';

interface TimeInputProps {
  type: 'hour' | 'minute';
  value: number | null;
  onChange: (value: string) => boolean;
  disabled?: boolean;
}

export default function TimeInputWithDropdown({ type, value, onChange, disabled }: TimeInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [inputValue, setInputValue] = useState(
    value === null ? '' : String(value).padStart(2, '0')
  );

  useEffect(() => {
    setInputValue(value === null ? '' : String(value).padStart(2, '0'));
  }, [value]);

  const refClickOutside = useClickOutside();
  const triggerWarning = useTriggerWarning(setIsWarning);

  // In case a user typed the time manually
  const handleBlur = () => {
    if (inputValue === '' || inputValue === '--') {
      onChange('--');
    } else {
      const num = Number(inputValue);
      const limit = type === 'hour' ? 24 : 60;
      if (num < limit) {
        const success = onChange(num.toString());
        if (!success) {
          setInputValue(value === null ? '' : String(value).padStart(2, '0'));
          triggerWarning();
        }
      } else {
        setInputValue(value === null ? '' : String(value).padStart(2, '0'));
        triggerWarning();
      }
    }
    setIsDropdownOpen(false);
  };

  const options = [
    '--',
    ...Array.from({ length: type === 'hour' ? 24 : 60 }, (_, i) => String(i).padStart(2, '0')),
  ];

  return (
    <div className='relative inline-block' ref={refClickOutside(() => setIsDropdownOpen(false))}>
      <input
        type='text'
        value={isDropdownOpen ? inputValue : value === null ? '--' : String(value).padStart(2, '0')}
        onChange={(e) =>
          /^\d*$/.test(e.target.value) &&
          e.target.value.length <= 2 &&
          setInputValue(e.target.value)
        }
        onClick={() => !disabled && setIsDropdownOpen((prev) => !prev)}
        onBlur={handleBlur}
        readOnly={disabled}
        placeholder='--'
        className={`w-9 rounded-md border py-0.5 text-center text-xs ${
          isWarning ? 'border-red-500 bg-red-200 text-red-600' : 'border-zinc-200 text-white'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      />
      {isDropdownOpen && !disabled && (
        <ul className='no-scrollbar absolute z-1 mt-1 max-h-40 w-10 overflow-y-auto rounded-sm border border-zinc-300 bg-white'>
          {options.map((opt) => (
            <li
              key={opt}
              onMouseDown={(e) => e.preventDefault()} // prevent onBlur of <input>
              onClick={() => {
                if (onChange(opt)) setIsDropdownOpen(false);
                else triggerWarning();
              }}
              className='cursor-pointer px-2 py-1 text-xs hover:bg-zinc-100'
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const useTriggerWarning = (setIsWarning: (arg: boolean) => void) => {
  const timeoutRef = useRef<number | null>(null);

  return () => {
    setIsWarning(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setIsWarning(false), 1000);
  };
};
