import {
  deletePlanContentsById,
  getPlanContentsById,
  insertPlanContents,
  type Content,
} from '@/apis/supabase/planContents';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FaCirclePlus } from 'react-icons/fa6';
import { IoIosAttach } from 'react-icons/io';
import TextBox from './TextBox';
import ImageBox from './ImageBox';
import { useAddImage } from './utils/image';
import { useAddText } from './utils/text';

export type DetailPlansHandle = {
  hasUnsavedChanges: boolean;
  saveChanges: () => Promise<void>;
};
type DetailPlans = {
  planId: number;
  ref: React.RefObject<DetailPlansHandle | null>;
};

export default function DetailPlans({ planId, ref }: DetailPlans) {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery({
    queryKey: ['DetailPlans', planId],
    queryFn: () => getPlanContentsById(planId),
    staleTime: Infinity,
  });
  // useState is used to update UI quickly before the DB server syncronization.
  const [planContents, setPlanContents] = useState<Content[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (data) {
      // synchronize local data with DB data
      setPlanContents(data.contents);
      setHasUnsavedChanges(false);
    }
  }, [data]);

  const updateLocalContents = (content: Content, replace = true) => {
    setPlanContents((prevContents) => {
      if (!prevContents.length || !replace) {
        return [...prevContents, content];
      }

      return prevContents.reduce((newContents, prevContent) => {
        if (prevContent.id === content.id) {
          if (content.data !== '') {
            newContents.push(content);
          } // else -> add nothing (remove the empty content)
        } else {
          console.log(prevContent.id, content.data);
          newContents.push(prevContent);
        }
        return newContents;
      }, [] as Content[]);
    });
    setHasUnsavedChanges(true);
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const handleAddText = useAddText({
    planContents,
    updateLocalContents: (content) => updateLocalContents(content, false),
    setEditingId,
  });

  const refFileInput = useRef<HTMLInputElement | null>(null);
  const addFile = useAddImage({
    planId,
    planContents,
    updateLocalContents: (content) => updateLocalContents(content, false),
  });

  const updateContents = (content: Content) => {
    updateLocalContents(content);
  };

  const saveChanges = async () => {
    if (planContents.length) {
      await insertPlanContents(planId, planContents);
    } else {
      await deletePlanContentsById(planId);
    }

    await queryClient.invalidateQueries({
      queryKey: ['DetailPlans', planId],
    });

    setHasUnsavedChanges(false);
  };

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges,
    saveChanges,
  }));

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
          return (
            <ImageBox
              content={content}
              updateContents={updateContents}
              key={content.id}
            />
          );
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
