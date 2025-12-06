import type { Database } from '@/database.types';
import supabase from '@/supabaseClient';

type PlanContentsRow = Database['public']['Tables']['planContents']['Row'];
type Json = Database['public']['Tables']['planContents']['Row']['contents'];
type InsertPlanContents = (
  plansId: number,
  contents: Json
) => Promise<PlanContentsRow>;
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
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting plan contents:', error.message);
    throw error;
  }

  return data;
};

type GetPlanById = (planId: number) => Promise<PlanContentsRow | null>;
export const getPlanContentsById: GetPlanById = async (planId) => {
  const { data, error } = await supabase
    .from('planContents')
    .select()
    .eq('id', planId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching plan by ID:', error.message);
    throw error;
  }

  return data;
};
