import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { ProjectOptions, ReleaseArtifact } from "../types";

function resolveAssetsDir() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(moduleDir, "../assets"),
    path.resolve(moduleDir, "../../assets"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}

const ASSETS_DIR = resolveAssetsDir();

interface WorkflowEntry {
  name: string;
  platform: string;
  args: string;
  rustTargets: string;
  assetPattern: string;
  uploadPlainBinary: boolean;
  portableUpload: boolean;
}

const DEFAULT_ASSET_PATTERN = "[name]-[version]-[platform]-[arch][setup][ext]";

function getWorkflowEntries(releaseArtifacts: ReleaseArtifact[]): WorkflowEntry[] {
  const selected = new Set(releaseArtifacts);
  const entries: WorkflowEntry[] = [];
  const windowsBundles = [
    selected.has("windows-nsis") && "nsis",
    selected.has("windows-msi") && "msi",
  ].filter((bundle): bundle is string => Boolean(bundle));
  const includePortable = selected.has("windows-portable");

  if (windowsBundles.length > 0) {
    entries.push({
      name: "Windows",
      platform: "windows-latest",
      args: `--bundles ${windowsBundles.join(",")}`,
      rustTargets: "",
      assetPattern: DEFAULT_ASSET_PATTERN,
      uploadPlainBinary: false,
      portableUpload: includePortable,
    });
  } else if (includePortable) {
    entries.push({
      name: "Windows Portable",
      platform: "windows-latest",
      args: "--no-bundle",
      rustTargets: "",
      assetPattern: "[name]-[version]-[platform]-[arch]-portable[ext]",
      uploadPlainBinary: true,
      portableUpload: false,
    });
  }

  if (selected.has("macos-aarch64-dmg")) {
    entries.push({
      name: "macOS Apple Silicon",
      platform: "macos-latest",
      args: "--target aarch64-apple-darwin --bundles dmg",
      rustTargets: "aarch64-apple-darwin",
      assetPattern: DEFAULT_ASSET_PATTERN,
      uploadPlainBinary: false,
      portableUpload: false,
    });
  }

  if (selected.has("macos-x64-dmg")) {
    entries.push({
      name: "macOS Intel",
      platform: "macos-latest",
      args: "--target x86_64-apple-darwin --bundles dmg",
      rustTargets: "x86_64-apple-darwin",
      assetPattern: DEFAULT_ASSET_PATTERN,
      uploadPlainBinary: false,
      portableUpload: false,
    });
  }

  const linuxBundles = [
    selected.has("linux-appimage") && "appimage",
    selected.has("linux-deb") && "deb",
    selected.has("linux-rpm") && "rpm",
  ].filter((bundle): bundle is string => Boolean(bundle));

  if (linuxBundles.length > 0) {
    entries.push({
      name: "Linux",
      platform: "ubuntu-22.04",
      args: `--bundles ${linuxBundles.join(",")}`,
      rustTargets: "",
      assetPattern: DEFAULT_ASSET_PATTERN,
      uploadPlainBinary: false,
      portableUpload: false,
    });
  }

  return entries;
}

export function getWorkflowMatrix(releaseArtifacts: ReleaseArtifact[]) {
  const entries = getWorkflowEntries(releaseArtifacts);

  return entries
    .map(
      (entry) =>
        `          - name: "${entry.name}"\n` +
        `            platform: "${entry.platform}"\n` +
        `            args: "${entry.args}"\n` +
        `            rustTargets: "${entry.rustTargets}"\n` +
        `            assetPattern: "${entry.assetPattern}"\n` +
        `            uploadPlainBinary: ${entry.uploadPlainBinary}\n` +
        `            portableUpload: ${entry.portableUpload}`,
    )
    .join("\n");
}

export async function applyWorkflow(projectDir: string, options: ProjectOptions) {
  const template = fs.readFileSync(path.join(ASSETS_DIR, "release.yml.tmpl"), "utf-8");

  const portableNote = options.releaseArtifacts.includes("windows-portable")
    ? "            The Windows portable executable requires the Microsoft Edge WebView2 Runtime."
    : "";
  const workflow = template
    .replace("{{PLATFORMS}}", getWorkflowMatrix(options.releaseArtifacts))
    .replace("{{PORTABLE_RELEASE_NOTE}}", portableNote);

  const workflowDir = path.join(projectDir, ".github/workflows");
  fs.mkdirSync(workflowDir, { recursive: true });
  fs.writeFileSync(path.join(workflowDir, "release.yml"), workflow);
}
