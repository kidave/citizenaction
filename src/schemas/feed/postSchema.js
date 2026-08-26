import { z } from "zod";

const optionalDate = z.string().datetime({ offset: true }).nullable().optional();

export const postSchema = z
  .object({
    type: z.string().min(1, "Choose what you are creating."),
    start_at: optionalDate,
    end_at: optionalDate,
    address: z.string().nullable().optional(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "event") return;

    if (!data.start_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["start_at"],
        message: "Add the event date and time.",
      });
    }

    if (!data.address || !data.address.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Add where the event is happening.",
      });
    }

    if (data.start_at && data.end_at) {
      const start = new Date(data.start_at);
      const end = new Date(data.end_at);

      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_at"],
          message: "The end time must be after the start time.",
        });
      }
    }
  });
