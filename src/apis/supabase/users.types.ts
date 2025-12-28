import z from 'zod';

export const usersSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  email: z.email(),
  created_at: z.string(),
});
