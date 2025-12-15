import { type QueryClient, useMutation } from '@tanstack/react-query';
import { type LocalContent } from '../DetailPlans';
import {
  deletePlanGroupThumbnail,
  uploadPlanGroupThumbnail,
} from '@/apis/supabase/buckets';
import {
  deletePlanContentsById,
  insertPlanContents,
  type Content,
} from '@/apis/supabase/planContents';

export const getContentsQueryKey = (planId: number) => ['DetailPlans', planId];

// Save contents into DB
export const useSaveChanges = (queryClient: QueryClient, planId: number) => {
  const { mutateAsync: saveMutation, isPending } = useMutation({
    mutationFn: async (contents: LocalContent[]) => {
      if (contents.length) {
        const saveContents = await Promise.all(
          contents.map(async (content) => {
            if (content.type === 'file') {
              if (content.fileDelete) {
                // Delete the image from DB and finally remove it from cache as well
                if (typeof content.data === 'string') {
                  await deletePlanGroupThumbnail(content.data);
                }
                return null;
              } else {
                return await fileToURL(content);
              }
            } else {
              return content;
            }
          })
        );

        const finalResults = saveContents.filter((c) => c !== null);
        if (finalResults.length) {
          await insertPlanContents(planId, finalResults as Content[]);
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
  });

  const handleSave = async () => {
    if (isPending) {
      console.log('Save operation already in progress. Ignoring new request.');
      return;
    }

    const currentData = queryClient.getQueryData<{
      contents: LocalContent[];
    }>(getContentsQueryKey(planId));

    if (currentData) {
      await saveMutation(currentData.contents);
    }
  };

  return {
    saveChanges: handleSave,
    isPending,
  };
};

// Replace a File object in Content.data with Supabase Storage URL
const fileToURL = async (content: LocalContent) => {
  if (content.type === 'file' && content.data instanceof File) {
    const { fullPath: filePath } = await uploadPlanGroupThumbnail(
      content.data as unknown as File
    );

    if (filePath) {
      return { ...content, data: filePath } as LocalContent;
    } else {
      console.error('Failed to upload an image:', content);
    }
  }
  return content;
};

// Add or update a content in cache
export const useUpdateLocalContents = (
  queryClient: QueryClient,
  planId: number
) => {
  return (updatedContent: LocalContent, replace = true) => {
    const previousData = queryClient.getQueryData<{ contents: LocalContent[] }>(
      getContentsQueryKey(planId)
    ) ?? { contents: [] };
    const prevContents = previousData.contents;

    if (!prevContents) {
      return;
    }

    let newContents: LocalContent[] = [];

    if (!prevContents.length || !replace) {
      // Add a new content
      newContents = [...prevContents, updatedContent];
    } else {
      // Update an existing content
      newContents = prevContents.reduce((acc, current) => {
        if (current.id === updatedContent.id) {
          if (updatedContent.type === 'text') {
            if (updatedContent.title !== '' || updatedContent.data !== '') {
              acc.push(updatedContent);
            }
          } else if (updatedContent.type === 'file') {
            if (updatedContent.data !== '') {
              acc.push(updatedContent);
            }
          }
        } else {
          acc.push(current);
        }
        return acc;
      }, [] as LocalContent[]);
    }

    queryClient.setQueryData(getContentsQueryKey(planId), {
      contents: newContents,
    });
  };
};

// Delete a content from cache
export const useDeleteLocalContents = (
  queryClient: QueryClient,
  planId: number
) => {
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
