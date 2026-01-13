/**
 * Zod Schema for OTLP Logs (ExportLogsServiceRequest)
 * Based on: https://github.com/open-telemetry/opentelemetry-proto
 * Encoding rules: https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding
 */

import { z } from "zod";
import {
  timestampSchema,
  traceIdSchema,
  spanIdSchema,
  keyValueSchema,
  anyValueSchema,
  resourceSchema,
  instrumentationScopeSchema,
} from "./common";

/** LogRecord */
const logRecordSchema = z
  .object({
    timeUnixNano: timestampSchema.optional(),
    observedTimeUnixNano: timestampSchema.optional(),
    severityNumber: z
      .number({
        message: "severityNumber must be a number",
      })
      .int({
        message: "severityNumber must be an integer",
      })
      .min(0, {
        message: "severityNumber must be >= 0",
      })
      .max(24, {
        message:
          "severityNumber must be <= 24 (UNSPECIFIED=0, TRACE=1-4, DEBUG=5-8, INFO=9-12, WARN=13-16, ERROR=17-20, FATAL=21-24)",
      })
      .optional(),
    severityText: z.string().optional(),
    body: anyValueSchema.optional(),
    attributes: z.array(keyValueSchema).optional(),
    droppedAttributesCount: z
      .number({
        message: "droppedAttributesCount must be a number",
      })
      .int()
      .min(0)
      .optional(),
    flags: z
      .number({
        message: "flags must be a number",
      })
      .int()
      .optional(),
    traceId: traceIdSchema.optional(),
    spanId: spanIdSchema.optional(),
  })
  .passthrough();

/** ScopeLogs */
const scopeLogsSchema = z
  .object({
    scope: instrumentationScopeSchema.optional(),
    logRecords: z.array(logRecordSchema).optional(),
    schemaUrl: z.string().optional(),
  })
  .passthrough();

/** ResourceLogs */
const resourceLogsSchema = z
  .object({
    resource: resourceSchema.optional(),
    scopeLogs: z.array(scopeLogsSchema).optional(),
    schemaUrl: z.string().optional(),
  })
  .passthrough();

/** Full logs schema (ExportLogsServiceRequest) */
export const logsSchema = z
  .object({
    resourceLogs: z.array(resourceLogsSchema).optional(),
  })
  .passthrough();
