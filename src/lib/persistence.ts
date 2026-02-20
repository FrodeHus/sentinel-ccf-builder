import { saveAs } from "file-saver";
import type { AppState } from "./schemas";
import { AppStateSchema } from "./schemas";

const MAX_IMPORT_SIZE = 1_048_576; // 1 MB

const STORAGE_KEY = "sentinel-ccf-builder-config";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function saveConfig(state: AppState): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage may be unavailable (private browsing) or full — config is still
      // held in memory for the current session, so the user can still export.
    }
  }, 500);
}

export function loadConfig(): AppState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);

    // Migrate old format: single ConnectorConfig → AppState
    if ("meta" in parsed && !("connectors" in parsed)) {
      const migrated = {
        solution: parsed.solution ?? {},
        connectors: [
          {
            meta: parsed.meta,
            schema: parsed.schema,
            dataFlow: parsed.dataFlow,
            connectorUI: parsed.connectorUI,
          },
        ],
        activeConnectorIndex: 0,
      };
      // Parse through schema to apply new defaults (connectorKind, etc.)
      return AppStateSchema.parse(migrated);
    }

    // Parse through schema to fill new field defaults
    return AppStateSchema.parse(parsed);
  } catch {
    // JSON.parse throws if the stored value is corrupt; treat as no saved config.
    return null;
  }
}

export function clearConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable in this context — no-op, nothing to clear.
  }
}

export function exportConfig(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importConfig(json: string): AppState | null {
  try {
    return AppStateSchema.parse(JSON.parse(json));
  } catch {
    return null;
  }
}

export function downloadProjectFile(state: AppState): void {
  const name =
    state.solution.name || state.connectors[0]?.meta.connectorId || "project";
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  saveAs(blob, `${name}-project.json`);
}

export async function readProjectFile(file: File): Promise<AppState> {
  if (file.size > MAX_IMPORT_SIZE) {
    throw new Error(
      `File is too large (${(file.size / 1024).toFixed(0)} KB). Maximum allowed size is 1 MB.`,
    );
  }

  const text = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The file does not contain valid JSON.");
  }

  try {
    return AppStateSchema.parse(parsed);
  } catch {
    throw new Error(
      "The file is not a valid project file. It does not match the expected format.",
    );
  }
}
