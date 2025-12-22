import { type DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

type Calendar = {
  range: DateRange | undefined;
  setRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onClose: () => void;
};
export default function Calendar({ range, setRange, onClose }: Calendar) {
  return (
    <div className='rounded-lg bg-white p-4 font-bold text-black shadow-md'>
      <h2 className='mb-4 text-lg font-bold'>여행 일정 선택</h2>
      <DayPicker
        mode='range'
        selected={range}
        onSelect={setRange}
        numberOfMonths={2}
        disabled={{ before: new Date() }}
        classNames={{
          months: 'flex flex-col sm:flex-row gap-2',
          month: 'space-y-4',
          range_middle: 'bg-blue-100 ',
          range_start: 'bg-blue-500 text-white rounded-l-full',
          range_end: 'bg-blue-500 text-white rounded-r-full',
          selected: 'font-bold',
          chevron: 'fill-black',
          today: 'text-black',
        }}
      />
      <div className='mt-2 flex justify-end'>
        <button
          onClick={onClose}
          className='bg-reiseorange rounded-lg px-2 py-1 text-white hover:bg-orange-300'
        >
          Anwenden
        </button>
      </div>
    </div>
  );
}
