import path from "node:path";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { PatchError, editFile } from "../utils";

function insertServerBlock(content: string) {
  if (content.includes("strictPort: true")) {
    return content;
  }

  const closingIndex = content.lastIndexOf("\n})");

  if (closingIndex === -1) {
    throw new PatchError(
      "vite.config.ts",
      "Could not find the React Router Vite config closing brace.",
    );
  }

  return `${content.slice(0, closingIndex)}
  server: {
    port: 1420,
    strictPort: true,
  },${content.slice(closingIndex)}`;
}

export const reactRouterAdapter: TemplateAdapter = {
  name: "react-router",
  async apply(projectDir: string, _options: ProjectOptions) {
    editFile(path.join(projectDir, "react-router.config.ts"), (content) => {
      if (content.includes("ssr: false")) {
        return content;
      }

      if (!content.includes("ssr: true")) {
        throw new PatchError(
          "react-router.config.ts",
          "Could not find the SSR flag in the generated React Router config.",
        );
      }

      return content.replace("ssr: true", "ssr: false");
    });

    editFile(path.join(projectDir, "vite.config.ts"), insertServerBlock);
  },
  tauriConfig() {
    return {
      frontendDist: "../build/client",
      devUrl: "http://localhost:1420",
      beforeDevCommand: "bun run dev",
      beforeBuildCommand: "bun run build",
    };
  },
};
