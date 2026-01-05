import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, type NodeKey } from 'lexical';
import { ImageNode } from './ImageNode';
import { useEffect, useState } from 'react';
import { useFetchImage } from '@/utils/useFetchImage';
import { isBase64DataUrl } from '../../utils/image';

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

  const isBase64 = isBase64DataUrl(src);
  const thumbnail = useFetchImage({ imageURL: src, enabled: !isBase64 });
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isBase64) {
      setImgSrc(src);
      return;
    }
    if (thumbnail) {
      const objectUrl = URL.createObjectURL(thumbnail);
      setImgSrc(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
        setImgSrc(null);
      };
    }
  }, [thumbnail, isBase64, src]);

  return (
    <div className='group/img relative h-fit max-w-full'>
      {!imgSrc && (
        <div
          style={{ height: height }}
          className={`lounded-lg w-full animate-pulse rounded-lg bg-gray-300`}
        />
      )}
      {imgSrc && (
        <>
          <img src={imgSrc} draggable={false} className='max-w-full rounded-lg' />
          {/* image resizing handle */}
          <div
            className='invisible absolute right-0 bottom-0 h-4 w-4 translate-1/3 cursor-se-resize rounded-full bg-blue-500 group-hover/img:visible'
            onMouseDown={(e) => startResize(e, width, height, onResize)}
          />
        </>
      )}
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
