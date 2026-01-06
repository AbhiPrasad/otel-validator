/**
 * OTLP Payload Validation Orchestrator
 * Combines Zod schema validation with semantic validation for traces, logs, and metrics.
 */

import type { ValidationResult, ValidationError, OTLPPayloadType } from './types';
import { detectPayloadType } from './payload-detector';
import { tracesSchema } from './schema/traces';
import { logsSchema } from './schema/logs';
import { metricsSchema } from './schema/metrics';
import { validateTraceSemantics } from './semantic/traces';
import { validateLogSemantics } from './semantic/logs';
import { validateMetricSemantics } from './semantic/metrics';

// Zod schemas by payload type
const schemas = {
  traces: tracesSchema,
  logs: logsSchema,
  metrics: metricsSchema
};

// Semantic validators by payload type
const semanticValidators = {
  traces: validateTraceSemantics,
  logs: validateLogSemantics,
  metrics: validateMetricSemantics
};

/**
 * Convert Zod error path to JSON Pointer format
 */
function pathToJsonPointer(path: (string | number)[]): string {
  if (path.length === 0) return '/';
  return '/' + path.join('/');
}

/**
 * Validate an OTLP payload (traces, logs, or metrics).
 * Auto-detects payload type and applies both schema and semantic validation.
 */
export function validateOTLPPayload(payload: unknown): ValidationResult {
  // Detect payload type from structure
  const payloadType = detectPayloadType(payload);

  if (!payloadType) {
    return {
      valid: false,
      payloadType: null,
      errors: [{
        path: '',
        message: 'Unable to detect payload type. Expected object with "resourceSpans", "resourceLogs", or "resourceMetrics" array',
        keyword: 'type',
        schemaPath: '#'
      }]
    };
  }

  const errors: ValidationError[] = [];

  // Step 1: Zod Schema validation
  const schema = schemas[payloadType];
  const result = schema.safeParse(payload);

  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push({
        path: pathToJsonPointer(issue.path),
        message: issue.message,
        keyword: issue.code,
        schemaPath: `#/${payloadType}`
      });
    }
  }

  // Step 2: Semantic validation (run even if schema fails to catch all issues)
  const semanticResult = semanticValidators[payloadType](payload);
  errors.push(...semanticResult.errors);

  return {
    valid: errors.length === 0,
    payloadType,
    errors,
    warnings: semanticResult.warnings.length > 0 ? semanticResult.warnings : undefined
  };
}

// Re-export types and utilities
export * from './types';
export { detectPayloadType } from './payload-detector';
