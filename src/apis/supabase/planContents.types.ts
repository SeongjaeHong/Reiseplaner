import z from 'zod';

const planTimeSchema = z.object({
  start: z.object({ hour: z.string(), minute: z.string() }),
  end: z.object({ hour: z.string(), minute: z.string() }),
});
export type PlanTime = z.infer<typeof planTimeSchema>;

const textContentSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  title: z.string(),
  data: z.string(),
  box: z.enum(['plain', 'note']),
  time: planTimeSchema,
  isTimeActive: z.boolean(),
});
export type TextContent = z.infer<typeof textContentSchema>;

const imageContentSchema = z.object({
  id: z.string(),
  type: z.literal('file'),
  data: z.string(),
  width: z.number(),
  height: z.number(),
});
export type ImageContent = z.infer<typeof imageContentSchema>;

export const ContentSchema = z.discriminatedUnion('type', [
  textContentSchema,
  imageContentSchema,
]);
export type Content = z.infer<typeof ContentSchema>;

export const planContentsResponseSchema = z
  .object({
    id: z.number(),
    plans_id: z.number(),
    created_at: z.string(),
    contents: z.array(ContentSchema),
  })
  .nullable();
