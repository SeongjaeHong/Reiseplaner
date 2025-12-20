import supabase from '@/supabaseClient';

export const createPlanGroup = async (title: string) => {
  const { error } = await supabase.from('plangroups').insert([{ title }]);

  if (error) console.error(error);
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
  const { data, error } = await supabase
    .from('plangroups')
    .select()
    .order('id', { ascending: true });

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
  thumbnailURL: string | null,
  startTime: string | null,
  endTime: string | null
) => {
  const update: Partial<{
    title: string;
    thumbnailURL: string | null;
    start_time: string | null;
    end_time: string | null;
  }> = {
    title,
    thumbnailURL,
    start_time: startTime,
    end_time: endTime,
  };

  const res = await supabase
    .from('plangroups')
    .update(update)
    .eq('id', groupId)
    .throwOnError();

  return res;
};
