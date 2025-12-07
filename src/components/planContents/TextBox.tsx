import type { Content } from '@/apis/supabase/planContents';
import type { HandleUpdateContent } from './DetailPlans';
import { FaTag } from 'react-icons/fa6';

type TextBox = {
  content: Content;
  isEdit: boolean;
  setEditingId: (id: number | null) => void;
  updateContent: ({ id, box, data }: HandleUpdateContent) => void;
};
export default function TextBox({
  content,
  isEdit,
  setEditingId,
  updateContent,
}: TextBox) {
  const handleClearEditOnBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }

    setEditingId(null);
    updateContent({ id: content.id, data: content.data });
  };

  if (content.box === 'note') {
    return (
      <NoteBox
        content={content}
        isEdit={isEdit}
        toggleNote={() => updateContent({ id: content.id, box: 'plain' })}
        toggleEdit={() => setEditingId(content.id)}
        UpdateContentOnBlur={handleClearEditOnBlur}
      />
    );
  } else {
    return (
      <DetailPlanBox
        content={content}
        isEdit={isEdit}
        toggleNote={() => updateContent({ id: content.id, box: 'note' })}
        toggleEdit={() => setEditingId(content.id)}
        UpdateContentOnBlur={handleClearEditOnBlur}
      />
    );
  }
}

const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const target = e.currentTarget;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};
type TextBoxItem = {
  content: Content;
  isEdit: boolean;
  toggleNote: () => void;
  toggleEdit: () => void;
  UpdateContentOnBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
};
function NoteBox({
  content,
  isEdit,
  toggleNote,
  toggleEdit,
  UpdateContentOnBlur,
}: TextBoxItem) {
  return (
    <div
      tabIndex={content.id} // to make it focousable and trigger onBlur later
      onBlur={UpdateContentOnBlur}
      className='rounded-md bg-reisered py-1 px-2 mb-3 min-h-5 '
    >
      <h1 className='mb-2 text-xl font-bold'>NOTE</h1>
      {isEdit && (
        <div>
          <textarea
            defaultValue={content.data ?? ''}
            onChange={handleTextArea}
            placeholder='Input here.'
            className='w-full resize-none outline-0'
          />
          <div className='flex flex-row-reverse pr-5 pb-2'>
            <button
              onClick={toggleNote}
              className='flex items-center gap-1 rounded-xl bg-orange-300 py-1 px-3'
            >
              <FaTag />
              NOTE
            </button>
          </div>
        </div>
      )}
      {!isEdit && (
        <div onClick={toggleEdit}>
          {content.data ? content.data : 'Input here.'}
        </div>
      )}
    </div>
  );
}

function DetailPlanBox({
  content,
  isEdit,
  toggleNote,
  toggleEdit,
  UpdateContentOnBlur,
}: TextBoxItem) {
  return (
    <div
      tabIndex={content.id} // to make it focousable and trigger onBlur later
      onBlur={UpdateContentOnBlur}
      className='border-1 border-reiseyellow rounded-md mb-2 px-2 py-1 min-h-2'
    >
      {isEdit && (
        <div>
          <textarea
            defaultValue={content.data ?? ''}
            onChange={handleTextArea}
            placeholder='Input here.'
            className='w-full py-1 resize-none outline-0'
          />
          <div className='flex flex-row-reverse pr-5 pb-2'>
            <button
              onClick={toggleNote}
              className='flex items-center gap-1 rounded-xl bg-zinc-300 py-1 px-3'
            >
              <FaTag />
              NOTE
            </button>
          </div>
        </div>
      )}
      {!isEdit && (
        <div onClick={toggleEdit} className='py-1 px-2'>
          {content.data ? content.data : 'Input here.'}
        </div>
      )}
    </div>
  );
}
