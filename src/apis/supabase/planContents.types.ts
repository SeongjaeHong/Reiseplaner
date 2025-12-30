import z from 'zod';

const planTimeSchema = z.object({
  start: z.object({ hour: z.number().nullable(), minute: z.number().nullable() }),
  end: z.object({ hour: z.number().nullable(), minute: z.number().nullable() }),
});
export type PlanTime = z.infer<typeof planTimeSchema>;

export const ContentSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  title: z.string(),
  data: z.string(),
  box: z.enum(['plain', 'note']),
  time: planTimeSchema,
  isTimeActive: z.boolean(),
});

export type Content = z.infer<typeof ContentSchema>;

export const planContentsResponseSchema = z
  .object({
    id: z.number(),
    plans_id: z.number(),
    created_at: z.string(),
    contents: z.array(ContentSchema),
  })
  .nullable();
