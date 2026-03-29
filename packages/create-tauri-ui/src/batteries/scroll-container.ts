import path from "node:path";

import type { ProjectOptions } from "../types";
import { PatchError, editFile } from "../utils";

const BASE_SCROLL_CSS = `
html,
body {
  height: 100%;
  overscroll-behavior: none;
}

body {
  overflow: hidden;
}

main {
  height: 100%;
  overflow: auto;
  overscroll-behavior: none;
}
`;

const VITE_ROOT_SCROLL_CSS = `
#root {
  height: 100%;
}
`;

function ensureCssSnippet(filePath: string, snippet: string) {
  editFile(filePath, (content) => {
    if (content.includes("overscroll-behavior: none;")) {
      return content;
    }

    return `${content.trimEnd()}\n${snippet}`;
  });
}

function ensureMainWrapper(filePath: string, matcher: string | RegExp, replacement: string) {
  editFile(filePath, (content) => {
    if (content.includes("<main>")) {
      return content;
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
        "<main>{children}</main>",
      );
      return;
    case "vite":
      ensureCssSnippet(
        path.join(projectDir, "src/index.css"),
        `${BASE_SCROLL_CSS}${VITE_ROOT_SCROLL_CSS}`,
      );
      ensureMainWrapper(path.join(projectDir, "src/main.tsx"), /<App \/>/, "<main><App /></main>");
      return;
    case "start":
      ensureCssSnippet(path.join(projectDir, "src/styles.css"), BASE_SCROLL_CSS);
      ensureMainWrapper(
        path.join(projectDir, "src/routes/__root.tsx"),
        /\{children\}/,
        "<main>{children}</main>",
      );
      return;
    case "react-router":
      ensureCssSnippet(path.join(projectDir, "app/app.css"), BASE_SCROLL_CSS);
      ensureMainWrapper(
        path.join(projectDir, "app/root.tsx"),
        /return <Outlet \/>/,
        "return <main><Outlet /></main>",
      );
      return;
    case "astro":
      ensureCssSnippet(path.join(projectDir, "src/styles/global.css"), BASE_SCROLL_CSS);
      ensureMainWrapper(
        path.join(projectDir, "src/layouts/main.astro"),
        /<slot \/>/,
        "<main><slot /></main>",
      );
      return;
    default:
      throw new PatchError(
        projectDir,
        `No scroll container battery implementation exists for template "${options.template}".`,
      );
  }
}
