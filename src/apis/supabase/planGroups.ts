import supabase from '@/supabaseClient';

export const createPlanGroup = async (title: string) => {
  const { data, error } = await supabase
    .from('plangroups')
    .insert([{ title }])
    .select();

  if (error) console.error(error);

  return data;
};

export const getPlanGroupByGroupId = async (groupId: number) => {
  const { data } = await supabase
    .from('plangroups')
    .select()
    .eq('id', groupId)
    .single()
    .throwOnError();

  return data;
};

export const getPlanGroups = async () => {
  const { data, error } = await supabase.from('plangroups').select();

  if (error) console.error(error);

  return data;
};

export const deletePlanGroups = async (planGroupId: number) => {
  const response = await supabase
    .from('plangroups')
    .delete()
    .eq('id', planGroupId);

  return response;
};

export const updatePlanGroupByGroupId = async (
  groupId: number,
  title: string,
  thumbnailURL: string | null | undefined
) => {
  const update: Partial<{ title: string; thumbnailURL: string | null }> = {
    title,
  };
  if (thumbnailURL || thumbnailURL === null) {
    update.thumbnailURL = thumbnailURL;
  }

  const res = await supabase
    .from('plangroups')
    .update(update)
    .eq('id', groupId)
    .single()
    .throwOnError();

  return res;
};
