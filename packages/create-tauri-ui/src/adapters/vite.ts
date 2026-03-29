import path from "node:path";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { PatchError, editFile } from "../utils";

function insertServerBlock(content: string) {
  if (content.includes("strictPort: true")) {
    return content;
  }

  const closingIndex = content.lastIndexOf("\n})");

  if (closingIndex === -1) {
    throw new PatchError("vite.config.ts", "Could not find the Vite config closing brace.");
  }

  return `${content.slice(0, closingIndex)}
  server: {
    port: 1420,
    strictPort: true,
  },${content.slice(closingIndex)}`;
}

export const viteAdapter: TemplateAdapter = {
  name: "vite",
  async apply(projectDir: string, _options: ProjectOptions) {
    editFile(path.join(projectDir, "vite.config.ts"), insertServerBlock);
  },
  tauriConfig() {
    return {
      frontendDist: "../dist",
      devUrl: "http://localhost:1420",
      beforeDevCommand: "bun run dev",
      beforeBuildCommand: "bun run build",
    };
  },
};
