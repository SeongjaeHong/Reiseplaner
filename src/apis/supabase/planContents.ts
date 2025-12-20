import supabase from '@/supabaseClient';
import { z } from 'zod';
import {
  ContentSchema,
  planContentsResponseSchema,
  type Content,
} from './planContents.types';

const InsertPlanContentsInput = z.tuple([z.number(), z.array(ContentSchema)]);
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

  const { data } = await supabase
    .from('planContents')
    .upsert([insertData], {
      onConflict: 'plans_id',
      ignoreDuplicates: false,
    })
    .select()
    .single()
    .throwOnError();

  return planContentsResponseSchema.parse(data);
};

export const getPlanContentsById = async (planId: number) => {
  const { data } = await supabase
    .from('planContents')
    .select()
    .eq('plans_id', planId)
    .maybeSingle()
    .throwOnError();

  return planContentsResponseSchema.parse(data);
};

export const deletePlanContentsById = async (planId: number) => {
  const { status } = await supabase
    .from('planContents')
    .delete()
    .eq('plans_id', planId);

  return status === 204 ? true : false;
};
