/**
 * OpenTelemetry ID Generator Library
 *
 * Provides utilities for generating and validating trace IDs and span IDs
 * according to the W3C Trace Context specification.
 *
 * - Trace ID: 128-bit (16 bytes) identifier as 32 lowercase hex characters
 * - Span ID: 64-bit (8 bytes) identifier as 16 lowercase hex characters
 */

/**
 * Generates a cryptographically random trace ID (32 hex characters)
 * @returns A valid 32-character lowercase hex string
 */
export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates a cryptographically random span ID (16 hex characters)
 * @returns A valid 16-character lowercase hex string
 */
export function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface IdValidationResult {
  valid: boolean;
  errors: string[];
  normalized?: string;
}

/**
 * Validates a trace ID
 * - Must be exactly 32 hex characters
 * - Must not be all zeros (invalid trace ID per spec)
 * @param id The trace ID to validate
 * @returns Validation result with errors if any
 */
export function validateTraceId(id: string): IdValidationResult {
  const errors: string[] = [];

  if (!id) {
    errors.push("Trace ID is required");
    return { valid: false, errors };
  }

  const trimmed = id.trim();

  if (!/^[0-9a-fA-F]+$/.test(trimmed)) {
    errors.push(
      "Trace ID must contain only hexadecimal characters (0-9, a-f, A-F)"
    );
  }

  if (trimmed.length !== 32) {
    errors.push(`Trace ID must be exactly 32 characters (got ${trimmed.length})`);
  }

  if (/^0+$/.test(trimmed)) {
    errors.push("Trace ID must not be all zeros (represents invalid/unset ID)");
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized: errors.length === 0 ? trimmed.toLowerCase() : undefined,
  };
}

/**
 * Validates a span ID
 * - Must be exactly 16 hex characters
 * - Must not be all zeros (invalid span ID per spec)
 * @param id The span ID to validate
 * @returns Validation result with errors if any
 */
export function validateSpanId(id: string): IdValidationResult {
  const errors: string[] = [];

  if (!id) {
    errors.push("Span ID is required");
    return { valid: false, errors };
  }

  const trimmed = id.trim();

  if (!/^[0-9a-fA-F]+$/.test(trimmed)) {
    errors.push(
      "Span ID must contain only hexadecimal characters (0-9, a-f, A-F)"
    );
  }

  if (trimmed.length !== 16) {
    errors.push(`Span ID must be exactly 16 characters (got ${trimmed.length})`);
  }

  if (/^0+$/.test(trimmed)) {
    errors.push("Span ID must not be all zeros (represents invalid/unset ID)");
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized: errors.length === 0 ? trimmed.toLowerCase() : undefined,
  };
}

/**
 * Generates multiple trace IDs
 * @param count Number of IDs to generate (max 100)
 * @returns Array of valid trace IDs
 */
export function generateTraceIds(count: number): string[] {
  const safeCount = Math.max(1, Math.min(count, 100));
  return Array.from({ length: safeCount }, generateTraceId);
}

/**
 * Generates multiple span IDs
 * @param count Number of IDs to generate (max 100)
 * @returns Array of valid span IDs
 */
export function generateSpanIds(count: number): string[] {
  const safeCount = Math.max(1, Math.min(count, 100));
  return Array.from({ length: safeCount }, generateSpanId);
}

/**
 * Convert hex ID to byte array representation (for display purposes)
 * @param hex The hex string to convert
 * @returns Array of byte values (0-255)
 */
export function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return bytes;
}

/**
 * Format bytes as a display string (e.g., "[01, 23, 45, ...]")
 * @param bytes Array of byte values
 * @returns Formatted string representation
 */
export function formatBytesDisplay(bytes: number[]): string {
  return `[${bytes.map((b) => b.toString(16).padStart(2, "0")).join(", ")}]`;
}
