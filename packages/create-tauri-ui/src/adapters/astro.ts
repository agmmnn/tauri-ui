import path from "node:path";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { PatchError, editFile } from "../utils";

export const astroAdapter: TemplateAdapter = {
  name: "astro",
  async apply(projectDir: string, _options: ProjectOptions) {
    editFile(path.join(projectDir, "astro.config.mjs"), (content) => {
      let nextContent = content.split("__dirname").join("import.meta.dirname");
      const additions: string[] = [];

      if (!nextContent.includes("server: {")) {
        additions.push(`  server: {
    port: 3000,
  },`);
      }

      if (!nextContent.includes("**/src-tauri/target/**")) {
        if (nextContent.includes("vite: {")) {
          nextContent = nextContent.replace(
            "vite: {",
            `vite: {
    server: {
      watch: {
        ignored: ["**/src-tauri/target/**"],
      },
    },`,
          );
        } else {
          additions.push(`  vite: {
    server: {
      watch: {
        ignored: ["**/src-tauri/target/**"],
      },
    },
  },`);
        }
      }

      if (additions.length === 0) return nextContent;

      const closingIndex = nextContent.lastIndexOf("\n})");

      if (closingIndex === -1) {
        throw new PatchError("astro.config.mjs", "Could not find the Astro config closing brace.");
      }

      return `${nextContent.slice(0, closingIndex)}
${additions.join("\n")}${nextContent.slice(closingIndex)}`;
    });
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
