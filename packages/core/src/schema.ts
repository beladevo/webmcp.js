import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export function isZodSchema(value: unknown): value is z.ZodTypeAny {
  return value instanceof z.ZodType;
}

export function toJsonSchema(schema: unknown): unknown {
  if (!schema) return undefined;
  if (isZodSchema(schema)) {
    return zodToJsonSchema(schema, { $refStrategy: "none" });
  }
  return schema;
}

export function validateInput(schema: unknown, input: unknown) {
  if (!schema) return { success: true as const, data: input };
  if (isZodSchema(schema)) {
    return schema.safeParse(input);
  }
  return { success: true as const, data: input };
}
