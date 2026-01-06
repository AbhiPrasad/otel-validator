/**
 * Semantic validation for OTLP Traces payloads.
 * These validations go beyond JSON schema to check OTel-specific semantics.
 */

import type { ValidationError, ValidationWarning } from '../types';

interface SemanticValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validate trace-specific semantics that can't be expressed in JSON Schema.
 */
export function validateTraceSemantics(payload: unknown): SemanticValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const data = payload as { resourceSpans?: unknown[] };
  if (!data.resourceSpans || !Array.isArray(data.resourceSpans)) {
    return { errors, warnings };
  }

  data.resourceSpans.forEach((rs: any, rsIdx: number) => {
    if (!rs.scopeSpans || !Array.isArray(rs.scopeSpans)) return;

    rs.scopeSpans.forEach((ss: any, ssIdx: number) => {
      if (!ss.spans || !Array.isArray(ss.spans)) return;

      ss.spans.forEach((span: any, spanIdx: number) => {
        const basePath = `/resourceSpans/${rsIdx}/scopeSpans/${ssIdx}/spans/${spanIdx}`;

        // Validate traceId is not all zeros
        if (span.traceId && span.traceId === '00000000000000000000000000000000') {
          errors.push({
            path: `${basePath}/traceId`,
            message: 'traceId must not be all zeros',
            keyword: 'semantic',
            schemaPath: '#/$defs/span/properties/traceId'
          });
        }

        // Validate spanId is not all zeros
        if (span.spanId && span.spanId === '0000000000000000') {
          errors.push({
            path: `${basePath}/spanId`,
            message: 'spanId must not be all zeros',
            keyword: 'semantic',
            schemaPath: '#/$defs/span/properties/spanId'
          });
        }

        // Validate timestamp ordering: endTime >= startTime
        if (span.startTimeUnixNano !== undefined && span.endTimeUnixNano !== undefined) {
          try {
            const startTime = BigInt(span.startTimeUnixNano);
            const endTime = BigInt(span.endTimeUnixNano);

            if (endTime < startTime) {
              errors.push({
                path: `${basePath}/endTimeUnixNano`,
                message: 'endTimeUnixNano must be greater than or equal to startTimeUnixNano',
                keyword: 'semantic',
                schemaPath: '#/$defs/span/properties/endTimeUnixNano'
              });
            }

            // Warning for future timestamps (potential clock skew)
            const nowNano = BigInt(Date.now()) * BigInt(1_000_000);
            if (startTime > nowNano + BigInt(60_000_000_000)) { // 1 minute grace period
              warnings.push({
                path: `${basePath}/startTimeUnixNano`,
                message: 'startTimeUnixNano is significantly in the future, possible clock skew',
                suggestion: 'Verify timestamp is in nanoseconds since Unix epoch'
              });
            }
          } catch {
            // BigInt conversion failed, schema validation will catch this
          }
        }

        // Validate event timestamps are within span bounds
        if (span.events && Array.isArray(span.events)) {
          span.events.forEach((event: any, eventIdx: number) => {
            if (event.timeUnixNano !== undefined &&
                span.startTimeUnixNano !== undefined &&
                span.endTimeUnixNano !== undefined) {
              try {
                const eventTime = BigInt(event.timeUnixNano);
                const startTime = BigInt(span.startTimeUnixNano);
                const endTime = BigInt(span.endTimeUnixNano);

                if (eventTime < startTime || eventTime > endTime) {
                  warnings.push({
                    path: `${basePath}/events/${eventIdx}/timeUnixNano`,
                    message: 'Event timestamp is outside span time bounds',
                    suggestion: 'Event should occur between span start and end times'
                  });
                }
              } catch {
                // BigInt conversion failed
              }
            }
          });
        }

        // Validate links have valid (non-zero) traceIds
        if (span.links && Array.isArray(span.links)) {
          span.links.forEach((link: any, linkIdx: number) => {
            if (link.traceId === '00000000000000000000000000000000') {
              errors.push({
                path: `${basePath}/links/${linkIdx}/traceId`,
                message: 'Link traceId must not be all zeros',
                keyword: 'semantic',
                schemaPath: '#/$defs/link/properties/traceId'
              });
            }
            if (link.spanId === '0000000000000000') {
              errors.push({
                path: `${basePath}/links/${linkIdx}/spanId`,
                message: 'Link spanId must not be all zeros',
                keyword: 'semantic',
                schemaPath: '#/$defs/link/properties/spanId'
              });
            }
          });
        }
      });
    });
  });

  return { errors, warnings };
}
