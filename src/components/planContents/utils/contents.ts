import {
  deletePlanContentsById,
  insertPlanContents,
  type Content,
  type ImageContent,
  type TextContent,
} from '@/apis/supabase/planContents';
import { useQueryClient } from '@tanstack/react-query';

type UseUpdateContents = {
  planId: number;
  planContents: Content[] | null;
  setPlanContents: React.Dispatch<React.SetStateAction<Content[] | null>>;
};
export function useUpdateContents({
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
