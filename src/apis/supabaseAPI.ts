import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import supabase from '../supabaseClient';

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

type typeDeletePlanGroups = (
  id: number
) => Promise<PostgrestSingleResponse<null>>;
export const deletePlanGroups: typeDeletePlanGroups = async (id) => {
  const response = await supabase.from('plangroups').delete().eq('id', id);

  return response;
};
