import { v4 as uuid } from 'uuid';
import type { Content } from '@/apis/supabase/planContents.types';

type UseAddText = {
  updateLocalContents: (content: Content) => void;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
};
export function useAddText({ updateLocalContents, setEditingId }: UseAddText) {
  return () => {
    const defaultTime = {
      start: { hour: null, minute: null },
      end: { hour: null, minute: null },
    };

    const newContent: Content = {
      id: uuid(),
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
