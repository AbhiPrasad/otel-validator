# OTLP Validator

A web application for validating OpenTelemetry Protocol (OTLP) payloads. Deployed on Cloudflare Workers.

**Live:** https://otel-validator.devabhiprasad.workers.dev/

## Features

- Validates OTLP traces, logs, and metrics payloads
- Auto-detects payload type from structure
- Returns detailed error messages with JSON paths to problematic fields
- Follows [OTLP JSON encoding specification](https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding)

## Usage

### Web UI

Visit the deployed application to use the interactive validator with:
- JSON textarea input
- Example payload buttons for traces, logs, and metrics
- Real-time validation with detailed error display

### API

```bash
POST /api/validate
Content-Type: application/json
```

**Request:** OTLP JSON payload (traces, logs, or metrics)

**Success Response (200):**
```json
{
  "success": true,
  "payloadType": "traces",
  "message": "Valid traces payload"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "payloadType": "traces",
  "errors": [
    {
      "path": "/resourceSpans/0/scopeSpans/0/spans/0/traceId",
      "message": "traceId must be exactly 32 hex characters",
      "keyword": "invalid_format",
      "schemaPath": "#/traces"
    }
  ]
}
```

### Example

```bash
# Valid payload
curl -X POST https://otel-validator.devabhiprasad.workers.dev/api/validate \
  -H "Content-Type: application/json" \
  -d '{"resourceSpans":[]}'

# Invalid payload
curl -X POST https://otel-validator.devabhiprasad.workers.dev/api/validate \
  -H "Content-Type: application/json" \
  -d '{"resourceSpans":[{"scopeSpans":[{"spans":[{"kind":"SERVER"}]}]}]}'
```

## OTLP JSON Encoding Rules

Per the [OTLP specification](https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding):

| Field | Format |
|-------|--------|
| traceId | 32 hex characters (case-insensitive) |
| spanId | 16 hex characters (case-insensitive) |
| Enums (kind, code, severityNumber) | Integers only (not string names) |
| Field names | lowerCamelCase |
| 64-bit integers | String or number |

## Development

```bash
yarn install      # Install dependencies
yarn dev          # Start dev server at localhost:4321
yarn build        # Build for production
yarn preview      # Preview with Wrangler locally
yarn deploy       # Deploy to Cloudflare Workers
```

## Project Structure

```
src/
  pages/
    index.astro           # Web UI
    api/
      validate.ts         # Validation API endpoint
  lib/
    validation/
      index.ts            # Main validateOTLPPayload() function
      types.ts            # TypeScript types
      payload-detector.ts # Auto-detects traces/logs/metrics
      schema/             # Zod schemas for structural validation
      semantic/           # OTel-specific semantic validation
```

## Tech Stack

- [Astro](https://astro.build) - Web framework
- [Cloudflare Workers](https://workers.cloudflare.com) - Edge deployment
- [Zod](https://zod.dev) - Schema validation (Cloudflare Workers compatible)
