import type { TableSchema } from "../schemas"

export function generateTableResource(schema: TableSchema, _workspaceResourceId: string) {
  return {
    type: "Microsoft.OperationalInsights/workspaces/tables",
    apiVersion: "2025-07-01",
    name: `[concat(parameters('workspace'), '/${schema.tableName}')]`,
    properties: {
      schema: {
        name: schema.tableName,
        columns: schema.columns.map(col => ({
          name: col.name,
          type: col.type,
        })),
      },
    },
  }
}
