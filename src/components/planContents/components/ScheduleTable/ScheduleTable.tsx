import { useSuspenseQueryLocalContents } from '../../utils/contents';

type ScheduleTable = {
  planId: number;
  focusedId: string | null;
  onSelectContent: (id: string) => void;
};
export default function ScheduleTable({ planId, focusedId, onSelectContent }: ScheduleTable) {
  const { data } = useSuspenseQueryLocalContents(planId);

  return (
    <div className='flex flex-col'>
      <div className='mb-2 pt-1'>
        <h1 className='text-xl font-bold text-black'>Schedule</h1>
      </div>

      <div className='relative flex flex-1 flex-col justify-between'>
        <div className='bg-reiseorange absolute left-[46px] h-full w-[2px] max-sm:hidden' />
        {data?.contents.map((content) => {
          if (content.type === 'text' && content.isTimeActive) {
            const text = content.title ? content.title : content.data.slice(0, 50);
            const startTime =
              String(content.time.start.hour).padStart(2, '0') +
              ':' +
              String(content.time.start.minute).padStart(2, '0');
            const isFocused = focusedId === content.id;

            return (
              <div
                key={content.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectContent(content.id);
                }}
                className={`relative mb-2 flex cursor-pointer rounded-lg p-1 text-black transition-all hover:bg-orange-300 hover:text-white ${
                  isFocused && 'bg-orange-400 text-white ring-2 ring-orange-400'
                }`}
              >
                <h1 className='text-center max-sm:w-full'>{startTime}</h1>
                <h1 className='line-clamp-2 flex-1 pl-2 max-sm:hidden'>{text}</h1>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
