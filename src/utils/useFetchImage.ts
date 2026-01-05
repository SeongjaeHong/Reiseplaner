import { downloadImage } from '@/apis/supabase/buckets';
import { toast } from '@/components/common/Toast/toast';
import { useQuery } from '@tanstack/react-query';

type UseFetchImage = {
  imageURL: string | null;
  enabled?: boolean;
};
export function useFetchImage({ imageURL, enabled = true }: UseFetchImage) {
  const { data } = useQuery({
    queryKey: [imageURL],
    queryFn: () => {
      try {
        return downloadImage(imageURL);
      } catch {
        toast.error('Failed to download an image from the server.');
        return null;
      }
    },
    enabled: enabled,
    staleTime: Infinity,
    gcTime: 3600 * 1000,
  });

  return data;
}
