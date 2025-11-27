import supabase from '@/supabaseClient';
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
export const createPlan: CreatePlan = async (group_id, title) => {
  const { data, error } = await supabase
    .from('plans')
    .insert({ group_id, title })
    .select()
    .single();

  if (error) throw error;

  return Plan.parse(data);
};

const Plans = z.array(Plan);
type TypePlans = z.infer<typeof Plans>;
type GetPlansByGroup = (groupId: number) => Promise<TypePlans | null>;
export const getPlansByGroupId: GetPlansByGroup = async (groupId) => {
  const { data, error } = await supabase
    .from('plans')
    .select()
    .eq('group_id', groupId);

  if (error) console.error(error);

  return Plans.parse(data);
};
