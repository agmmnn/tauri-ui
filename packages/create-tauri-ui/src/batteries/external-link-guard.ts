import fs from "node:fs";
import path from "node:path";

import type { ProjectOptions } from "../types";
import { PatchError, editFile } from "../utils";

const OPENER_IMPORT = "use tauri_plugin_opener::OpenerExt;";

const EXTERNAL_NAVIGATION_PLUGIN = `fn external_navigation_plugin<R: tauri::Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::<R>::new("external-navigation")
        .on_navigation(|webview, url| {
            let is_internal_host = matches!(
                url.host_str(),
                Some("localhost") | Some("127.0.0.1") | Some("tauri.localhost") | Some("::1")
            );

            let is_internal = url.scheme() == "tauri" || is_internal_host;

            if is_internal {
                return true;
            }

            let is_external_link = matches!(url.scheme(), "http" | "https" | "mailto" | "tel");

            if is_external_link {
                let _ = webview.opener().open_url(url.as_str(), None::<&str>);
                return false;
            }

            true
        })
        .build()
}

`;

const EXTERNAL_LINK_GUARD_COMPONENT = `"use client"

import { useEffect } from "react"

const DEBUG_EVENT_NAME = "ctui:debug"
const EXTERNAL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"])

function isModifiedClick(event: MouseEvent) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
}

function shouldOpenExternally(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href")

  if (!href || href.startsWith("#") || anchor.hasAttribute("download")) {
    return false
  }

  try {
    const url = new URL(anchor.href, window.location.href)

    if (!EXTERNAL_PROTOCOLS.has(url.protocol)) {
      return false
    }

    if (url.protocol === "mailto:" || url.protocol === "tel:") {
      return true
    }

    return url.origin !== window.location.origin
  } catch {
    return false
  }
}

async function openExternalLink(href: string) {
  const { openUrl } = await import("@tauri-apps/plugin-opener")
  await openUrl(href)
}

function emitExternalLinkDebugEvent(href: string) {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new CustomEvent(DEBUG_EVENT_NAME, {
      detail: {
        id: crypto.randomUUID(),
        kind: "external-link",
        href,
        timestamp: new Date().toISOString(),
      },
    })
  )
}

export function ExternalLinkGuard() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (isModifiedClick(event)) {
        return
      }

      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest("a[href]")

      if (!(anchor instanceof HTMLAnchorElement)) {
        return
      }

      if (!shouldOpenExternally(anchor)) {
        return
      }

      event.preventDefault()
      emitExternalLinkDebugEvent(anchor.href)
      void openExternalLink(anchor.href)
    }

    document.addEventListener("click", handleClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [])

  return null
}
`;

function writeGuardComponent(componentPath: string) {
  fs.mkdirSync(path.dirname(componentPath), { recursive: true });
  fs.writeFileSync(componentPath, EXTERNAL_LINK_GUARD_COMPONENT, "utf-8");
}

function ensureRustNavigationGuard(projectDir: string) {
  const libPath = path.join(projectDir, "src-tauri/src/lib.rs");

  editFile(libPath, (content) => {
    let nextContent = content;

    if (!nextContent.includes(OPENER_IMPORT)) {
      if (nextContent.includes("use tauri::webview::PageLoadEvent;\n")) {
        nextContent = nextContent.replace(
          "use tauri::webview::PageLoadEvent;\n",
          `use tauri::webview::PageLoadEvent;\n${OPENER_IMPORT}\n`,
        );
      } else {
        nextContent = `${OPENER_IMPORT}\n${nextContent}`;
      }
    }

    if (!nextContent.includes("fn external_navigation_plugin<R: tauri::Runtime>()")) {
      if (!nextContent.includes("#[cfg_attr(mobile, tauri::mobile_entry_point)]")) {
        throw new PatchError(
          libPath,
          "Could not find the Tauri entry point while inserting the external navigation plugin.",
        );
      }

      nextContent = nextContent.replace(
        "#[cfg_attr(mobile, tauri::mobile_entry_point)]",
        `${EXTERNAL_NAVIGATION_PLUGIN}#[cfg_attr(mobile, tauri::mobile_entry_point)]`,
      );
    }

    if (!nextContent.includes(".plugin(external_navigation_plugin())")) {
      if (!nextContent.includes(".plugin(tauri_plugin_opener::init())")) {
        throw new PatchError(
          libPath,
          "Could not find the opener plugin while inserting the external navigation guard.",
        );
      }

      nextContent = nextContent.replace(
        "        .plugin(tauri_plugin_opener::init())\n",
        "        .plugin(tauri_plugin_opener::init())\n        .plugin(external_navigation_plugin())\n",
      );
    }

    return nextContent;
  });
}

function patchVite(projectDir: string) {
  const componentPath = path.join(projectDir, "src/components/external-link-guard.tsx");
  const mainPath = path.join(projectDir, "src/main.tsx");

  writeGuardComponent(componentPath);

  editFile(mainPath, (content) => {
    let nextContent = content;

    if (
      !nextContent.includes(
        'import { ExternalLinkGuard } from "./components/external-link-guard.tsx"',
      )
    ) {
      nextContent = nextContent.replace(
        'import { ThemeProvider } from "@/components/theme-provider.tsx"\n',
        'import { ThemeProvider } from "@/components/theme-provider.tsx"\nimport { ExternalLinkGuard } from "./components/external-link-guard.tsx"\n',
      );
    }

    if (nextContent.includes("<ExternalLinkGuard />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      "<ThemeProvider>\n      <main><App /></main>",
      "<ThemeProvider>\n      <ExternalLinkGuard />\n      <main><App /></main>",
    );

    if (patchedContent === nextContent) {
      throw new PatchError(mainPath, "Could not mount ExternalLinkGuard in the Vite entrypoint.");
    }

    return patchedContent;
  });
}

function patchNext(projectDir: string) {
  const componentPath = path.join(projectDir, "components/external-link-guard.tsx");
  const layoutPath = path.join(projectDir, "app/layout.tsx");

  writeGuardComponent(componentPath);

  editFile(layoutPath, (content) => {
    let nextContent = content;

    if (
      !nextContent.includes('import { ExternalLinkGuard } from "@/components/external-link-guard"')
    ) {
      if (nextContent.includes('import { TooltipProvider } from "@/components/ui/tooltip"\n')) {
        nextContent = nextContent.replace(
          'import { TooltipProvider } from "@/components/ui/tooltip"\n',
          'import { TooltipProvider } from "@/components/ui/tooltip"\nimport { ExternalLinkGuard } from "@/components/external-link-guard"\n',
        );
      } else {
        nextContent = nextContent.replace(
          'import { ThemeProvider } from "@/components/theme-provider"\n',
          'import { ThemeProvider } from "@/components/theme-provider"\nimport { ExternalLinkGuard } from "@/components/external-link-guard"\n',
        );
      }
    }

    if (nextContent.includes("<ExternalLinkGuard />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      "<main>{children}</main>",
      "<main><ExternalLinkGuard />{children}</main>",
    );

    if (patchedContent === nextContent) {
      throw new PatchError(layoutPath, "Could not mount ExternalLinkGuard in the Next.js layout.");
    }

    return patchedContent;
  });
}

function patchStart(projectDir: string) {
  const componentPath = path.join(projectDir, "src/components/external-link-guard.tsx");
  const rootPath = path.join(projectDir, "src/routes/__root.tsx");

  writeGuardComponent(componentPath);

  editFile(rootPath, (content) => {
    let nextContent = content;

    if (
      !nextContent.includes('import { ExternalLinkGuard } from "../components/external-link-guard"')
    ) {
      nextContent = nextContent.replace(
        'import appCss from "../styles.css?url"\n',
        'import appCss from "../styles.css?url"\nimport { ExternalLinkGuard } from "../components/external-link-guard"\n',
      );
    }

    if (nextContent.includes("<ExternalLinkGuard />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      "<main>{children}</main>",
      "<main><ExternalLinkGuard />{children}</main>",
    );

    if (patchedContent === nextContent) {
      throw new PatchError(
        rootPath,
        "Could not mount ExternalLinkGuard in the TanStack Start root route.",
      );
    }

    return patchedContent;
  });
}

function patchReactRouter(projectDir: string) {
  const componentPath = path.join(projectDir, "app/components/external-link-guard.tsx");
  const rootPath = path.join(projectDir, "app/root.tsx");

  writeGuardComponent(componentPath);

  editFile(rootPath, (content) => {
    let nextContent = content;

    if (
      !nextContent.includes('import { ExternalLinkGuard } from "./components/external-link-guard"')
    ) {
      nextContent = nextContent.replace(
        'import "./app.css"\n',
        'import "./app.css"\nimport { ExternalLinkGuard } from "./components/external-link-guard"\n',
      );
    }

    if (nextContent.includes("<ExternalLinkGuard />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      "<body>\n        {children}",
      "<body>\n        <ExternalLinkGuard />\n        {children}",
    );

    if (patchedContent === nextContent) {
      throw new PatchError(
        rootPath,
        "Could not mount ExternalLinkGuard in the React Router root layout.",
      );
    }

    return patchedContent;
  });
}

function patchAstro(projectDir: string) {
  const componentPath = path.join(projectDir, "src/components/external-link-guard.tsx");
  const layoutPath = path.join(projectDir, "src/layouts/main.astro");

  writeGuardComponent(componentPath);

  editFile(layoutPath, (content) => {
    let nextContent = content;

    if (
      !nextContent.includes('import { ExternalLinkGuard } from "@/components/external-link-guard"')
    ) {
      nextContent = nextContent.replace(
        'import "@/styles/global.css"\n',
        'import "@/styles/global.css"\nimport { ExternalLinkGuard } from "@/components/external-link-guard"\n',
      );
    }

    if (nextContent.includes("<ExternalLinkGuard client:load />")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      "  <body>\n    <main><slot /></main>\n  </body>",
      "  <body>\n    <main><ExternalLinkGuard client:load /><slot /></main>\n  </body>",
    );

    if (patchedContent === nextContent) {
      throw new PatchError(layoutPath, "Could not mount ExternalLinkGuard in the Astro layout.");
    }

    return patchedContent;
  });
}

export async function applyExternalLinkGuard(projectDir: string, options: ProjectOptions) {
  ensureRustNavigationGuard(projectDir);

  switch (options.template) {
    case "vite":
      patchVite(projectDir);
      return;
    case "next":
      patchNext(projectDir);
      return;
    case "start":
      patchStart(projectDir);
      return;
    case "react-router":
      patchReactRouter(projectDir);
      return;
    case "astro":
      patchAstro(projectDir);
      return;
  }
}
