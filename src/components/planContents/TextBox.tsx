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

  if (content.box === 'note') {
    return (
      <NoteBox
        content={content}
        isEdit={isEdit}
        toggleNote={handleToggleNote('plain')}
        toggleEdit={() => setEditingId(content.id)}
        UpdateContentOnBlur={handleClearEditOnBlur}
      />
    );
  } else {
    return (
      <DetailPlanBox
        content={content}
        isEdit={isEdit}
        toggleNote={handleToggleNote('note')}
        toggleEdit={() => setEditingId(content.id)}
        UpdateContentOnBlur={handleClearEditOnBlur}
      />
    );
  }
}

type UseToggleNote = {
  id: Content['id'];
  updateContents: ({ id, box, data }: HandleUpdateContent) => void;
};
function useToggleNote({ id, updateContents }: UseToggleNote) {
  return (box: Content['box']) => {
    return (ref: React.RefObject<HTMLTextAreaElement | null>) => {
      if (!ref.current) {
        updateContents({ id, box });
      } else {
        updateContents({ id, box, data: ref.current.value });
      }
    };
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

type TextBoxItem = {
  content: Content;
  isEdit: boolean;
  toggleNote: (ref: React.RefObject<HTMLTextAreaElement | null>) => void;
  toggleEdit: () => void;
  UpdateContentOnBlur: (
    e: React.FocusEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLTextAreaElement | null>
  ) => Promise<void>;
};

function NoteBox({
  content,
  isEdit,
  toggleNote,
  toggleEdit,
  UpdateContentOnBlur,
}: TextBoxItem) {
  const refTextArea = useRef<HTMLTextAreaElement | null>(null);
  return (
    <div
      tabIndex={content.id} // to make it focousable and trigger onBlur later
      onBlur={(e) => void UpdateContentOnBlur(e, refTextArea)}
      className='rounded-md bg-reisered py-1 px-2 mb-3 min-h-5 '
    >
      <h1 className='mb-2 px-2 text-xl font-bold'>NOTE</h1>
      {isEdit && (
        <div>
          <textarea
            ref={(node) => {
              refTextArea.current = node;
              refTextArea.current?.focus();
            }}
            defaultValue={content.data ?? ''}
            onChange={handleTextArea}
            placeholder='Input here.'
            className='w-full resize-none outline-0 py-1 px-2'
          />
          <div className='flex flex-row-reverse pr-5 pb-2'>
            <button
              onClick={() => toggleNote(refTextArea)}
              className='flex items-center gap-1 rounded-xl bg-orange-300 hover:bg-orange-200 py-1 px-3'
            >
              <FaTag />
              NOTE
            </button>
          </div>
        </div>
      )}
      {!isEdit && (
        <div
          onClick={toggleEdit}
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

function DetailPlanBox({
  content,
  isEdit,
  toggleNote,
  toggleEdit,
  UpdateContentOnBlur,
}: TextBoxItem) {
  const refTextArea = useRef<HTMLTextAreaElement | null>(null);
  return (
    <div
      tabIndex={content.id} // to make it focousable and trigger onBlur later
      onBlur={(e) => void UpdateContentOnBlur(e, refTextArea)}
      className='border-1 border-reiseyellow rounded-md mb-2 px-2 py-1 min-h-2'
    >
      {isEdit && (
        <div>
          <textarea
            ref={(node) => {
              refTextArea.current = node;
              refTextArea.current?.focus();
            }}
            defaultValue={content.data ?? ''}
            onChange={handleTextArea}
            placeholder='Input here.'
            className='w-full py-1 resize-none outline-0 px-2'
          />
          <div className='flex flex-row-reverse pr-5 pb-2'>
            <button
              onClick={() => toggleNote(refTextArea)}
              className='flex items-center gap-1 rounded-xl bg-zinc-300 hover:bg-zinc-200 py-1 px-3'
            >
              <FaTag />
              NOTE
            </button>
          </div>
        </div>
      )}
      {!isEdit && (
        <div
          onClick={toggleEdit}
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
