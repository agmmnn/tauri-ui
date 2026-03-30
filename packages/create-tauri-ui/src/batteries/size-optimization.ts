import path from "node:path";

import type { ProjectOptions } from "../types";
import { editFile, editJson } from "../utils";

const SIZE_OPTIMIZATION_PROFILES = `
[profile.dev]
incremental = true # Compile your binary in smaller steps.

[profile.release]
codegen-units = 1 # Allows LLVM to perform better optimization.
lto = true        # Enables link-time-optimizations.
opt-level = "s"   # Prioritizes small binary size. Use \`3\` if you prefer speed.
panic = "abort"   # Higher performance by disabling panic handlers.
strip = true      # Ensures debug symbols are removed.
`;

function ensureCargoProfiles(projectDir: string) {
  const cargoPath = path.join(projectDir, "src-tauri/Cargo.toml");

  editFile(cargoPath, (content) => {
    if (content.includes("[profile.release]")) {
      return content;
    }

    return `${content.trimEnd()}\n\n${SIZE_OPTIMIZATION_PROFILES}`;
  });
}

function ensureRemoveUnusedCommands(projectDir: string) {
  editJson<Record<string, any>>(path.join(projectDir, "src-tauri/tauri.conf.json"), (config) => {
    config.build = config.build || {};
    config.build.removeUnusedCommands = true;
    return config;
  });
}

export async function applySizeOptimization(projectDir: string, _options: ProjectOptions) {
  ensureCargoProfiles(projectDir);
  ensureRemoveUnusedCommands(projectDir);
}
