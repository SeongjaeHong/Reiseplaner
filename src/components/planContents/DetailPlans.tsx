import { useQueryClient } from '@tanstack/react-query';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { FaCirclePlus } from 'react-icons/fa6';
import { IoIosAttach } from 'react-icons/io';
import TextBox, { type TextBoxHandle } from './TextBox';
import ImageBox from './ImageBox';
import { useAddImage } from './utils/image';
import { useAddText } from './utils/text';
import {
  useDeleteLocalContents,
  useSaveChanges,
  useSuspenseQueryLocalContents,
  useUpdateLocalContents,
  type LocalContent,
} from './utils/contents';

export type DetailPlansHandle = {
  saveChanges: () => Promise<void>;
  contentsStatus: ContentsStatus;
  scrollToContent: (id: string) => void;
};

type ContentsStatus = 'Clean' | 'Dirty' | 'Pending'; // Pending: Being saved into DB
type DetailPlans = {
  planId: number;
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  ref: React.Ref<DetailPlansHandle>;
};

export default function DetailPlans({
  planId,
  ref,
  focusedId,
  setFocusedId,
}: DetailPlans) {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQueryLocalContents(planId);

  const [contentsStatus, setContentsStatus] = useState<ContentsStatus>('Clean');
  const saveStatusRef = useRef<ContentsStatus>('Clean');
  const updateContentsStatus = (status: ContentsStatus) => {
    setContentsStatus(status);
    saveStatusRef.current = status;
  };

  const { saveChanges, isPending: isSavePending } = useSaveChanges(
    queryClient,
    planId
  );
  const isSavePendingRef = useRef(isSavePending);

  const handleSaveChanges = useCallback(async () => {
    if (isSavePendingRef.current) {
      try {
        await waitFor(() => !isSavePendingRef.current, 5000);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error('An unknown error occurred while waiting for saving');
        }
        return;
      }
    }

    updateContentsStatus('Pending');
    isSavePendingRef.current = true;

    await saveChanges();

    isSavePendingRef.current = false;
    if (saveStatusRef.current === 'Pending') {
      // Set saveStatus to "Clean" only when contents hasn't been changed while saving.
      updateContentsStatus('Clean');
    }
  }, [saveChanges]);

  const autoSave = useAutoSave(handleSaveChanges);

  const updateLocalContents = useUpdateLocalContents(queryClient, planId);
  const handleUpdateLocalContents = (
    updatedContent: LocalContent,
    replace = true
  ) => {
    updateLocalContents(updatedContent, replace);
    updateContentsStatus('Dirty');
    autoSave();
  };

  const deleteLocalContents = useDeleteLocalContents(queryClient, planId);
  const handleDeleteLocalContents = (deletedContent: LocalContent) => {
    deleteLocalContents(deletedContent);
    updateContentsStatus('Dirty');
    autoSave();
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const handleAddText = useAddText({
    updateLocalContents: (content) => handleUpdateLocalContents(content, false),
    setEditingId,
  });

  const refFileInput = useRef<HTMLInputElement | null>(null);
  const addFile = useAddImage({
    updateLocalContents: (content) => handleUpdateLocalContents(content, false),
  });

  const contentRefs = useRef<Record<string, TextBoxHandle | null>>({});
  useImperativeHandle(
    ref,
    (): DetailPlansHandle => ({
      saveChanges: handleSaveChanges,
      contentsStatus: contentsStatus,
      scrollToContent: (id: string) => {
        const target = contentRefs.current[id];
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
    })
  );

  return (
    <>
      {data?.contents?.map((content) => {
        if (content.type === 'text') {
          return (
            <TextBox
              ref={(el) => {
                contentRefs.current[content.id] = el;
              }}
              content={content}
              isFocused={focusedId === content.id}
              isEdit={editingId === content.id}
              onFocus={() => setFocusedId(content.id)}
              setEditingId={setEditingId}
              updateContents={handleUpdateLocalContents}
              deleteContents={handleDeleteLocalContents}
              key={content.id}
            />
          );
        } else if (content.type === 'file' && !content.fileDelete) {
          return (
            <ImageBox
              content={content}
              updateContents={handleUpdateLocalContents}
              deleteContents={handleDeleteLocalContents}
              key={content.id}
            />
          );
        }
      })}

      {/* A function layer at the bottom*/}
      <div className='flex justify-between mt-5'>
        <div className='flex items-center gap-2 ml-2'>
          <button onClick={handleAddText}>
            <FaCirclePlus className='text-3xl text-reiseorange hover:text-orange-400' />
          </button>
          <button
            onClick={() => refFileInput.current?.click()}
            className='flex rounded-xl py-1 pr-2 text-white font-bold bg-reiseorange hover:bg-orange-400'
          >
            <input
              type='file'
              accept='image/*'
              ref={refFileInput}
              onChange={(e) => {
                const fileInput = e.currentTarget;
                void (async () => {
                  await addFile(e);
                  fileInput.value = '';
                })();
              }}
              className='hidden'
            />
            <IoIosAttach className='text-2xl' />
            <span>File</span>
          </button>
        </div>
        <div className='mr-2'>
          {contentsStatus === 'Pending' && <p className='text-sm'>Saving...</p>}
        </div>
      </div>
    </>
  );
}

const useAutoSave = (handleSaveChanges: () => Promise<void>) => {
  const refSaveTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (refSaveTimer.current) clearTimeout(refSaveTimer.current);
    };
  }, []);

  return () => {
    if (refSaveTimer.current) {
      clearTimeout(refSaveTimer.current);
    }

    refSaveTimer.current = setTimeout(() => {
      void handleSaveChanges();
    }, 30_000);
  };
};

const waitFor = (condition: () => boolean, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('waitFor timeout exceeded'));
      } else {
        setTimeout(checkCondition, 100);
      }
    };
    checkCondition();
  });
};
