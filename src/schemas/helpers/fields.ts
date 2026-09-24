import { z } from "zod";

/**
 * URL field that allows:
 * - valid URL
 * - null (remove)
 * - empty string → null
 * - undefined (not provided)
 */
export const urlOrNull = z
  .union([z.string().url(), z.literal("").transform(() => null), z.null()])
  .optional();

/**
 * Hex color or null
 */
export const hexColorOrNull = z
  .string()
  .regex(/^#[0-9A-F]{6}$/i, "Invalid hex color")
  .nullable()
  .optional();
