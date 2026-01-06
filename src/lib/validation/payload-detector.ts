import type { OTLPPayloadType } from './types';

/**
 * Auto-detect OTLP payload type from the payload structure.
 * Checks for resourceSpans, resourceLogs, or resourceMetrics keys.
 */
export function detectPayloadType(payload: unknown): OTLPPayloadType | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const obj = payload as Record<string, unknown>;

  if ('resourceSpans' in obj && Array.isArray(obj.resourceSpans)) {
    return 'traces';
  }

  if ('resourceLogs' in obj && Array.isArray(obj.resourceLogs)) {
    return 'logs';
  }

  if ('resourceMetrics' in obj && Array.isArray(obj.resourceMetrics)) {
    return 'metrics';
  }

  return null;
}
