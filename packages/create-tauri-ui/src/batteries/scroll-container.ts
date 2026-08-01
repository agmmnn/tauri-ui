import path from "node:path";

import type { ProjectOptions } from "../types";
import { PatchError, editFile } from "../utils";

const SCROLL_CONTAINER_ATTRIBUTE = "data-ui-scroll-container";

const NATIVE_COLOR_SCHEME_CSS = `
/* Keep native WebView controls, including scrollbars, in sync with the app theme. */
html {
  color-scheme: light;
}

html.dark {
  color-scheme: dark;
}
`;

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

function ensureCssSnippet(filePath: string, snippet: string, marker: string) {
  editFile(filePath, (content) => {
    if (content.includes(marker)) {
      return content;
    }

    return `${content.trimEnd()}\n${snippet}`;
  });
}

function ensureScrollCss(filePath: string, rootCss = "") {
  ensureCssSnippet(
    filePath,
    NATIVE_COLOR_SCHEME_CSS,
    "Keep native WebView controls, including scrollbars, in sync with the app theme",
  );
  ensureCssSnippet(
    filePath,
    `${BASE_SCROLL_CSS}${rootCss}`,
    "Disable page-level overscroll and rubber-band scrolling",
  );
}

function ensureMainWrapper(filePath: string, matcher: string | RegExp, replacement: string) {
  editFile(filePath, (content) => {
    if (content.includes(`<main ${SCROLL_CONTAINER_ATTRIBUTE}>`)) {
      return content;
    }

    const wrappedContent = content.replace(matcher, replacement);

    if (wrappedContent !== content) {
      return wrappedContent;
    }

    const upgradedContent = content.replace(
      new RegExp(`<main(?![^>]*${SCROLL_CONTAINER_ATTRIBUTE})([^>]*)>`),
      `<main ${SCROLL_CONTAINER_ATTRIBUTE}$1>`,
    );

    if (upgradedContent === content) {
      throw new PatchError(filePath, "Could not insert the scroll container <main> wrapper.");
    }

    return upgradedContent;
  });
}

export async function applyScrollContainer(projectDir: string, options: ProjectOptions) {
  switch (options.template) {
    case "next":
      ensureScrollCss(path.join(projectDir, "app/globals.css"));
      ensureMainWrapper(
        path.join(projectDir, "app/layout.tsx"),
        /\{children\}/,
        `<main ${SCROLL_CONTAINER_ATTRIBUTE}>{children}</main>`,
      );
      return;
    case "vite":
      ensureScrollCss(path.join(projectDir, "src/index.css"), VITE_ROOT_SCROLL_CSS);
      ensureMainWrapper(
        path.join(projectDir, "src/main.tsx"),
        /<App \/>/,
        `<main ${SCROLL_CONTAINER_ATTRIBUTE}><App /></main>`,
      );
      return;
    case "start":
      ensureScrollCss(path.join(projectDir, "src/styles.css"));
      ensureMainWrapper(
        path.join(projectDir, "src/routes/__root.tsx"),
        /\{children\}/,
        `<main ${SCROLL_CONTAINER_ATTRIBUTE}>{children}</main>`,
      );
      return;
    case "react-router":
      ensureScrollCss(path.join(projectDir, "app/app.css"));
      ensureMainWrapper(
        path.join(projectDir, "app/root.tsx"),
        /return <Outlet \/>/,
        `return <main ${SCROLL_CONTAINER_ATTRIBUTE}><Outlet /></main>`,
      );
      return;
    case "astro":
      ensureScrollCss(path.join(projectDir, "src/styles/global.css"));
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
