import supabase from '@/supabaseClient';
import { z } from 'zod';
import { ContentSchema, planContentsResponseSchema, type Content } from './planContents.types';
import { ApiError } from '@/errors/ApiError';

const InsertPlanContentsInput = z.tuple([z.number(), z.array(ContentSchema)]);
export const insertPlanContents = async (plansId: number, contents: Content[]) => {
  const validation = InsertPlanContentsInput.safeParse([plansId, contents]);

  if (!validation.success) {
    throw new ApiError('VALIDATION', { cause: validation.error });
  }

  const [validatedPlansId, validatedContents] = validation.data;

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
    throw new ApiError('DATABASE', { message: 'Failed to update plan contents.', cause: error });
  }

  const res = planContentsResponseSchema.safeParse(data);
  if (!res.success) {
    throw new ApiError('SERVER_RESPONSE', { cause: res.error });
  }

  return res.data;
};

export const getPlanContentsById = async (planId: number) => {
  const { data, error } = await supabase
    .from('planContents')
    .select()
    .eq('plans_id', planId)
    .maybeSingle();

  if (error) {
    throw new ApiError('DATABASE', { message: 'Failed to fetch plan contents.', cause: error });
  }

  const res = planContentsResponseSchema.safeParse(data);
  if (!res.success) {
    throw new ApiError('VALIDATION', { cause: res.error });
  }

  return res.data;
};

export const deletePlanContentsById = async (planId: number) => {
  const { status, error } = await supabase.from('planContents').delete().eq('plans_id', planId);

  if (error) {
    throw new ApiError('DATABASE', { cause: error });
  }

  return status === 204 ? true : false;
};
