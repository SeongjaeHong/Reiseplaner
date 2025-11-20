import supabase from '@/supabaseClient';

type typeuploadImage = (file: File) => Promise<string>;
export const uploadImage: typeuploadImage = async (file) => {
  const filePath = file.name;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) throw error;

  return data.fullPath;
};

type typeGetPlansByGroup = (groupId: number) => Promise<any[] | null>;
export const getPlansByGroupId: typeGetPlansByGroup = async (groupId) => {
  const { data, error } = await supabase
    .from('plans')
    .select()
    .eq('group_id', groupId);

  if (error) console.error(error);

  return data;
};

type typeCreatePlan = (
  group_id: number,
  title: string
) => Promise<any[] | null>;
export const createPlan: typeCreatePlan = async (group_id, title) => {
  const { data, error } = await supabase
    .from('plans')
    .insert({ group_id, title })
    .select()
    .single();

  if (error) throw error;

  return data;
};
