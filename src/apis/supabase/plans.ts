import supabase from '@/supabaseClient';
import { planArrayResponseSchema, planSchema } from './plans.types';
import z from 'zod';
import { ApiError } from '@/errors/ApiError';

export const createPlan = async (groupId: number, title: string) => {
  const insert = planSchema.parse({ group_id: groupId, title: title });

  const { error, status } = await supabase.from('plans').insert(insert);

  if (error) throw error;

  return status === 201 ? true : false;
};

export const getPlansByGroupId = async (groupId: number) => {
  const { data, error } = await supabase
    .from('plans')
    .select()
    .eq('group_id', groupId)
    .order('id', { ascending: true });

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to fetch plans by group id: ${groupId}`,
      cause: error,
    });
  }

  return planArrayResponseSchema.parse(data);
};

export const deletePlan = async (planId: number) => {
  const { status, error } = await supabase.from('plans').delete().eq('id', planId);

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to delete a plan by id: ${planId}`,
      cause: error,
    });
  }

  return status === 204 ? true : false;
};

const renamePlanByPlanIdInput = z.tuple([z.number(), z.string().min(1)]);
export const renamePlanByPlanId = async (planId: number, newTitle: string) => {
  const [validatedId, validatedTitle] = renamePlanByPlanIdInput.parse([planId, newTitle]);

  const { status, error } = await supabase
    .from('plans')
    .update({ title: validatedTitle })
    .eq('id', validatedId)
    .single();

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to rename a plan by id: ${planId}`,
      cause: error,
    });
  }

  return status === 204 ? true : false;
};
