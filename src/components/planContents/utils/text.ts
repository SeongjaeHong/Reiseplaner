import type { Content, TextContent } from '@/apis/supabase/planContents';

type UseAddText = {
  planContents: Content[] | null;
  setPlanContents: React.Dispatch<React.SetStateAction<Content[] | null>>;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
};
export function useAddText({
  planContents,
  setPlanContents,
  setEditingId,
}: UseAddText) {
  return () => {
    const newContent: TextContent = {
      id: planContents ? planContents.length + 1 : 1,
      type: 'text',
      data: '',
      box: 'plain',
    };

    setEditingId(newContent.id);
    setPlanContents((prev) => (prev ? [...prev, newContent] : [newContent]));
  };
}
