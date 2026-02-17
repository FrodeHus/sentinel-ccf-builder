export function titleToConnectorId(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("")
}

export function connectorIdToTableName(connectorId: string): string {
  return `${connectorId}_CL`
}

export function tableNameToStreamName(tableName: string): string {
  const base = tableName.replace(/_CL$/, "")
  return `Custom-${base}`
}

export function tableNameToOutputStreamName(tableName: string): string {
  return `Custom-${tableName}`
}

export function connectorIdToDcrName(connectorId: string): string {
  return `${connectorId}PushDCR`
}

export function connectorIdToConnectorDefName(connectorId: string): string {
  return `${connectorId}Push`
}

export function connectorIdToConnectorConfigName(connectorId: string): string {
  return `${connectorId}PushConnector`
}
