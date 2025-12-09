import {
  deletePlanContentsById,
  getPlanContentsById,
  insertPlanContents,
  type Content,
  type ImageContent,
  type TextContent,
} from '@/apis/supabase/planContents';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { FaCirclePlus } from 'react-icons/fa6';
import { IoIosAttach } from 'react-icons/io';
import TextBox from './TextBox';
import ImageBox from './ImageBox';
import { useAddImage } from './utils/image';
import { useAddText } from './utils/text';

type DetailPlans = {
  planId: number;
};

export default function DetailPlans({ planId }: DetailPlans) {
  const [planContents, setPlanContents] = useState<Content[] | null>(null);
  const { data } = useSuspenseQuery({
    queryKey: ['DetailPlans', planId],
    queryFn: () => getPlanContentsById(planId),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

type UseUpdateContents = {
  planId: number;
  planContents: Content[] | null;
  setPlanContents: React.Dispatch<React.SetStateAction<Content[] | null>>;
};
function useUpdateContents({
  planId,
  planContents,
  setPlanContents,
}: UseUpdateContents) {
  const queryClient = useQueryClient();

  return async (newContent: Content) => {
    if (!planContents) {
      return;
    }

    let textContentsDirty = false;
    const newContents = planContents
      .map((content) => {
        if (content.id !== newContent.id) {
          return content;
        }

        const isDataDirty = content.data !== newContent.data;
        let isBoxDirty = false;
        let isImageSizeDirty = false;
        if (newContent.type === 'text') {
          isBoxDirty = (content as TextContent).box !== newContent.box;
        } else if (newContent.type === 'file') {
          isImageSizeDirty =
            (content as ImageContent).height !== newContent.height ||
            (content as ImageContent).width !== newContent.width;
        }

        textContentsDirty = isDataDirty || isBoxDirty || isImageSizeDirty;

        return newContent;
      })
      .filter((content) => content.data !== '');

    if (newContents.length !== planContents.length) {
      textContentsDirty = true;
    }

    setPlanContents(newContents);

    if (textContentsDirty) {
      if (newContents.length) {
        await insertPlanContents(planId, newContents);
      } else {
        await deletePlanContentsById(planId);
      }

      await queryClient.invalidateQueries({
        queryKey: ['DetailPlans', planId],
      });
    }
  };
}
