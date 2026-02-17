import type { Meta, DataFlow } from "../schemas"
import { connectorIdToConnectorDefName, connectorIdToConnectorConfigName, connectorIdToDcrName } from "../naming"

export function generateDataConnector(
  meta: Meta,
  dataFlow: DataFlow,
) {
  const connectorDefName = connectorIdToConnectorDefName(meta.connectorId)
  const connectorConfigName = connectorIdToConnectorConfigName(meta.connectorId)
  const dcrName = connectorIdToDcrName(meta.connectorId)

  return {
    type: "Microsoft.SecurityInsights/dataConnectors",
    apiVersion: "2022-12-01-preview",
    name: `[concat(parameters('workspace'), '/Microsoft.SecurityInsights/${connectorConfigName}')]`,
    dependsOn: [
      `[resourceId('Microsoft.SecurityInsights/dataConnectorDefinitions', parameters('workspace'), 'Microsoft.SecurityInsights', '${connectorDefName}')]`,
      `[resourceId('Microsoft.Insights/dataCollectionRules', concat(parameters('workspace'), '-${dcrName}'))]`,
    ],
    kind: "Push",
    properties: {
      connectorDefinitionName: connectorDefName,
      dataTypes: {
        logs: {
          pipelineDeploymentId: `[[parameters('connectorDefinition-${connectorDefName}')]`,
        },
      },
      dcrConfig: {
        dataCollectionEndpoint: `[[parameters('connectorDefinition-DataCollectionEndpoint-${connectorDefName}')]`,
        dataCollectionRuleImmutableId: `[[parameters('connectorDefinition-DataCollectionRuleImmutableId-${connectorDefName}')]`,
        streamName: dataFlow.streamName,
      },
    },
  }
}
