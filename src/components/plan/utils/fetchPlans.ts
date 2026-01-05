import { getPlansByGroupId } from '@/apis/supabase/plans';
import { useQuery } from '@tanstack/react-query';

export const plansFetchKey = (groupId: number) => {
  return ['fetchPlans', groupId];
};

export function useFetchPlans(groupId: number) {
  return useQuery({
    queryKey: plansFetchKey(groupId),
    queryFn: async () => {
      const data = await getPlansByGroupId(groupId);
      return data ?? [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
    throwOnError: true,
  });
}
