// schemas/committee.js
import { z } from "zod";

export const committeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable(),
  contact_number: z.string().optional().nullable(),
  primary_color: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
});

// For updates, we need to handle null/empty string properly
export const committeeUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable(),
  contact_number: z.string().optional().nullable(),
  primary_color: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
}).partial();