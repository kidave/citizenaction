import { z } from "zod";

const optionalDate = z.string().datetime({ offset: true }).nullable().optional();

export const postSchema = z
  .object({
    start_at: optionalDate,
    end_at: optionalDate,
    address: z.string().nullable().optional(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.start_at && data.end_at) {
      const start = new Date(data.start_at);
      const end = new Date(data.end_at);

      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end < start
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_at"],
          message: "The end time must be after the start time.",
        });
      }
    }
  });
