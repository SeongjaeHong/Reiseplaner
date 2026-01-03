import { useSuspenseQueryLocalContents } from '../../utils/contents';
import { editorContentSchema } from '../Editor/editor.types';

type ScheduleTable = {
  planId: number;
  focusedId: string | null;
  onSelectContent: (id: string) => void;
};
export default function ScheduleTable({ planId, focusedId, onSelectContent }: ScheduleTable) {
  const { data } = useSuspenseQueryLocalContents(planId);

  return (
    <div className='sticky top-4 flex flex-col'>
      <div className='mb-2 pt-1'>
        <h1 className='text-xl font-bold text-black max-[412px]:text-sm'>Schedule</h1>
      </div>

      <div className='relative flex flex-1 flex-col justify-between'>
        <div className='bg-secondary absolute left-[46px] h-full w-[2px] max-sm:hidden' />
        {data?.contents.map((content) => {
          if (content.type === 'text' && content.isTimeActive) {
            const contentBody = editorContentSchema.safeParse(JSON.parse(content.data));
            let contentBodyText: string;
            if (!contentBody.success) {
              contentBodyText = 'Empty';
            } else {
              contentBodyText =
                contentBody.data.root.children[0]?.children
                  .find((child) => child.type === 'text')
                  ?.text?.slice(0, 30) ?? 'Empty';
            }

            const text = content.title ? content.title : contentBodyText;

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
                className={`mb-2 flex cursor-pointer rounded-lg p-1 text-black transition-all hover:bg-orange-300 hover:text-white ${
                  isFocused && 'bg-secondary ring-secondary text-white ring-2'
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
