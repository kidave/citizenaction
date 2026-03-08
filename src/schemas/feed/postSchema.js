import { z } from "zod";

export const postSchema = z.object({
  type: z.string(),
  date: z.string().optional(),
  time: z.string().optional(),
});