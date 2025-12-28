import supabase from '@/supabaseClient';
import { planGroupArrayResponseSchema, planGroupSchema } from './planGroups.types';
import { ApiError } from '@/errors/ApiError';

export const createPlanGroup = async (title: string) => {
  const { status, error } = await supabase.from('plangroups').insert([{ title }]);

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to create a plan group: ${title}`,
      cause: error,
    });
  }

  return status === 201 ? true : false;
};

export const getPlanGroups = async () => {
  const { data } = await supabase
    .from('plangroups')
    .select()
    .order('id', { ascending: true })
    .throwOnError();

  const res = planGroupArrayResponseSchema.safeParse(data);
  if (!res.success) {
    throw new ApiError('VALIDATION', { cause: res.error });
  }

  return res.data;
};

export const deletePlanGroups = async (planGroupId: number) => {
  const { status, error } = await supabase.from('plangroups').delete().eq('id', planGroupId);

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to delete a plan group by id: ${planGroupId}`,
      cause: error,
    });
  }

  return status === 204 ? true : false;
};

export const updatePlanGroupByGroupId = async (
  planGroupId: number,
  title: string,
  thumbnailURL: string | null,
  startTime: string | null,
  endTime: string | null
) => {
  const update = planGroupSchema.parse({
    title,
    thumbnailURL,
    start_time: startTime,
    end_time: endTime,
  });

  const { status, error } = await supabase.from('plangroups').update(update).eq('id', planGroupId);

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to update a plan group by id: ${planGroupId}`,
      cause: error,
    });
  }

  return status === 204 ? true : false;
};
