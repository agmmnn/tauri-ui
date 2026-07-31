import path from "node:path";
import { existsSync } from "node:fs";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { PatchError, editFile, editJson } from "../utils";

export const nextAdapter: TemplateAdapter = {
  name: "next",
  async apply(projectDir: string, _options: ProjectOptions) {
    const possibleConfigs = [
      "next.config.ts",
      "next.config.mts",
      "next.config.js",
      "next.config.mjs",
      "next.config.cjs",
    ];

    const configFile = possibleConfigs.find((file) =>
      existsSync(path.join(projectDir, file)),
    );

    if (!configFile) {
      throw new PatchError(
        "next.config",
        `Could not find a Next.js config file. Checked: ${possibleConfigs.join(", ")}`,
      );
    }

    editFile(path.join(projectDir, configFile), (content) => {
      if (content.includes('output: "export"')) {
        return content;
      }

      if (!content.includes("const nextConfig = {}")) {
        throw new PatchError(
          configFile,
          "Could not find the default Next.js config shape.",
        );
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
          "next dev --turbopack -p 3000",
        );
      }

      return pkg;
    });
  },

  tauriConfig() {
    return {
      frontendDist: "../out",
      devUrl: "http://localhost:3000",
      beforeDevCommand: "bun run dev",
      beforeBuildCommand: "bun run build",
    };
  },
};