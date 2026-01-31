import { z } from "zod";

// URL validation that allows null/empty strings
const urlOrNull = z.string().url().nullable().optional()
  .or(z.literal('').transform(() => null))
  .or(z.null());

export const communityUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable(),
  contact_number: z.string().max(20).optional().nullable(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional().nullable(),
  logo_url: urlOrNull,
  cover_url: urlOrNull,
}).partial().refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export const communitySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable(),
  contact_number: z.string().max(20).optional().nullable(),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color").optional().nullable(),
  logo_url: urlOrNull,
  cover_url: urlOrNull,
});