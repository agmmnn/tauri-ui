import path from "node:path";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { PatchError, editFile, editJson } from "../utils";

function insertStartServerBlock(content: string) {
  if (content.includes("strictPort: true")) {
    return content;
  }

  const closingIndex = content.lastIndexOf("\n})");

  if (closingIndex === -1) {
    throw new PatchError(
      "vite.config.ts",
      "Could not find the TanStack Start config closing brace.",
    );
  }

  return `${content.slice(0, closingIndex)}
  server: {
    port: 1420,
    strictPort: true,
  },${content.slice(closingIndex)}`;
}

export const startAdapter: TemplateAdapter = {
  name: "start",
  async apply(projectDir: string, _options: ProjectOptions) {
    editFile(path.join(projectDir, "vite.config.ts"), (content) => {
      let nextContent = insertStartServerBlock(content);

      if (!nextContent.includes("tanstackStart({ spa: { enabled: true } })")) {
        if (!nextContent.includes("tanstackStart(),")) {
          throw new PatchError(
            "vite.config.ts",
            "Could not find tanstackStart() in the generated Vite config.",
          );
        }

        nextContent = nextContent.replace(
          "tanstackStart(),",
          "tanstackStart({ spa: { enabled: true } }),",
        );
      }

      return nextContent;
    });

    editJson<Record<string, any>>(path.join(projectDir, "package.json"), (pkg) => {
      if (pkg.scripts?.dev) {
        pkg.scripts.dev = pkg.scripts.dev.replace("--port 3000", "--port 1420");
      }

      return pkg;
    });
  },
  tauriConfig() {
    return {
      frontendDist: "../.output/public",
      devUrl: "http://localhost:1420",
      beforeDevCommand: "bun run dev",
      beforeBuildCommand: "bun run build",
    };
  },
};
