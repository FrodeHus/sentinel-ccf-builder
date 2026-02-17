import type { ConnectorConfig } from "./schemas"
import { connectorIdToDcrName } from "./naming"
import { generateTableResource } from "./arm-resources/table"
import { generateDcrResource } from "./arm-resources/dcr"
import { generateConnectorDefinition } from "./arm-resources/connector-def"
import { generateDataConnector } from "./arm-resources/data-connector"

export function generateArmTemplate(config: ConnectorConfig): Record<string, unknown> {
  const { meta, schema, dataFlow, connectorUI } = config
  const dcrName = connectorIdToDcrName(meta.connectorId)

  const resources = [
    generateTableResource(schema, "[variables('workspaceResourceId')]"),
    generateDcrResource(schema, dataFlow, dcrName),
    generateConnectorDefinition(meta, schema, connectorUI),
    generateDataConnector(meta, dataFlow),
  ]

  return {
    $schema: "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    contentVersion: "1.0.0.0",
    parameters: {
      workspace: {
        type: "string",
      },
      "workspace-location": {
        type: "string",
      },
      subscription: {
        type: "string",
        defaultValue: "[subscription().subscriptionId]",
      },
      resourceGroupName: {
        type: "string",
        defaultValue: "[resourceGroup().name]",
      },
    },
    variables: {
      workspaceResourceId: "[resourceId('Microsoft.OperationalInsights/workspaces', parameters('workspace'))]",
    },
    resources,
  }
}
