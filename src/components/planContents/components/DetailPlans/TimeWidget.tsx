import { useState } from 'react';
import { FaClock } from 'react-icons/fa6';
import type { PlanTime } from '@/apis/supabase/planContents.types';
import TimeInputWithDropdown from './TimeInputWithDropdown';

interface TimeWidgetProps {
  time: PlanTime;
  setTime: (time: PlanTime) => void;
  timeActive: boolean;
  setTimeActive: (state: boolean) => void;
}

export default function TimeWidget({ time, setTime, timeActive, setTimeActive }: TimeWidgetProps) {
  const [isOpen, setIsOpen] = useState(timeActive);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (!nextState) {
      setTimeActive(false);
    } else if (isTimeValid(time.start, time.end)) {
      setTimeActive(true);
    }
  };

  const handleTimeChange = useTimeChange(time, setTime, setTimeActive);
  const isEndDisabled = time.start.hour === null || time.start.minute === null;

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 rounded-xl px-3 py-1 transition-all duration-300 max-[550px]:w-[81px] max-[550px]:flex-col max-[550px]:justify-center ${
        isOpen
          ? 'bg-reiseorange text-white hover:bg-orange-300'
          : 'w-20 w-[81px] bg-zinc-300 hover:bg-zinc-200'
      }`}
    >
      <span className='flex items-center gap-2'>
        <FaClock />
        Time
      </span>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className='animate-in fade-in ml-auto flex items-center duration-500 max-[550px]:flex-col'
        >
          <div className='flex items-center text-black'>
            <TimeInputWithDropdown
              type='hour'
              value={time.start.hour}
              onChange={handleTimeChange('startHour')}
            />
            <span className='mx-0.5 text-white'>:</span>
            <TimeInputWithDropdown
              type='minute'
              value={time.start.minute}
              onChange={handleTimeChange('startMinute')}
            />
          </div>
          <span className='mx-1 text-white'>-</span>
          <div className='flex items-center text-black'>
            <TimeInputWithDropdown
              type='hour'
              value={time.end.hour}
              onChange={handleTimeChange('endHour')}
              disabled={isEndDisabled}
            />
            <span className='mx-0.5 text-white'>:</span>
            <TimeInputWithDropdown
              type='minute'
              value={time.end.minute}
              onChange={handleTimeChange('endMinute')}
              disabled={isEndDisabled}
            />
          </div>
        </div>
      )}
    </button>
  );
}

const isTimeValid = (start: PlanTime['start'], end: PlanTime['end']) => {
  if (start.hour === null || start.minute === null || end.hour === null || end.minute === null) {
    return true;
  }
  const startTime = start.hour * 60 + start.minute;
  const endTime = end.hour * 60 + end.minute;
  return startTime <= endTime;
};

type TimeType = 'startHour' | 'startMinute' | 'endHour' | 'endMinute';

type UseTimeChange = (
  time: PlanTime,
  setTime: (time: PlanTime) => void,
  setTimeActive: (state: boolean) => void
) => (timeType: TimeType) => (option: string) => boolean;

const useTimeChange: UseTimeChange =
  (time, setTime, setTimeActive) =>
  (timeType: TimeType) =>
  (option: string): boolean => {
    const newTime = structuredClone(time);
    const isStart = timeType.startsWith('start');
    const unit = timeType.toLowerCase().includes('hour') ? 'hour' : 'minute';
    const otherUnit = unit === 'hour' ? 'minute' : 'hour';

    if (option === '--' || option === '') {
      if (isStart) {
        newTime.start = { hour: null, minute: null };
        newTime.end = { hour: null, minute: null };
      } else {
        newTime.end = { hour: null, minute: null };
      }
    } else {
      const newValue = Number(option);
      if (isStart) {
        newTime.start[unit] = newValue;
        if (newTime.start[otherUnit] === null) newTime.start[otherUnit] = 0;
      } else {
        newTime.end[unit] = newValue;
        if (newTime.end[otherUnit] === null) newTime.end[otherUnit] = 0;
      }
    }

    if (!isTimeValid(newTime.start, newTime.end)) {
      return false;
    }

    setTime(newTime);
    setTimeActive(true);
    return true;
  };
