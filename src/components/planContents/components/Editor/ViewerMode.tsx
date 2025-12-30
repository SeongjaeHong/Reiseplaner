import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ImageNode } from './ImageNode';

const readOnlyConfig = {
  namespace: 'Viewer',
  theme: {
    paragraph: 'mb-1',
    text: {
      bold: 'font-bold',
      italic: 'italic',
    },
  },
  editable: false,
  nodes: [ImageNode],
  onError: (error: Error) => console.error(error),
};

type ViewerMode = {
  title: string;
  initialState: string;
  isNoteBox: boolean;
};
export default function ViewerMode({ title, initialState, isNoteBox }: ViewerMode) {
  return (
    <div className={`px-2 py-1 ${isNoteBox ? 'text-white' : 'text-black'}`}>
      {isNoteBox && <h1 className='mb-2 text-xl font-bold text-white'>NOTE</h1>}
      <div className='mb-1 truncate border-b-1 text-xl'>
        {title || <span className={`${isNoteBox ? 'text-red-200' : 'text-zinc-300'}`}>Titel</span>}
      </div>

      <div className='lexical-viewer'>
        <LexicalComposer
          initialConfig={{
            ...readOnlyConfig,
            editorState: initialState,
          }}
        >
          <RichTextPlugin
            contentEditable={<ContentEditable className='pointer-events-none outline-none' />}
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </LexicalComposer>
      </div>
    </div>
  );
}
