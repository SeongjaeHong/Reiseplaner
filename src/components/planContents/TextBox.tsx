import type { TextContent } from '@/apis/supabase/planContents';
import { FaRegTrashCan, FaTag } from 'react-icons/fa6';
import { useImperativeHandle, useReducer, useRef, useState } from 'react';
import TimeWidget from './TimeWidget';
import type { LocalContent } from './utils/contents';

export type TextBoxHandle = {
  scrollIntoView: (options?: ScrollIntoViewOptions) => void;
};

type TextBox = {
  content: TextContent;
  isEdit: boolean;
  isFocused: boolean; // 추가
  setEditingId: (id: string | null) => void;
  onFocus: () => void; // 추가
  updateContents: (content: LocalContent) => void;
  deleteContents: (content: LocalContent) => void;
  ref: React.Ref<TextBoxHandle>;
};
export default function TextBox({
  content,
  isEdit,
  isFocused,
  setEditingId,
  onFocus,
  updateContents,
  deleteContents,
  ref,
}: TextBox) {
  const [time, setTime] = useState(content.time);
  const [timeActive, setTimeActive] = useState(content.isTimeActive);

  const handleDeleteContent = () => deleteContents(content);
  const [isNoteBox, toggleIsNoteBox] = useReducer(
    (prev) => !prev,
    content.box === 'note'
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const refTitle = useRef<HTMLInputElement | null>(null);
  const refTextArea = useRef<HTMLTextAreaElement | null>(null);

  const handleClearEditOnBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }

    if (refTextArea.current && refTitle.current) {
      const newTitle = refTitle.current.value.trim();
      const newContent = refTextArea.current.value.trim();
      const newTime = time;
      const newTimeActive = timeActive;
      const currentBoxType = content.box;

      const updatedContent: TextContent = {
        ...content,
        title: newTitle,
        data: newContent,
        time: newTime,
        isTimeActive: newTimeActive,
        box: currentBoxType,
      };
      updateContents(updatedContent);
    }

    setEditingId(null);
  };

  useImperativeHandle(ref, () => ({
    scrollIntoView: (options?: ScrollIntoViewOptions) => {
      containerRef.current?.scrollIntoView(
        options ?? { behavior: 'smooth', block: 'center' }
      );
    },
  }));

  const handleTextBoxClick = () => {
    onFocus();
    if (!isEdit) setEditingId(content.id);
  };

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      onBlur={(e) => void handleClearEditOnBlur(e)}
      className={`group relative rounded-md py-1 px-2 mb-2
        ${isFocused ? 'ring-2 ring-reiseorange shadow-lg' : ''} 
        ${
          isNoteBox
            ? 'bg-reisered min-h-5'
            : 'border-1 border-reiseyellow min-h-2'
        }`}
    >
      {isNoteBox && <h1 className='mb-2 px-2 text-xl font-bold'>NOTE</h1>}
      {isEdit && (
        <div onSubmit={(e) => e.preventDefault()}>
          <input
            ref={refTitle}
            type='text'
            placeholder='Titel'
            defaultValue={content.title}
            autoFocus={content.title ? false : true}
            className='w-full px-2 outline-0 text-xl border-b-1 border-red-300 truncate'
          />
          <textarea
            ref={(node) => {
              refTextArea.current = node;
              handleTextAreaResize(refTextArea);
            }}
            defaultValue={content.data}
            onChange={handleTextAreaResize}
            onFocus={handleTextAreaResize}
            placeholder='Input here.'
            autoFocus={content.title ? true : false}
            className='w-full resize-none outline-0 py-1 px-2'
          />
          <div className='flex flex-row-reverse gap-3 pb-2'>
            <button
              onClick={toggleIsNoteBox}
              className={`flex items-center gap-1 rounded-xl py-1 px-3 ${
                isNoteBox
                  ? 'bg-reiseorange hover:bg-orange-300'
                  : 'bg-zinc-300 hover:bg-zinc-200'
              }`}
            >
              <FaTag />
              NOTE
            </button>
            <TimeWidget
              time={time}
              setTime={setTime}
              timeActive={timeActive}
              setTimeActive={setTimeActive}
            />
          </div>
        </div>
      )}
      {!isEdit && (
        <div onClick={handleTextBoxClick} className='py-1 px-2 text-white'>
          <div className='w-full text-xl border-b-1 mb-1 truncate'>
            {content.title && <h1>{content.title}</h1>}
            {!content.title && <h1 className='text-zinc-300'>제목 없음</h1>}
          </div>
          <pre className='text-wrap'>{content.data}</pre>
        </div>
      )}

      {/* Delete button to delete the TextBox */}
      <div className='absolute top-0 right-0 bg-reiseorange rounded-full w-6 h-6 text-center invisible group-hover:visible'>
        <button onClick={handleDeleteContent} className='text-white'>
          <FaRegTrashCan />
        </button>
      </div>
    </div>
  );
}

const handleTextAreaResize = (
  obj:
    | React.ChangeEvent<HTMLTextAreaElement>
    | React.RefObject<HTMLTextAreaElement | null>
) => {
  let target: HTMLTextAreaElement | null = null;
  if ('currentTarget' in obj) {
    target = obj.currentTarget;
  } else if ('current' in obj) {
    target = obj.current;
  }

  if (target) {
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }
};
