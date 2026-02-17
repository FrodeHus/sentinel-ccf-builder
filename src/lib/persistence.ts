import type { ConnectorConfig } from "./schemas"

const STORAGE_KEY = "sentinel-ccf-builder-config"

let debounceTimer: ReturnType<typeof setTimeout> | null = null

export function saveConfig(config: ConnectorConfig): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      // localStorage might be full or unavailable
    }
  }, 500)
}

export function loadConfig(): ConnectorConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as ConnectorConfig
  } catch {
    return null
  }
}

export function clearConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function exportConfig(config: ConnectorConfig): string {
  return JSON.stringify(config, null, 2)
}

export function importConfig(json: string): ConnectorConfig | null {
  try {
    return JSON.parse(json) as ConnectorConfig
  } catch {
    return null
  }
}
