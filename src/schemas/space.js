import { z } from "zod";
import { createUpdateSchema } from "./helpers/updateSchema";
import { urlOrNull, hexColorOrNull } from "./helpers/fields";

/** CREATE / FULL OBJECT */
export const spaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).nullable().optional(),
  email: z.string().email("Invalid email").nullable().optional(),
  website: z.string().url("Invalid URL").nullable().optional(),
  contact_number: z.string().max(20).nullable().optional(),
  primary_color: hexColorOrNull,
  logo_url: urlOrNull,
  cover_url: urlOrNull,
});

/** UPDATE / PATCH */
export const spaceUpdateSchema = createUpdateSchema({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  contact_number: z.string().max(20).nullable().optional(),
  primary_color: hexColorOrNull,
  logo_url: urlOrNull,
  cover_url: urlOrNull,
});
