import path from "node:path";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { PatchError, editFile, editJson } from "../utils";
import { patchViteConfig } from "./vite-config";

export const startAdapter: TemplateAdapter = {
  name: "start",
  async apply(projectDir: string, _options: ProjectOptions) {
    editFile(path.join(projectDir, "vite.config.ts"), (content) => {
      let nextContent = patchViteConfig(
        content,
        "vite.config.ts",
        "Could not find the TanStack Start config closing brace.",
      );

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
        pkg.scripts.dev = pkg.scripts.dev.replace("--port 3000", "--port 3000");
      }

      return pkg;
    });
  },
  tauriConfig() {
    return {
      frontendDist: "../.output/public",
      devUrl: "http://localhost:3000",
      beforeDevCommand: "bun run dev",
      beforeBuildCommand: "bun run build",
    };
  },
};
