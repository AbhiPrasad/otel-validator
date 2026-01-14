# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

otel-tools is an Astro web application deployed to Cloudflare Workers. It provides a collection of OpenTelemetry developer utilities. Uses TypeScript with strict mode enabled.

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

### Project Structure

```
src/
├── components/
│   ├── Layout.astro        # Shared page wrapper (head, nav, footer)
│   ├── Navbar.astro        # Horizontal navigation with mobile support
│   ├── ThemeToggle.astro   # Dark/light mode toggle
│   └── Footer.astro        # Page footer
├── styles/
│   └── global.css          # Global CSS variables and base styles
├── lib/
│   ├── id-generator/       # Trace/Span ID generation and validation
│   │   └── index.ts
│   └── validation/         # OTLP payload validation library
│       ├── index.ts
│       ├── types.ts
│       ├── payload-detector.ts
│       ├── schema/         # Zod schemas
│       └── semantic/       # OTel semantic validation
├── pages/
│   ├── index.astro         # Landing page with tool cards
│   ├── validate.astro      # OTLP Payload Validator
│   ├── trace-id.astro      # Trace ID/Span ID Generator
│   └── api/
│       └── validate.ts     # OTLP validation API endpoint
```

### Key Configuration Files

- `astro.config.mjs` - Astro config with Cloudflare adapter
- `wrangler.jsonc` - Cloudflare Worker settings
- `tsconfig.json` - TypeScript config extending Astro's strict preset

### Adding New Tools

1. Create a new page in `src/pages/` (e.g., `new-tool.astro`)
2. Use the `Layout` component with appropriate `title`, `description`, and `activeNav` props
3. Add the tool to `navItems` in `src/components/Navbar.astro`
4. Update the tools array in `src/pages/index.astro` (change status from 'coming-soon' to 'stable')
5. If needed, create a library in `src/lib/` for reusable logic

### Cloudflare Runtime Access

Access Cloudflare runtime APIs via `Astro.locals.runtime`:

```typescript
const runtime = Astro.locals.runtime;
const env = runtime.env; // Access bindings defined in wrangler.jsonc
```

## Available Tools

### 1. OTLP Payload Validator (`/validate`)

Validates OpenTelemetry Protocol (OTLP) payloads for traces, logs, and metrics.

**API Endpoint:** `POST /api/validate`
- Content-Type: `application/json` for JSON payloads
- Returns `200` with `{success: true, payloadType}` if valid
- Returns `400` with `{success: false, errors: [...]}` if invalid

**Validation Library:** `src/lib/validation/`

### 2. Trace ID Generator (`/trace-id`)

Generate and validate trace IDs (32 hex chars) and span IDs (16 hex chars).

**Library:** `src/lib/id-generator/`
- `generateTraceId()` - Generate random 32-char hex trace ID
- `generateSpanId()` - Generate random 16-char hex span ID
- `validateTraceId(id)` - Validate trace ID format
- `validateSpanId(id)` - Validate span ID format

### Planned Tools (Coming Soon)

- **Trace Context** (`/trace-context`) - W3C traceparent/tracestate encoding/decoding
- **Timestamp Converter** (`/timestamp`) - Unix nanoseconds conversion
- **Collector Config** (`/collector-config`) - OTel Collector YAML validation
- **Semantic Conventions** (`/semconv`) - Searchable semconv database

## OTLP JSON Encoding Rules

Per https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding:

- traceId/spanId: hex-encoded strings (case-insensitive), 32/16 chars respectively
- Enums: integers only (e.g., `kind: 2` not `kind: "SERVER"`)
- Field names: lowerCamelCase (e.g., `droppedAttributesCount`)
- 64-bit integers: accept both string and number formats
