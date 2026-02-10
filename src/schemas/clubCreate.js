// schemas/clubCreate.js
import { z } from "zod";

export const clubCreateSchema = z.object({
  scope_type: z.string().min(1),
  scope_code: z.string().min(1),
  description: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
});
