import { type QueryClient, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { deleteImage, uploadImage } from '@/apis/supabase/buckets';
import {
  deletePlanContentsById,
  getPlanContentsById,
  insertPlanContents,
} from '@/apis/supabase/planContents';
import type { ImageContent, TextContent } from '@/apis/supabase/planContents.types';
import { toast } from '@/components/common/Toast/toast';

export type LocalContent = TextContent | LocalImageContent;
export type LocalImageContent = Omit<ImageContent, 'data'> & {
  data: string | File;
  fileDelete: boolean;
};

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

        // Add fileDelete attribute to file contents
        const processedContents: LocalContent[] = data.contents.map((content) => {
          if (content.type === 'file') {
            return { ...content, fileDelete: false };
          }
          return content;
        });

        return { ...data, contents: getSortedContents(processedContents) };
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
    mutationFn: async (localContents: LocalContent[]) => {
      if (localContents.length) {
        const saveContents = await Promise.all(
          localContents.map(async (localContent) => {
            if (localContent.type === 'file') {
              if (localContent.fileDelete) {
                // Delete the image from DB and finally remove it from cache as well
                if (typeof localContent.data === 'string') {
                  try {
                    await deleteImage(localContent.data);
                  } catch {
                    console.error('Failed to delete an image from the server.');
                  }
                }
                return null;
              } else {
                const { fileDelete: _, ...content } = await fileToURL(localContent);
                return content as ImageContent;
              }
            } else {
              return localContent;
            }
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
      toast.error('Failed to save plan contents.');
      console.error(error);
    },
  });

  const handleSave = async () => {
    if (isPending) {
      console.warn('Save operation already in progress. Ignoring new request.');
      return false;
    }

    const currentData = queryClient.getQueryData<{
      contents: LocalContent[];
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
const fileToURL = async (content: LocalImageContent) => {
  if (content.type === 'file' && content.data instanceof File) {
    const { fullPath: filePath } = await uploadImage(content.data);
    return { ...content, data: filePath };
  }
  return content;
};

// Add or update a content in cache
export const useUpdateLocalContents = (queryClient: QueryClient, planId: number) => {
  return (updatedContent: LocalContent, replace = true) => {
    const queryKey = getContentsQueryKey(planId);
    const previousData = queryClient.getQueryData<{ contents: LocalContent[] }>(queryKey) ?? {
      contents: [],
    };
    const prevContents = previousData.contents;

    if (!prevContents) return;

    let updatedList: LocalContent[];

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
  return (deletedContent: LocalContent) => {
    const previousData = queryClient.getQueryData<{ contents: LocalContent[] }>(
      getContentsQueryKey(planId)
    ) ?? { contents: [] };
    const prevContents = previousData.contents;

    if (!prevContents) {
      return;
    }

    const newContents = prevContents.reduce((acc, current) => {
      if (current.id === deletedContent.id) {
        if (deletedContent.type === 'file') {
          if (typeof deletedContent.data === 'string') {
            // If an image is already stored in DB, simply mark it to delete it from DB while saving changes
            // and then this will be removed from cache
            deletedContent.fileDelete = true;
            acc.push(deletedContent);
          }
        }
      } else {
        acc.push(current);
      }

      return acc;
    }, [] as LocalContent[]);

    queryClient.setQueryData(getContentsQueryKey(planId), {
      contents: newContents,
    });
  };
};

// Sort contents by time
export const getSortedContents = (contents: LocalContent[]): LocalContent[] => {
  const active = contents.filter((c) => c.type === 'text' && c.isTimeActive) as TextContent[];
  const inactive = contents.filter((c) => !(c.type === 'text' && c.isTimeActive));

  active.sort((a, b) => {
    const timeA = Number(a.time.start.hour) * 60 + Number(a.time.start.minute);
    const timeB = Number(b.time.start.hour) * 60 + Number(b.time.start.minute);
    return timeA - timeB;
  });

  return [...active, ...inactive];
};
