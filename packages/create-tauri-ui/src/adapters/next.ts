import fs from "node:fs";
import path from "node:path";

import type { ProjectOptions, TemplateAdapter } from "../types";
import { PatchError, editFile, editJson } from "../utils";

const NEXT_CONFIG_FILES = ["next.config.ts", "next.config.mjs", "next.config.js"];

export const nextAdapter: TemplateAdapter = {
  name: "next",
  async apply(projectDir: string, _options: ProjectOptions) {
    const configFile = NEXT_CONFIG_FILES.find((file) => fs.existsSync(path.join(projectDir, file)));

    if (!configFile) {
      throw new PatchError("next.config.ts", "Could not find the Next.js config file.");
    }

    editFile(path.join(projectDir, configFile), (content) => {
      if (content.includes('output: "export"')) {
        return content;
      }

      const emptyConfig = /const nextConfig(?:\s*:\s*NextConfig)?\s*=\s*\{\}/;

      if (!emptyConfig.test(content)) {
        throw new PatchError(configFile, "Could not find the default Next.js config shape.");
      }

      return content.replace(emptyConfig, (declaration) =>
        declaration.replace(
          "{}",
          `{
  output: "export",
  images: {
    unoptimized: true,
  },
}`,
        ),
      );
    });

    editJson<Record<string, any>>(path.join(projectDir, "package.json"), (pkg) => {
      if (pkg.scripts?.dev?.startsWith("next dev") && !pkg.scripts.dev.includes("-p ")) {
        pkg.scripts.dev = `${pkg.scripts.dev} -p 1420`;
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
