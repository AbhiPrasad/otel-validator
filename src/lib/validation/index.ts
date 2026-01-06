/**
 * OTLP Payload Validation Orchestrator
 * Combines JSON Schema validation with semantic validation for traces, logs, and metrics.
 */

import Ajv from 'ajv';
import type { ValidationResult, ValidationError, OTLPPayloadType } from './types';
import { detectPayloadType } from './payload-detector';
import { tracesSchema } from './schema/traces';
import { logsSchema } from './schema/logs';
import { metricsSchema } from './schema/metrics';
import { validateTraceSemantics } from './semantic/traces';
import { validateLogSemantics } from './semantic/logs';
import { validateMetricSemantics } from './semantic/metrics';

// Initialize Ajv with appropriate options for OTLP validation
const ajv = new Ajv({
  allErrors: true,        // Report all errors, not just first
  strict: false,          // Allow flexible schema definitions
  allowUnionTypes: true,  // Support type: ["string", "integer"] for 64-bit ints
  verbose: true           // Include data in error messages for debugging
});

// Compile schemas once at module load
const validators = {
  traces: ajv.compile(tracesSchema),
  logs: ajv.compile(logsSchema),
  metrics: ajv.compile(metricsSchema)
};

// Semantic validators by payload type
const semanticValidators = {
  traces: validateTraceSemantics,
  logs: validateLogSemantics,
  metrics: validateMetricSemantics
};

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

  // Step 1: JSON Schema validation
  const validator = validators[payloadType];
  const schemaValid = validator(payload);

  if (!schemaValid && validator.errors) {
    for (const err of validator.errors) {
      errors.push({
        path: err.instancePath || '/',
        message: err.message || 'Validation error',
        keyword: err.keyword,
        schemaPath: err.schemaPath
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
