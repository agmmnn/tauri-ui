import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ProjectOptions } from "../types";

function resolveAssetsDir() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(moduleDir, "../assets"),
    path.resolve(moduleDir, "../../assets"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}

const ASSETS_DIR = resolveAssetsDir();

export async function applyWorkflow(projectDir: string, options: ProjectOptions) {
  const template = fs.readFileSync(path.join(ASSETS_DIR, "release.yml.tmpl"), "utf-8");

  const workflow = template.replace(
    "{{PLATFORMS}}",
    `[${options.targetOS.map((value) => `"${value}"`).join(", ")}]`,
  );

  const workflowDir = path.join(projectDir, ".github/workflows");
  fs.mkdirSync(workflowDir, { recursive: true });
  fs.writeFileSync(path.join(workflowDir, "release.yml"), workflow);
}
