import { type DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

type Calendar = {
  range: DateRange | undefined;
  setRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onClose: () => void;
};
export default function Calendar({ range, setRange, onClose }: Calendar) {
  return (
    <div className='p-4 rounded-lg shadow-md bg-white font-bold text-black'>
      <h2 className='text-lg font-bold mb-4'>여행 일정 선택</h2>
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
      <div className='flex justify-end mt-2'>
        <button
          onClick={onClose}
          className='rounded-lg text-white py-1 px-2 bg-reiseorange hover:bg-orange-300'
        >
          Anwenden
        </button>
      </div>
    </div>
  );
}
