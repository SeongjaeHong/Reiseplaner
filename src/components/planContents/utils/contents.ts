import { type QueryClient, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { uploadImage } from '@/apis/supabase/buckets';
import {
  deletePlanContentsById,
  getPlanContentsById,
  insertPlanContents,
} from '@/apis/supabase/planContents';
import type { Content } from '@/apis/supabase/planContents.types';
import { toast } from '@/components/common/Toast/toast';
import { isBase64DataUrl } from './image';
import { editorContentSchema, type NODE } from '../components/Editor/editor.types';
import { ApiError } from '@/errors/ApiError';
import { GuestError } from '@/errors/GuestError';

export const getContentsQueryKey = (planId: number) => ['DetailPlans', planId];

// Fetch contents from DB
export const useSuspenseQueryLocalContents = (planId: number) =>
  useSuspenseQuery({
    queryKey: getContentsQueryKey(planId),
    queryFn: async () => {
      let data;
      try {
        data = await getPlanContentsById(planId);
        if (!data) {
          return null;
        }

        return { ...data, contents: getSortedContents(data.contents) };
      } catch (error) {
        toast.error('Failed to load contents.');
        console.error(error);
        return null;
      }
    },
    staleTime: Infinity,
  });

// Save contents into DB
export const useSaveChanges = (queryClient: QueryClient, planId: number) => {
  const { mutateAsync: saveMutation, isPending } = useMutation({
    mutationFn: async (contents: Content[]) => {
      if (contents.length) {
        const saveContents = await Promise.all(
          contents.map(async (content) => {
            if (!content) {
              return null;
            }

            const res = editorContentSchema.safeParse(JSON.parse(content.data));
            if (res.error) {
              throw new ApiError('VALIDATION', { cause: res.error });
            }

            const parsed = res.data;
            parsed.root.children = await Promise.all(
              parsed.root.children.map(async (child) => {
                child.children = await convertContent(child.children);
                return child;
              })
            );

            content.data = JSON.stringify(parsed);
            return content;
          })
        );

        const finalResults = saveContents.filter((c) => c !== null);
        if (finalResults.length) {
          await insertPlanContents(planId, finalResults);
        } else {
          await deletePlanContentsById(planId);
        }

        queryClient.setQueryData(getContentsQueryKey(planId), {
          contents: finalResults,
        });
      } else {
        await deletePlanContentsById(planId);
      }
    },
    onError: (error) => {
      if (error instanceof GuestError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to save plan contents.');
      }
    },
  });

  const convertContent = async (children: NODE[]) => {
    return await Promise.all(
      children.map(async (child) => {
        if (child.type === 'text') {
          return child;
        }

        // child.type === 'file'
        if (isBase64DataUrl(child.src)) {
          child.src = await Base64ToURL(child.src);
        }
        return child;
      })
    );
  };

  const handleSave = async () => {
    if (isPending) {
      console.warn('Save operation already in progress. Ignoring new request.');
      return false;
    }

    const currentData = queryClient.getQueryData<{
      contents: Content[];
    }>(getContentsQueryKey(planId));

    if (currentData) {
      try {
        await saveMutation(currentData.contents);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  };

  return {
    saveChanges: handleSave,
    isPending,
  };
};

// Replace a File object in Content.data with Supabase Storage URL
const Base64ToURL = async (content: string) => {
  const res = await fetch(content);
  const blob = await res.blob();

  const file = new File([blob], 'png', { type: blob.type });
  const { fullPath: filePath } = await uploadImage(file);
  return filePath;
};

// Add or update a content in cache
export const useUpdateLocalContents = (queryClient: QueryClient, planId: number) => {
  return (updatedContent: Content, replace = true) => {
    const queryKey = getContentsQueryKey(planId);
    const previousData = queryClient.getQueryData<{ contents: Content[] }>(queryKey) ?? {
      contents: [],
    };
    const prevContents = previousData.contents;

    if (!prevContents) return;

    let updatedList: Content[];

    if (replace) {
      updatedList = prevContents
        .map((item) => (item.id === updatedContent.id ? updatedContent : item))
        .filter((item) => {
          if (item.type === 'text') return item.title !== '' || item.data !== '';
          return item.data !== '';
        });
    } else {
      updatedList = [...prevContents, updatedContent];
    }

    queryClient.setQueryData(queryKey, {
      contents: getSortedContents(updatedList),
    });
  };
};

// Delete a content from cache
export const useDeleteLocalContents = (queryClient: QueryClient, planId: number) => {
  return (deletedContent: Content) => {
    const previousData = queryClient.getQueryData<{ contents: Content[] }>(
      getContentsQueryKey(planId)
    ) ?? { contents: [] };
    const prevContents = previousData.contents;

    if (!prevContents) {
      return;
    }

    const newContents = prevContents.reduce((acc, current) => {
      if (current.id !== deletedContent.id) {
        acc.push(current);
      }

      return acc;
    }, [] as Content[]);

    queryClient.setQueryData(getContentsQueryKey(planId), {
      contents: newContents,
    });
  };
};

// Sort contents by time
export const getSortedContents = (contents: Content[]): Content[] => {
  const active = contents.filter((c) => c.type === 'text' && c.isTimeActive);
  const inactive = contents.filter((c) => !(c.type === 'text' && c.isTimeActive));

  active.sort((a, b) => {
    const timeA = Number(a.time.start.hour) * 60 + Number(a.time.start.minute);
    const timeB = Number(b.time.start.hour) * 60 + Number(b.time.start.minute);
    return timeA - timeB;
  });

  return [...active, ...inactive];
};
