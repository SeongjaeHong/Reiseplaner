import React, { useRef, useState } from 'react';
import useClickOutside from '@/utils/useClickOutside';
import { FaClock } from 'react-icons/fa6';
import type { PlanTime } from '@/apis/supabase/planContents.types';

type TimeWidget = {
  time: PlanTime;
  setTime: (time: PlanTime) => void;
  timeActive: boolean;
  setTimeActive: (state: boolean) => void;
};
export default function TimeWidget({ time, setTime, timeActive, setTimeActive }: TimeWidget) {
  const [isOpen, setIsOpen] = useState(timeActive);
  const [isContentVisible, setIsContentVisible] = useState(timeActive);

  const isStartTimeEarlierThanEndTime = (start: PlanTime['start'], end: PlanTime['end']) => {
    return start.hour < end.hour || (start.hour === end.hour && start.minute < end.minute);
  };

  const handleOpen = () => {
    if (isOpen) {
      setIsContentVisible(false);
      setIsOpen(false);
      setTimeActive(false);
    } else {
      setIsOpen(true);
      if (isStartTimeEarlierThanEndTime(time.start, time.end)) {
        setTimeActive(true);
      }
    }
  };
  const handleTransitionEnd = () => {
    if (isOpen) {
      setIsContentVisible(true);
    }
  };

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

      if (!isStartTimeEarlierThanEndTime(start, end)) {
        return false;
      }

      setTime({ start, end });
      setTimeActive(true);
      return true;
    };
  };

  return (
    <button
      onTransitionEnd={handleTransitionEnd}
      onClick={handleOpen}
      className={`flex items-center gap-1 rounded-xl px-3 py-1 transition-[width] duration-700 ${
        isOpen ? 'bg-reiseorange w-69 hover:bg-orange-300' : 'w-21 bg-zinc-300 hover:bg-zinc-200'
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
function TimeInputWithDropdown({ type, value, onChange }: TimeInputProps) {
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
    <div className='relative inline-block' ref={refClickOutside(handleClickOutside)}>
      <input
        type='text'
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder='00'
        maxLength={2}
        className={`w-10 rounded-md border-1 text-center text-sm ${
          warning ? 'border-red-500 text-red-500' : 'border-zinc-200'
        }`}
      />
      {isOpen && (
        <ul className='no-scrollbar absolute z-1 max-h-30 overflow-y-scroll rounded-sm border-1 border-zinc-300 bg-white text-gray-700'>
          {options.map((option) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className='cursor-pointer px-2 hover:bg-zinc-300'
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
