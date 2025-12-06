import type { Database } from '@/database.types';
import supabase from '@/supabaseClient';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';

type typeuploadImage = (file: File) => Promise<string>;
export const uploadImage: typeuploadImage = async (file) => {
  const filePath = file.name;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) throw error;

  return data.fullPath;
};

type Plan = Database['public']['Tables']['plans']['Row'];
type CreatePlan = (group_id: number, title: string) => Promise<Plan | null>;
export const createPlan: CreatePlan = async (groupId, title) => {
  const { data, error } = await supabase
    .from('plans')
    .insert({ group_id: groupId, title: title })
    .select()
    .single();

  if (error) throw error;

  return data;
};

type GetPlansByGroup = (groupId: number) => Promise<Plan[] | null>;
export const getPlansByGroupId: GetPlansByGroup = async (groupId) => {
  const { data, error } = await supabase
    .from('plans')
    .select()
    .eq('group_id', groupId);

  if (error) console.error(error);

  return data;
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
