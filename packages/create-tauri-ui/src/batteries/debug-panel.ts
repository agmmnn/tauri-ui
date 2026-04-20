import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { addShadcnComponent } from "../scaffold";
import type { ProjectOptions } from "../types";
import { PatchError, editFile, editJson } from "../utils";

const LOG_PLUGIN_IMPORT = "use tauri_plugin_log::{Target, TargetKind};";
const GREET_LOG_STATEMENT = '    log::info!("greet command executed for {}", name);\n';
const EXTERNAL_LINK_LOG_STATEMENT =
  '                log::info!("opening external link in system browser: {}", url);\n';
const PAGE_LOAD_LOG_STATEMENT = '                log::info!("main webview finished loading");\n';

const LOG_PLUGIN_INIT = `        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
`;

function resolveAssetsDir() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(moduleDir, "../assets/debug-panel"),
    path.resolve(moduleDir, "../../assets/debug-panel"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}

const ASSETS_DIR = resolveAssetsDir();

function aliasPrefix(template: ProjectOptions["template"]) {
  return template === "react-router" ? "~/" : "@/";
}

function componentDir(projectDir: string, options: ProjectOptions) {
  switch (options.template) {
    case "next":
      return path.join(projectDir, "components");
    case "vite":
    case "start":
    case "astro":
      return path.join(projectDir, "src/components");
    case "react-router":
      return path.join(projectDir, "app/components");
  }
}

function libDir(projectDir: string, options: ProjectOptions) {
  switch (options.template) {
    case "next":
      return path.join(projectDir, "lib");
    case "vite":
    case "start":
    case "astro":
      return path.join(projectDir, "src/lib");
    case "react-router":
      return path.join(projectDir, "app/lib");
  }
}

function uiDir(projectDir: string, options: ProjectOptions) {
  return path.join(componentDir(projectDir, options), "ui");
}

function componentImportPath(options: ProjectOptions) {
  switch (options.template) {
    case "next":
      return "@/components/debug-panel";
    case "vite":
      return "./components/debug-panel.tsx";
    case "start":
      return "../components/debug-panel";
    case "react-router":
      return "./components/debug-panel";
    case "astro":
      return "@/components/debug-panel";
  }
}

async function ensureUiComponents(projectDir: string, options: ProjectOptions) {
  for (const component of ["button", "badge", "dropdown-menu", "tabs", "tooltip"]) {
    const componentPath = path.join(uiDir(projectDir, options), `${component}.tsx`);

    if (fs.existsSync(componentPath)) {
      continue;
    }

    await addShadcnComponent(projectDir, component);
  }
}

function readAsset(fileName: string) {
  return fs.readFileSync(path.join(ASSETS_DIR, fileName), "utf-8");
}

function writeDebugFiles(projectDir: string, options: ProjectOptions) {
  const componentPath = path.join(componentDir(projectDir, options), "debug-panel.tsx");
  const sharedLibDir = libDir(projectDir, options);

  fs.mkdirSync(path.dirname(componentPath), { recursive: true });
  fs.mkdirSync(sharedLibDir, { recursive: true });

  fs.writeFileSync(
    componentPath,
    readAsset("debug-panel.tsx.tmpl").split("__ALIAS_PREFIX__").join(aliasPrefix(options.template)),
    "utf-8",
  );

  fs.writeFileSync(
    path.join(sharedLibDir, "debug-events.ts"),
    readAsset("debug-events.ts.tmpl"),
    "utf-8",
  );
  fs.writeFileSync(path.join(sharedLibDir, "tauri.ts"), readAsset("tauri.ts.tmpl"), "utf-8");
}

function ensureJsLogDependency(projectDir: string) {
  editJson<Record<string, any>>(path.join(projectDir, "package.json"), (pkg) => {
    pkg.dependencies = pkg.dependencies || {};

    if (!pkg.dependencies["@tauri-apps/plugin-log"]) {
      pkg.dependencies["@tauri-apps/plugin-log"] = "^2";
    }

    return pkg;
  });
}

function ensureCargoDependency(content: string, dependencyLine: string) {
  if (content.includes(dependencyLine)) {
    return content;
  }

  const dependenciesHeader = /\[dependencies\]\r?\n/;

  if (!dependenciesHeader.test(content)) {
    throw new Error(`Could not find [dependencies] while inserting ${dependencyLine}.`);
  }

  return content.replace(dependenciesHeader, `[dependencies]\n${dependencyLine}\n`);
}

function ensureRustLogPlugin(projectDir: string) {
  const cargoPath = path.join(projectDir, "src-tauri/Cargo.toml");
  const libPath = path.join(projectDir, "src-tauri/src/lib.rs");

  editFile(cargoPath, (content) => {
    let nextContent = content;

    nextContent = ensureCargoDependency(nextContent, 'tauri-plugin-log = "2"');
    nextContent = ensureCargoDependency(nextContent, 'log = "0.4"');

    return nextContent;
  });

  editJson<Record<string, any>>(
    path.join(projectDir, "src-tauri/capabilities/default.json"),
    (config) => {
      config.permissions = Array.isArray(config.permissions) ? config.permissions : [];

      if (!config.permissions.includes("log:default")) {
        config.permissions.push("log:default");
      }

      return config;
    },
  );

  editFile(libPath, (content) => {
    let nextContent = content;

    if (!nextContent.includes(LOG_PLUGIN_IMPORT)) {
      if (nextContent.includes("use tauri_plugin_opener::OpenerExt;\n")) {
        nextContent = nextContent.replace(
          "use tauri_plugin_opener::OpenerExt;\n",
          `use tauri_plugin_opener::OpenerExt;\n${LOG_PLUGIN_IMPORT}\n`,
        );
      } else if (nextContent.includes("use tauri::webview::PageLoadEvent;\n")) {
        nextContent = nextContent.replace(
          "use tauri::webview::PageLoadEvent;\n",
          `use tauri::webview::PageLoadEvent;\n${LOG_PLUGIN_IMPORT}\n`,
        );
      } else {
        nextContent = `${LOG_PLUGIN_IMPORT}\n${nextContent}`;
      }
    }

    if (nextContent.includes("tauri_plugin_log::Builder::new()")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      "    tauri::Builder::default()\n",
      `    tauri::Builder::default()\n${LOG_PLUGIN_INIT}`,
    );

    if (patchedContent === nextContent) {
      throw new PatchError(libPath, "Could not register the Tauri log plugin.");
    }

    nextContent = patchedContent;

    if (
      !nextContent.includes(GREET_LOG_STATEMENT.trim()) &&
      nextContent.includes(
        '    let message = format!("Hello, {}! You\'ve been greeted from Rust!", name);\n',
      )
    ) {
      nextContent = nextContent.replace(
        '    let message = format!("Hello, {}! You\'ve been greeted from Rust!", name);\n',
        `    let message = format!("Hello, {}! You've been greeted from Rust!", name);\n${GREET_LOG_STATEMENT}`,
      );
    }

    if (
      !nextContent.includes(EXTERNAL_LINK_LOG_STATEMENT.trim()) &&
      nextContent.includes(
        "                let _ = webview.opener().open_url(url.as_str(), None::<&str>);\n",
      )
    ) {
      nextContent = nextContent.replace(
        "                let _ = webview.opener().open_url(url.as_str(), None::<&str>);\n",
        `${EXTERNAL_LINK_LOG_STATEMENT}                let _ = webview.opener().open_url(url.as_str(), None::<&str>);\n`,
      );
    }

    if (
      !nextContent.includes(PAGE_LOAD_LOG_STATEMENT.trim()) &&
      nextContent.includes("                let _ = webview.window().show();\n")
    ) {
      nextContent = nextContent.replace(
        "                let _ = webview.window().show();\n",
        `${PAGE_LOAD_LOG_STATEMENT}                let _ = webview.window().show();\n`,
      );
    }

    return nextContent;
  });
}

function patchVite(projectDir: string, options: ProjectOptions) {
  const mainPath = path.join(projectDir, "src/main.tsx");
  const importPath = componentImportPath(options);

  editFile(mainPath, (content) => {
    let nextContent = content;

    if (!nextContent.includes(`import { DebugPanel } from "${importPath}"`)) {
      nextContent = nextContent.replace(
        /import { ExternalLinkGuard } from "\.\/components\/external-link-guard\.tsx"\r?\n/,
        `import { ExternalLinkGuard } from "./components/external-link-guard.tsx"\nimport { DebugPanel } from "${importPath}"\n`,
      );
    }

    if (nextContent.includes("<DebugPanel />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      /<ExternalLinkGuard \/>\r?\n(\s*)<main(?:\s+data-ui-scroll-container)?><App \/><\/main>/,
      "<ExternalLinkGuard />\n$1{import.meta.env.DEV ? <DebugPanel /> : null}\n$1<main data-ui-scroll-container><App /></main>",
    );

    if (patchedContent === nextContent) {
      throw new PatchError(mainPath, "Could not mount DebugPanel in the Vite entrypoint.");
    }

    return patchedContent;
  });
}

function patchNext(projectDir: string, options: ProjectOptions) {
  const layoutPath = path.join(projectDir, "app/layout.tsx");
  const importPath = componentImportPath(options);

  editFile(layoutPath, (content) => {
    let nextContent = content;

    if (!nextContent.includes(`import { DebugPanel } from "${importPath}"`)) {
      if (
        nextContent.includes(
          'import { ExternalLinkGuard } from "@/components/external-link-guard"\n',
        )
      ) {
        nextContent = nextContent.replace(
          'import { ExternalLinkGuard } from "@/components/external-link-guard"\n',
          `import { ExternalLinkGuard } from "@/components/external-link-guard"\nimport { DebugPanel } from "${importPath}"\n`,
        );
      } else if (
        nextContent.includes('import { ThemeProvider } from "@/components/theme-provider"\n')
      ) {
        nextContent = nextContent.replace(
          'import { ThemeProvider } from "@/components/theme-provider"\n',
          `import { ThemeProvider } from "@/components/theme-provider"\nimport { DebugPanel } from "${importPath}"\n`,
        );
      }
    }

    if (nextContent.includes("<DebugPanel />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      /<ExternalLinkGuard \/>\{children\}/,
      '<ExternalLinkGuard />{process.env.NODE_ENV === "development" ? <DebugPanel /> : null}{children}',
    );

    if (patchedContent === nextContent) {
      throw new PatchError(layoutPath, "Could not mount DebugPanel in the Next.js layout.");
    }

    return patchedContent;
  });
}

function patchStart(projectDir: string, options: ProjectOptions) {
  const rootPath = path.join(projectDir, "src/routes/__root.tsx");
  const importPath = componentImportPath(options);

  editFile(rootPath, (content) => {
    let nextContent = content;

    if (!nextContent.includes(`import { DebugPanel } from "${importPath}"`)) {
      nextContent = nextContent.replace(
        'import { ExternalLinkGuard } from "../components/external-link-guard"\n',
        `import { ExternalLinkGuard } from "../components/external-link-guard"\nimport { DebugPanel } from "${importPath}"\n`,
      );
    }

    if (nextContent.includes("<DebugPanel />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      /<main(?:\s+data-ui-scroll-container)?><ExternalLinkGuard \/>\{children\}<\/main>/,
      "<main data-ui-scroll-container><ExternalLinkGuard />{import.meta.env.DEV ? <DebugPanel /> : null}{children}</main>",
    );

    if (patchedContent === nextContent) {
      throw new PatchError(
        rootPath,
        "Could not mount DebugPanel in the TanStack Start root route.",
      );
    }

    return patchedContent;
  });
}

function patchReactRouter(projectDir: string, options: ProjectOptions) {
  const rootPath = path.join(projectDir, "app/root.tsx");
  const importPath = componentImportPath(options);

  editFile(rootPath, (content) => {
    let nextContent = content;

    if (!nextContent.includes(`import { DebugPanel } from "${importPath}"`)) {
      nextContent = nextContent.replace(
        'import { ExternalLinkGuard } from "./components/external-link-guard"\n',
        `import { ExternalLinkGuard } from "./components/external-link-guard"\nimport { DebugPanel } from "${importPath}"\n`,
      );
    }

    if (nextContent.includes("<DebugPanel />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      "<ExternalLinkGuard />\n        {children}",
      "<ExternalLinkGuard />\n        {import.meta.env.DEV ? <DebugPanel /> : null}\n        {children}",
    );

    if (patchedContent === nextContent) {
      throw new PatchError(rootPath, "Could not mount DebugPanel in the React Router root layout.");
    }

    return patchedContent;
  });
}

function patchAstro(projectDir: string, options: ProjectOptions) {
  const layoutPath = path.join(projectDir, "src/layouts/main.astro");
  const importPath = componentImportPath(options);

  editFile(layoutPath, (content) => {
    let nextContent = content;

    if (!nextContent.includes(`import { DebugPanel } from "${importPath}"`)) {
      nextContent = nextContent.replace(
        'import { ExternalLinkGuard } from "@/components/external-link-guard"\n',
        `import { ExternalLinkGuard } from "@/components/external-link-guard"\nimport { DebugPanel } from "${importPath}"\n`,
      );
    }

    if (nextContent.includes("<DebugPanel client:load />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      /<main(?:\s+data-ui-scroll-container)?><ExternalLinkGuard client:load \/><slot \/><\/main>/,
      "<main data-ui-scroll-container><ExternalLinkGuard client:load />{import.meta.env.DEV ? <DebugPanel client:load /> : null}<slot /></main>",
    );

    if (patchedContent === nextContent) {
      throw new PatchError(layoutPath, "Could not mount DebugPanel in the Astro layout.");
    }

    return patchedContent;
  });
}

export async function applyDebugPanel(projectDir: string, options: ProjectOptions) {
  await ensureUiComponents(projectDir, options);
  writeDebugFiles(projectDir, options);
  ensureJsLogDependency(projectDir);
  ensureRustLogPlugin(projectDir);

  switch (options.template) {
    case "vite":
      patchVite(projectDir, options);
      return;
    case "next":
      patchNext(projectDir, options);
      return;
    case "start":
      patchStart(projectDir, options);
      return;
    case "react-router":
      patchReactRouter(projectDir, options);
      return;
    case "astro":
      patchAstro(projectDir, options);
      return;
  }
}
