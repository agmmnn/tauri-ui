import { emit } from "@tauri-apps/api/event"
import { invoke, isTauri, type InvokeArgs } from "@tauri-apps/api/core"

import { emitDebugEvent, serializeDebugValue, serializeError } from "./debug-events"

export async function trackedInvoke<T>(command: string, args?: InvokeArgs) {
  const startedAt = performance.now()

  try {
    const result = await invoke<T>(command, args)

    emitDebugEvent({
      id: crypto.randomUUID(),
      kind: "invoke",
      command,
      args: serializeDebugValue(args),
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      status: "success",
      result: serializeDebugValue(result),
      timestamp: new Date().toISOString(),
    })

    return result
  } catch (error) {
    emitDebugEvent({
      id: crypto.randomUUID(),
      kind: "invoke",
      command,
      args: serializeDebugValue(args),
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      status: "error",
      error: serializeError(error),
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}

export async function trackedEmit<T>(event: string, payload?: T) {
  await emit(event, payload)

  emitDebugEvent({
    id: crypto.randomUUID(),
    kind: "runtime-event",
    name: event,
    source: "tauri-event",
    payload: serializeDebugValue(payload),
    timestamp: new Date().toISOString(),
  })
}

export { isTauri }
