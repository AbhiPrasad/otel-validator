/**
 * Zod Schema for OTLP Metrics (ExportMetricsServiceRequest)
 * Based on: https://github.com/open-telemetry/opentelemetry-proto
 * Encoding rules: https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding
 */

import { z } from 'zod';
import {
  int64Schema,
  traceIdSchema,
  spanIdSchema,
  keyValueSchema,
  resourceSchema,
  instrumentationScopeSchema
} from './common';

/** Exemplar */
const exemplarSchema = z.object({
  filteredAttributes: z.array(keyValueSchema).optional(),
  timeUnixNano: int64Schema.optional(),
  asDouble: z.number().optional(),
  asInt: int64Schema.optional(),
  spanId: spanIdSchema.optional(),
  traceId: traceIdSchema.optional()
}).passthrough();

/** NumberDataPoint (for Gauge and Sum) */
const numberDataPointSchema = z.object({
  attributes: z.array(keyValueSchema).optional(),
  startTimeUnixNano: int64Schema.optional(),
  timeUnixNano: int64Schema.optional(),
  asDouble: z.number().optional(),
  asInt: int64Schema.optional(),
  exemplars: z.array(exemplarSchema).optional(),
  flags: z.number({
    message: 'flags must be a number'
  }).int().optional()
}).passthrough();

/** HistogramDataPoint */
const histogramDataPointSchema = z.object({
  attributes: z.array(keyValueSchema).optional(),
  startTimeUnixNano: int64Schema.optional(),
  timeUnixNano: int64Schema.optional(),
  count: int64Schema.optional(),
  sum: z.number().optional(),
  bucketCounts: z.array(int64Schema).optional(),
  explicitBounds: z.array(z.number({
    message: 'explicitBounds values must be numbers'
  })).optional(),
  exemplars: z.array(exemplarSchema).optional(),
  flags: z.number({
    message: 'flags must be a number'
  }).int().optional(),
  min: z.number().optional(),
  max: z.number().optional()
}).passthrough();

/** ExponentialHistogram Buckets */
const bucketsSchema = z.object({
  offset: z.number({
    message: 'offset must be a number'
  }).int({
    message: 'offset must be an integer'
  }).optional(),
  bucketCounts: z.array(int64Schema).optional()
}).passthrough();

/** ExponentialHistogramDataPoint */
const exponentialHistogramDataPointSchema = z.object({
  attributes: z.array(keyValueSchema).optional(),
  startTimeUnixNano: int64Schema.optional(),
  timeUnixNano: int64Schema.optional(),
  count: int64Schema.optional(),
  sum: z.number().optional(),
  scale: z.number({
    message: 'scale must be a number'
  }).int({
    message: 'scale must be an integer'
  }).optional(),
  zeroCount: int64Schema.optional(),
  positive: bucketsSchema.optional(),
  negative: bucketsSchema.optional(),
  flags: z.number({
    message: 'flags must be a number'
  }).int().optional(),
  exemplars: z.array(exemplarSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  zeroThreshold: z.number().optional()
}).passthrough();

/** SummaryDataPoint ValueAtQuantile */
const quantileValueSchema = z.object({
  quantile: z.number({
    message: 'quantile must be a number'
  }).optional(),
  value: z.number({
    message: 'value must be a number'
  }).optional()
}).passthrough();

/** SummaryDataPoint */
const summaryDataPointSchema = z.object({
  attributes: z.array(keyValueSchema).optional(),
  startTimeUnixNano: int64Schema.optional(),
  timeUnixNano: int64Schema.optional(),
  count: int64Schema.optional(),
  sum: z.number().optional(),
  quantileValues: z.array(quantileValueSchema).optional(),
  flags: z.number({
    message: 'flags must be a number'
  }).int().optional()
}).passthrough();

/** Gauge metric */
const gaugeSchema = z.object({
  dataPoints: z.array(numberDataPointSchema).optional()
}).passthrough();

/** Sum metric */
const sumSchema = z.object({
  dataPoints: z.array(numberDataPointSchema).optional(),
  aggregationTemporality: z.number({
    message: 'aggregationTemporality must be a number'
  }).int({
    message: 'aggregationTemporality must be an integer'
  }).min(0, {
    message: 'aggregationTemporality must be >= 0'
  }).max(2, {
    message: 'aggregationTemporality must be <= 2 (UNSPECIFIED=0, DELTA=1, CUMULATIVE=2)'
  }).optional(),
  isMonotonic: z.boolean({
    message: 'isMonotonic must be a boolean'
  }).optional()
}).passthrough();

/** Histogram metric */
const histogramSchema = z.object({
  dataPoints: z.array(histogramDataPointSchema).optional(),
  aggregationTemporality: z.number({
    message: 'aggregationTemporality must be a number'
  }).int({
    message: 'aggregationTemporality must be an integer'
  }).min(0, {
    message: 'aggregationTemporality must be >= 0'
  }).max(2, {
    message: 'aggregationTemporality must be <= 2 (UNSPECIFIED=0, DELTA=1, CUMULATIVE=2)'
  }).optional()
}).passthrough();

/** ExponentialHistogram metric */
const exponentialHistogramSchema = z.object({
  dataPoints: z.array(exponentialHistogramDataPointSchema).optional(),
  aggregationTemporality: z.number({
    message: 'aggregationTemporality must be a number'
  }).int({
    message: 'aggregationTemporality must be an integer'
  }).min(0, {
    message: 'aggregationTemporality must be >= 0'
  }).max(2, {
    message: 'aggregationTemporality must be <= 2 (UNSPECIFIED=0, DELTA=1, CUMULATIVE=2)'
  }).optional()
}).passthrough();

/** Summary metric */
const summarySchema = z.object({
  dataPoints: z.array(summaryDataPointSchema).optional()
}).passthrough();

/** Metric */
const metricSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  metadata: z.array(keyValueSchema).optional(),
  gauge: gaugeSchema.optional(),
  sum: sumSchema.optional(),
  histogram: histogramSchema.optional(),
  exponentialHistogram: exponentialHistogramSchema.optional(),
  summary: summarySchema.optional()
}).passthrough();

/** ScopeMetrics */
const scopeMetricsSchema = z.object({
  scope: instrumentationScopeSchema.optional(),
  metrics: z.array(metricSchema).optional(),
  schemaUrl: z.string().optional()
}).passthrough();

/** ResourceMetrics */
const resourceMetricsSchema = z.object({
  resource: resourceSchema.optional(),
  scopeMetrics: z.array(scopeMetricsSchema).optional(),
  schemaUrl: z.string().optional()
}).passthrough();

/** Full metrics schema (ExportMetricsServiceRequest) */
export const metricsSchema = z.object({
  resourceMetrics: z.array(resourceMetricsSchema).optional()
}).passthrough();
