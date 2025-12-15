import type { TextContent } from '@/apis/supabase/planContents';
import type { LocalContent } from '../DetailPlans';

type UseAddText = {
  planContents: LocalContent[];
  updateLocalContents: (content: LocalContent) => void;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
};
export function useAddText({
  planContents,
  updateLocalContents,
  setEditingId,
}: UseAddText) {
  return () => {
    const contentId = (planContents.at(-1)?.id ?? 0) + 1;
    const defaultTime = {
      start: { hour: '00', minute: '00' },
      end: { hour: '00', minute: '00' },
    };

    const newContent: TextContent = {
      id: contentId,
      type: 'text',
      title: '',
      data: '',
      box: 'plain',
      time: defaultTime,
      isTimeActive: false,
    };

    setEditingId(newContent.id);
    updateLocalContents(newContent);
  };
}
