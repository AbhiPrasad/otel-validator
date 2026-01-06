/**
 * Types for OTLP payload validation
 */

export type OTLPPayloadType = 'traces' | 'logs' | 'metrics';

export interface ValidationError {
  /** JSON path to the error location (e.g., "/resourceSpans/0/scopeSpans/0/spans/0/traceId") */
  path: string;
  /** Human-readable error message */
  message: string;
  /** Validation keyword (e.g., "pattern", "required", "enum", "semantic") */
  keyword: string;
  /** Path in schema where rule is defined */
  schemaPath: string;
}

export interface ValidationWarning {
  /** JSON path to the warning location */
  path: string;
  /** Human-readable warning message */
  message: string;
  /** Optional suggestion for fixing the issue */
  suggestion?: string;
}

export interface ValidationResult {
  /** Whether the payload is valid */
  valid: boolean;
  /** Detected payload type (null if unable to detect) */
  payloadType: OTLPPayloadType | null;
  /** List of validation errors */
  errors: ValidationError[];
  /** List of validation warnings (non-fatal issues) */
  warnings?: ValidationWarning[];
}

export interface APISuccessResponse {
  success: true;
  payloadType: OTLPPayloadType;
  message: string;
}

export interface APIErrorResponse {
  success: false;
  payloadType: OTLPPayloadType | null;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export type APIResponse = APISuccessResponse | APIErrorResponse;
