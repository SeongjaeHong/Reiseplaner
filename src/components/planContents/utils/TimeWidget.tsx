import React, { useRef, useState } from 'react';
import useClickOutside from '@/utils/useOutsideClick';
import { FaClock } from 'react-icons/fa6';

export type Time = {
  start: { hour: string; minute: string };
  end: { hour: string; minute: string };
};
type TimeWidget = {
  time: Time;
  setTime: (time: Time) => void;
  timeActive: boolean;
  setTimeActive: (state: boolean) => void;
};
export default function TimeWidget({
  time,
  setTime,
  timeActive,
  setTimeActive,
}: TimeWidget) {
  type TimeType = 'startHour' | 'startMinute' | 'endHour' | 'endMinute';
  const handleTimeChange = (timeType: TimeType) => {
    return (newValue: string) => {
      const start = {
        hour: timeType === 'startHour' ? newValue : time.start.hour,
        minute: timeType === 'startMinute' ? newValue : time.start.minute,
      };
      const end = {
        hour: timeType === 'endHour' ? newValue : time.end.hour,
        minute: timeType === 'endMinute' ? newValue : time.end.minute,
      };

      if (start.hour > end.hour) {
        return false;
      } else if (start.hour === end.hour && start.minute >= end.minute) {
        return false;
      } else {
        setTime({ start, end });
        setTimeActive(true);
        return true;
      }
    };
  };

  const [isOpen, setIsOpen] = useState(timeActive);
  const [isContentVisible, setIsContentVisible] = useState(timeActive);

  const handleOpen = () => {
    if (isOpen) {
      setIsContentVisible(false);
      setIsOpen(false);
      setTimeActive(false);
    } else {
      setIsOpen(true);
      setTimeActive(true);
    }
  };
  const handleTransitionEnd = () => {
    if (isOpen) {
      setIsContentVisible(true);
    }
  };
  return (
    <button
      onTransitionEnd={handleTransitionEnd}
      onClick={handleOpen}
      className={`flex items-center gap-1 rounded-xl py-1 px-3 transition-[width] duration-700 
        ${
          isOpen
            ? 'w-69 bg-reiseorange hover:bg-orange-300'
            : 'w-21 bg-zinc-300 hover:bg-zinc-200'
        }`}
    >
      <FaClock />
      <span>Time</span>
      {isContentVisible && (
        <div onClick={(e) => e.stopPropagation()} className='flex items-center'>
          <div>
            <TimeInputWithDropdown
              type='hour'
              value={time.start.hour}
              onChange={handleTimeChange('startHour')}
            />
            <span className='px-[2px]'>:</span>
            <TimeInputWithDropdown
              type='minute'
              value={time.start.minute}
              onChange={handleTimeChange('startMinute')}
            />
          </div>
          <span className='px-1'>-</span>
          <div>
            <TimeInputWithDropdown
              type='hour'
              value={time.end.hour}
              onChange={handleTimeChange('endHour')}
            />
            <span className='px-[2px]'>:</span>
            <TimeInputWithDropdown
              type='minute'
              value={time.end.minute}
              onChange={handleTimeChange('endMinute')}
            />
          </div>
        </div>
      )}
    </button>
  );
}

type TimeInputProps = {
  type: 'hour' | 'minute';
  value: string;
  onChange: (value: string) => boolean;
};
const TimeInputWithDropdown: React.FC<TimeInputProps> = ({
  type,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [warning, setWarning] = useState(false);
  const options = Array.from({ length: type === 'hour' ? 24 : 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  const refClickOutside = useClickOutside();
  const handleClickOutside = () => {
    setIsOpen(false);
  };

  const refWarningTimeout = useRef<number | null>(null);
  const handleWarning = (isSuccess: boolean) => {
    if (refWarningTimeout.current) {
      clearTimeout(refWarningTimeout.current);
    }

    if (!isSuccess) {
      setWarning(false);
    } else {
      setWarning(true);
      refWarningTimeout.current = setTimeout(() => setWarning(false), 1000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const limit = type === 'hour' ? 24 : 60;
    const isEmptyOrDigits = inputValue === '' || /^\d+$/.test(inputValue);
    const isValidValue = Number(inputValue) < limit;

    if (isEmptyOrDigits && isValidValue) {
      const isSuccess = onChange(inputValue);
      handleWarning(!isSuccess);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    const isSuccess = onChange(optionValue);
    handleWarning(!isSuccess);
    setIsOpen(false);
  };

  return (
    <div
      className='relative inline-block'
      ref={refClickOutside(handleClickOutside)}
    >
      <input
        type='text'
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder='00'
        maxLength={2}
        className={`w-10 border-1 rounded-md text-center text-sm ${
          warning ? 'text-red-500 border-red-500' : 'border-zinc-200'
        }`}
      />
      {isOpen && (
        <ul className='absolute text-gray-700 bg-white border-1 border-zinc-300 rounded-sm max-h-30 overflow-y-scroll no-scrollbar z-1'>
          {options.map((option) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className='px-2 cursor-pointer hover:bg-zinc-300'
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
