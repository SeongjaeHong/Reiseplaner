import supabase from '../supabaseClient';

export const savePlanGroup = async (title: string) => {
  const { data, error } = await supabase
    .from('plans')
    .insert([{ title }])
    .select();

  if (error) console.error(error);

  return data;
};
