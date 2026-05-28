import { z } from "zod";

export const postSchema = z.object({
  type: z.string(),
  start_at: z.string().nullable().optional(),
  end_at: z.string().nullable().optional(),
});
