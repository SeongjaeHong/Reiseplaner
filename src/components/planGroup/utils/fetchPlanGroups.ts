import { getPlanGroups } from '@/apis/supabase/planGroups';
import { getPlansCount } from '@/apis/supabase/plans';
import { useAuth } from '@/components/auth/AuthContext';
import { useQuery } from '@tanstack/react-query';

export const plangroupsFetchKey = (userId: string) => {
  return ['getPlanGroups', userId];
};

export const useFetchPlanGroupsByUserId = () => {
  const { user } = useAuth();
  if (!user) {
    throw new Error('User session not exists.');
  }

  return useQuery({
    queryKey: plangroupsFetchKey(user.id),
    queryFn: getPlanGroups,
    staleTime: Infinity,
    gcTime: Infinity,
    throwOnError: true,
  });
};

export const useFetchPlanGroupByGroupId = (groupId: number) => {
  const { data: planGroups } = useFetchPlanGroupsByUserId();
  return planGroups?.find((planGroup) => planGroup.id === groupId);
};

export const plansCountsFetchKey = (groupId: number) => ['useGetPlansCounts', groupId];

export function useGetPlansCounts(groupId: number) {
  return useQuery({
    queryKey: plansCountsFetchKey(groupId),
    queryFn: () => getPlansCount(groupId),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
