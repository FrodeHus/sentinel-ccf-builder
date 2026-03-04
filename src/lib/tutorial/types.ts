import type { ConnectorKind } from "@/lib/schemas"

export type TourId = "push" | "poller"

export interface TourStop {
  id: string
  elementSelector: string
  stepId: string
  mode: "connector" | "solution"
  title: string
  description: string
  expectedValue: string | null
  matchStrategy: "exact" | "startsWith" | "endsWith" | "contains"
  side?: "top" | "bottom" | "left" | "right"
  /** CSS selector of an element to click programmatically before showing this stop */
  clickSelector?: string
}

export interface TourDefinition {
  id: TourId
  label: string
  description: string
  connectorKind: ConnectorKind
  stops: TourStop[]
}
