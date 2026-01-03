import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { FaCirclePlus } from 'react-icons/fa6';
import {
  useDeleteLocalContents,
  useSaveChanges,
  useSuspenseQueryLocalContents,
  useUpdateLocalContents,
} from '../../utils/contents';
import { useAddText } from '../../utils/text';
import PlanEditor, { type PlanEditorHandle } from '../Editor/PlanEditor';
import type { Content } from '@/apis/supabase/planContents.types';

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

export default function DetailPlans({ planId, ref, focusedId, setFocusedId }: DetailPlans) {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQueryLocalContents(planId);

  const [contentsStatus, setContentsStatus] = useState<ContentsStatus>('Clean');
  const saveStatusRef = useRef<ContentsStatus>('Clean');
  const updateContentsStatus = (status: ContentsStatus) => {
    setContentsStatus(status);
    saveStatusRef.current = status;
  };

  const { saveChanges, isPending: isSavePending } = useSaveChanges(queryClient, planId);
  const isSavePendingRef = useRef(isSavePending);

  const handleSaveChanges = useCallback(async () => {
    if (isSavePendingRef.current) {
      try {
        await waitFor(() => !isSavePendingRef.current, 5000);
      } catch {
        throw new Error('Saving in progress. Please try again in a moment.');
      }
    }

    updateContentsStatus('Pending');
    isSavePendingRef.current = true;

    const isSaveSuccess = await saveChanges();
    if (isSaveSuccess && saveStatusRef.current === 'Pending') {
      // Set saveStatus to "Clean" only when contents hasn't been changed while saving.
      updateContentsStatus('Clean');
    }

    isSavePendingRef.current = false;
  }, [saveChanges]);

  const autoSave = useAutoSave(handleSaveChanges);

  const updateLocalContents = useUpdateLocalContents(queryClient, planId);
  const handleUpdateLocalContents = (updatedContent: Content, replace = true) => {
    updateLocalContents(updatedContent, replace);
    updateContentsStatus('Dirty');
    autoSave();
  };

  const deleteLocalContents = useDeleteLocalContents(queryClient, planId);
  const handleDeleteLocalContents = (deletedContent: Content) => {
    deleteLocalContents(deletedContent);
    updateContentsStatus('Dirty');
    autoSave();
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const handleAddText = useAddText({
    updateLocalContents: (content) => handleUpdateLocalContents(content, false),
    setEditingId,
  });

  const contentRefs = useRef<Record<string, PlanEditorHandle | null>>({});
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
        return (
          <PlanEditor
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
      })}

      {/* A function layer at the bottom*/}
      <div className='mt-5 ml-2 flex items-center gap-2'>
        <button onClick={handleAddText}>
          <FaCirclePlus className='hover:text-primary text-3xl text-slate-400' />
        </button>
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
        reject(new Error('waitFor timeout exceeded.'));
      } else {
        setTimeout(checkCondition, 100);
      }
    };
    checkCondition();
  });
};
