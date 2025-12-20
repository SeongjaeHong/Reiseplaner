import z from 'zod';

export const imageSchema = z.object({
  id: z.string(),
  path: z.string(),
  fullPath: z.string(),
});
