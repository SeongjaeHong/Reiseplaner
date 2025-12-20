import supabase from '@/supabaseClient';
import { planArrayResponseSchema, planSchema } from './plans.types';
import z from 'zod';

export const createPlan = async (groupId: number, title: string) => {
  const insert = planSchema.parse({ group_id: groupId, title: title });

  const { error, status } = await supabase.from('plans').insert(insert);

  if (error) throw error;

  return status === 201 ? true : false;
};

export const getPlansByGroupId = async (groupId: number) => {
  const { data } = await supabase
    .from('plans')
    .select()
    .eq('group_id', groupId)
    .order('id', { ascending: true })
    .throwOnError();

  return planArrayResponseSchema.parse(data);
};

export const deletePlan = async (planId: number) => {
  const { status } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId)
    .throwOnError();

  return status === 204 ? true : false;
};

const renamePlanByPlanIdInput = z.tuple([z.number(), z.string().min(1)]);
export const renamePlanByPlanId = async (planId: number, newTitle: string) => {
  const [validatedId, validatedTitle] = renamePlanByPlanIdInput.parse([
    planId,
    newTitle,
  ]);

  const { status } = await supabase
    .from('plans')
    .update({ title: validatedTitle })
    .eq('id', validatedId)
    .single()
    .throwOnError();

  return status === 204 ? true : false;
};
