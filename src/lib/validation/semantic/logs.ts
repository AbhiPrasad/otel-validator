/**
 * Semantic validation for OTLP Logs payloads.
 * These validations go beyond JSON schema to check OTel-specific semantics.
 */

import type { ValidationError, ValidationWarning } from '../types';

interface SemanticValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Severity number to text mapping for validation
const SEVERITY_BASE_NAMES: Record<number, string> = {
  0: 'UNSPECIFIED',
  1: 'TRACE', 2: 'TRACE', 3: 'TRACE', 4: 'TRACE',
  5: 'DEBUG', 6: 'DEBUG', 7: 'DEBUG', 8: 'DEBUG',
  9: 'INFO', 10: 'INFO', 11: 'INFO', 12: 'INFO',
  13: 'WARN', 14: 'WARN', 15: 'WARN', 16: 'WARN',
  17: 'ERROR', 18: 'ERROR', 19: 'ERROR', 20: 'ERROR',
  21: 'FATAL', 22: 'FATAL', 23: 'FATAL', 24: 'FATAL'
};

/**
 * Validate log-specific semantics that can't be expressed in JSON Schema.
 */
export function validateLogSemantics(payload: unknown): SemanticValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const data = payload as { resourceLogs?: unknown[] };
  if (!data.resourceLogs || !Array.isArray(data.resourceLogs)) {
    return { errors, warnings };
  }

  data.resourceLogs.forEach((rl: any, rlIdx: number) => {
    if (!rl.scopeLogs || !Array.isArray(rl.scopeLogs)) return;

    rl.scopeLogs.forEach((sl: any, slIdx: number) => {
      if (!sl.logRecords || !Array.isArray(sl.logRecords)) return;

      sl.logRecords.forEach((log: any, logIdx: number) => {
        const basePath = `/resourceLogs/${rlIdx}/scopeLogs/${slIdx}/logRecords/${logIdx}`;

        // Validate traceId is not all zeros when present
        if (log.traceId && log.traceId !== '' && log.traceId === '00000000000000000000000000000000') {
          errors.push({
            path: `${basePath}/traceId`,
            message: 'traceId must not be all zeros when present',
            keyword: 'semantic',
            schemaPath: '#/$defs/logRecord/properties/traceId'
          });
        }

        // Validate spanId is not all zeros when present
        if (log.spanId && log.spanId !== '' && log.spanId === '0000000000000000') {
          errors.push({
            path: `${basePath}/spanId`,
            message: 'spanId must not be all zeros when present',
            keyword: 'semantic',
            schemaPath: '#/$defs/logRecord/properties/spanId'
          });
        }

        // Validate observedTimeUnixNano >= timeUnixNano
        if (log.timeUnixNano !== undefined && log.observedTimeUnixNano !== undefined) {
          try {
            const time = BigInt(log.timeUnixNano);
            const observedTime = BigInt(log.observedTimeUnixNano);

            if (observedTime < time) {
              warnings.push({
                path: `${basePath}/observedTimeUnixNano`,
                message: 'observedTimeUnixNano is earlier than timeUnixNano',
                suggestion: 'observedTimeUnixNano should typically be >= timeUnixNano'
              });
            }
          } catch {
            // BigInt conversion failed
          }
        }

        // Validate severity consistency
        if (log.severityNumber !== undefined && log.severityText) {
          const expectedBaseName = SEVERITY_BASE_NAMES[log.severityNumber];
          if (expectedBaseName) {
            const severityTextUpper = log.severityText.toUpperCase();
            // Check if severityText starts with expected base name (allows for variants like INFO2, WARN3)
            if (!severityTextUpper.startsWith(expectedBaseName) &&
                severityTextUpper !== expectedBaseName) {
              warnings.push({
                path: `${basePath}/severityText`,
                message: `severityText "${log.severityText}" may not match severityNumber ${log.severityNumber}`,
                suggestion: `Expected severity text to be "${expectedBaseName}" or similar`
              });
            }
          }
        }

        // Warning if log has neither body nor severityNumber
        if (log.body === undefined && log.severityNumber === undefined) {
          warnings.push({
            path: basePath,
            message: 'Log record has neither body nor severityNumber',
            suggestion: 'Consider adding a body or severity for meaningful logs'
          });
        }
      });
    });
  });

  return { errors, warnings };
}
