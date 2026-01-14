/**
 * OpenTelemetry Semantic Conventions Database
 *
 * Provides searchable access to OTel semantic conventions for:
 * - Resource attributes
 * - Span attributes
 * - Metric attributes
 * - Log attributes
 *
 * Data based on: https://opentelemetry.io/docs/specs/semconv/
 */

export interface SemanticConvention {
  id: string;
  name: string;
  type: "string" | "int" | "double" | "boolean" | "string[]" | "int[]";
  brief: string;
  examples?: string[];
  requirement?: "required" | "conditionally_required" | "recommended" | "opt_in";
  stability: "stable" | "experimental" | "deprecated";
  namespace: string;
  signal: ("traces" | "metrics" | "logs" | "resources")[];
  note?: string;
}

// Comprehensive list of semantic conventions
// This is a curated subset of the most commonly used conventions
const SEMANTIC_CONVENTIONS: SemanticConvention[] = [
  // Service/Resource attributes
  {
    id: "service.name",
    name: "service.name",
    type: "string",
    brief: "Logical name of the service",
    examples: ["shoppingcart", "api-gateway"],
    requirement: "required",
    stability: "stable",
    namespace: "service",
    signal: ["resources"],
  },
  {
    id: "service.version",
    name: "service.version",
    type: "string",
    brief: "Version of the service",
    examples: ["1.0.0", "2023.04.01"],
    requirement: "recommended",
    stability: "stable",
    namespace: "service",
    signal: ["resources"],
  },
  {
    id: "service.namespace",
    name: "service.namespace",
    type: "string",
    brief: "Namespace for service.name",
    examples: ["Shop"],
    requirement: "recommended",
    stability: "experimental",
    namespace: "service",
    signal: ["resources"],
  },
  {
    id: "service.instance.id",
    name: "service.instance.id",
    type: "string",
    brief: "Unique instance ID of the service",
    examples: ["627cc493-f310-47de-96bd-71410b7dec09"],
    requirement: "recommended",
    stability: "experimental",
    namespace: "service",
    signal: ["resources"],
  },

  // HTTP attributes
  {
    id: "http.request.method",
    name: "http.request.method",
    type: "string",
    brief: "HTTP request method",
    examples: ["GET", "POST", "HEAD"],
    requirement: "required",
    stability: "stable",
    namespace: "http",
    signal: ["traces", "metrics"],
  },
  {
    id: "http.response.status_code",
    name: "http.response.status_code",
    type: "int",
    brief: "HTTP response status code",
    examples: ["200", "404", "500"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "http",
    signal: ["traces", "metrics"],
  },
  {
    id: "http.route",
    name: "http.route",
    type: "string",
    brief: "The matched route (path template)",
    examples: ["/users/:userID?", "/api/v1/users/{id}"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "http",
    signal: ["traces", "metrics"],
  },
  {
    id: "url.full",
    name: "url.full",
    type: "string",
    brief: "Absolute URL describing a network resource",
    examples: ["https://www.foo.bar/search?q=OpenTelemetry"],
    requirement: "recommended",
    stability: "stable",
    namespace: "url",
    signal: ["traces"],
  },
  {
    id: "url.path",
    name: "url.path",
    type: "string",
    brief: "The URI path component",
    examples: ["/search", "/api/v1/users"],
    requirement: "recommended",
    stability: "stable",
    namespace: "url",
    signal: ["traces", "metrics"],
  },
  {
    id: "url.query",
    name: "url.query",
    type: "string",
    brief: "The URI query component",
    examples: ["q=OpenTelemetry"],
    requirement: "recommended",
    stability: "stable",
    namespace: "url",
    signal: ["traces"],
  },
  {
    id: "url.scheme",
    name: "url.scheme",
    type: "string",
    brief: "The URI scheme component",
    examples: ["https", "http"],
    requirement: "recommended",
    stability: "stable",
    namespace: "url",
    signal: ["traces", "metrics"],
  },

  // Network attributes
  {
    id: "server.address",
    name: "server.address",
    type: "string",
    brief: "Server address - domain name or IP",
    examples: ["example.com", "10.1.2.80"],
    requirement: "recommended",
    stability: "stable",
    namespace: "server",
    signal: ["traces", "metrics"],
  },
  {
    id: "server.port",
    name: "server.port",
    type: "int",
    brief: "Server port number",
    examples: ["80", "8080", "443"],
    requirement: "recommended",
    stability: "stable",
    namespace: "server",
    signal: ["traces", "metrics"],
  },
  {
    id: "client.address",
    name: "client.address",
    type: "string",
    brief: "Client address - domain name or IP",
    examples: ["client.example.com", "10.1.2.80"],
    requirement: "recommended",
    stability: "stable",
    namespace: "client",
    signal: ["traces"],
  },
  {
    id: "client.port",
    name: "client.port",
    type: "int",
    brief: "Client port number",
    examples: ["65123"],
    requirement: "recommended",
    stability: "stable",
    namespace: "client",
    signal: ["traces"],
  },
  {
    id: "network.protocol.name",
    name: "network.protocol.name",
    type: "string",
    brief: "Application layer protocol",
    examples: ["http", "spdy"],
    requirement: "recommended",
    stability: "stable",
    namespace: "network",
    signal: ["traces", "metrics"],
  },
  {
    id: "network.protocol.version",
    name: "network.protocol.version",
    type: "string",
    brief: "Version of the protocol",
    examples: ["1.0", "1.1", "2", "3"],
    requirement: "recommended",
    stability: "stable",
    namespace: "network",
    signal: ["traces", "metrics"],
  },

  // Database attributes
  {
    id: "db.system",
    name: "db.system",
    type: "string",
    brief: "Database management system identifier",
    examples: ["postgresql", "mysql", "redis", "mongodb"],
    requirement: "required",
    stability: "stable",
    namespace: "db",
    signal: ["traces"],
  },
  {
    id: "db.name",
    name: "db.name",
    type: "string",
    brief: "Database name being accessed",
    examples: ["customers", "main"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "db",
    signal: ["traces"],
  },
  {
    id: "db.operation",
    name: "db.operation",
    type: "string",
    brief: "Database operation being performed",
    examples: ["SELECT", "INSERT", "UPDATE", "findAndModify"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "db",
    signal: ["traces"],
  },
  {
    id: "db.statement",
    name: "db.statement",
    type: "string",
    brief: "Database statement being executed",
    examples: ["SELECT * FROM wuser_table WHERE username = ?"],
    requirement: "recommended",
    stability: "stable",
    namespace: "db",
    signal: ["traces"],
    note: "Should be sanitized to exclude sensitive information",
  },

  // RPC attributes
  {
    id: "rpc.system",
    name: "rpc.system",
    type: "string",
    brief: "RPC system being used",
    examples: ["grpc", "java_rmi", "wcf"],
    requirement: "required",
    stability: "stable",
    namespace: "rpc",
    signal: ["traces"],
  },
  {
    id: "rpc.service",
    name: "rpc.service",
    type: "string",
    brief: "Full name of the service being called",
    examples: ["myservice.EchoService"],
    requirement: "recommended",
    stability: "stable",
    namespace: "rpc",
    signal: ["traces"],
  },
  {
    id: "rpc.method",
    name: "rpc.method",
    type: "string",
    brief: "Name of the method being called",
    examples: ["exampleMethod"],
    requirement: "recommended",
    stability: "stable",
    namespace: "rpc",
    signal: ["traces"],
  },
  {
    id: "rpc.grpc.status_code",
    name: "rpc.grpc.status_code",
    type: "int",
    brief: "gRPC status code",
    examples: ["0", "1", "2"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "rpc",
    signal: ["traces"],
  },

  // Messaging attributes
  {
    id: "messaging.system",
    name: "messaging.system",
    type: "string",
    brief: "Messaging system identifier",
    examples: ["kafka", "rabbitmq", "rocketmq", "activemq"],
    requirement: "required",
    stability: "stable",
    namespace: "messaging",
    signal: ["traces"],
  },
  {
    id: "messaging.destination.name",
    name: "messaging.destination.name",
    type: "string",
    brief: "Message destination name",
    examples: ["MyQueue", "MyTopic"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "messaging",
    signal: ["traces"],
  },
  {
    id: "messaging.operation",
    name: "messaging.operation",
    type: "string",
    brief: "Type of messaging operation",
    examples: ["publish", "receive", "process"],
    requirement: "required",
    stability: "stable",
    namespace: "messaging",
    signal: ["traces"],
  },
  {
    id: "messaging.message.id",
    name: "messaging.message.id",
    type: "string",
    brief: "Message identifier",
    examples: ["452a7c7c7c7048c2f887f61572b18fc2"],
    requirement: "recommended",
    stability: "stable",
    namespace: "messaging",
    signal: ["traces"],
  },

  // Exception attributes
  {
    id: "exception.type",
    name: "exception.type",
    type: "string",
    brief: "Type of the exception",
    examples: ["java.net.ConnectException", "OSError"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "exception",
    signal: ["traces", "logs"],
  },
  {
    id: "exception.message",
    name: "exception.message",
    type: "string",
    brief: "Exception message",
    examples: ["Division by zero", "Can't convert 'int' to 'str'"],
    requirement: "recommended",
    stability: "stable",
    namespace: "exception",
    signal: ["traces", "logs"],
  },
  {
    id: "exception.stacktrace",
    name: "exception.stacktrace",
    type: "string",
    brief: "Stacktrace as a string",
    examples: ["Exception in thread main..."],
    requirement: "recommended",
    stability: "stable",
    namespace: "exception",
    signal: ["traces", "logs"],
  },

  // Cloud attributes
  {
    id: "cloud.provider",
    name: "cloud.provider",
    type: "string",
    brief: "Cloud provider name",
    examples: ["aws", "azure", "gcp", "alibaba_cloud"],
    requirement: "recommended",
    stability: "stable",
    namespace: "cloud",
    signal: ["resources"],
  },
  {
    id: "cloud.region",
    name: "cloud.region",
    type: "string",
    brief: "Cloud region",
    examples: ["us-central1", "us-east-1"],
    requirement: "recommended",
    stability: "stable",
    namespace: "cloud",
    signal: ["resources"],
  },
  {
    id: "cloud.availability_zone",
    name: "cloud.availability_zone",
    type: "string",
    brief: "Cloud availability zone",
    examples: ["us-east-1c"],
    requirement: "recommended",
    stability: "stable",
    namespace: "cloud",
    signal: ["resources"],
  },
  {
    id: "cloud.account.id",
    name: "cloud.account.id",
    type: "string",
    brief: "Cloud account ID",
    examples: ["111111111111", "opentelemetry"],
    requirement: "recommended",
    stability: "stable",
    namespace: "cloud",
    signal: ["resources"],
  },

  // Container attributes
  {
    id: "container.name",
    name: "container.name",
    type: "string",
    brief: "Container name",
    examples: ["opentelemetry-autoconf"],
    requirement: "recommended",
    stability: "stable",
    namespace: "container",
    signal: ["resources"],
  },
  {
    id: "container.id",
    name: "container.id",
    type: "string",
    brief: "Container ID",
    examples: ["a3bf90e006b2"],
    requirement: "recommended",
    stability: "stable",
    namespace: "container",
    signal: ["resources"],
  },
  {
    id: "container.image.name",
    name: "container.image.name",
    type: "string",
    brief: "Container image name",
    examples: ["gcr.io/opentelemetry/operator"],
    requirement: "recommended",
    stability: "stable",
    namespace: "container",
    signal: ["resources"],
  },
  {
    id: "container.image.tag",
    name: "container.image.tag",
    type: "string",
    brief: "Container image tag",
    examples: ["0.1"],
    requirement: "recommended",
    stability: "stable",
    namespace: "container",
    signal: ["resources"],
  },

  // Kubernetes attributes
  {
    id: "k8s.cluster.name",
    name: "k8s.cluster.name",
    type: "string",
    brief: "Kubernetes cluster name",
    examples: ["opentelemetry-cluster"],
    requirement: "recommended",
    stability: "stable",
    namespace: "k8s",
    signal: ["resources"],
  },
  {
    id: "k8s.namespace.name",
    name: "k8s.namespace.name",
    type: "string",
    brief: "Kubernetes namespace name",
    examples: ["default"],
    requirement: "recommended",
    stability: "stable",
    namespace: "k8s",
    signal: ["resources"],
  },
  {
    id: "k8s.pod.name",
    name: "k8s.pod.name",
    type: "string",
    brief: "Kubernetes pod name",
    examples: ["opentelemetry-pod-autoconf"],
    requirement: "recommended",
    stability: "stable",
    namespace: "k8s",
    signal: ["resources"],
  },
  {
    id: "k8s.pod.uid",
    name: "k8s.pod.uid",
    type: "string",
    brief: "Kubernetes pod UID",
    examples: ["275ecb36-5aa8-4c2a-9c47-d8bb681b9aff"],
    requirement: "recommended",
    stability: "stable",
    namespace: "k8s",
    signal: ["resources"],
  },
  {
    id: "k8s.deployment.name",
    name: "k8s.deployment.name",
    type: "string",
    brief: "Kubernetes deployment name",
    examples: ["opentelemetry"],
    requirement: "recommended",
    stability: "stable",
    namespace: "k8s",
    signal: ["resources"],
  },

  // Host attributes
  {
    id: "host.name",
    name: "host.name",
    type: "string",
    brief: "Hostname of the host",
    examples: ["opentelemetry-test"],
    requirement: "recommended",
    stability: "stable",
    namespace: "host",
    signal: ["resources"],
  },
  {
    id: "host.id",
    name: "host.id",
    type: "string",
    brief: "Unique host identifier",
    examples: ["opentelemetry-test"],
    requirement: "recommended",
    stability: "stable",
    namespace: "host",
    signal: ["resources"],
  },
  {
    id: "host.type",
    name: "host.type",
    type: "string",
    brief: "Type of host",
    examples: ["n1-standard-1"],
    requirement: "recommended",
    stability: "stable",
    namespace: "host",
    signal: ["resources"],
  },
  {
    id: "host.arch",
    name: "host.arch",
    type: "string",
    brief: "CPU architecture",
    examples: ["amd64", "arm32", "arm64"],
    requirement: "recommended",
    stability: "stable",
    namespace: "host",
    signal: ["resources"],
  },

  // OS attributes
  {
    id: "os.type",
    name: "os.type",
    type: "string",
    brief: "Operating system type",
    examples: ["windows", "linux", "darwin"],
    requirement: "recommended",
    stability: "stable",
    namespace: "os",
    signal: ["resources"],
  },
  {
    id: "os.version",
    name: "os.version",
    type: "string",
    brief: "Operating system version",
    examples: ["14.2.1", "18.04.1"],
    requirement: "recommended",
    stability: "stable",
    namespace: "os",
    signal: ["resources"],
  },

  // Process attributes
  {
    id: "process.pid",
    name: "process.pid",
    type: "int",
    brief: "Process identifier (PID)",
    examples: ["1234"],
    requirement: "recommended",
    stability: "stable",
    namespace: "process",
    signal: ["resources"],
  },
  {
    id: "process.executable.name",
    name: "process.executable.name",
    type: "string",
    brief: "Name of the process executable",
    examples: ["otelcol"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "process",
    signal: ["resources"],
  },
  {
    id: "process.executable.path",
    name: "process.executable.path",
    type: "string",
    brief: "Full path to the process executable",
    examples: ["/usr/bin/cmd/otelcol"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "process",
    signal: ["resources"],
  },
  {
    id: "process.runtime.name",
    name: "process.runtime.name",
    type: "string",
    brief: "Name of the runtime",
    examples: ["OpenJDK Runtime Environment"],
    requirement: "recommended",
    stability: "stable",
    namespace: "process",
    signal: ["resources"],
  },
  {
    id: "process.runtime.version",
    name: "process.runtime.version",
    type: "string",
    brief: "Version of the runtime",
    examples: ["14.0.2"],
    requirement: "recommended",
    stability: "stable",
    namespace: "process",
    signal: ["resources"],
  },

  // Telemetry SDK attributes
  {
    id: "telemetry.sdk.name",
    name: "telemetry.sdk.name",
    type: "string",
    brief: "Name of the telemetry SDK",
    examples: ["opentelemetry"],
    requirement: "required",
    stability: "stable",
    namespace: "telemetry",
    signal: ["resources"],
  },
  {
    id: "telemetry.sdk.language",
    name: "telemetry.sdk.language",
    type: "string",
    brief: "Language of the telemetry SDK",
    examples: ["java", "python", "go", "javascript"],
    requirement: "required",
    stability: "stable",
    namespace: "telemetry",
    signal: ["resources"],
  },
  {
    id: "telemetry.sdk.version",
    name: "telemetry.sdk.version",
    type: "string",
    brief: "Version of the telemetry SDK",
    examples: ["1.2.3"],
    requirement: "required",
    stability: "stable",
    namespace: "telemetry",
    signal: ["resources"],
  },

  // User/Enduser attributes
  {
    id: "enduser.id",
    name: "enduser.id",
    type: "string",
    brief: "Username or client_id",
    examples: ["username"],
    requirement: "recommended",
    stability: "stable",
    namespace: "enduser",
    signal: ["traces"],
  },
  {
    id: "enduser.role",
    name: "enduser.role",
    type: "string",
    brief: "User's role",
    examples: ["admin"],
    requirement: "recommended",
    stability: "stable",
    namespace: "enduser",
    signal: ["traces"],
  },

  // Thread attributes
  {
    id: "thread.id",
    name: "thread.id",
    type: "int",
    brief: "Thread ID",
    examples: ["42"],
    requirement: "recommended",
    stability: "stable",
    namespace: "thread",
    signal: ["traces", "logs"],
  },
  {
    id: "thread.name",
    name: "thread.name",
    type: "string",
    brief: "Thread name",
    examples: ["main"],
    requirement: "recommended",
    stability: "stable",
    namespace: "thread",
    signal: ["traces", "logs"],
  },

  // Code attributes
  {
    id: "code.function",
    name: "code.function",
    type: "string",
    brief: "Method or function name",
    examples: ["serveRequest"],
    requirement: "recommended",
    stability: "stable",
    namespace: "code",
    signal: ["traces"],
  },
  {
    id: "code.namespace",
    name: "code.namespace",
    type: "string",
    brief: "Namespace of the code",
    examples: ["com.example.MyClass"],
    requirement: "recommended",
    stability: "stable",
    namespace: "code",
    signal: ["traces"],
  },
  {
    id: "code.filepath",
    name: "code.filepath",
    type: "string",
    brief: "Source code file path",
    examples: ["/usr/local/MyClass.java"],
    requirement: "recommended",
    stability: "stable",
    namespace: "code",
    signal: ["traces"],
  },
  {
    id: "code.lineno",
    name: "code.lineno",
    type: "int",
    brief: "Source code line number",
    examples: ["42"],
    requirement: "recommended",
    stability: "stable",
    namespace: "code",
    signal: ["traces"],
  },

  // Error attributes
  {
    id: "error.type",
    name: "error.type",
    type: "string",
    brief: "Describes a class of error",
    examples: ["timeout", "java.net.UnknownHostException", "500"],
    requirement: "conditionally_required",
    stability: "stable",
    namespace: "error",
    signal: ["traces", "metrics"],
  },

  // User agent attributes
  {
    id: "user_agent.original",
    name: "user_agent.original",
    type: "string",
    brief: "Original user-agent string",
    examples: ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)"],
    requirement: "recommended",
    stability: "stable",
    namespace: "user_agent",
    signal: ["traces"],
  },
];

// Get all unique namespaces
export function getNamespaces(): string[] {
  const namespaces = new Set(SEMANTIC_CONVENTIONS.map((c) => c.namespace));
  return Array.from(namespaces).sort();
}

// Get all conventions
export function getAllConventions(): SemanticConvention[] {
  return [...SEMANTIC_CONVENTIONS];
}

// Search conventions
export interface SearchFilters {
  namespace?: string;
  signal?: "traces" | "metrics" | "logs" | "resources";
  stability?: "stable" | "experimental" | "deprecated";
  requirement?: "required" | "conditionally_required" | "recommended" | "opt_in";
}

export function searchConventions(
  query: string,
  filters?: SearchFilters
): SemanticConvention[] {
  const lowerQuery = query.toLowerCase().trim();

  let results = SEMANTIC_CONVENTIONS;

  // Apply filters
  if (filters?.namespace) {
    results = results.filter((c) => c.namespace === filters.namespace);
  }
  if (filters?.signal) {
    results = results.filter((c) => c.signal.includes(filters.signal!));
  }
  if (filters?.stability) {
    results = results.filter((c) => c.stability === filters.stability);
  }
  if (filters?.requirement) {
    results = results.filter((c) => c.requirement === filters.requirement);
  }

  // Apply search query
  if (lowerQuery) {
    results = results.filter((c) => {
      return (
        c.name.toLowerCase().includes(lowerQuery) ||
        c.brief.toLowerCase().includes(lowerQuery) ||
        c.namespace.toLowerCase().includes(lowerQuery) ||
        c.examples?.some((e) => e.toLowerCase().includes(lowerQuery))
      );
    });
  }

  // Sort by relevance (exact matches first, then by name)
  results.sort((a, b) => {
    const aExact = a.name.toLowerCase() === lowerQuery;
    const bExact = b.name.toLowerCase() === lowerQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    const aStartsWith = a.name.toLowerCase().startsWith(lowerQuery);
    const bStartsWith = b.name.toLowerCase().startsWith(lowerQuery);
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;

    return a.name.localeCompare(b.name);
  });

  return results;
}

// Get convention by ID
export function getConventionById(id: string): SemanticConvention | undefined {
  return SEMANTIC_CONVENTIONS.find((c) => c.id === id);
}

// Get count of conventions
export function getConventionCount(): number {
  return SEMANTIC_CONVENTIONS.length;
}
