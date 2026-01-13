/**
 * Zod Schema for OTLP Traces (ExportTraceServiceRequest)
 * Based on: https://github.com/open-telemetry/opentelemetry-proto
 * Encoding rules: https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding
 */

import { z } from "zod";
import {
  timestampSchema,
  traceIdSchema,
  spanIdSchema,
  keyValueSchema,
  resourceSchema,
  instrumentationScopeSchema,
} from "./common";

/** Span Status */
const statusSchema = z
  .object({
    message: z.string().optional(),
    code: z
      .number({
        message: "status.code must be a number",
      })
      .int({
        message: "status.code must be an integer",
      })
      .min(0, {
        message: "status.code must be >= 0",
      })
      .max(2, {
        message: "status.code must be <= 2 (UNSET=0, OK=1, ERROR=2)",
      })
      .optional(),
  })
  .passthrough();

/** Span Event */
const eventSchema = z
  .object({
    timeUnixNano: timestampSchema.optional(),
    name: z.string().optional(),
    attributes: z.array(keyValueSchema).optional(),
    droppedAttributesCount: z
      .number({
        message: "droppedAttributesCount must be a number",
      })
      .int()
      .min(0)
      .optional(),
  })
  .passthrough();

/** Span Link */
const linkSchema = z
  .object({
    traceId: traceIdSchema.optional(),
    spanId: spanIdSchema.optional(),
    traceState: z.string().optional(),
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
  })
  .passthrough();

/** Span */
const spanSchema = z
  .object({
    traceId: traceIdSchema.optional(),
    spanId: spanIdSchema.optional(),
    traceState: z.string().optional(),
    parentSpanId: spanIdSchema.optional(),
    name: z.string().optional(),
    kind: z
      .number({
        message:
          "kind must be a number (integer). Use: UNSPECIFIED=0, INTERNAL=1, SERVER=2, CLIENT=3, PRODUCER=4, CONSUMER=5",
      })
      .int({
        message: "kind must be an integer (0-5)",
      })
      .min(0, {
        message: "kind must be >= 0",
      })
      .max(5, {
        message:
          "kind must be <= 5 (UNSPECIFIED=0, INTERNAL=1, SERVER=2, CLIENT=3, PRODUCER=4, CONSUMER=5)",
      })
      .optional(),
    startTimeUnixNano: timestampSchema.optional(),
    endTimeUnixNano: timestampSchema.optional(),
    attributes: z.array(keyValueSchema).optional(),
    droppedAttributesCount: z
      .number({
        message: "droppedAttributesCount must be a number",
      })
      .int()
      .min(0)
      .optional(),
    events: z.array(eventSchema).optional(),
    droppedEventsCount: z
      .number({
        message: "droppedEventsCount must be a number",
      })
      .int()
      .min(0)
      .optional(),
    links: z.array(linkSchema).optional(),
    droppedLinksCount: z
      .number({
        message: "droppedLinksCount must be a number",
      })
      .int()
      .min(0)
      .optional(),
    status: statusSchema.optional(),
    flags: z
      .number({
        message: "flags must be a number",
      })
      .int()
      .optional(),
  })
  .passthrough();

/** ScopeSpans */
const scopeSpansSchema = z
  .object({
    scope: instrumentationScopeSchema.optional(),
    spans: z.array(spanSchema).optional(),
    schemaUrl: z.string().optional(),
  })
  .passthrough();

/** ResourceSpans */
const resourceSpansSchema = z
  .object({
    resource: resourceSchema.optional(),
    scopeSpans: z.array(scopeSpansSchema).optional(),
    schemaUrl: z.string().optional(),
  })
  .passthrough();

/** Full traces schema (ExportTraceServiceRequest) */
export const tracesSchema = z
  .object({
    resourceSpans: z.array(resourceSpansSchema).optional(),
  })
  .passthrough();
