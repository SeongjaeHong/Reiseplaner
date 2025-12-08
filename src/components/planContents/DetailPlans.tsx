import {
  getPlanContentsById,
  insertPlanContents,
  type Content,
} from '@/apis/supabase/planContents';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FaCirclePlus } from 'react-icons/fa6';
import TextBox from './TextBox';

export type HandleUpdateContent = {
  id: Content['id'];
  box?: Content['box'];
  data?: Content['data'];
};
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
  const handleAddNewBox = useAddNewBox({
    planContents,
    setPlanContents,
    setEditingId,
  });

  const [contentsDirty, setContentsDirty] = useState(false);
  const handleUpdateContents = useUpdateContent({
    planContents,
    setPlanContents,
    setContentsDirty,
  });

  const handleSaveContents = useSaveContent({
    planId,
    planContents,
    contentsDirty,
    setContentsDirty,
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
              updateContents={handleUpdateContents}
              saveContents={handleSaveContents}
              key={content.id}
            />
          );
        } else {
          // content.type === file
          return (
            <div className='h-10 w-full border-1 border-reiseyellow'>FILE</div>
          );
        }
      })}
      <div className='ml-2 mt-5'>
        <button onClick={handleAddNewBox}>
          <FaCirclePlus className='text-3xl text-reiseorange hover:text-orange-300' />
        </button>
      </div>
    </div>
  );
}

type UseSaveContent = {
  planId: number;
  planContents: Content[] | null;
  contentsDirty: boolean;
  setContentsDirty: React.Dispatch<React.SetStateAction<boolean>>;
};
function useSaveContent({
  planId,
  planContents,
  contentsDirty,
  setContentsDirty,
}: UseSaveContent) {
  const queryClient = useQueryClient();

  return async () => {
    if (planContents && contentsDirty) {
      await insertPlanContents(planId, planContents);
      await queryClient.invalidateQueries({
        queryKey: ['DetailPlans', planId],
      });
      setContentsDirty(false);
    }
  };
}

type UseAddNewBox = {
  planContents: Content[] | null;
  setPlanContents: React.Dispatch<React.SetStateAction<Content[] | null>>;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
};
function useAddNewBox({
  planContents,
  setPlanContents,
  setEditingId,
}: UseAddNewBox) {
  return () => {
    const newContent: Content = {
      id: planContents ? planContents.length + 1 : 1,
      type: 'text',
      data: '',
      box: 'plain',
    };

    setPlanContents((prev) => (prev ? [...prev, newContent] : [newContent]));
    setEditingId(newContent.id);
  };
}

type UseUpdateContent = {
  planContents: Content[] | null;
  setPlanContents: React.Dispatch<React.SetStateAction<Content[] | null>>;
  setContentsDirty: React.Dispatch<React.SetStateAction<boolean>>;
};
function useUpdateContent({
  planContents,
  setPlanContents,
  setContentsDirty,
}: UseUpdateContent) {
  return ({ id, box, data }: HandleUpdateContent) => {
    if (!planContents) {
      return;
    }

    if (box) {
      setPlanContents(
        planContents.map((content) => {
          if (content.id === id) {
            content.box = box;
          }

          return content;
        })
      );
    }

    if (typeof data === 'string') {
      setPlanContents(
        planContents.map((content) => {
          if (content.id === id && content.data !== data) {
            content.data = data;
            setContentsDirty(true);
          }

          return content;
        })
      );
    }
  };
}
