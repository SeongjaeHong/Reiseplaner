import { useSuspenseQueryLocalContents } from './utils/contents';

type ScheduleTable = {
  planId: number;
  focusedId: string | null;
  onSelectContent: (id: string) => void;
};
export default function ScheduleTable({
  planId,
  focusedId,
  onSelectContent,
}: ScheduleTable) {
  const { data } = useSuspenseQueryLocalContents(planId);

  return (
    <div className='flex flex-col'>
      <div className='pt-1 mb-2'>
        <h1 className='font-bold text-xl text-black'>Schedule</h1>
      </div>

      <div className='relative flex-1 flex flex-col justify-between'>
        <div className='absolute h-full w-[2px] left-[46px] bg-reiseorange max-sm:hidden' />
        {data?.contents.map((content) => {
          if (content.type === 'text' && content.isTimeActive) {
            const text = content.title
              ? content.title
              : content.data.slice(0, 50);
            const startTime =
              content.time.start.hour + ':' + content.time.start.minute;
            const isFocused = focusedId === content.id;

            return (
              <div
                key={content.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectContent(content.id);
                }}
                className={`flex relative cursor-pointer rounded-lg mb-2 p-1 transition-all text-black hover:bg-orange-300 hover:text-white
                  ${
                    isFocused &&
                    'ring-2 ring-orange-400 bg-orange-400 text-white'
                  }`}
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
