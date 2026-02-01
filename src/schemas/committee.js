// schemas/committee.js
import { z } from "zod";
import { createUpdateSchema } from "./helpers/updateSchema";
import { urlOrNull, hexColorOrNull } from "./helpers/fields";

export const committeeSchema = z.object({
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  contact_number: z.string().nullable().optional(),
  primary_color: hexColorOrNull,
  logo_url: urlOrNull,
  cover_url: urlOrNull,
});

export const committeeUpdateSchema = createUpdateSchema({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  contact_number: z.string().nullable().optional(),
  primary_color: hexColorOrNull,
  logo_url: urlOrNull,
  cover_url: urlOrNull,
});
