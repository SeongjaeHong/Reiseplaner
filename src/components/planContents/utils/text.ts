import type { Content, TextContent } from '@/apis/supabase/planContents';

type UseAddText = {
  planContents: Content[];
  updateLocalContents: (content: Content) => void;
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
