/**
 * W3C Trace Context Library
 *
 * Implements encoding/decoding for W3C Trace Context headers:
 * - traceparent: version-traceId-spanId-flags
 * - tracestate: vendor-specific key-value pairs
 *
 * Specification: https://www.w3.org/TR/trace-context/
 */

export interface TraceParent {
  version: string;
  traceId: string;
  spanId: string;
  flags: TraceFlags;
}

export interface TraceFlags {
  sampled: boolean;
}

export interface TraceState {
  entries: TraceStateEntry[];
}

export interface TraceStateEntry {
  key: string;
  value: string;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

/**
 * Parse a traceparent header string
 * Format: version-traceId-spanId-flags
 * Example: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
 */
export function parseTraceParent(header: string): ParseResult<TraceParent> {
  const errors: string[] = [];
  const trimmed = header.trim();

  if (!trimmed) {
    return { success: false, errors: ["traceparent header is required"] };
  }

  const parts = trimmed.split("-");

  if (parts.length !== 4) {
    errors.push(
      `traceparent must have exactly 4 parts separated by '-' (got ${parts.length})`
    );
    return { success: false, errors };
  }

  const [version, traceId, spanId, flags] = parts;

  // Validate version (2 hex chars)
  if (!/^[0-9a-fA-F]{2}$/.test(version)) {
    errors.push("version must be exactly 2 lowercase hex characters");
  } else if (version.toLowerCase() === "ff") {
    errors.push("version ff is invalid (reserved)");
  }

  // Validate traceId (32 hex chars, not all zeros)
  if (!/^[0-9a-fA-F]{32}$/.test(traceId)) {
    errors.push("traceId must be exactly 32 lowercase hex characters");
  } else if (/^0+$/.test(traceId)) {
    errors.push("traceId must not be all zeros");
  }

  // Validate spanId (16 hex chars, not all zeros)
  if (!/^[0-9a-fA-F]{16}$/.test(spanId)) {
    errors.push("spanId must be exactly 16 lowercase hex characters");
  } else if (/^0+$/.test(spanId)) {
    errors.push("spanId must not be all zeros");
  }

  // Validate flags (2 hex chars)
  if (!/^[0-9a-fA-F]{2}$/.test(flags)) {
    errors.push("flags must be exactly 2 lowercase hex characters");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const flagsInt = parseInt(flags, 16);

  return {
    success: true,
    data: {
      version: version.toLowerCase(),
      traceId: traceId.toLowerCase(),
      spanId: spanId.toLowerCase(),
      flags: {
        sampled: (flagsInt & 0x01) === 0x01,
      },
    },
    errors: [],
  };
}

/**
 * Encode a TraceParent object to a traceparent header string
 */
export function encodeTraceParent(tp: TraceParent): string {
  const flagsByte = (tp.flags.sampled ? 0x01 : 0x00).toString(16).padStart(2, "0");
  return `${tp.version}-${tp.traceId.toLowerCase()}-${tp.spanId.toLowerCase()}-${flagsByte}`;
}

/**
 * Parse a tracestate header string
 * Format: key1=value1,key2=value2
 * Keys can be: simple-key or tenant@vendor-key
 */
export function parseTraceState(header: string): ParseResult<TraceState> {
  const errors: string[] = [];
  const trimmed = header.trim();

  if (!trimmed) {
    return { success: true, data: { entries: [] }, errors: [] };
  }

  const entries: TraceStateEntry[] = [];
  const parts = trimmed.split(",");

  // Max 32 entries per spec
  if (parts.length > 32) {
    errors.push(`tracestate can have at most 32 entries (got ${parts.length})`);
  }

  const seenKeys = new Set<string>();

  for (let i = 0; i < Math.min(parts.length, 32); i++) {
    const part = parts[i].trim();
    if (!part) continue;

    const eqIndex = part.indexOf("=");
    if (eqIndex === -1) {
      errors.push(`entry ${i + 1}: missing '=' separator`);
      continue;
    }

    const key = part.slice(0, eqIndex);
    const value = part.slice(eqIndex + 1);

    // Validate key format
    // Simple key: [a-z][a-z0-9_\-\*\/]{0,255}
    // Multi-tenant: [a-z0-9][a-z0-9_\-\*\/]{0,240}@[a-z][a-z0-9_\-\*\/]{0,13}
    const simpleKeyPattern = /^[a-z][a-z0-9_\-*\/]{0,255}$/;
    const multiTenantPattern = /^[a-z0-9][a-z0-9_\-*\/]{0,240}@[a-z][a-z0-9_\-*\/]{0,13}$/;

    if (!simpleKeyPattern.test(key) && !multiTenantPattern.test(key)) {
      errors.push(`entry ${i + 1}: invalid key format "${key}"`);
    }

    // Validate value (printable ASCII, no ',' or '=')
    if (!/^[\x20-\x2b\x2d-\x3c\x3e-\x7e]{0,256}$/.test(value)) {
      errors.push(`entry ${i + 1}: invalid value format`);
    }

    // Check for duplicate keys
    if (seenKeys.has(key)) {
      errors.push(`entry ${i + 1}: duplicate key "${key}"`);
    }
    seenKeys.add(key);

    entries.push({ key, value });
  }

  return {
    success: errors.length === 0,
    data: { entries },
    errors,
  };
}

/**
 * Encode a TraceState object to a tracestate header string
 */
export function encodeTraceState(ts: TraceState): string {
  return ts.entries.map((e) => `${e.key}=${e.value}`).join(",");
}

/**
 * Generate a sample traceparent header
 */
export function generateSampleTraceParent(sampled: boolean = true): string {
  const traceId = generateRandomHex(32);
  const spanId = generateRandomHex(16);
  const flags = sampled ? "01" : "00";
  return `00-${traceId}-${spanId}-${flags}`;
}

/**
 * Generate random hex string
 */
function generateRandomHex(length: number): string {
  const bytes = new Uint8Array(length / 2);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Get human-readable description of flags
 */
export function describeFlagsHuman(flags: TraceFlags): string {
  const parts: string[] = [];
  if (flags.sampled) {
    parts.push("sampled");
  } else {
    parts.push("not sampled");
  }
  return parts.join(", ");
}
