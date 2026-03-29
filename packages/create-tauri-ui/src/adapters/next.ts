import path from "node:path";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { PatchError, editFile, editJson } from "../utils";

export const nextAdapter: TemplateAdapter = {
  name: "next",
  async apply(projectDir: string, _options: ProjectOptions) {
    editFile(path.join(projectDir, "next.config.mjs"), (content) => {
      if (content.includes('output: "export"')) {
        return content;
      }

      if (!content.includes("const nextConfig = {}")) {
        throw new PatchError("next.config.mjs", "Could not find the default Next.js config shape.");
      }

      return content.replace(
        "const nextConfig = {}",
        `const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
}`,
      );
    });

    editJson<Record<string, any>>(path.join(projectDir, "package.json"), (pkg) => {
      if (pkg.scripts?.dev) {
        pkg.scripts.dev = pkg.scripts.dev.replace(
          "next dev --turbopack",
          "next dev --turbopack -p 1420",
        );
      }

      return pkg;
    });
  },
  tauriConfig() {
    return {
      frontendDist: "../out",
      devUrl: "http://localhost:1420",
      beforeDevCommand: "bun run dev",
      beforeBuildCommand: "bun run build",
    };
  },
};
