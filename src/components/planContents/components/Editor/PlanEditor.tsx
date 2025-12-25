import { useImperativeHandle, useReducer, useRef } from 'react';
import { FaRegTrashCan } from 'react-icons/fa6';
import EditorMode from './EditorMode';
import ViewerMode from './ViewerMode';
import type { Content } from '@/apis/supabase/planContents.types';
import { editorContentSchema } from './editor.types';
import { deleteEditorImagesFromDB } from '../../utils/image';

const EMPTY_CONTENT =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

const getSafeEditorState = (data: string) => {
  if (!data || data.trim() === '' || data === '{}') return EMPTY_CONTENT;

  const res = editorContentSchema.safeParse(JSON.parse(data));

  if (res.success) {
    return JSON.stringify(res.data);
  }

  return EMPTY_CONTENT;
};

export type PlanEditorHandle = {
  scrollIntoView: (options?: ScrollIntoViewOptions) => void;
};

type PlanEditor = {
  content: Content;
  isEdit: boolean;
  isFocused: boolean;
  setEditingId: (id: string | null) => void;
  onFocus: () => void;
  updateContents: (content: Content) => void;
  deleteContents: (content: Content) => void;
  ref: React.Ref<PlanEditorHandle>;
};
export default function PlanEditor({
  content,
  isEdit,
  isFocused,
  setEditingId,
  onFocus,
  updateContents,
  deleteContents,
  ref,
}: PlanEditor) {
  const [isNoteBox, toggleIsNoteBox] = useReducer((prev) => !prev, content.box === 'note');

  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollIntoView: (options?: ScrollIntoViewOptions) => {
      containerRef.current?.scrollIntoView(options ?? { behavior: 'smooth', block: 'center' });
    },
  }));

  const initialState = getSafeEditorState(content.data);
  const handleDelete = () => {
    // If images were removed from the editor, it deletes the same images from DB
    void deleteEditorImagesFromDB(initialState);
    deleteContents(content);
  };

  return (
    <div
      ref={containerRef}
      onClick={() => {
        onFocus();
        if (!isEdit) setEditingId(content.id);
      }}
      className={`group relative mb-2 rounded-md px-2 py-1 transition-all ${
        isFocused ? 'ring-reiseorange shadow-lg ring-2' : ''
      } ${isNoteBox ? 'bg-reisered min-h-5' : 'border-reiseyellow min-h-2 border-2'}`}
    >
      {isEdit ? (
        <EditorMode
          content={content}
          isNoteBox={isNoteBox}
          updateContents={updateContents}
          setEditingId={setEditingId}
          toggleIsNoteBox={toggleIsNoteBox}
          initialState={initialState}
        />
      ) : (
        <ViewerMode title={content.title} initialState={initialState} isNoteBox={isNoteBox} />
      )}

      {/* 삭제 버튼 */}
      <div className='bg-reiseorange invisible absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full group-hover:visible'>
        <button onClick={handleDelete} className='text-xs text-white'>
          <FaRegTrashCan />
        </button>
      </div>
    </div>
  );
}
