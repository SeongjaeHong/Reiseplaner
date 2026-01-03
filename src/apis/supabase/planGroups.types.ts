import z from 'zod';

export const planGroupSchema = z.object({
  title: z.string().min(1),
  thumbnailURL: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
});

export const planGroupResponseSchema = planGroupSchema.extend({
  id: z.number(),
  created_at: z.string(),
  owner: z.string().nullable(),
});
export type PlanGroupResponseSchema = z.infer<typeof planGroupResponseSchema>;

export const planGroupArrayResponseSchema = z.array(planGroupResponseSchema).nullable();
