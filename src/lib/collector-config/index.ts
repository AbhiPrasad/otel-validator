/**
 * OpenTelemetry Collector Configuration Validator
 *
 * Validates OTel Collector YAML configurations for:
 * - YAML syntax errors
 * - Structure validation (receivers, processors, exporters, service)
 * - Pipeline validation (referenced components exist)
 * - Common misconfiguration warnings
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  config?: CollectorConfig;
}

export interface ValidationError {
  path: string;
  message: string;
  line?: number;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

export interface CollectorConfig {
  receivers?: Record<string, unknown>;
  processors?: Record<string, unknown>;
  exporters?: Record<string, unknown>;
  extensions?: Record<string, unknown>;
  connectors?: Record<string, unknown>;
  service?: ServiceConfig;
}

export interface ServiceConfig {
  extensions?: string[];
  pipelines?: Record<string, PipelineConfig>;
  telemetry?: Record<string, unknown>;
}

export interface PipelineConfig {
  receivers?: string[];
  processors?: string[];
  exporters?: string[];
}

// Known component types from otel-collector-contrib
const KNOWN_RECEIVERS = new Set([
  "otlp",
  "jaeger",
  "zipkin",
  "prometheus",
  "hostmetrics",
  "filelog",
  "kafka",
  "redis",
  "postgresql",
  "mysql",
  "mongodb",
  "elasticsearch",
  "httpcheck",
  "kubeletstats",
  "k8s_cluster",
  "k8s_events",
  "awscloudwatch",
  "azureeventhub",
  "googlecloudpubsub",
  "splunk_hec",
  "statsd",
  "syslog",
  "tcplog",
  "udplog",
  "windowseventlog",
  "carbon",
  "collectd",
  "fluentforward",
  "influxdb",
  "loki",
  "opencensus",
  "skywalking",
  "solace",
  "datadog",
  "nginx",
  "apache",
  "iis",
  "jmx",
  "snmp",
]);

const KNOWN_PROCESSORS = new Set([
  "batch",
  "memory_limiter",
  "attributes",
  "resource",
  "filter",
  "transform",
  "tail_sampling",
  "probabilistic_sampler",
  "span",
  "k8sattributes",
  "resourcedetection",
  "metricstransform",
  "cumulativetodelta",
  "deltatorate",
  "groupbyattrs",
  "groupbytrace",
  "routing",
  "redaction",
  "schema",
]);

const KNOWN_EXPORTERS = new Set([
  "otlp",
  "otlphttp",
  "debug",
  "logging",
  "file",
  "jaeger",
  "zipkin",
  "prometheus",
  "prometheusremotewrite",
  "kafka",
  "elasticsearch",
  "splunk_hec",
  "awsxray",
  "awscloudwatchlogs",
  "azuremonitor",
  "googlecloud",
  "googlemanagedprometheus",
  "datadog",
  "newrelic",
  "loki",
  "influxdb",
  "carbon",
  "loadbalancing",
  "sumologic",
  "coralogix",
  "dynatrace",
  "honeycomb",
  "lightstep",
  "logzio",
  "sapm",
  "signalfx",
  "sentry",
  "tanzuobservability",
]);

const KNOWN_EXTENSIONS = new Set([
  "health_check",
  "pprof",
  "zpages",
  "memory_ballast",
  "basicauth",
  "bearertokenauth",
  "oauth2client",
  "oidc",
  "headers_setter",
  "host_observer",
  "k8s_observer",
  "file_storage",
  "db_storage",
]);

/**
 * Parse YAML string into object (simple parser for common cases)
 * Note: This is a simplified parser. For production, use a proper YAML library.
 */
export function parseYAML(yaml: string): { success: boolean; data?: unknown; error?: string; line?: number } {
  try {
    // Very basic YAML parsing - handles common collector config patterns
    const lines = yaml.split("\n");
    const result: Record<string, unknown> = {};
    const stack: { obj: Record<string, unknown>; indent: number }[] = [{ obj: result, indent: -1 }];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith("#")) {
        continue;
      }

      // Calculate indentation
      const indent = line.search(/\S/);
      const content = line.trim();

      // Pop stack until we find the right parent
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;

      // Check for key: value or key:
      if (content.includes(":")) {
        const colonIndex = content.indexOf(":");
        const key = content.slice(0, colonIndex).trim();
        let value: unknown = content.slice(colonIndex + 1).trim();

        if (!key) {
          return { success: false, error: `Invalid key at line ${lineNum}`, line: lineNum };
        }

        // Handle array item
        if (key.startsWith("- ")) {
          const actualKey = key.slice(2);
          if (!Array.isArray(parent)) {
            // Create array
            const parentKey = Object.keys(parent).pop();
            if (parentKey) {
              const newArr: unknown[] = [];
              (parent as Record<string, unknown>)[parentKey] = newArr;
              const newObj: Record<string, unknown> = {};
              newObj[actualKey] = value === "" ? {} : parseValue(value as string);
              newArr.push(newObj);
              stack.push({ obj: newObj, indent });
            }
          }
          continue;
        }

        if (value === "" || value === null) {
          // Nested object
          const newObj: Record<string, unknown> = {};
          parent[key] = newObj;
          stack.push({ obj: newObj, indent });
        } else {
          // Simple value
          parent[key] = parseValue(value as string);
        }
      } else if (content.startsWith("- ")) {
        // Array item
        const value = content.slice(2).trim();
        const parentKey = Object.keys(stack[stack.length - 1].obj).pop();
        if (parentKey) {
          const arr = stack[stack.length - 1].obj[parentKey];
          if (Array.isArray(arr)) {
            arr.push(parseValue(value));
          } else {
            stack[stack.length - 1].obj[parentKey] = [parseValue(value)];
          }
        }
      }
    }

    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Parse error" };
  }
}

function parseValue(str: string): unknown {
  // Remove quotes
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  // Boolean
  if (str === "true") return true;
  if (str === "false") return false;
  // Null
  if (str === "null" || str === "~") return null;
  // Number
  if (/^-?\d+$/.test(str)) return parseInt(str, 10);
  if (/^-?\d*\.\d+$/.test(str)) return parseFloat(str);
  // String
  return str;
}

/**
 * Validate a collector configuration object
 */
export function validateConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!config || typeof config !== "object") {
    errors.push({ path: "/", message: "Configuration must be an object" });
    return { valid: false, errors, warnings };
  }

  const cfg = config as CollectorConfig;

  // Check for required service section
  if (!cfg.service) {
    errors.push({ path: "/service", message: "Missing required 'service' section" });
  }

  // Collect all defined components
  const definedReceivers = new Set(Object.keys(cfg.receivers || {}));
  const definedProcessors = new Set(Object.keys(cfg.processors || {}));
  const definedExporters = new Set(Object.keys(cfg.exporters || {}));
  const definedExtensions = new Set(Object.keys(cfg.extensions || {}));
  const definedConnectors = new Set(Object.keys(cfg.connectors || {}));

  // Validate receivers
  for (const [name] of Object.entries(cfg.receivers || {})) {
    const baseType = name.split("/")[0];
    if (!KNOWN_RECEIVERS.has(baseType)) {
      warnings.push({
        path: `/receivers/${name}`,
        message: `Unknown receiver type: ${baseType}`,
        suggestion: "This may be a custom receiver. Verify it's installed.",
      });
    }
  }

  // Validate processors
  for (const [name] of Object.entries(cfg.processors || {})) {
    const baseType = name.split("/")[0];
    if (!KNOWN_PROCESSORS.has(baseType)) {
      warnings.push({
        path: `/processors/${name}`,
        message: `Unknown processor type: ${baseType}`,
        suggestion: "This may be a custom processor. Verify it's installed.",
      });
    }
  }

  // Validate exporters
  for (const [name] of Object.entries(cfg.exporters || {})) {
    const baseType = name.split("/")[0];
    if (!KNOWN_EXPORTERS.has(baseType)) {
      warnings.push({
        path: `/exporters/${name}`,
        message: `Unknown exporter type: ${baseType}`,
        suggestion: "This may be a custom exporter. Verify it's installed.",
      });
    }
  }

  // Validate extensions
  for (const [name] of Object.entries(cfg.extensions || {})) {
    const baseType = name.split("/")[0];
    if (!KNOWN_EXTENSIONS.has(baseType)) {
      warnings.push({
        path: `/extensions/${name}`,
        message: `Unknown extension type: ${baseType}`,
        suggestion: "This may be a custom extension. Verify it's installed.",
      });
    }
  }

  // Validate service section
  if (cfg.service) {
    // Validate service extensions
    if (cfg.service.extensions) {
      for (const ext of cfg.service.extensions) {
        if (!definedExtensions.has(ext)) {
          errors.push({
            path: `/service/extensions`,
            message: `Extension '${ext}' is used but not defined in extensions section`,
          });
        }
      }
    }

    // Validate pipelines
    if (cfg.service.pipelines) {
      for (const [pipelineName, pipeline] of Object.entries(cfg.service.pipelines)) {
        const pipelineType = pipelineName.split("/")[0];

        // Validate pipeline type
        if (!["traces", "metrics", "logs"].includes(pipelineType)) {
          warnings.push({
            path: `/service/pipelines/${pipelineName}`,
            message: `Unknown pipeline type: ${pipelineType}`,
            suggestion: "Valid types are: traces, metrics, logs",
          });
        }

        // Validate receivers in pipeline
        if (pipeline.receivers) {
          for (const receiver of pipeline.receivers) {
            if (!definedReceivers.has(receiver) && !definedConnectors.has(receiver)) {
              errors.push({
                path: `/service/pipelines/${pipelineName}/receivers`,
                message: `Receiver '${receiver}' is used but not defined`,
              });
            }
          }
        } else {
          errors.push({
            path: `/service/pipelines/${pipelineName}`,
            message: "Pipeline must have at least one receiver",
          });
        }

        // Validate processors in pipeline
        if (pipeline.processors) {
          for (const processor of pipeline.processors) {
            if (!definedProcessors.has(processor)) {
              errors.push({
                path: `/service/pipelines/${pipelineName}/processors`,
                message: `Processor '${processor}' is used but not defined`,
              });
            }
          }
        }

        // Validate exporters in pipeline
        if (pipeline.exporters) {
          for (const exporter of pipeline.exporters) {
            if (!definedExporters.has(exporter) && !definedConnectors.has(exporter)) {
              errors.push({
                path: `/service/pipelines/${pipelineName}/exporters`,
                message: `Exporter '${exporter}' is used but not defined`,
              });
            }
          }
        } else {
          errors.push({
            path: `/service/pipelines/${pipelineName}`,
            message: "Pipeline must have at least one exporter",
          });
        }
      }
    } else {
      warnings.push({
        path: "/service/pipelines",
        message: "No pipelines defined",
        suggestion: "Define at least one pipeline (traces, metrics, or logs)",
      });
    }
  }

  // Check for common issues
  if (!cfg.receivers || Object.keys(cfg.receivers).length === 0) {
    warnings.push({
      path: "/receivers",
      message: "No receivers defined",
      suggestion: "Add at least one receiver (e.g., otlp)",
    });
  }

  if (!cfg.exporters || Object.keys(cfg.exporters).length === 0) {
    warnings.push({
      path: "/exporters",
      message: "No exporters defined",
      suggestion: "Add at least one exporter (e.g., debug, otlp)",
    });
  }

  // Check for memory_limiter processor recommendation
  const hasMemoryLimiter = Object.keys(cfg.processors || {}).some(
    (p) => p.startsWith("memory_limiter")
  );
  if (!hasMemoryLimiter && Object.keys(cfg.processors || {}).length > 0) {
    warnings.push({
      path: "/processors",
      message: "No memory_limiter processor configured",
      suggestion: "Consider adding memory_limiter to prevent OOM issues",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config: cfg,
  };
}

/**
 * Get list of known component types for autocomplete
 */
export function getKnownComponents(): {
  receivers: string[];
  processors: string[];
  exporters: string[];
  extensions: string[];
} {
  return {
    receivers: Array.from(KNOWN_RECEIVERS).sort(),
    processors: Array.from(KNOWN_PROCESSORS).sort(),
    exporters: Array.from(KNOWN_EXPORTERS).sort(),
    extensions: Array.from(KNOWN_EXTENSIONS).sort(),
  };
}

/**
 * Generate a sample minimal config
 */
export function getSampleConfig(): string {
  return `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]
    logs:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug]`;
}
