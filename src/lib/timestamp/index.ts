/**
 * Timestamp Conversion Library
 *
 * Converts between various timestamp formats used in OpenTelemetry:
 * - Unix nanoseconds (OTLP default)
 * - Unix milliseconds
 * - Unix seconds
 * - ISO 8601 strings
 * - Human-readable formats
 */

export interface TimestampFormats {
  nanoseconds: string;
  milliseconds: string;
  seconds: string;
  iso8601: string;
  human: string;
  date: Date;
}

export interface ParseResult {
  success: boolean;
  timestamp?: TimestampFormats;
  errors: string[];
}

export interface DurationResult {
  success: boolean;
  duration?: Duration;
  errors: string[];
}

export interface Duration {
  nanoseconds: bigint;
  milliseconds: number;
  seconds: number;
  human: string;
}

// Constants
const NS_PER_MS = 1_000_000n;
const NS_PER_SEC = 1_000_000_000n;
const MS_PER_SEC = 1000;

/**
 * Parse a timestamp string and return all formats
 * Supports: nanoseconds, milliseconds, seconds, ISO 8601
 */
export function parseTimestamp(
  input: string,
  format: "auto" | "ns" | "ms" | "s" | "iso" = "auto"
): ParseResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { success: false, errors: ["Timestamp is required"] };
  }

  try {
    let date: Date;
    let nanoseconds: bigint;

    if (format === "iso" || (format === "auto" && isISOFormat(trimmed))) {
      // ISO 8601 format
      date = new Date(trimmed);
      if (isNaN(date.getTime())) {
        return { success: false, errors: ["Invalid ISO 8601 format"] };
      }
      nanoseconds = BigInt(date.getTime()) * NS_PER_MS;
    } else if (format === "auto") {
      // Auto-detect based on magnitude
      const num = BigInt(trimmed);

      if (num < 0n) {
        return { success: false, errors: ["Negative timestamps not supported"] };
      }

      // Heuristic based on typical timestamp ranges:
      // - Seconds: ~1.7 billion (10 digits, year 2024)
      // - Milliseconds: ~1.7 trillion (13 digits)
      // - Nanoseconds: ~1.7 quadrillion (19 digits)
      const strLen = trimmed.length;

      if (strLen <= 10) {
        // Likely seconds
        nanoseconds = num * NS_PER_SEC;
      } else if (strLen <= 13) {
        // Likely milliseconds
        nanoseconds = num * NS_PER_MS;
      } else {
        // Likely nanoseconds
        nanoseconds = num;
      }

      date = new Date(Number(nanoseconds / NS_PER_MS));
    } else {
      const num = BigInt(trimmed);

      if (num < 0n) {
        return { success: false, errors: ["Negative timestamps not supported"] };
      }

      switch (format) {
        case "ns":
          nanoseconds = num;
          break;
        case "ms":
          nanoseconds = num * NS_PER_MS;
          break;
        case "s":
          nanoseconds = num * NS_PER_SEC;
          break;
        default:
          return { success: false, errors: [`Unknown format: ${format}`] };
      }

      date = new Date(Number(nanoseconds / NS_PER_MS));
    }

    // Validate the date is reasonable (between year 1970 and 3000)
    const year = date.getFullYear();
    if (year < 1970 || year > 3000) {
      return {
        success: false,
        errors: [`Timestamp out of reasonable range (year ${year})`],
      };
    }

    return {
      success: true,
      timestamp: formatTimestamp(nanoseconds, date),
      errors: [],
    };
  } catch (e) {
    return {
      success: false,
      errors: [e instanceof Error ? e.message : "Invalid timestamp format"],
    };
  }
}

/**
 * Get the current time in all formats
 */
export function getCurrentTimestamp(): TimestampFormats {
  const now = new Date();
  const nanoseconds = BigInt(now.getTime()) * NS_PER_MS;
  return formatTimestamp(nanoseconds, now);
}

/**
 * Calculate duration between two nanosecond timestamps
 */
export function calculateDuration(
  startNs: string,
  endNs: string
): DurationResult {
  try {
    const start = BigInt(startNs.trim());
    const end = BigInt(endNs.trim());

    if (start < 0n || end < 0n) {
      return { success: false, errors: ["Negative timestamps not supported"] };
    }

    const durationNs = end - start;

    if (durationNs < 0n) {
      return {
        success: false,
        errors: ["End time must be after start time"],
      };
    }

    const durationMs = Number(durationNs / NS_PER_MS);
    const durationSec = Number(durationNs / NS_PER_SEC);

    return {
      success: true,
      duration: {
        nanoseconds: durationNs,
        milliseconds: durationMs,
        seconds: durationSec,
        human: formatDurationHuman(durationNs),
      },
      errors: [],
    };
  } catch (e) {
    return {
      success: false,
      errors: [e instanceof Error ? e.message : "Invalid timestamp format"],
    };
  }
}

/**
 * Convert nanoseconds to other formats
 */
function formatTimestamp(nanoseconds: bigint, date: Date): TimestampFormats {
  return {
    nanoseconds: nanoseconds.toString(),
    milliseconds: (nanoseconds / NS_PER_MS).toString(),
    seconds: (nanoseconds / NS_PER_SEC).toString(),
    iso8601: date.toISOString(),
    human: formatDateHuman(date),
    date,
  };
}

/**
 * Format a date in human-readable form
 */
function formatDateHuman(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  };
  return date.toLocaleString("en-US", options);
}

/**
 * Format duration in human-readable form
 */
function formatDurationHuman(nanoseconds: bigint): string {
  const ns = nanoseconds;

  if (ns < 1000n) {
    return `${ns}ns`;
  }

  const us = ns / 1000n;
  if (us < 1000n) {
    return `${us}µs`;
  }

  const ms = ns / NS_PER_MS;
  if (ms < 1000n) {
    return `${ms}ms`;
  }

  const sec = Number(ns) / Number(NS_PER_SEC);
  if (sec < 60) {
    return `${sec.toFixed(3)}s`;
  }

  const min = Math.floor(sec / 60);
  const remainingSec = sec % 60;
  if (min < 60) {
    return `${min}m ${remainingSec.toFixed(1)}s`;
  }

  const hours = Math.floor(min / 60);
  const remainingMin = min % 60;
  if (hours < 24) {
    return `${hours}h ${remainingMin}m ${Math.floor(remainingSec)}s`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h ${remainingMin}m`;
}

/**
 * Check if string looks like ISO 8601 format
 */
function isISOFormat(str: string): boolean {
  // Check for common ISO patterns: YYYY-MM-DD or contains 'T'
  return /^\d{4}-\d{2}-\d{2}/.test(str) || str.includes("T");
}

/**
 * Convert a Date to nanoseconds string
 */
export function dateToNanoseconds(date: Date): string {
  return (BigInt(date.getTime()) * NS_PER_MS).toString();
}

/**
 * Convert nanoseconds string to Date
 */
export function nanosecondsToDate(ns: string): Date {
  return new Date(Number(BigInt(ns) / NS_PER_MS));
}
