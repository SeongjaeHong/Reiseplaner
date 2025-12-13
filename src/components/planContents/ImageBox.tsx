import type { Content, ImageContent } from '@/apis/supabase/planContents';
import { useRef, useState } from 'react';
import { ResizableBox, type ResizeCallbackData } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { FaRegTrashCan } from 'react-icons/fa6';
import { deletePlanGroupThumbnail } from '@/apis/supabase/buckets';

type ImageBox = {
  content: ImageContent;
  updateContents: (content: Content) => void;
};
const PROJECT_ID = import.meta.env.VITE_PROJECT_ID as string;
const defaultMaxLength = 400;
export default function ImageBox({ content, updateContents }: ImageBox) {
  let contentWidth: number;
  let contentHeight: number;

  if (content.width >= content.height && content.width > defaultMaxLength) {
    const ratio = content.height / content.width;
    contentWidth = defaultMaxLength;
    contentHeight = ratio * contentWidth;
  } else if (
    content.height > content.width &&
    content.height > defaultMaxLength
  ) {
    const ratio = content.width / content.height;
    contentHeight = defaultMaxLength;
    contentWidth = ratio * contentHeight;
  } else {
    contentWidth = content.width;
    contentHeight = content.height;
  }

  const [width, setWidth] = useState(contentWidth);
  const [height, setHeight] = useState(contentHeight);
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
    refUpdateTimer.current = setTimeout(() => {
      updateContents({ ...content, width, height });
    }, 1000);
  };

  const handleDeleteContent = async () => {
    updateContents({ ...content, data: '' });
    await deletePlanGroupThumbnail(content.data);
  };

  return (
    <ResizableBox
      width={width}
      height={height}
      onResize={handleResize}
      axis='both'
      className='group relative w-full'
    >
      <img
        src={`https://${PROJECT_ID}.supabase.co/storage/v1/object/public/${content.data}`}
        alt='Image'
        className='w-full h-full object-contain rounded-lg'
      />
      <div className='absolute top-0 right-0 bg-reiseorange rounded-full w-6 h-6 text-center invisible group-hover:visible'>
        <button
          onClick={() => void handleDeleteContent()}
          className='text-white text-lg'
        >
          <FaRegTrashCan />
        </button>
      </div>
    </ResizableBox>
  );
}
