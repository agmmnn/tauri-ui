import path from "node:path";

import type { ProjectOptions } from "../types";
import { PatchError, editFile } from "../utils";

const SELECTION_BEHAVIOR_CSS = `
@layer base {
  body {
    @apply select-none;
  }

  input,
  textarea,
  [contenteditable="true"],
  pre,
  code {
    @apply select-text;
  }
}

@layer utilities {
  .ui-selectable {
    @apply select-text;
  }
}
`;

function ensureCssSnippet(filePath: string, snippet: string) {
  editFile(filePath, (content) => {
    if (content.includes(".ui-selectable")) {
      return content;
    }

    return `${content.trimEnd()}\n${snippet}`;
  });
}

export async function applySelectionBehavior(projectDir: string, options: ProjectOptions) {
  switch (options.template) {
    case "next":
      ensureCssSnippet(path.join(projectDir, "app/globals.css"), SELECTION_BEHAVIOR_CSS);
      return;
    case "vite":
      ensureCssSnippet(path.join(projectDir, "src/index.css"), SELECTION_BEHAVIOR_CSS);
      return;
    case "start":
      ensureCssSnippet(path.join(projectDir, "src/styles.css"), SELECTION_BEHAVIOR_CSS);
      return;
    case "react-router":
      ensureCssSnippet(path.join(projectDir, "app/app.css"), SELECTION_BEHAVIOR_CSS);
      return;
    case "astro":
      ensureCssSnippet(path.join(projectDir, "src/styles/global.css"), SELECTION_BEHAVIOR_CSS);
      return;
    default:
      throw new PatchError(
        projectDir,
        `No selection behavior battery implementation exists for template "${options.template}".`,
      );
  }
}
