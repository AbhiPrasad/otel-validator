/**
 * API endpoint for validating OTLP payloads.
 * Supports JSON and protobuf content types.
 */

import type { APIRoute } from 'astro';
import { validateOTLPPayload } from '../../lib/validation';
import type { APIResponse, ValidationError } from '../../lib/validation/types';

export const prerender = false;

/**
 * POST /api/validate
 * Validates an OTLP payload (traces, logs, or metrics).
 */
export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') || '';

  try {
    let payload: unknown;

    // Handle JSON content type
    if (contentType.includes('application/json')) {
      const text = await request.text();

      if (!text.trim()) {
        return jsonResponse({
          success: false,
          payloadType: null,
          errors: [{
            path: '',
            message: 'Request body is empty',
            keyword: 'required',
            schemaPath: '#'
          }]
        }, 400);
      }

      try {
        payload = JSON.parse(text);
      } catch (e) {
        const parseError = e instanceof Error ? e.message : 'Parse error';
        return jsonResponse({
          success: false,
          payloadType: null,
          errors: [{
            path: '',
            message: `Invalid JSON: ${parseError}`,
            keyword: 'format',
            schemaPath: '#'
          }]
        }, 400);
      }
    }
    // Handle protobuf content type
    else if (contentType.includes('application/x-protobuf') ||
             contentType.includes('application/protobuf')) {
      // For protobuf, we need to decode it first
      // This is a simplified implementation - full protobuf support requires additional setup
      const buffer = await request.arrayBuffer();

      if (buffer.byteLength === 0) {
        return jsonResponse({
          success: false,
          payloadType: null,
          errors: [{
            path: '',
            message: 'Request body is empty',
            keyword: 'required',
            schemaPath: '#'
          }]
        }, 400);
      }

      // Try to decode as JSON first (some clients send JSON with protobuf content-type)
      try {
        const text = new TextDecoder().decode(buffer);
        payload = JSON.parse(text);
      } catch {
        // Actual protobuf binary - for now return an error indicating protobuf needs setup
        return jsonResponse({
          success: false,
          payloadType: null,
          errors: [{
            path: '',
            message: 'Binary protobuf decoding is not yet fully supported. Please use JSON format (application/json) or send JSON data.',
            keyword: 'format',
            schemaPath: '#'
          }]
        }, 415);
      }
    }
    // Unsupported content type
    else {
      return jsonResponse({
        success: false,
        payloadType: null,
        errors: [{
          path: '',
          message: `Unsupported content type: "${contentType}". Use application/json or application/x-protobuf`,
          keyword: 'contentType',
          schemaPath: '#'
        }]
      }, 415);
    }

    // Validate the payload
    const result = validateOTLPPayload(payload);

    if (result.valid) {
      return jsonResponse({
        success: true,
        payloadType: result.payloadType!,
        message: `Valid ${result.payloadType} payload`
      }, 200);
    } else {
      return jsonResponse({
        success: false,
        payloadType: result.payloadType,
        errors: result.errors,
        warnings: result.warnings
      }, 400);
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({
      success: false,
      payloadType: null,
      errors: [{
        path: '',
        message: `Internal error: ${errorMessage}`,
        keyword: 'internal',
        schemaPath: '#'
      }]
    }, 500);
  }
};

/**
 * OPTIONS /api/validate
 * Handle CORS preflight requests.
 */
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
};

/**
 * Create a JSON response with CORS headers.
 */
function jsonResponse(data: APIResponse, status: number): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}

/**
 * CORS headers for cross-origin requests.
 */
function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
