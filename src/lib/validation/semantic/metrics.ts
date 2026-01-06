/**
 * Semantic validation for OTLP Metrics payloads.
 * These validations go beyond JSON schema to check OTel-specific semantics.
 */

import type { ValidationError, ValidationWarning } from '../types';

interface SemanticValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

const METRIC_DATA_TYPES = ['gauge', 'sum', 'histogram', 'exponentialHistogram', 'summary'] as const;

/**
 * Validate metric-specific semantics that can't be expressed in JSON Schema.
 */
export function validateMetricSemantics(payload: unknown): SemanticValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const data = payload as { resourceMetrics?: unknown[] };
  if (!data.resourceMetrics || !Array.isArray(data.resourceMetrics)) {
    return { errors, warnings };
  }

  data.resourceMetrics.forEach((rm: any, rmIdx: number) => {
    if (!rm.scopeMetrics || !Array.isArray(rm.scopeMetrics)) return;

    rm.scopeMetrics.forEach((sm: any, smIdx: number) => {
      if (!sm.metrics || !Array.isArray(sm.metrics)) return;

      sm.metrics.forEach((metric: any, metricIdx: number) => {
        const basePath = `/resourceMetrics/${rmIdx}/scopeMetrics/${smIdx}/metrics/${metricIdx}`;

        // Validate metric has exactly one data type
        const presentDataTypes = METRIC_DATA_TYPES.filter(dt => metric[dt] !== undefined);

        if (presentDataTypes.length === 0) {
          errors.push({
            path: basePath,
            message: 'Metric must have exactly one data type (gauge, sum, histogram, exponentialHistogram, or summary)',
            keyword: 'semantic',
            schemaPath: '#/$defs/metric'
          });
        } else if (presentDataTypes.length > 1) {
          errors.push({
            path: basePath,
            message: `Metric has multiple data types: ${presentDataTypes.join(', ')}. Only one is allowed.`,
            keyword: 'semantic',
            schemaPath: '#/$defs/metric'
          });
        }

        // Validate data points for the present data type
        const dataType = presentDataTypes[0];
        const metricData = metric[dataType];

        if (metricData?.dataPoints && Array.isArray(metricData.dataPoints)) {
          metricData.dataPoints.forEach((dp: any, dpIdx: number) => {
            const dpPath = `${basePath}/${dataType}/dataPoints/${dpIdx}`;

            // Validate timestamps: timeUnixNano >= startTimeUnixNano
            if (dp.startTimeUnixNano !== undefined && dp.timeUnixNano !== undefined) {
              try {
                const start = BigInt(dp.startTimeUnixNano);
                const end = BigInt(dp.timeUnixNano);

                if (end < start) {
                  errors.push({
                    path: `${dpPath}/timeUnixNano`,
                    message: 'timeUnixNano must be >= startTimeUnixNano',
                    keyword: 'semantic',
                    schemaPath: '#/properties/timeUnixNano'
                  });
                }
              } catch {
                // BigInt conversion failed
              }
            }

            // Histogram-specific validations
            if (dataType === 'histogram') {
              // Validate bucketCounts.length === explicitBounds.length + 1
              if (dp.bucketCounts && dp.explicitBounds) {
                if (dp.bucketCounts.length !== dp.explicitBounds.length + 1) {
                  errors.push({
                    path: `${dpPath}/bucketCounts`,
                    message: `bucketCounts length (${dp.bucketCounts.length}) must be explicitBounds length + 1 (${dp.explicitBounds.length + 1})`,
                    keyword: 'semantic',
                    schemaPath: '#/$defs/histogramDataPoint/properties/bucketCounts'
                  });
                }
              }

              // Validate explicitBounds are strictly increasing
              if (dp.explicitBounds && Array.isArray(dp.explicitBounds)) {
                for (let i = 1; i < dp.explicitBounds.length; i++) {
                  if (dp.explicitBounds[i] <= dp.explicitBounds[i - 1]) {
                    errors.push({
                      path: `${dpPath}/explicitBounds/${i}`,
                      message: `explicitBounds must be strictly increasing (${dp.explicitBounds[i]} <= ${dp.explicitBounds[i - 1]})`,
                      keyword: 'semantic',
                      schemaPath: '#/$defs/histogramDataPoint/properties/explicitBounds'
                    });
                    break; // Only report first violation
                  }
                }
              }
            }

            // Validate exemplars
            if (dp.exemplars && Array.isArray(dp.exemplars)) {
              dp.exemplars.forEach((ex: any, exIdx: number) => {
                if (ex.traceId === '00000000000000000000000000000000') {
                  warnings.push({
                    path: `${dpPath}/exemplars/${exIdx}/traceId`,
                    message: 'Exemplar traceId is all zeros',
                    suggestion: 'Consider omitting traceId if no trace context exists'
                  });
                }
                if (ex.spanId === '0000000000000000') {
                  warnings.push({
                    path: `${dpPath}/exemplars/${exIdx}/spanId`,
                    message: 'Exemplar spanId is all zeros',
                    suggestion: 'Consider omitting spanId if no trace context exists'
                  });
                }
              });
            }
          });
        }

        // Sum-specific validations
        if (dataType === 'sum' && metricData) {
          // Warning: monotonic sum with DELTA aggregation is unusual
          if (metricData.isMonotonic === true && metricData.aggregationTemporality === 1) {
            warnings.push({
              path: `${basePath}/sum`,
              message: 'Monotonic sum with DELTA aggregation temporality is uncommon',
              suggestion: 'Verify this is intentional; CUMULATIVE is more common for monotonic sums'
            });
          }
        }
      });
    });
  });

  return { errors, warnings };
}
