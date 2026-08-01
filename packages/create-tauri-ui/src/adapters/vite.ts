import path from "node:path";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { editFile } from "../utils";
import { patchViteConfig } from "./vite-config";

export const viteAdapter: TemplateAdapter = {
  name: "vite",
  async apply(projectDir: string, _options: ProjectOptions) {
    editFile(path.join(projectDir, "vite.config.ts"), (content) =>
      patchViteConfig(content, "vite.config.ts", "Could not find the Vite config closing brace."),
    );
  },
  tauriConfig() {
    return {
      frontendDist: "../dist",
      devUrl: "http://localhost:3000",
      beforeDevCommand: "bun run dev",
      beforeBuildCommand: "bun run build",
    };
  },
};
