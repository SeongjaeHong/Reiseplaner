import {
  deletePlanContentsById,
  getPlanContentsById,
  insertPlanContents,
  type Content,
  type TextContent,
} from '@/apis/supabase/planContents';
import {
  type QueryClient,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useImperativeHandle, useRef, useState } from 'react';
import { FaCirclePlus } from 'react-icons/fa6';
import { IoIosAttach } from 'react-icons/io';
import TextBox from './TextBox';
import ImageBox from './ImageBox';
import { useAddImage } from './utils/image';
import { useAddText } from './utils/text';

export type DetailPlansHandle = {
  saveChanges: () => Promise<void>;
};
type DetailPlans = {
  planId: number;
  ref: React.RefObject<DetailPlansHandle | null>;
};

const CONTENTS_QUERY_KEY = (planId: number) => ['DetailPlans', planId];

export default function DetailPlans({ planId, ref }: DetailPlans) {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery({
    queryKey: CONTENTS_QUERY_KEY(planId),
    queryFn: () => getPlanContentsById(planId),
    staleTime: Infinity,
  });

  const saveChanges = useSaveChanges(queryClient, planId);
  const updateLocalContents = useUpdateLocalContents(queryClient, planId);

  const [editingId, setEditingId] = useState<number | null>(null);
  const handleAddText = useAddText({
    planContents: data?.contents ?? ([] as Content[]),
    updateLocalContents: (content) => updateLocalContents(content, false),
    setEditingId,
  });

  const refFileInput = useRef<HTMLInputElement | null>(null);
  const addFile = useAddImage({
    planId,
    planContents: data?.contents ?? ([] as Content[]),
    updateLocalContents: (content) => updateLocalContents(content, false),
  });

  useImperativeHandle(ref, () => ({
    saveChanges,
  }));

  return (
    <div className='border-1 border-reiseorange bg-zinc-500 flex-1 min-h-30 p-1'>
      {data?.contents?.map((content) => {
        if (content.type === 'text') {
          return (
            <TextBox
              content={content}
              isEdit={editingId === content.id}
              setEditingId={setEditingId}
              updateContents={(content) => updateLocalContents(content)}
              key={content.id}
            />
          );
        } else {
          // content.type === file
          return (
            <ImageBox
              content={content}
              updateContents={(content) => updateLocalContents(content)}
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

const useUpdateLocalContents = (queryClient: QueryClient, planId: number) => {
  return (updatedContent: Content, replace = true) => {
    const previousData = queryClient.getQueryData<{ contents: Content[] }>(
      CONTENTS_QUERY_KEY(planId)
    ) ?? { contents: [] };
    const prevContents = previousData.contents;
    if (prevContents) {
      let newContents: Content[] = [];

      if (!prevContents.length || !replace) {
        // Add a new content
        newContents = [...prevContents, updatedContent];
      } else {
        // Update an existing content
        newContents = prevContents.reduce((acc, current) => {
          if (current.id === updatedContent.id) {
            if (
              updatedContent.data !== '' ||
              (updatedContent as TextContent)?.title !== ''
            ) {
              acc.push(updatedContent);
            }
            // else -> Add nothing (remove the empty content)
          } else {
            acc.push(current);
          }
          return acc;
        }, [] as Content[]);
      }

      queryClient.setQueryData(CONTENTS_QUERY_KEY(planId), {
        contents: newContents,
      });
    }
  };
};

const useSaveChanges = (queryClient: QueryClient, planId: number) => {
  const { mutateAsync: saveMutation } = useMutation({
    mutationFn: async (contents: Content[]) => {
      if (contents.length) {
        await insertPlanContents(planId, contents);
      } else {
        await deletePlanContentsById(planId);
      }

      return true;
    },
  });

  return async () => {
    const currentData = queryClient.getQueryData<{ contents: Content[] }>(
      CONTENTS_QUERY_KEY(planId)
    );

    if (currentData) {
      await saveMutation(currentData.contents);
    }
  };
};
