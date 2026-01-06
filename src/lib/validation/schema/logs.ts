/**
 * JSON Schema for OTLP Logs (ExportLogsServiceRequest)
 * Based on: https://github.com/open-telemetry/opentelemetry-proto
 * Encoding rules: https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding
 */

import { commonDefs } from './common';

/** LogRecord definition */
const logRecordDef = {
  type: 'object',
  properties: {
    timeUnixNano: { type: ['string', 'integer'] },
    observedTimeUnixNano: { type: ['string', 'integer'] },
    severityNumber: {
      type: 'integer',
      minimum: 0,
      maximum: 24 // UNSPECIFIED=0 through FATAL4=24
    },
    severityText: { type: 'string' },
    body: { $ref: '#/$defs/anyValue' },
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    droppedAttributesCount: { type: 'integer', minimum: 0 },
    flags: { type: 'integer' },
    traceId: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{32}$' // 32 hex chars when present
    },
    spanId: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{16}$' // 16 hex chars when present
    }
  }
};

/** ScopeLogs definition */
const scopeLogsDef = {
  type: 'object',
  properties: {
    scope: { $ref: '#/$defs/instrumentationScope' },
    logRecords: {
      type: 'array',
      items: { $ref: '#/$defs/logRecord' }
    },
    schemaUrl: { type: 'string' }
  }
};

/** ResourceLogs definition */
const resourceLogsDef = {
  type: 'object',
  properties: {
    resource: { $ref: '#/$defs/resource' },
    scopeLogs: {
      type: 'array',
      items: { $ref: '#/$defs/scopeLogs' }
    },
    schemaUrl: { type: 'string' }
  }
};

/** Full logs schema (ExportLogsServiceRequest) */
export const logsSchema = {
  $id: 'otlp-logs',
  type: 'object',
  properties: {
    resourceLogs: {
      type: 'array',
      items: { $ref: '#/$defs/resourceLogs' }
    }
  },
  $defs: {
    ...commonDefs,
    logRecord: logRecordDef,
    scopeLogs: scopeLogsDef,
    resourceLogs: resourceLogsDef
  }
};
