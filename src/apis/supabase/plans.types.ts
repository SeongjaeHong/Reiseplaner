import z from 'zod';

export const planSchema = z.object({
  title: z.string().min(1),
  group_id: z.number(),
});

export const planResponseSchema = planSchema.extend({
  id: z.number(),
  created_at: z.string(),
  owner: z.string(),
});

export const planArrayResponseSchema = z.array(planResponseSchema).nullable();
