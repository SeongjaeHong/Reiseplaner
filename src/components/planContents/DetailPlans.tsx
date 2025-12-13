import {
  getPlanContentsById,
  type Content,
} from '@/apis/supabase/planContents';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { FaCirclePlus } from 'react-icons/fa6';
import { IoIosAttach } from 'react-icons/io';
import TextBox from './TextBox';
import ImageBox from './ImageBox';
import { useAddImage } from './utils/image';
import { useAddText } from './utils/text';
import { useUpdateContents } from './utils/contents';

type DetailPlans = {
  planId: number;
};

export default function DetailPlans({ planId }: DetailPlans) {
  // useState is used to update UI quickly before the DB server syncronization.
  const [planContents, setPlanContents] = useState<Content[] | null>(null);
  const { data } = useSuspenseQuery({
    queryKey: ['DetailPlans', planId],
    queryFn: () => getPlanContentsById(planId),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data) {
      // replace local data to DB data
      setPlanContents(data.contents);
    }
  }, [data]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const handleAddText = useAddText({
    planContents,
    setPlanContents,
    setEditingId,
  });

  const refFileInput = useRef<HTMLInputElement | null>(null);
  const addFile = useAddImage({ planId, planContents, setPlanContents });

  const updateContents = useUpdateContents({
    planId,
    planContents,
    setPlanContents,
  });

  return (
    <div className='border-1 border-reiseorange bg-zinc-500 flex-1 min-h-30 p-1'>
      {planContents?.map((content) => {
        if (content.type === 'text') {
          return (
            <TextBox
              content={content}
              isEdit={editingId === content.id}
              setEditingId={setEditingId}
              updateContents={updateContents}
              key={content.id}
            />
          );
        } else {
          // content.type === file
          return <ImageBox content={content} updateContents={updateContents} />;
        }
      })}
      <div className='flex items-center gap-2 ml-2 mt-5'>
        <button onClick={handleAddText}>
          <FaCirclePlus className='text-3xl text-reiseorange hover:text-orange-300' />
        </button>
        <button
          onClick={() => refFileInput.current?.click()}
          className='flex rounded-xl py-1 pr-2 text-zinc-500 font-bold bg-reiseorange hover:bg-orange-300'
        >
          <input
            type='file'
            accept='image/*'
            ref={refFileInput}
            onChange={(e) => void addFile(e)}
            className='hidden'
          />
          <IoIosAttach className='text-2xl' />
          <span>File</span>
        </button>
      </div>
    </div>
  );
}
