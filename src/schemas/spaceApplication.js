import { z } from "zod";

export const spaceApplicationSchema = z.object({
  proposed_name: z.string().min(3, "Organization name is required"),

  proposed_slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens"),

  category: z
    .string()
    .trim()
    .min(3, "Tell us what this Space stands for")
    .max(500, "Please keep this under 500 characters"),

  email: z.string().email("Invalid email address"),

  contact_number: z.string().min(7, "Invalid contact number"),

  address: z.string().optional(),

  website: z.string().url("Invalid website URL").optional().or(z.literal("")),

  description: z.string().min(20, "Please add a short description"),

  justification: z.string().min(20, "Tell us why this Space should exist"),

  social_links: z
    .array(
      z.object({
        platform: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});
