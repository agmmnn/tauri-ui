import path from "node:path";

import type { ProjectOptions } from "../types";
import { PatchError, editFile } from "../utils";

const SCROLL_CONTAINER_ATTRIBUTE = "data-ui-scroll-container";

const BASE_SCROLL_CSS = `
/* Disable page-level overscroll and rubber-band scrolling so the UI feels more desktop-native. */
html,
body {
  height: 100%;
}

body {
  overflow: hidden;
}

/* Scope the desktop scroll shell to the generated root container only. */
[${SCROLL_CONTAINER_ATTRIBUTE}] {
  height: 100vh;
  height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: none;
}
`;

const VITE_ROOT_SCROLL_CSS = `
/* Vite mounts into #root, so it needs to inherit the full-height desktop shell. */
#root {
  height: 100%;
}
`;

function ensureCssSnippet(filePath: string, snippet: string) {
  editFile(filePath, (content) => {
    if (content.includes("Disable page-level overscroll and rubber-band scrolling")) {
      return content;
    }

    return `${content.trimEnd()}\n${snippet}`;
  });
}

function ensureMainWrapper(filePath: string, matcher: string | RegExp, replacement: string) {
  editFile(filePath, (content) => {
    if (content.includes(`<main ${SCROLL_CONTAINER_ATTRIBUTE}>`)) {
      return content;
    }

    const upgradedContent = content.replace(
      new RegExp(`<main(?![^>]*${SCROLL_CONTAINER_ATTRIBUTE})([^>]*)>`),
      `<main ${SCROLL_CONTAINER_ATTRIBUTE}$1>`,
    );

    if (upgradedContent !== content) {
      return upgradedContent;
    }

    const nextContent = content.replace(matcher, replacement);

    if (nextContent === content) {
      throw new PatchError(filePath, "Could not insert the scroll container <main> wrapper.");
    }

    return nextContent;
  });
}

export async function applyScrollContainer(projectDir: string, options: ProjectOptions) {
  switch (options.template) {
    case "next":
      ensureCssSnippet(path.join(projectDir, "app/globals.css"), BASE_SCROLL_CSS);
      ensureMainWrapper(
        path.join(projectDir, "app/layout.tsx"),
        /\{children\}/,
        `<main ${SCROLL_CONTAINER_ATTRIBUTE}>{children}</main>`,
      );
      return;
    case "vite":
      ensureCssSnippet(
        path.join(projectDir, "src/index.css"),
        `${BASE_SCROLL_CSS}${VITE_ROOT_SCROLL_CSS}`,
      );
      ensureMainWrapper(
        path.join(projectDir, "src/main.tsx"),
        /<App \/>/,
        `<main ${SCROLL_CONTAINER_ATTRIBUTE}><App /></main>`,
      );
      return;
    case "start":
      ensureCssSnippet(path.join(projectDir, "src/styles.css"), BASE_SCROLL_CSS);
      ensureMainWrapper(
        path.join(projectDir, "src/routes/__root.tsx"),
        /\{children\}/,
        `<main ${SCROLL_CONTAINER_ATTRIBUTE}>{children}</main>`,
      );
      return;
    case "react-router":
      ensureCssSnippet(path.join(projectDir, "app/app.css"), BASE_SCROLL_CSS);
      ensureMainWrapper(
        path.join(projectDir, "app/root.tsx"),
        /return <Outlet \/>/,
        `return <main ${SCROLL_CONTAINER_ATTRIBUTE}><Outlet /></main>`,
      );
      return;
    case "astro":
      ensureCssSnippet(path.join(projectDir, "src/styles/global.css"), BASE_SCROLL_CSS);
      ensureMainWrapper(
        path.join(projectDir, "src/layouts/main.astro"),
        /<slot \/>/,
        `<main ${SCROLL_CONTAINER_ATTRIBUTE}><slot /></main>`,
      );
      return;
    default:
      throw new PatchError(
        projectDir,
        `No scroll container battery implementation exists for template "${options.template}".`,
      );
  }
}
