import type { Content, ImageContent } from '@/apis/supabase/planContents';
import { useRef, useState } from 'react';
import { ResizableBox, type ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';

type ImageBox = {
  content: ImageContent;
  updateContents: (content: Content) => Promise<void>;
};
const PROJECT_ID = import.meta.env.VITE_PROJECT_ID as string;

export default function ImageBox({ content, updateContents }: ImageBox) {
  const [width, setWidth] = useState(content.width ?? 200);
  const [height, setHeight] = useState(content.height ?? 200);
  const refUpdateTimer = useRef<number | null>(null);

  const handleResize = (
    _: React.SyntheticEvent<Element, Event>,
    { size }: ResizeCallbackData
  ) => {
    setWidth(size.width);
    setHeight(size.height);

    if (refUpdateTimer.current) {
      clearTimeout(refUpdateTimer.current);
    }
    refUpdateTimer.current = setTimeout(async () => {
      await updateContents({ ...content, width, height });
    }, 1000);
  };

  return (
    <ResizableBox
      width={width}
      height={height}
      onResize={handleResize}
      axis='both'
      className='w-full'
    >
      <img
        src={`https://${PROJECT_ID}.supabase.co/storage/v1/object/public/${content.data}`}
        alt='Image'
        className='w-full h-full object-contain rounded-lg'
      />
    </ResizableBox>
  );
}
