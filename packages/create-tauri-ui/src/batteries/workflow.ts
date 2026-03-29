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

function getWorkflowMatrix(targetOS: string[]) {
  const entries: Array<{ name: string; platform: string; args: string }> = [];

  for (const value of targetOS) {
    if (value === "macos-latest") {
      entries.push(
        {
          name: "macOS Apple Silicon",
          platform: "macos-latest",
          args: "--target aarch64-apple-darwin",
        },
        {
          name: "macOS Intel",
          platform: "macos-latest",
          args: "--target x86_64-apple-darwin",
        },
      );
      continue;
    }

    if (value === "ubuntu-latest") {
      entries.push({
        name: "Linux",
        platform: "ubuntu-22.04",
        args: "",
      });
      continue;
    }

    entries.push({
      name: "Windows",
      platform: value,
      args: "",
    });
  }

  return entries
    .map(
      (entry) =>
        `          - name: "${entry.name}"\n` +
        `            platform: "${entry.platform}"\n` +
        `            args: "${entry.args}"`,
    )
    .join("\n");
}

export async function applyWorkflow(projectDir: string, options: ProjectOptions) {
  const template = fs.readFileSync(path.join(ASSETS_DIR, "release.yml.tmpl"), "utf-8");

  const workflow = template.replace("{{PLATFORMS}}", getWorkflowMatrix(options.targetOS));

  const workflowDir = path.join(projectDir, ".github/workflows");
  fs.mkdirSync(workflowDir, { recursive: true });
  fs.writeFileSync(path.join(workflowDir, "release.yml"), workflow);
}
