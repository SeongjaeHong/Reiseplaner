import {
  getPlanContentsById,
  type Content,
} from '@/apis/supabase/planContents';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FaCirclePlus, FaTag } from 'react-icons/fa6';

type HandleUpdateContent = {
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
      setPlanContents(data.contents);
    }
  }, [data]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const handleAddNewBox = () => {
    const newContent: Content = {
      id: planContents ? planContents.length + 1 : 1,
      type: 'text',
      data: '',
      box: 'plain',
    };

    setPlanContents((prev) => (prev ? [...prev, newContent] : [newContent]));
    setEditingId(newContent.id);
  };

  const handleUpdateContent = ({ id, box, data }: HandleUpdateContent) => {
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

    if (data) {
      setPlanContents(
        planContents.map((content) => {
          if (content.id === id) {
            content.data = data;
          }

          return content;
        })
      );
    }
  };

  return (
    <div className='border-1 border-reiseorange bg-zinc-500 flex-1 min-h-30 p-1'>
      {planContents?.map((content) => {
        if (content.type === 'text') {
          return (
            <TextBox
              content={content}
              isEdit={editingId === content.id}
              setEditingId={setEditingId}
              updateContent={handleUpdateContent}
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

type TextBox = {
  content: Content;
  isEdit: boolean;
  setEditingId: (id: number | null) => void;
  updateContent: ({ id, box, data }: HandleUpdateContent) => void;
};
function TextBox({ content, isEdit, setEditingId, updateContent }: TextBox) {
  const handleClearEditOnBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }

    setEditingId(null);
    updateContent({ id: content.id, data: content.data });
  };

  if (content.box === 'note') {
    return (
      <NoteBox
        content={content}
        isEdit={isEdit}
        toggleNote={() => updateContent({ id: content.id, box: 'plain' })}
        toggleEdit={() => setEditingId(content.id)}
        UpdateContentOnBlur={handleClearEditOnBlur}
      />
    );
  } else {
    return (
      <DetailPlanBox
        content={content}
        isEdit={isEdit}
        toggleNote={() => updateContent({ id: content.id, box: 'note' })}
        toggleEdit={() => setEditingId(content.id)}
        UpdateContentOnBlur={handleClearEditOnBlur}
      />
    );
  }
}

const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const target = e.currentTarget;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};
type TextBoxItem = {
  content: Content;
  isEdit: boolean;
  toggleNote: () => void;
  toggleEdit: () => void;
  UpdateContentOnBlur: (e: React.FocusEvent<HTMLDivElement>) => void;
};
function NoteBox({
  content,
  isEdit,
  toggleNote,
  toggleEdit,
  UpdateContentOnBlur,
}: TextBoxItem) {
  return (
    <div
      tabIndex={content.id} // to make it focousable and trigger onBlur later
      onBlur={UpdateContentOnBlur}
      className='rounded-md bg-reisered py-1 px-2 mb-3 min-h-5 '
    >
      <h1 className='mb-2 text-xl font-bold'>NOTE</h1>
      {isEdit && (
        <div>
          <textarea
            defaultValue={content.data ?? ''}
            onChange={handleTextArea}
            placeholder='Input here.'
            className='w-full resize-none outline-0'
          />
          <div className='flex flex-row-reverse pr-5 pb-2'>
            <button
              onClick={toggleNote}
              className='flex items-center gap-1 rounded-xl bg-orange-300 py-1 px-2'
            >
              <FaTag />
              NOTE
            </button>
          </div>
        </div>
      )}
      {!isEdit && (
        <div onClick={toggleEdit}>
          {content.data ? content.data : 'Input here.'}
        </div>
      )}
    </div>
  );
}

function DetailPlanBox({
  content,
  isEdit,
  toggleNote,
  toggleEdit,
  UpdateContentOnBlur,
}: TextBoxItem) {
  return (
    <div
      tabIndex={content.id} // to make it focousable and trigger onBlur later
      onBlur={UpdateContentOnBlur}
      className='border-1 border-reiseyellow rounded-md mb-2 min-h-2'
    >
      {isEdit && (
        <div>
          <textarea
            defaultValue={content.data ?? ''}
            onChange={handleTextArea}
            placeholder='Input here.'
            className='w-full py-1 px-2 resize-none outline-0'
          />
          <div className='flex flex-row-reverse pr-5 pb-2'>
            <button
              onClick={toggleNote}
              className='flex items-center gap-1 rounded-xl bg-orange-300 py-1 px-2'
            >
              <FaTag />
              NOTE
            </button>
          </div>
        </div>
      )}
      {!isEdit && (
        <div onClick={toggleEdit} className='py-1 px-2'>
          {content.data ? content.data : 'Input here.'}
        </div>
      )}
    </div>
  );
}
