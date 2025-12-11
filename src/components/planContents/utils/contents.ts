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

    let contentsDirty = false;
    const newContents = planContents
      .map((content) => {
        if (content.id !== newContent.id) {
          return content;
        }

        const isDataDirty = content.data !== newContent.data;
        contentsDirty = isDataDirty;
        if (!contentsDirty) {
          if (newContent.type === 'text') {
            const textContent = content as TextContent;
            const isBoxDirty = textContent.box !== newContent.box;
            const isTimeActiveDirty =
              textContent.isTimeActive !== newContent.isTimeActive;

            const time = textContent.time;
            const newTime = newContent.time;
            const isTimeDirty =
              time.start.hour !== newTime.start.hour ||
              time.start.minute !== newTime.start.minute ||
              time.end.hour !== newTime.end.hour ||
              time.end.minute !== newTime.end.minute;

            contentsDirty = isBoxDirty || isTimeActiveDirty || isTimeDirty;
          } else if (newContent.type === 'file') {
            contentsDirty =
              (content as ImageContent).height !== newContent.height ||
              (content as ImageContent).width !== newContent.width;
          }
        }

        return newContent;
      })
      .filter((content) => content.data !== '');

    if (newContents.length !== planContents.length) {
      contentsDirty = true;
    }

    setPlanContents(newContents);

    if (contentsDirty) {
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
