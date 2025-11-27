import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import supabase from '@/supabaseClient';
import { z } from 'zod';

export const savePlanGroup = async (title: string) => {
  const { data, error } = await supabase
    .from('plangroups')
    .insert([{ title }])
    .select();

  if (error) console.error(error);

  return data;
};

export const getPlanGroups = async () => {
  const { data, error } = await supabase.from('plangroups').select();

  if (error) console.error(error);

  return data;
};

const plangroupsById = z.object({
  id: z.number(),
  created_at: z.string(),
  title: z.string(),
});
type GetPlanGroupByGroupId = (
  groupId: number
) => Promise<z.infer<typeof plangroupsById> | null>;
export const getPlanGroupByGroupId: GetPlanGroupByGroupId = async (groupId) => {
  const { data } = await supabase
    .from('plangroups')
    .select()
    .eq('id', groupId)
    .single()
    .throwOnError();

  return plangroupsById.parse(data);
};

type typeDeletePlanGroups = (
  id: number
) => Promise<PostgrestSingleResponse<null>>;
export const deletePlanGroups: typeDeletePlanGroups = async (id) => {
  const response = await supabase.from('plangroups').delete().eq('id', id);

  return response;
};
