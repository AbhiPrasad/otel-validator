# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

otel-validator is an Astro web application deployed to Cloudflare Workers. It uses TypeScript with strict mode enabled.

## Development Commands

```bash
yarn install          # Install dependencies
yarn dev              # Start dev server at localhost:4321
yarn build            # Build production site to ./dist/
yarn preview          # Build and preview locally with Wrangler
yarn deploy           # Build and deploy to Cloudflare Workers
yarn cf-typegen       # Generate TypeScript types from Wrangler config
```

## Architecture

- **Framework**: Astro 5.x with Cloudflare adapter for edge deployment
- **Runtime**: Cloudflare Workers with Node.js compatibility enabled
- **Routing**: File-based routing in `src/pages/` (each `.astro` file becomes a route)

### Key Configuration Files

- `astro.config.mjs` - Astro config with Cloudflare adapter and platform proxy enabled
- `wrangler.jsonc` - Cloudflare Worker settings (compatibility flags, assets binding)
- `tsconfig.json` - TypeScript config extending Astro's strict preset

### Cloudflare Runtime Access

Access Cloudflare runtime APIs (env vars, KV, D1, etc.) via `Astro.locals.runtime`:

```typescript
// In .astro files or API routes
const runtime = Astro.locals.runtime;
const env = runtime.env; // Access bindings defined in wrangler.jsonc
```

Type definitions for bindings go in `worker-configuration.d.ts` (generate with `yarn cf-typegen`).

## OTLP Validation

The app validates OpenTelemetry Protocol (OTLP) payloads for traces, logs, and metrics.

### API Endpoint

`POST /api/validate` - Validates OTLP payloads

- Content-Type: `application/json` for JSON payloads
- Returns `200` with `{success: true, payloadType}` if valid
- Returns `400` with `{success: false, errors: [...]}` if invalid
- Errors include JSON path to problematic field (e.g., `/resourceSpans/0/scopeSpans/0/spans/0/traceId`)

### Validation Library Structure

```
src/lib/validation/
  index.ts              # Main validateOTLPPayload() function
  types.ts              # TypeScript types (ValidationError, ValidationResult)
  payload-detector.ts   # Auto-detects traces/logs/metrics from payload
  schema/               # Zod schemas for structural validation
    common.ts           # Shared definitions (resource, keyValue, anyValue)
    traces.ts           # ExportTraceServiceRequest schema
    logs.ts             # ExportLogsServiceRequest schema
    metrics.ts          # ExportMetricsServiceRequest schema
  semantic/             # OTel-specific semantic validation
    traces.ts           # traceId/spanId format, timestamp ordering
    logs.ts             # severity consistency, timestamp ordering
    metrics.ts          # histogram buckets, aggregation temporality
```

### OTLP JSON Encoding Rules

Per https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding:

- traceId/spanId: hex-encoded strings (case-insensitive), 32/16 chars respectively
- Enums: integers only (e.g., `kind: 2` not `kind: "SERVER"`)
- Field names: lowerCamelCase (e.g., `droppedAttributesCount`)
- 64-bit integers: accept both string and number formats
