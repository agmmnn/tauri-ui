import path from "node:path";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { PatchError, editFile } from "../utils";

export const astroAdapter: TemplateAdapter = {
  name: "astro",
  async apply(projectDir: string, _options: ProjectOptions) {
    editFile(path.join(projectDir, "astro.config.mjs"), (content) => {
      if (content.includes("server: {")) {
        return content;
      }

      const closingIndex = content.lastIndexOf("\n})");

      if (closingIndex === -1) {
        throw new PatchError("astro.config.mjs", "Could not find the Astro config closing brace.");
      }

      return `${content.slice(0, closingIndex)}
  server: {
    port: 1420,
  },${content.slice(closingIndex)}`;
    });
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
