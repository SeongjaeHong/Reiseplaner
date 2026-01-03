import supabase from '@/supabaseClient';
import {
  planGroupArrayResponseSchema,
  planGroupResponseSchema,
  planGroupSchema,
} from './planGroups.types';
import { ApiError } from '@/errors/ApiError';
import { _guestGuard } from './users';

export const createPlanGroup = async (title: string) => {
  _guestGuard('CREATE', "Guest can't create a plan group.");

  const { status, error } = await supabase.from('plangroups').insert([{ title }]);

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to create a plan group: ${title}`,
      cause: error,
    });
  }

  return status === 201 ? true : false;
};

export const getPlanGroups = async () => {
  const { data } = await supabase
    .from('plangroups')
    .select()
    .order('id', { ascending: true })
    .throwOnError();

  const res = planGroupArrayResponseSchema.safeParse(data);
  if (!res.success) {
    throw new ApiError('VALIDATION', { cause: res.error });
  }

  return res.data;
};

export const getPlanGroupById = async (groupId: number) => {
  const { data } = await supabase
    .from('plangroups')
    .select()
    .eq('id', groupId)
    .maybeSingle()
    .throwOnError();

  if (!data) {
    throw new Error(`PlanGroup of Id(${groupId}) not exists.`);
  }

  const res = planGroupResponseSchema.safeParse(data);
  if (!res.success) {
    throw new ApiError('VALIDATION', { cause: res.error });
  }

  return res.data;
};

export const deletePlanGroups = async (planGroupId: number) => {
  _guestGuard('DELETE', "Guest can't delete a plan group.");

  const { status, error } = await supabase.from('plangroups').delete().eq('id', planGroupId);

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to delete a plan group by id: ${planGroupId}`,
      cause: error,
    });
  }

  return status === 204 ? true : false;
};

export const updatePlanGroupByGroupId = async (
  planGroupId: number,
  title: string,
  thumbnailURL: string | null,
  startTime: string | null,
  endTime: string | null
) => {
  _guestGuard('UPDATE');

  const update = planGroupSchema.parse({
    title,
    thumbnailURL,
    start_time: startTime,
    end_time: endTime,
  });

  const { status, error } = await supabase.from('plangroups').update(update).eq('id', planGroupId);

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to update a plan group by id: ${planGroupId}`,
      cause: error,
    });
  }

  return status === 204 ? true : false;
};
