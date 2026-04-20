import fs from "node:fs";
import path from "node:path";

import type { TemplateName } from "../types";

export interface DetectedProject {
  template: TemplateName;
  projectDir: string;
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function readPackageJson(projectDir: string): PackageJson | null {
  const pkgPath = path.join(projectDir, "package.json");

  if (!fs.existsSync(pkgPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as PackageJson;
  } catch {
    return null;
  }
}

function hasDependency(pkg: PackageJson, name: string) {
  return Boolean(pkg.dependencies?.[name] || pkg.devDependencies?.[name]);
}

function detectFromFiles(projectDir: string): TemplateName | null {
  const candidates: Array<{ path: string; template: TemplateName }> = [
    { path: "app/layout.tsx", template: "next" },
    { path: "app/root.tsx", template: "react-router" },
    { path: "src/routes/__root.tsx", template: "start" },
    { path: "src/layouts/main.astro", template: "astro" },
    { path: "src/main.tsx", template: "vite" },
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(projectDir, candidate.path))) {
      return candidate.template;
    }
  }

  return null;
}

function detectFromPackage(pkg: PackageJson): TemplateName | null {
  if (hasDependency(pkg, "next")) return "next";
  if (hasDependency(pkg, "@tanstack/react-start") || hasDependency(pkg, "@tanstack/start"))
    return "start";
  if (hasDependency(pkg, "react-router") || hasDependency(pkg, "@react-router/dev"))
    return "react-router";
  if (hasDependency(pkg, "astro")) return "astro";
  if (hasDependency(pkg, "vite")) return "vite";

  return null;
}

export function detectProject(projectDir: string): DetectedProject {
  const resolved = path.resolve(projectDir);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Directory not found: ${resolved}`);
  }

  if (!fs.existsSync(path.join(resolved, "src-tauri"))) {
    throw new Error(
      `No src-tauri/ directory found in ${resolved}. Run this command inside a Tauri project.`,
    );
  }

  const pkg = readPackageJson(resolved);

  if (!pkg) {
    throw new Error(`No readable package.json found in ${resolved}.`);
  }

  const template = detectFromFiles(resolved) ?? detectFromPackage(pkg);

  if (!template) {
    throw new Error(
      "Could not detect the frontend template (vite, next, start, react-router, astro).",
    );
  }

  return { template, projectDir: resolved };
}
