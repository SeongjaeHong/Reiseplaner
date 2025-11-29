import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import supabase from '@/supabaseClient';
import { z } from 'zod';

export const createPlanGroup = async (title: string) => {
  const { data, error } = await supabase
    .from('plangroups')
    .insert([{ title }])
    .select();

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

const plangroups = z.array(
  z.object({
    id: z.number(),
    created_at: z.string(),
    title: z.string(),
  })
);
export type TypePlangroups = z.infer<typeof plangroups>;
type GetPlanGroups = () => Promise<TypePlangroups | null>;
export const getPlanGroups: GetPlanGroups = async () => {
  const { data, error } = await supabase.from('plangroups').select();

  if (error) console.error(error);

  return plangroups.parse(data);
};

type typeDeletePlanGroups = (
  planGroupId: number
) => Promise<PostgrestSingleResponse<null>>;
export const deletePlanGroups: typeDeletePlanGroups = async (planGroupId) => {
  const response = await supabase
    .from('plangroups')
    .delete()
    .eq('id', planGroupId);

  return response;
};

type RenamePlanGroupByGroupId = (
  groupId: number,
  newTitle: string
) => Promise<PostgrestResponse<never> | null>;
export const renamePlanGroupByGroupId: RenamePlanGroupByGroupId = async (
  groupId,
  newTitle
) => {
  const res = await supabase
    .from('plangroups')
    .update({ title: newTitle })
    .eq('id', groupId)
    .single()
    .throwOnError();

  return res;
};
