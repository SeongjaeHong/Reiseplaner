import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, type NodeKey } from 'lexical';
import { ImageNode } from './ImageNode';

export default function ImageComponent({
  src,
  width,
  height,
  nodeKey,
}: {
  src: string;
  width: number;
  height: number;
  nodeKey: NodeKey;
}) {
  const [editor] = useLexicalComposerContext();

  const onResize = (newWidth: number, newHeight: number) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node instanceof ImageNode) {
        node.setSize(newWidth, newHeight);
      }
    });
  };

  return (
    <div style={{ width }} className='group/img relative h-fit max-w-full bg-red-300'>
      <img src={src} className='lounded-lg max-w-full' draggable={false} />

      {/* image resizing handle */}
      <div
        className='invisible absolute right-0 bottom-0 h-4 w-4 translate-1/3 cursor-se-resize rounded-full bg-blue-500 group-hover/img:visible'
        onMouseDown={(e) => startResize(e, width, height, onResize)}
      />
    </div>
  );
}

function startResize(
  e: React.MouseEvent,
  startW: number,
  startH: number,
  onResize: (w: number, h: number) => void
) {
  const startX = e.clientX;

  const container = (e.currentTarget as HTMLElement).parentElement;
  const parent = container?.parentElement;

  const parentRect = parent?.getBoundingClientRect();
  const maxWidth = parentRect?.width ?? Infinity;

  const aspectRatio = startW / startH;

  const onMove = (ev: MouseEvent) => {
    let newWidth = startW + (ev.clientX - startX);
    newWidth = Math.min(newWidth, maxWidth);
    const newHeight = newWidth / aspectRatio;

    onResize(newWidth, newHeight);
  };

  const onUp = () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}
