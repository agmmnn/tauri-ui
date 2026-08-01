import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  applyWorkflow,
  getWorkflowMatrix,
} from "../packages/create-tauri-ui/src/batteries/workflow";
import type { ProjectOptions, ReleaseArtifact } from "../packages/create-tauri-ui/src/types";

function assertIncludes(content: string, expected: string[]) {
  const missing = expected.filter((value) => !content.includes(value));
  if (missing.length > 0) {
    throw new Error(`Release workflow fixture is missing: ${missing.join(", ")}`);
  }
}

function assertExcludes(content: string, unexpected: string[]) {
  const present = unexpected.filter((value) => content.includes(value));
  if (present.length > 0) {
    throw new Error(`Release workflow fixture unexpectedly contains: ${present.join(", ")}`);
  }
}

const allArtifacts: ReleaseArtifact[] = [
  "windows-nsis",
  "windows-msi",
  "windows-portable",
  "macos-aarch64-dmg",
  "macos-x64-dmg",
  "linux-appimage",
  "linux-deb",
  "linux-rpm",
];

const allMatrix = getWorkflowMatrix(allArtifacts);
assertIncludes(allMatrix, [
  'args: "--bundles nsis,msi"',
  "portableUpload: true",
  'args: "--target aarch64-apple-darwin --bundles dmg"',
  'args: "--target x86_64-apple-darwin --bundles dmg"',
  'args: "--bundles appimage,deb,rpm"',
]);

const portableOnlyMatrix = getWorkflowMatrix(["windows-portable"]);
assertIncludes(portableOnlyMatrix, [
  'name: "Windows Portable"',
  'args: "--no-bundle"',
  "uploadPlainBinary: true",
  "portableUpload: false",
]);
assertExcludes(portableOnlyMatrix, ["--bundles nsis", "--bundles msi"]);

const installersOnlyMatrix = getWorkflowMatrix(["windows-nsis", "windows-msi"]);
assertIncludes(installersOnlyMatrix, [
  'args: "--bundles nsis,msi"',
  "uploadPlainBinary: false",
  "portableUpload: false",
]);

const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "create-tauri-ui-workflow-"));

try {
  const options = {
    projectName: "workflow-smoke",
    packageName: "workflow-smoke",
    template: "vite",
    identifier: "com.example.workflow-smoke",
    preset: "b0",
    includeSizeOptimization: false,
    includeStarterUI: false,
    includeInvokeExample: false,
    includeWorkflow: true,
    releaseArtifacts: allArtifacts,
    targetDir: projectDir,
  } satisfies ProjectOptions;

  await applyWorkflow(projectDir, options);
  const workflow = await fs.readFile(
    path.join(projectDir, ".github/workflows/release.yml"),
    "utf8",
  );
  assertIncludes(workflow, [
    "bun-version: 1.3.14",
    "APPLE_SIGNING_IDENTITY:",
    "startsWith(matrix.platform, 'macos-')",
    "The Windows portable executable requires the Microsoft Edge WebView2 Runtime.",
    'args: "--bundles nsis,msi"',
    'args: "--bundles appimage,deb,rpm"',
  ]);
} finally {
  await fs.rm(projectDir, { recursive: true, force: true });
}

console.log("[create-tauri-ui:test] release workflow variants PASS");
