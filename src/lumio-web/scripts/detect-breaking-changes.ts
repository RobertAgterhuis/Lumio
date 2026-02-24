/**
 * detect-breaking-changes.ts
 *
 * Detects breaking changes in the API by comparing the current OpenAPI spec
 * against a baseline. Intended to run in CI to prevent accidental breaking changes.
 *
 * Usage:
 *   npx tsx scripts/detect-breaking-changes.ts [--update-baseline]
 *
 * Options:
 *   --update-baseline  Update the baseline file with the current spec
 *
 * Exit codes:
 *   0 - No breaking changes detected
 *   1 - Breaking changes detected
 *   2 - Error (could not fetch spec, missing baseline, etc.)
 */

import * as fs from "node:fs";
import * as path from "node:path";

const SWAGGER_URL = "http://127.0.0.1:5123/swagger/v1/swagger.json";
const BASELINE_FILE = path.join(__dirname, "../api-baseline.json");

interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string };
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
  };
}

interface PathItem {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  patch?: OperationObject;
  delete?: OperationObject;
}

interface OperationObject {
  operationId?: string;
  parameters?: ParameterObject[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, { schema?: SchemaObject }>;
  };
  responses?: Record<string, ResponseObject>;
}

interface ParameterObject {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  required?: boolean;
  schema?: SchemaObject;
}

interface ResponseObject {
  description?: string;
  content?: Record<string, { schema?: SchemaObject }>;
}

interface SchemaObject {
  type?: string;
  $ref?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  items?: SchemaObject;
  enum?: (string | number)[];
  nullable?: boolean;
}

interface BreakingChange {
  severity: "error" | "warning";
  type: string;
  path: string;
  message: string;
}

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

async function fetchCurrentSpec(): Promise<OpenAPISpec> {
  const response = await fetch(SWAGGER_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<OpenAPISpec>;
}

function loadBaseline(): OpenAPISpec | null {
  if (!fs.existsSync(BASELINE_FILE)) {
    return null;
  }
  const content = fs.readFileSync(BASELINE_FILE, "utf8");
  return JSON.parse(content) as OpenAPISpec;
}

function saveBaseline(spec: OpenAPISpec): void {
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(spec, null, 2), "utf8");
}

function resolveRef(spec: OpenAPISpec, ref: string): SchemaObject | undefined {
  if (!ref.startsWith("#/components/schemas/")) {
    return undefined;
  }
  const schemaName = ref.replace("#/components/schemas/", "");
  return spec.components?.schemas?.[schemaName];
}

function getSchemaProperties(
  spec: OpenAPISpec,
  schema: SchemaObject | undefined
): Record<string, SchemaObject> {
  if (!schema) return {};

  if (schema.$ref) {
    const resolved = resolveRef(spec, schema.$ref);
    return getSchemaProperties(spec, resolved);
  }

  return schema.properties || {};
}

function getSchemaRequired(spec: OpenAPISpec, schema: SchemaObject | undefined): string[] {
  if (!schema) return [];

  if (schema.$ref) {
    const resolved = resolveRef(spec, schema.$ref);
    return getSchemaRequired(spec, resolved);
  }

  return schema.required || [];
}

function compareSchemas(
  baseSpec: OpenAPISpec,
  currentSpec: OpenAPISpec,
  baseSchema: SchemaObject | undefined,
  currentSchema: SchemaObject | undefined,
  context: string
): BreakingChange[] {
  const changes: BreakingChange[] = [];

  const baseProps = getSchemaProperties(baseSpec, baseSchema);
  const currentProps = getSchemaProperties(currentSpec, currentSchema);
  const baseRequired = new Set(getSchemaRequired(baseSpec, baseSchema));
  const currentRequired = new Set(getSchemaRequired(currentSpec, currentSchema));

  // Check for removed properties (breaking for responses)
  for (const propName of Object.keys(baseProps)) {
    if (!(propName in currentProps)) {
      changes.push({
        severity: "error",
        type: "removed-property",
        path: `${context}.${propName}`,
        message: `Property "${propName}" was removed`,
      });
    }
  }

  // Check for new required properties (breaking for requests)
  for (const propName of currentRequired) {
    if (!baseRequired.has(propName) && !(propName in baseProps)) {
      changes.push({
        severity: "error",
        type: "new-required-property",
        path: `${context}.${propName}`,
        message: `New required property "${propName}" was added`,
      });
    }
  }

  // Check for type changes
  for (const propName of Object.keys(baseProps)) {
    if (propName in currentProps) {
      const baseProp = baseProps[propName];
      const currentProp = currentProps[propName];

      const baseType = baseProp.$ref || baseProp.type;
      const currentType = currentProp.$ref || currentProp.type;

      if (baseType !== currentType) {
        changes.push({
          severity: "error",
          type: "type-change",
          path: `${context}.${propName}`,
          message: `Type changed from "${baseType}" to "${currentType}"`,
        });
      }

      // Check nullable changes (non-nullable to nullable is OK, opposite is breaking)
      if (baseProp.nullable && !currentProp.nullable) {
        changes.push({
          severity: "error",
          type: "nullable-change",
          path: `${context}.${propName}`,
          message: `Property was nullable but is no longer nullable`,
        });
      }
    }
  }

  return changes;
}

function compareEndpoints(
  baseSpec: OpenAPISpec,
  currentSpec: OpenAPISpec
): BreakingChange[] {
  const changes: BreakingChange[] = [];

  // Check for removed endpoints
  for (const [pathUrl, basePathItem] of Object.entries(baseSpec.paths)) {
    const currentPathItem = currentSpec.paths[pathUrl];

    if (!currentPathItem) {
      // Entire path removed
      for (const method of HTTP_METHODS) {
        if (basePathItem[method]) {
          changes.push({
            severity: "error",
            type: "removed-endpoint",
            path: `${method.toUpperCase()} ${pathUrl}`,
            message: `Endpoint was removed`,
          });
        }
      }
      continue;
    }

    // Check each HTTP method
    for (const method of HTTP_METHODS) {
      const baseOp = basePathItem[method];
      const currentOp = currentPathItem[method];

      if (baseOp && !currentOp) {
        changes.push({
          severity: "error",
          type: "removed-endpoint",
          path: `${method.toUpperCase()} ${pathUrl}`,
          message: `Endpoint was removed`,
        });
        continue;
      }

      if (baseOp && currentOp) {
        // Compare request body
        const baseRequestSchema =
          baseOp.requestBody?.content?.["application/json"]?.schema;
        const currentRequestSchema =
          currentOp.requestBody?.content?.["application/json"]?.schema;

        if (baseRequestSchema || currentRequestSchema) {
          const requestChanges = compareSchemas(
            baseSpec,
            currentSpec,
            baseRequestSchema,
            currentRequestSchema,
            `${method.toUpperCase()} ${pathUrl} request`
          );
          changes.push(...requestChanges);
        }

        // Check if request body became required
        if (!baseOp.requestBody?.required && currentOp.requestBody?.required) {
          changes.push({
            severity: "error",
            type: "required-body",
            path: `${method.toUpperCase()} ${pathUrl}`,
            message: `Request body is now required`,
          });
        }

        // Compare response schemas (200, 201)
        for (const statusCode of ["200", "201"]) {
          const baseResponseSchema =
            baseOp.responses?.[statusCode]?.content?.["application/json"]?.schema;
          const currentResponseSchema =
            currentOp.responses?.[statusCode]?.content?.["application/json"]?.schema;

          if (baseResponseSchema) {
            const responseChanges = compareSchemas(
              baseSpec,
              currentSpec,
              baseResponseSchema,
              currentResponseSchema,
              `${method.toUpperCase()} ${pathUrl} response[${statusCode}]`
            );
            changes.push(...responseChanges);
          }
        }

        // Check required parameters
        const baseParams = baseOp.parameters || [];
        const currentParams = currentOp.parameters || [];

        for (const currentParam of currentParams) {
          if (currentParam.required) {
            const baseParam = baseParams.find(
              (p) => p.name === currentParam.name && p.in === currentParam.in
            );
            if (!baseParam) {
              changes.push({
                severity: "error",
                type: "new-required-parameter",
                path: `${method.toUpperCase()} ${pathUrl}`,
                message: `New required ${currentParam.in} parameter "${currentParam.name}" was added`,
              });
            }
          }
        }
      }
    }
  }

  // Check for removed schemas that might be in use
  if (baseSpec.components?.schemas && currentSpec.components?.schemas) {
    for (const schemaName of Object.keys(baseSpec.components.schemas)) {
      if (!(schemaName in (currentSpec.components.schemas || {}))) {
        changes.push({
          severity: "warning",
          type: "removed-schema",
          path: `#/components/schemas/${schemaName}`,
          message: `Schema "${schemaName}" was removed`,
        });
      }
    }
  }

  return changes;
}

async function main(): Promise<void> {
  const updateBaseline = process.argv.includes("--update-baseline");

  console.log("🔍 Fetching current OpenAPI spec...");

  let currentSpec: OpenAPISpec;
  try {
    currentSpec = await fetchCurrentSpec();
  } catch (error) {
    console.error("❌ Error fetching OpenAPI spec:", (error as Error).message);
    console.error("   Make sure the API is running on http://127.0.0.1:5123");
    process.exit(2);
  }

  console.log(`   Found ${Object.keys(currentSpec.paths).length} endpoints`);

  if (updateBaseline) {
    console.log("\n📝 Updating baseline...");
    saveBaseline(currentSpec);
    console.log(`   Saved to ${BASELINE_FILE}`);
    console.log("\n✅ Baseline updated successfully!");
    process.exit(0);
  }

  const baselineSpec = loadBaseline();

  if (!baselineSpec) {
    console.log("\n⚠️  No baseline found. Creating initial baseline...");
    saveBaseline(currentSpec);
    console.log(`   Saved to ${BASELINE_FILE}`);
    console.log("\n✅ Initial baseline created. Run again to detect changes.");
    process.exit(0);
  }

  console.log("\n🔄 Comparing against baseline...");
  console.log(`   Baseline: ${Object.keys(baselineSpec.paths).length} endpoints`);

  const breakingChanges = compareEndpoints(baselineSpec, currentSpec);

  const errors = breakingChanges.filter((c) => c.severity === "error");
  const warnings = breakingChanges.filter((c) => c.severity === "warning");

  if (breakingChanges.length === 0) {
    console.log("\n✅ No breaking changes detected!");

    // Check for new endpoints (informational)
    const newEndpoints: string[] = [];
    for (const [pathUrl, currentPathItem] of Object.entries(currentSpec.paths)) {
      const basePathItem = baselineSpec.paths[pathUrl];
      for (const method of HTTP_METHODS) {
        if (currentPathItem[method] && !basePathItem?.[method]) {
          newEndpoints.push(`${method.toUpperCase()} ${pathUrl}`);
        }
      }
    }

    if (newEndpoints.length > 0) {
      console.log(`\n📝 New endpoints added (non-breaking):`);
      for (const endpoint of newEndpoints) {
        console.log(`   + ${endpoint}`);
      }
    }

    process.exit(0);
  }

  console.log(`\n❌ Found ${breakingChanges.length} potential breaking change(s):\n`);

  for (const change of errors) {
    console.log(`   🔴 [${change.type}] ${change.path}`);
    console.log(`      ${change.message}`);
  }

  for (const change of warnings) {
    console.log(`   🟡 [${change.type}] ${change.path}`);
    console.log(`      ${change.message}`);
  }

  console.log("\n💡 If these changes are intentional:");
  console.log("   1. Update the frontend to handle the changes");
  console.log("   2. Update api version if needed");
  console.log("   3. Run: npm run detect-breaking-changes -- --update-baseline");

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
