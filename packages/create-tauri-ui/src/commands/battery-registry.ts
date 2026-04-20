import fs from "node:fs";
import path from "node:path";

import { applyDebugPanel } from "../batteries/debug-panel";
import { applyWorkflow } from "../batteries/workflow";
import type { ProjectOptions, TemplateName } from "../types";
import { editFile, editJson } from "../utils";

export type BatteryId = "debug-panel" | "workflow";

export interface BatteryStatus {
  installed: boolean;
  detectedFiles: string[];
}

export interface BatteryDefinition {
  id: BatteryId;
  name: string;
  description: string;
  detectFiles(projectDir: string, template: TemplateName): string[];
  apply(projectDir: string, options: ProjectOptions): Promise<void>;
  remove(projectDir: string, options: ProjectOptions): { removed: string[]; manual: string[] };
}

function componentRoot(template: TemplateName) {
  switch (template) {
    case "next":
      return "components";
    case "react-router":
      return "app/components";
    case "vite":
    case "start":
    case "astro":
      return "src/components";
  }
}

function libRoot(template: TemplateName) {
  switch (template) {
    case "next":
      return "lib";
    case "react-router":
      return "app/lib";
    case "vite":
    case "start":
    case "astro":
      return "src/lib";
  }
}

function debugPanelFiles(projectDir: string, template: TemplateName) {
  const components = componentRoot(template);
  return [path.join(projectDir, components, "debug-panel.tsx")];
}

function removeDebugPanelMount(projectDir: string, template: TemplateName) {
  const mountTargets: Record<TemplateName, { file: string; importMatch: RegExp; jsxMatch: RegExp }> =
    {
      vite: {
        file: "src/main.tsx",
        importMatch: /import \{ DebugPanel \} from "\.\/components\/debug-panel\.tsx"\r?\n/,
        jsxMatch: / *\{import\.meta\.env\.DEV \? <DebugPanel \/> : null\}\r?\n/,
      },
      next: {
        file: "app/layout.tsx",
        importMatch: /import \{ DebugPanel \} from "@\/components\/debug-panel"\r?\n/,
        jsxMatch: /\{process\.env\.NODE_ENV === "development" \? <DebugPanel \/> : null\}/,
      },
      start: {
        file: "src/routes/__root.tsx",
        importMatch: /import \{ DebugPanel \} from "\.\.\/components\/debug-panel"\r?\n/,
        jsxMatch: /\{import\.meta\.env\.DEV \? <DebugPanel \/> : null\}/,
      },
      "react-router": {
        file: "app/root.tsx",
        importMatch: /import \{ DebugPanel \} from "\.\/components\/debug-panel"\r?\n/,
        jsxMatch: / *\{import\.meta\.env\.DEV \? <DebugPanel \/> : null\}\r?\n/,
      },
      astro: {
        file: "src/layouts/main.astro",
        importMatch: /import \{ DebugPanel \} from "@\/components\/debug-panel"\r?\n/,
        jsxMatch: /\{import\.meta\.env\.DEV \? <DebugPanel client:load \/> : null\}/,
      },
    };

  const target = mountTargets[template];
  const filePath = path.join(projectDir, target.file);

  if (!fs.existsSync(filePath)) return;

  editFile(filePath, (content) =>
    content.replace(target.importMatch, "").replace(target.jsxMatch, ""),
  );
}

function removeLogPermission(projectDir: string) {
  const capabilityPath = path.join(projectDir, "src-tauri/capabilities/default.json");

  if (!fs.existsSync(capabilityPath)) return;

  editJson<{ permissions?: unknown[] }>(capabilityPath, (config) => {
    if (Array.isArray(config.permissions)) {
      config.permissions = config.permissions.filter((entry) => entry !== "log:default");
    }

    return config;
  });
}

export const BATTERIES: Record<BatteryId, BatteryDefinition> = {
  "debug-panel": {
    id: "debug-panel",
    name: "Development debug panel",
    description: "Dev-only inspector for state, window, host diagnostics, invokes, events, logs.",
    detectFiles(projectDir, template) {
      return debugPanelFiles(projectDir, template).filter((file) => fs.existsSync(file));
    },
    async apply(projectDir, options) {
      await applyDebugPanel(projectDir, options);
    },
    remove(projectDir, options) {
      const removed: string[] = [];
      const files = debugPanelFiles(projectDir, options.template);

      for (const file of files) {
        if (fs.existsSync(file)) {
          fs.rmSync(file);
          removed.push(path.relative(projectDir, file));
        }
      }

      removeDebugPanelMount(projectDir, options.template);
      removeLogPermission(projectDir);

      return {
        removed,
        manual: [
          "src/lib/debug-events.ts and src/lib/tauri.ts are shared with the invoke-example battery — leave them in place unless you also remove invoke-example",
          "src-tauri/Cargo.toml — remove `tauri-plugin-log` and `log` dependencies if unused",
          "src-tauri/src/lib.rs — remove the `tauri_plugin_log` import and `.plugin(...)` registration if unused",
          "package.json — remove `@tauri-apps/plugin-log` if unused",
          "run `bun install` and `cargo check` in src-tauri/ to confirm",
        ],
      };
    },
  },
  workflow: {
    id: "workflow",
    name: "GitHub release workflow",
    description: "GitHub Actions workflow that builds and publishes a release per platform.",
    detectFiles(projectDir) {
      const file = path.join(projectDir, ".github/workflows/release.yml");
      return fs.existsSync(file) ? [file] : [];
    },
    async apply(projectDir, options) {
      await applyWorkflow(projectDir, options);
    },
    remove(projectDir) {
      const removed: string[] = [];
      const file = path.join(projectDir, ".github/workflows/release.yml");

      if (fs.existsSync(file)) {
        fs.rmSync(file);
        removed.push(path.relative(projectDir, file));
      }

      return { removed, manual: [] };
    },
  },
};

export function getBattery(id: string): BatteryDefinition {
  const battery = BATTERIES[id as BatteryId];

  if (!battery) {
    throw new Error(
      `Unknown battery "${id}". Available: ${Object.keys(BATTERIES).join(", ")}`,
    );
  }

  return battery;
}

export function listBatteries(): BatteryDefinition[] {
  return Object.values(BATTERIES);
}

export function getStatus(
  battery: BatteryDefinition,
  projectDir: string,
  template: TemplateName,
): BatteryStatus {
  const detectedFiles = battery.detectFiles(projectDir, template);

  return {
    installed: detectedFiles.length > 0,
    detectedFiles,
  };
}
