import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { copy } from "../utils";

function resolveAssetsDir() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(moduleDir, "../assets"),
    path.resolve(moduleDir, "../../assets"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}

const ASSETS_DIR = resolveAssetsDir();

export async function applyIcon(projectDir: string) {
  copy(path.join(ASSETS_DIR, "app-icon.png"), path.join(projectDir, "app-icon.png"));
}
