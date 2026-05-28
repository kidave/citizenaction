import { z, ZodRawShape } from "zod";

/**
 * Creates a safe UPDATE schema from a base object shape.
 *
 * Rules:
 * - All fields become optional
 * - `undefined` = field not sent
 * - `null` = explicit removal (if allowed by field schema)
 * - Requires at least ONE field to be present
 *
 * @param shape Zod object shape
 */
export function createUpdateSchema<T extends ZodRawShape>(shape: T) {
  return z
    .object(shape)
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      {
        message: "At least one field must be provided for update",
      },
    );
}
