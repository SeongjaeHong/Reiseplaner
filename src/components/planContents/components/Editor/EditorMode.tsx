import { useRef, useState } from 'react';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import TimeWidget from '../DetailPlans/TimeWidget';
import { ImageNode } from './ImageNode';
import { deleteEditorImagesFromDB, useAddImage } from '../../utils/image';
import { toast } from '@/components/common/Toast/toast';
import { FaImage, FaTag } from 'react-icons/fa6';
import type { Content, PlanTime } from '@/apis/supabase/planContents.types';
import { GuestError } from '@/errors/GuestError';

const editorConfig = {
  namespace: 'MyEditor',
  theme: {
    paragraph: 'mb-1',
    text: {
      bold: 'font-bold',
      italic: 'italic',
    },
  },
  onError: (error: Error) => console.error(error),
  nodes: [ImageNode],
};

type EditorMode = {
  content: Content;
  isNoteBox: boolean;
  updateContents: (content: Content) => void;
  setEditingId: (id: string | null) => void;
  toggleIsNoteBox: React.ActionDispatch<[]>;
  initialState: string;
};
export default function EditorMode({
  content,
  isNoteBox,
  updateContents,
  setEditingId,
  toggleIsNoteBox,
  initialState,
}: EditorMode) {
  const [time, setTime] = useState(content.time);
  const [timeActive, setTimeActive] = useState(content.isTimeActive);
  const [editorState, setEditorState] = useState<string>(content.data);
  const [isUploading, setIsUploading] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const refEditor = useRef<HTMLDivElement>(null);
  const handleBlur = (e: React.FocusEvent) => {
    const isChild = refEditor.current?.contains(e.relatedTarget as Node);
    if (isUploading || isChild) {
      return;
    }

    try {
      // If images were removed from the editor, it deletes the same images from DB
      void deleteEditorImagesFromDB(initialState, editorState);

      updateContents({
        ...content,
        title: titleRef.current?.value || '',
        data: editorState,
        time,
        isTimeActive: timeActive && isTimeNotNull(time),
        box: isNoteBox ? 'note' : 'plain',
      });
    } catch (error) {
      if (error instanceof GuestError) {
        toast.error("Guest can't change contents");
      } else {
        toast.error('Failed to update contents.');
      }
    }

    setEditingId(null);
  };

  return (
    <div ref={refEditor} onBlur={handleBlur}>
      {isNoteBox && <h1 className='mb-2 px-2 text-xl font-bold text-white'>NOTE</h1>}
      <LexicalComposer initialConfig={{ ...editorConfig, editorState: initialState }}>
        <div className='flex flex-col gap-2'>
          <input
            ref={titleRef}
            defaultValue={content.title}
            placeholder='Titel'
            className={`w-full border-b-1 border-red-300 bg-transparent px-2 text-xl outline-0 max-[600px]:text-sm max-[600px]:font-bold ${
              isNoteBox ? 'text-white placeholder-red-200' : 'text-black'
            }`}
          />

          <div className='relative min-h-[100px] px-2 py-1'>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={`min-h-[100px] outline-none max-[600px]:text-sm ${isNoteBox ? 'text-white' : 'text-black'}`}
                />
              }
              placeholder={<div className='absolute top-1 text-zinc-400'>Inhalt eingeben</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <OnChangePlugin
              onChange={(editorState) => {
                const jsonString = JSON.stringify(editorState.toJSON());
                setEditorState(jsonString);
              }}
            />
          </div>

          {/* Toolbar layer */}
          <div className='flex flex-row-reverse items-center gap-3 pb-2'>
            <button
              onClick={toggleIsNoteBox}
              className={`flex items-center gap-1 rounded-xl px-3 py-1 text-sm ${
                isNoteBox ? 'bg-reiseorange text-white' : 'bg-zinc-300 text-black'
              }`}
            >
              <FaTag /> NOTE
            </button>

            <ImageUploadHandler setIsUploading={setIsUploading} />

            <TimeWidget
              time={time}
              setTime={setTime}
              timeActive={timeActive}
              setTimeActive={setTimeActive}
            />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}

const isTimeNotNull = (time: PlanTime) => {
  const isStartTimeSet = time.start.hour !== null && time.start.minute !== null;
  const isEndTimeSet = time.end.hour !== null && time.end.minute !== null;

  return isStartTimeSet || isEndTimeSet;
};

type ImageUploadHandler = {
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
};
function ImageUploadHandler({ setIsUploading }: ImageUploadHandler) {
  const addFile = useAddImage();
  const [editor] = useLexicalComposerContext();

  const handleInputClick = () => {
    setIsUploading(true);

    // If a user cancel to upload a file, onChange doesn't occur.
    // In this case, isUploading should be set to "false" manually.
    const onWindowFocus = () => {
      // Wait a bit to call onChange of <input> first
      setTimeout(() => {
        setIsUploading(false);
      }, 100);

      window.removeEventListener('focus', onWindowFocus);
    };

    window.addEventListener('focus', onWindowFocus);
  };

  return (
    <label
      onMouseDown={(e) => e.preventDefault()}
      className='flex cursor-pointer items-center gap-1 rounded-xl bg-zinc-200 px-3 py-1 text-sm hover:bg-zinc-300'
    >
      <FaImage />
      <span>Image</span>
      <input
        type='file'
        accept='image/*'
        onClick={handleInputClick}
        onChange={(e) => {
          const fileInput = e.currentTarget;
          void (async () => {
            try {
              await addFile(e, editor);
            } catch (error) {
              toast.error('Failed to upload an image.');
              console.error(error);
            } finally {
              fileInput.value = '';
              setIsUploading(false);
            }
          })();
        }}
        className='hidden'
      />
    </label>
  );
}
