import supabase from '@/supabaseClient';
import {
  planGroupArrayResponseSchema,
  planGroupSchema,
} from './planGroups.types';

export const createPlanGroup = async (title: string) => {
  const { status } = await supabase
    .from('plangroups')
    .insert([{ title }])
    .throwOnError();

  return status === 201 ? true : false;
};

export const getPlanGroups = async () => {
  const { data } = await supabase
    .from('plangroups')
    .select()
    .order('id', { ascending: true })
    .throwOnError();

  return planGroupArrayResponseSchema.parse(data);
};

export const deletePlanGroups = async (planGroupId: number) => {
  const { status } = await supabase
    .from('plangroups')
    .delete()
    .eq('id', planGroupId)
    .throwOnError();

  return status === 204 ? true : false;
};

export const updatePlanGroupByGroupId = async (
  groupId: number,
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

  const { status } = await supabase
    .from('plangroups')
    .update(update)
    .eq('id', groupId)
    .throwOnError();

  return status === 204 ? true : false;
};
