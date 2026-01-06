/**
 * JSON Schema for OTLP Traces (ExportTraceServiceRequest)
 * Based on: https://github.com/open-telemetry/opentelemetry-proto
 * Encoding rules: https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding
 */

import { commonDefs } from './common';

/** Span Status definition */
const statusDef = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    code: {
      type: 'integer',
      enum: [0, 1, 2] // UNSET=0, OK=1, ERROR=2
    }
  }
};

/** Span Event definition */
const eventDef = {
  type: 'object',
  properties: {
    timeUnixNano: { type: ['string', 'integer'] },
    name: { type: 'string' },
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    droppedAttributesCount: { type: 'integer', minimum: 0 }
  }
};

/** Span Link definition */
const linkDef = {
  type: 'object',
  properties: {
    traceId: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{32}$'
    },
    spanId: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{16}$'
    },
    traceState: { type: 'string' },
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    droppedAttributesCount: { type: 'integer', minimum: 0 },
    flags: { type: 'integer' }
  }
};

/** Span definition */
const spanDef = {
  type: 'object',
  properties: {
    traceId: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{32}$' // 32 hex chars, case-insensitive
    },
    spanId: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{16}$' // 16 hex chars, case-insensitive
    },
    traceState: { type: 'string' },
    parentSpanId: {
      type: 'string',
      pattern: '^[a-fA-F0-9]{16}$'
    },
    name: { type: 'string' },
    kind: {
      type: 'integer',
      enum: [0, 1, 2, 3, 4, 5] // UNSPECIFIED=0, INTERNAL=1, SERVER=2, CLIENT=3, PRODUCER=4, CONSUMER=5
    },
    startTimeUnixNano: { type: ['string', 'integer'] },
    endTimeUnixNano: { type: ['string', 'integer'] },
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    droppedAttributesCount: { type: 'integer', minimum: 0 },
    events: {
      type: 'array',
      items: { $ref: '#/$defs/event' }
    },
    droppedEventsCount: { type: 'integer', minimum: 0 },
    links: {
      type: 'array',
      items: { $ref: '#/$defs/link' }
    },
    droppedLinksCount: { type: 'integer', minimum: 0 },
    status: { $ref: '#/$defs/status' },
    flags: { type: 'integer' }
  }
};

/** ScopeSpans definition */
const scopeSpansDef = {
  type: 'object',
  properties: {
    scope: { $ref: '#/$defs/instrumentationScope' },
    spans: {
      type: 'array',
      items: { $ref: '#/$defs/span' }
    },
    schemaUrl: { type: 'string' }
  }
};

/** ResourceSpans definition */
const resourceSpansDef = {
  type: 'object',
  properties: {
    resource: { $ref: '#/$defs/resource' },
    scopeSpans: {
      type: 'array',
      items: { $ref: '#/$defs/scopeSpans' }
    },
    schemaUrl: { type: 'string' }
  }
};

/** Full traces schema (ExportTraceServiceRequest) */
export const tracesSchema = {
  $id: 'otlp-traces',
  type: 'object',
  properties: {
    resourceSpans: {
      type: 'array',
      items: { $ref: '#/$defs/resourceSpans' }
    }
  },
  $defs: {
    ...commonDefs,
    status: statusDef,
    event: eventDef,
    link: linkDef,
    span: spanDef,
    scopeSpans: scopeSpansDef,
    resourceSpans: resourceSpansDef
  }
};
