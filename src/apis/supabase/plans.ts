import supabase from '@/supabaseClient';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import z from 'zod';

type typeuploadImage = (file: File) => Promise<string>;
export const uploadImage: typeuploadImage = async (file) => {
  const filePath = file.name;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) throw error;

  return data.fullPath;
};

const Plan = z.object({
  id: z.number(),
  created_at: z.string(),
  title: z.string(),
  contents: z.json(),
  group_id: z.number(),
});
type TypePlan = z.infer<typeof Plan>;
type CreatePlan = (group_id: number, title: string) => Promise<TypePlan | null>;
export const createPlan: CreatePlan = async (groupId, title) => {
  const { data, error } = await supabase
    .from('plans')
    .insert({ group_id: groupId, title: title })
    .select()
    .single();

  if (error) throw error;

  return Plan.parse(data);
};

const Plans = z.array(Plan);
export type TypePlans = z.infer<typeof Plans>;
type GetPlansByGroup = (groupId: number) => Promise<TypePlans | null>;
export const getPlansByGroupId: GetPlansByGroup = async (groupId) => {
  const { data, error } = await supabase
    .from('plans')
    .select()
    .eq('group_id', groupId);

  if (error) console.error(error);

  return Plans.parse(data);
};

type typeDeletePlan = (
  planId: number
) => Promise<PostgrestSingleResponse<null>>;
export const deletePlan: typeDeletePlan = async (planId) => {
  const response = await supabase.from('plans').delete().eq('id', planId);

  return response;
};

type RenamePlanByPlanId = (
  planId: number,
  newTitle: string
) => Promise<PostgrestResponse<never> | null>;
export const renamePlanByPlanId: RenamePlanByPlanId = async (
  planId,
  newTitle
) => {
  const res = await supabase
    .from('plans')
    .update({ title: newTitle })
    .eq('id', planId)
    .single()
    .throwOnError();

  return res;
};
