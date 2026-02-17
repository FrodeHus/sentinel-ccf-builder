import type { Column, ColumnType } from "./schemas"

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/

function inferType(value: unknown): ColumnType {
  if (value === null || value === undefined) return "string"
  if (typeof value === "boolean") return "bool"
  if (typeof value === "number") {
    return Number.isInteger(value) ? "long" : "real"
  }
  if (typeof value === "string") {
    if (ISO_DATE_REGEX.test(value)) return "datetime"
    return "string"
  }
  if (Array.isArray(value) || typeof value === "object") return "dynamic"
  return "string"
}

function toPascalCase(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase())
    .replace(/_+/g, "")
}

export function inferSchemaFromJson(json: unknown): Column[] {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error("Input must be a JSON object")
  }

  const columns: Column[] = []
  for (const [key, value] of Object.entries(json)) {
    const name = toPascalCase(key)
    if (name === "TimeGenerated") continue
    columns.push({ name, type: inferType(value) })
  }

  return columns
}
