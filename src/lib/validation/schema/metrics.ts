/**
 * JSON Schema for OTLP Metrics (ExportMetricsServiceRequest)
 * Based on: https://github.com/open-telemetry/opentelemetry-proto
 * Encoding rules: https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding
 */

import { commonDefs } from './common';

/** Exemplar definition */
const exemplarDef = {
  type: 'object',
  properties: {
    filteredAttributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    timeUnixNano: { type: ['string', 'integer'] },
    asDouble: { type: 'number' },
    asInt: { type: ['string', 'integer'] },
    spanId: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{16}$'
    },
    traceId: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{32}$'
    }
  }
};

/** NumberDataPoint definition (for Gauge and Sum) */
const numberDataPointDef = {
  type: 'object',
  properties: {
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    startTimeUnixNano: { type: ['string', 'integer'] },
    timeUnixNano: { type: ['string', 'integer'] },
    asDouble: { type: 'number' },
    asInt: { type: ['string', 'integer'] },
    exemplars: {
      type: 'array',
      items: { $ref: '#/$defs/exemplar' }
    },
    flags: { type: 'integer' }
  }
};

/** HistogramDataPoint definition */
const histogramDataPointDef = {
  type: 'object',
  properties: {
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    startTimeUnixNano: { type: ['string', 'integer'] },
    timeUnixNano: { type: ['string', 'integer'] },
    count: { type: ['string', 'integer'] },
    sum: { type: 'number' },
    bucketCounts: {
      type: 'array',
      items: { type: ['string', 'integer'] }
    },
    explicitBounds: {
      type: 'array',
      items: { type: 'number' }
    },
    exemplars: {
      type: 'array',
      items: { $ref: '#/$defs/exemplar' }
    },
    flags: { type: 'integer' },
    min: { type: 'number' },
    max: { type: 'number' }
  }
};

/** ExponentialHistogramDataPoint definition */
const exponentialHistogramDataPointDef = {
  type: 'object',
  properties: {
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    startTimeUnixNano: { type: ['string', 'integer'] },
    timeUnixNano: { type: ['string', 'integer'] },
    count: { type: ['string', 'integer'] },
    sum: { type: 'number' },
    scale: { type: 'integer' },
    zeroCount: { type: ['string', 'integer'] },
    positive: {
      type: 'object',
      properties: {
        offset: { type: 'integer' },
        bucketCounts: {
          type: 'array',
          items: { type: ['string', 'integer'] }
        }
      }
    },
    negative: {
      type: 'object',
      properties: {
        offset: { type: 'integer' },
        bucketCounts: {
          type: 'array',
          items: { type: ['string', 'integer'] }
        }
      }
    },
    flags: { type: 'integer' },
    exemplars: {
      type: 'array',
      items: { $ref: '#/$defs/exemplar' }
    },
    min: { type: 'number' },
    max: { type: 'number' },
    zeroThreshold: { type: 'number' }
  }
};

/** SummaryDataPoint definition */
const summaryDataPointDef = {
  type: 'object',
  properties: {
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    startTimeUnixNano: { type: ['string', 'integer'] },
    timeUnixNano: { type: ['string', 'integer'] },
    count: { type: ['string', 'integer'] },
    sum: { type: 'number' },
    quantileValues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quantile: { type: 'number' },
          value: { type: 'number' }
        }
      }
    },
    flags: { type: 'integer' }
  }
};

/** Gauge metric definition */
const gaugeDef = {
  type: 'object',
  properties: {
    dataPoints: {
      type: 'array',
      items: { $ref: '#/$defs/numberDataPoint' }
    }
  }
};

/** Sum metric definition */
const sumDef = {
  type: 'object',
  properties: {
    dataPoints: {
      type: 'array',
      items: { $ref: '#/$defs/numberDataPoint' }
    },
    aggregationTemporality: {
      type: 'integer',
      enum: [0, 1, 2] // UNSPECIFIED=0, DELTA=1, CUMULATIVE=2
    },
    isMonotonic: { type: 'boolean' }
  }
};

/** Histogram metric definition */
const histogramDef = {
  type: 'object',
  properties: {
    dataPoints: {
      type: 'array',
      items: { $ref: '#/$defs/histogramDataPoint' }
    },
    aggregationTemporality: {
      type: 'integer',
      enum: [0, 1, 2] // UNSPECIFIED=0, DELTA=1, CUMULATIVE=2
    }
  }
};

/** ExponentialHistogram metric definition */
const exponentialHistogramDef = {
  type: 'object',
  properties: {
    dataPoints: {
      type: 'array',
      items: { $ref: '#/$defs/exponentialHistogramDataPoint' }
    },
    aggregationTemporality: {
      type: 'integer',
      enum: [0, 1, 2] // UNSPECIFIED=0, DELTA=1, CUMULATIVE=2
    }
  }
};

/** Summary metric definition */
const summaryDef = {
  type: 'object',
  properties: {
    dataPoints: {
      type: 'array',
      items: { $ref: '#/$defs/summaryDataPoint' }
    }
  }
};

/** Metric definition */
const metricDef = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    unit: { type: 'string' },
    metadata: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    gauge: { $ref: '#/$defs/gauge' },
    sum: { $ref: '#/$defs/sum' },
    histogram: { $ref: '#/$defs/histogram' },
    exponentialHistogram: { $ref: '#/$defs/exponentialHistogram' },
    summary: { $ref: '#/$defs/summary' }
  }
};

/** ScopeMetrics definition */
const scopeMetricsDef = {
  type: 'object',
  properties: {
    scope: { $ref: '#/$defs/instrumentationScope' },
    metrics: {
      type: 'array',
      items: { $ref: '#/$defs/metric' }
    },
    schemaUrl: { type: 'string' }
  }
};

/** ResourceMetrics definition */
const resourceMetricsDef = {
  type: 'object',
  properties: {
    resource: { $ref: '#/$defs/resource' },
    scopeMetrics: {
      type: 'array',
      items: { $ref: '#/$defs/scopeMetrics' }
    },
    schemaUrl: { type: 'string' }
  }
};

/** Full metrics schema (ExportMetricsServiceRequest) */
export const metricsSchema = {
  $id: 'otlp-metrics',
  type: 'object',
  properties: {
    resourceMetrics: {
      type: 'array',
      items: { $ref: '#/$defs/resourceMetrics' }
    }
  },
  $defs: {
    ...commonDefs,
    exemplar: exemplarDef,
    numberDataPoint: numberDataPointDef,
    histogramDataPoint: histogramDataPointDef,
    exponentialHistogramDataPoint: exponentialHistogramDataPointDef,
    summaryDataPoint: summaryDataPointDef,
    gauge: gaugeDef,
    sum: sumDef,
    histogram: histogramDef,
    exponentialHistogram: exponentialHistogramDef,
    summary: summaryDef,
    metric: metricDef,
    scopeMetrics: scopeMetricsDef,
    resourceMetrics: resourceMetricsDef
  }
};
