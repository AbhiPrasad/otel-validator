/**
 * Common OTLP JSON Schema definitions shared across traces, logs, and metrics.
 * Field names use lowerCamelCase per OTLP JSON encoding spec.
 */

/** AnyValue - can hold any type of value */
export const anyValueDef = {
  type: 'object',
  properties: {
    stringValue: { type: 'string' },
    boolValue: { type: 'boolean' },
    intValue: { type: ['string', 'integer'] },
    doubleValue: { type: 'number' },
    arrayValue: {
      type: 'object',
      properties: {
        values: {
          type: 'array',
          items: { $ref: '#/$defs/anyValue' }
        }
      }
    },
    kvlistValue: {
      type: 'object',
      properties: {
        values: {
          type: 'array',
          items: { $ref: '#/$defs/keyValue' }
        }
      }
    },
    bytesValue: { type: 'string' }
  }
};

/** KeyValue - attribute key-value pair */
export const keyValueDef = {
  type: 'object',
  required: ['key'],
  properties: {
    key: { type: 'string' },
    value: { $ref: '#/$defs/anyValue' }
  }
};

/** Resource - describes the entity producing telemetry */
export const resourceDef = {
  type: 'object',
  properties: {
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    droppedAttributesCount: { type: 'integer', minimum: 0 }
  }
};

/** InstrumentationScope - describes the instrumentation library */
export const instrumentationScopeDef = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    version: { type: 'string' },
    attributes: {
      type: 'array',
      items: { $ref: '#/$defs/keyValue' }
    },
    droppedAttributesCount: { type: 'integer', minimum: 0 }
  }
};

/** Common $defs to be included in each schema */
export const commonDefs = {
  anyValue: anyValueDef,
  keyValue: keyValueDef,
  resource: resourceDef,
  instrumentationScope: instrumentationScopeDef
};
