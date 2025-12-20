import supabase from '@/supabaseClient';
import { z } from 'zod';
import {
  ContentSchema,
  planContentsResponseSchema,
  type Content,
} from './planContents.types';

const InsertPlanContentsInput = z.tuple([z.number(), ContentSchema]);
export const insertPlanContents = async (
  plansId: number,
  contents: Content[]
) => {
  const [validatedPlansId, validatedContents] = InsertPlanContentsInput.parse([
    plansId,
    contents,
  ]);
  const insertData = {
    plans_id: validatedPlansId,
    contents: validatedContents,
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

  return planContentsResponseSchema.parse(data);
};

export const getPlanContentsById = async (planId: number) => {
  const { data, error } = await supabase
    .from('planContents')
    .select()
    .eq('plans_id', planId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching plan by ID:', error.message);
    throw error;
  }

  return planContentsResponseSchema.parse(data);
};

export const deletePlanContentsById = async (planId: number) => {
  const response = await supabase
    .from('planContents')
    .delete()
    .eq('plans_id', planId);

  return response;
};
