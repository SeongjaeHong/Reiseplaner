import type { Content } from '@/apis/supabase/planContents';
import { FaRegTrashCan, FaTag } from 'react-icons/fa6';
import { useRef } from 'react';

type TextBox = {
  content: Content;
  isEdit: boolean;
  setEditingId: (id: number | null) => void;
  updateContents: (content: Content) => Promise<void>;
};
export default function TextBox({
  content,
  isEdit,
  setEditingId,
  updateContents,
}: TextBox) {
  const handleToggleNote = useToggleNote({ updateContents });
  const handleClearEditOnBlur = useClearEditOnBlur({
    setEditingId,
    updateContents,
  });
  const handleDeleteContent = useDeleteContent({
    content,
    updateContents,
  });

  const refTextArea = useRef<HTMLTextAreaElement | null>(null);
  const isNoteBox = content.box === 'note';

  return (
    <div
      tabIndex={content.id} // to make it focousable and trigger onBlur later
      onBlur={(e) => void handleClearEditOnBlur(e, refTextArea, content)}
      className={`group relative rounded-md py-1 px-2 mb-2
        ${
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
              onClick={() => void handleToggleNote(content, refTextArea)}
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
          className='py-1 px-2 text-white'
        >
          {content.data}
        </div>
      )}
      <div className='absolute top-0 right-0 bg-reiseorange rounded-full w-6 h-6 text-center invisible group-hover:visible'>
        <button
          onClick={() => void handleDeleteContent()}
          className='text-white'
        >
          <FaRegTrashCan />
        </button>
      </div>
    </div>
  );
}

type UseToggleNote = {
  updateContents: (content: Content) => Promise<void>;
};
function useToggleNote({ updateContents }: UseToggleNote) {
  return async (
    content: Content,
    ref: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    if (ref.current) {
      content.data = ref.current.value;
    }
    content.box = content.box === 'plain' ? 'note' : 'plain';
    await updateContents(content);
  };
}

type UseDeleteContent = {
  content: Content;
  updateContents: (content: Content) => Promise<void>;
};
function useDeleteContent({ content, updateContents }: UseDeleteContent) {
  return async () => {
    await updateContents({ ...content, data: '' });
  };
}

type UseClearEditOnBlur = {
  setEditingId: (id: number | null) => void;
  updateContents: (content: Content) => Promise<void>;
};
function useClearEditOnBlur({
  setEditingId,
  updateContents,
}: UseClearEditOnBlur) {
  return async (
    e: React.FocusEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLTextAreaElement | null>,
    content: Content
  ) => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }

    if (ref.current) {
      await updateContents({ ...content, data: ref.current.value });
    }

    setEditingId(null);
  };
}

const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const target = e.currentTarget;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};
