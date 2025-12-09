import type { Database } from '@/database.types';
import supabase from '@/supabaseClient';

export type TextContent = {
  id: number;
  type: 'text';
  data: string;
  box: 'plain' | 'note';
};
export type ImageContent = {
  id: number;
  type: 'file';
  data: string;
  width: number | null;
  height: number | null;
};
export type Content = TextContent | ImageContent;
type PlanContentsRow = Database['public']['Tables']['planContents']['Row'];
export type PlanContent = Omit<PlanContentsRow, 'contents'> & {
  contents: Content[];
};
type InsertPlanContents = (
  plansId: number,
  contents: Content[]
) => Promise<PlanContent>;
export const insertPlanContents: InsertPlanContents = async (
  plansId,
  contents
) => {
  const insertData = {
    plans_id: plansId,
    contents: contents,
  };

  const { data, error } = await supabase
    .from('planContents')
    .upsert([insertData], {
      onConflict: 'plans_id',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting plan contents:', error.message);
    throw error;
  }

  return data as PlanContent;
};

type GetPlanContentsById = (planId: number) => Promise<PlanContent | null>;
export const getPlanContentsById: GetPlanContentsById = async (planId) => {
  const { data, error } = await supabase
    .from('planContents')
    .select()
    .eq('plans_id', planId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching plan by ID:', error.message);
    throw error;
  }

  return data as PlanContent | null;
};

export const deletePlanContentsById = async (planId: number) => {
  const response = await supabase
    .from('planContents')
    .delete()
    .eq('plans_id', planId);

  return response;
};
