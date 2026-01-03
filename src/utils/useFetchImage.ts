import { downloadImage } from '@/apis/supabase/buckets';
import { toast } from '@/components/common/Toast/toast';
import { useSuspenseQuery } from '@tanstack/react-query';

type UseFetchImage = {
  imageURL: string | null;
};
export function useFetchImage({ imageURL }: UseFetchImage) {
  const { data } = useSuspenseQuery({
    queryKey: [imageURL],
    queryFn: () => {
      try {
        return downloadImage(imageURL);
      } catch {
        toast.error('Failed to download an image from the server.');
        return null;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return data;
}
