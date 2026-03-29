export const DEBUG_EVENT_NAME = "ctui:debug"

type SerializedError = {
  name: string
  message: string
  stack?: string
}

export type ExternalLinkDebugEvent = {
  id: string
  kind: "external-link"
  href: string
  timestamp: string
}

export type InvokeDebugEvent = {
  id: string
  kind: "invoke"
  command: string
  args: unknown
  durationMs: number
  status: "success" | "error"
  result?: unknown
  error?: SerializedError
  timestamp: string
}

export type RuntimeEventDebugEvent = {
  id: string
  kind: "runtime-event"
  name: string
  source: "window" | "tauri-event"
  payload?: unknown
  timestamp: string
}

export type LogDebugEvent = {
  id: string
  kind: "log"
  level: "log" | "info" | "warn" | "error" | "debug"
  message: string
  timestamp: string
}

export type DebugEvent =
  | ExternalLinkDebugEvent
  | InvokeDebugEvent
  | RuntimeEventDebugEvent
  | LogDebugEvent

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    name: "Error",
    message: typeof error === "string" ? error : JSON.stringify(error),
  }
}

export function serializeDebugValue(value: unknown): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return value ?? null
  }

  if (typeof value === "string") {
    return value.length > 500 ? `${value.slice(0, 500)}…` : value
  }

  if (value instanceof Error) {
    return serializeError(value)
  }

  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return String(value)
  }
}

export function emitDebugEvent(detail: DebugEvent) {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new CustomEvent<DebugEvent>(DEBUG_EVENT_NAME, { detail }))
}
