import type { Content } from '@/apis/supabase/planContents';
import type { HandleUpdateContent } from './DetailPlans';
import { FaTag } from 'react-icons/fa6';
import { useRef } from 'react';

type TextBox = {
  content: Content;
  isEdit: boolean;
  setEditingId: (id: number | null) => void;
  updateContents: ({ id, box, data }: HandleUpdateContent) => void;
  saveContents: () => Promise<void>;
};
export default function TextBox({
  content,
  isEdit,
  setEditingId,
  updateContents,
  saveContents,
}: TextBox) {
  const handleToggleNote = useToggleNote({ id: content.id, updateContents });
  const handleClearEditOnBlur = useClearEditOnBlur({
    id: content.id,
    setEditingId,
    updateContents,
    saveContents,
  });

  const refTextArea = useRef<HTMLTextAreaElement | null>(null);
  const isNoteBox = content.box === 'note';

  return (
    <div
      tabIndex={content.id} // to make it focousable and trigger onBlur later
      onBlur={(e) => void handleClearEditOnBlur(e, refTextArea)}
      className={`rounded-md py-1 px-2 mb-2 ${
        isNoteBox
          ? 'bg-reisered min-h-5'
          : 'border-1 border-reiseyellow min-h-2'
      }`}
    >
      {isNoteBox && <h1 className='mb-2 px-2 text-xl font-bold'>NOTE</h1>}
      {isEdit && (
        <div>
          <textarea
            ref={(node) => {
              refTextArea.current = node;
              refTextArea.current?.focus();
            }}
            defaultValue={content.data ?? ''}
            onChange={handleTextArea}
            onFocus={handleTextArea}
            placeholder='Input here.'
            className='w-full resize-none outline-0 py-1 px-2'
          />
          <div className='flex flex-row-reverse pr-5 pb-2'>
            <button
              onClick={() =>
                handleToggleNote(isNoteBox ? 'plain' : 'note', refTextArea)
              }
              className={`flex items-center gap-1 rounded-xl py-1 px-3 ${
                isNoteBox
                  ? 'bg-orange-300 hover:bg-orange-200'
                  : 'bg-zinc-300 hover:bg-zinc-200'
              }`}
            >
              <FaTag />
              NOTE
            </button>
          </div>
        </div>
      )}
      {!isEdit && (
        <div
          onClick={() => setEditingId(content.id)}
          className={`py-1 px-2 ${
            content.data ? 'text-white' : 'text-red-300'
          }`}
        >
          {content.data ? content.data : 'Input here.'}
        </div>
      )}
    </div>
  );
}

type UseToggleNote = {
  id: Content['id'];
  updateContents: ({ id, box, data }: HandleUpdateContent) => void;
};
function useToggleNote({ id, updateContents }: UseToggleNote) {
  return (
    box: Content['box'],
    ref: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    if (!ref.current) {
      updateContents({ id, box });
    } else {
      updateContents({ id, box, data: ref.current.value });
    }
  };
}

type UseClearEditOnBlur = {
  id: Content['id'];
  setEditingId: (id: number | null) => void;
  updateContents: ({ id, box, data }: HandleUpdateContent) => void;
  saveContents: () => Promise<void>;
};
function useClearEditOnBlur({
  id,
  setEditingId,
  updateContents,
  saveContents,
}: UseClearEditOnBlur) {
  return async (
    e: React.FocusEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }

    if (ref.current) {
      updateContents({ id, data: ref.current.value });
      await saveContents();
    }

    setEditingId(null);
  };
}

const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const target = e.currentTarget;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};
