/**
 * Common OTLP Zod schema definitions shared across traces, logs, and metrics.
 * Field names use lowerCamelCase per OTLP JSON encoding spec.
 */

import { z } from "zod";

/**
 * 64-bit integer - accepts both string and number.
 * Note: Large numbers may lose precision in JavaScript, but we accept them per OTLP spec.
 * For precision, use string encoding (recommended for timestamps).
 */
export const int64Schema = z.union(
  [
    z.string({ message: "Expected string or number for 64-bit integer" }),
    z.number({ message: "Expected string or number for 64-bit integer" }),
  ],
  {
    message:
      "Must be a string or number (64-bit integer). Large values should use string encoding to preserve precision.",
  }
);

/**
 * Nanosecond timestamp - must be a string per OTLP JSON encoding spec.
 * Used for: timeUnixNano, observedTimeUnixNano, startTimeUnixNano, endTimeUnixNano
 */
export const timestampSchema = z.string({
  message:
    'Timestamp must be a string (nanoseconds since Unix epoch). Example: "1704067200000000000"',
});

/** Hex-encoded traceId (32 chars, case-insensitive) */
export const traceIdSchema = z
  .string({
    message: "traceId must be a string",
  })
  .regex(/^[a-fA-F0-9]{32}$/, {
    message:
      'traceId must be exactly 32 hex characters (e.g., "5B8EFFF798038103D269B633813FC60C")',
  });

/** Hex-encoded spanId (16 chars, case-insensitive) */
export const spanIdSchema = z
  .string({
    message: "spanId must be a string",
  })
  .regex(/^[a-fA-F0-9]{16}$/, {
    message:
      'spanId must be exactly 16 hex characters (e.g., "EEE19B7EC3C1B174")',
  });

/** AnyValue - can hold any type of value */
export const anyValueSchema: z.ZodType<any> = z.lazy(() =>
  z
    .object({
      stringValue: z.string().optional(),
      boolValue: z.boolean().optional(),
      intValue: int64Schema.optional(),
      doubleValue: z.number().optional(),
      arrayValue: z
        .object({
          values: z.array(anyValueSchema).optional(),
        })
        .optional(),
      kvlistValue: z
        .object({
          values: z.array(keyValueSchema).optional(),
        })
        .optional(),
      bytesValue: z.string().optional(),
    })
    .passthrough()
);

/** KeyValue - attribute key-value pair */
export const keyValueSchema = z
  .object({
    key: z.string({ message: "Attribute key must be a string" }),
    value: anyValueSchema.optional(),
  })
  .passthrough();

/** Resource - describes the entity producing telemetry */
export const resourceSchema = z
  .object({
    attributes: z.array(keyValueSchema).optional(),
    droppedAttributesCount: z
      .number({
        message: "droppedAttributesCount must be a number",
      })
      .int({
        message: "droppedAttributesCount must be an integer",
      })
      .min(0, {
        message: "droppedAttributesCount must be >= 0",
      })
      .optional(),
  })
  .passthrough();

/** InstrumentationScope - describes the instrumentation library */
export const instrumentationScopeSchema = z
  .object({
    name: z.string().optional(),
    version: z.string().optional(),
    attributes: z.array(keyValueSchema).optional(),
    droppedAttributesCount: z
      .number({
        message: "droppedAttributesCount must be a number",
      })
      .int({
        message: "droppedAttributesCount must be an integer",
      })
      .min(0, {
        message: "droppedAttributesCount must be >= 0",
      })
      .optional(),
  })
  .passthrough();
