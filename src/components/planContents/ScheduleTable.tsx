import { useSuspenseQueryLocalContents } from './utils/contents';

type ScheduleTable = { planId: number };
export default function ScheduleTable({ planId }: ScheduleTable) {
  const { data } = useSuspenseQueryLocalContents(planId);

  return (
    <div className='flex flex-col'>
      <div className='pt-1 mb-2'>
        <h1 className='font-bold text-xl'>Schedule</h1>
      </div>

      <div className='relative flex-1 flex flex-col justify-between'>
        <div className='absolute h-full w-[2px] left-[42px] bg-reiseorange max-sm:hidden' />
        {data?.contents.map((content) => {
          if (content.type === 'text' && content.isTimeActive) {
            const text = content.title
              ? content.title
              : content.data.slice(0, 50);
            const startTime =
              content.time.start.hour + ':' + content.time.start.minute;
            return (
              <div
                key={content.id}
                className='flex relative hover:bg-orange-300 rounded-lg mb-2'
              >
                <h1 className='text-center max-sm:w-full'>{startTime}</h1>
                <h1 className='pl-2 flex-1 line-clamp-2 max-sm:hidden'>
                  {text}
                </h1>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
