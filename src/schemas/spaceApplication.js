// schemas/spaceApplication.js
import { z } from "zod";

export const spaceApplicationSchema = z.object({
  proposed_name: z.string().min(3),

  proposed_slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens"),

  email: z.string().email("Invalid email address"),

  website: z.string().url("Invalid website URL").optional().or(z.literal("")),

  contact_number: z
    .string()
    .regex(/^[0-9+\-\s]{7,15}$/, "Invalid contact number")
    .or(z.literal("")),

  description: z.string().optional(),

  justification: z.string().min(20),
});
