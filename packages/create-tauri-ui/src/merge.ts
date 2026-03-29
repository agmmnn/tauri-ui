import path from "node:path";

import type { ProjectOptions, TauriBuildConfig } from "./types";
import { copyDir, editFile, editJson, toRustPackageName } from "./utils";

const DEFAULT_WINDOW_WIDTH = 1400;
const DEFAULT_WINDOW_HEIGHT = 918;

export async function mergeTauri(
  projectDir: string,
  tauriProjectDir: string,
  options: ProjectOptions,
) {
  copyDir(path.join(tauriProjectDir, "src-tauri"), path.join(projectDir, "src-tauri"));

  editJson<Record<string, any>>(path.join(projectDir, "package.json"), (pkg) => {
    pkg.name = options.packageName;
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies["@tauri-apps/api"] = "^2";
    pkg.dependencies["@tauri-apps/plugin-opener"] = "^2";

    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies["@tauri-apps/cli"] = "^2";

    pkg.scripts = pkg.scripts || {};
    pkg.scripts.tauri = "tauri";

    return pkg;
  });

  const rustPackageName = toRustPackageName(options.packageName);
  const rustLibName = `${rustPackageName}_lib`;

  editFile(path.join(projectDir, "src-tauri/Cargo.toml"), (content) =>
    content
      .replace(/^name = "tauri-app"$/m, `name = "${rustPackageName}"`)
      .replace(/^name = "tauri_app_lib"$/m, `name = "${rustLibName}"`),
  );

  editFile(path.join(projectDir, "src-tauri/src/main.rs"), (content) =>
    content.replace("tauri_app_lib::run()", `${rustLibName}::run()`),
  );
}

export async function applyTauriConfig(
  projectDir: string,
  options: ProjectOptions,
  buildConfig: TauriBuildConfig,
) {
  editJson<Record<string, any>>(path.join(projectDir, "src-tauri/tauri.conf.json"), (config) => {
    config.productName = options.projectName;
    config.identifier = options.identifier;
    config.build = {
      ...config.build,
      ...buildConfig,
    };

    config.app = config.app || {};
    config.app.windows = Array.isArray(config.app.windows) ? config.app.windows : [{}];

    const mainWindow = config.app.windows[0] || {};
    config.app.windows[0] = {
      ...mainWindow,
      title: options.projectName,
      center: true,
      width: DEFAULT_WINDOW_WIDTH,
      height: DEFAULT_WINDOW_HEIGHT,
    };

    return config;
  });
}
