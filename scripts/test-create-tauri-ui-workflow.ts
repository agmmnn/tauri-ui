import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  applyWorkflow,
  getWorkflowMatrix,
} from "../packages/create-tauri-ui/src/batteries/workflow";
import type { ProjectOptions, ReleaseArtifact } from "../packages/create-tauri-ui/src/types";
import { applyArtifactMetadata, exportBuildArtifacts } from "./create-tauri-ui-test-lib.mjs";

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

const tauriActionPin = "tauri-apps/tauri-action@action-v1.0.0";

// Inputs declared by tauri-action at `tauriActionPin` (action.yml -> inputs). GitHub Actions
// silently ignores `with:` keys an action does not declare, so a renamed input degrades to a
// no-op instead of failing the workflow.
const tauriActionInputs = new Set([
  "releaseId",
  "tagName",
  "releaseName",
  "releaseBody",
  "releaseDraft",
  "prerelease",
  "releaseCommitish",
  "projectPath",
  "uploadUpdaterJson",
  "updaterJsonPreferNsis",
  "tauriScript",
  "args",
  "retryAttempts",
  "owner",
  "repo",
  "githubBaseUrl",
  "releaseAssetNamePattern",
  "uploadPlainBinary",
  "uploadWorkflowArtifacts",
  "workflowArtifactNamePattern",
  "uploadUpdaterSignatures",
  "generateReleaseNotes",
  "mobile",
]);

function tauriActionStepInputs(workflow: string) {
  const lines = workflow.split("\n");
  const stepLine = lines.findIndex((line) => line.includes(`uses: ${tauriActionPin}`));

  if (stepLine === -1) {
    throw new Error(`Release workflow does not invoke ${tauriActionPin}.`);
  }

  const withLine = lines.findIndex((line, index) => index > stepLine && line.trim() === "with:");

  if (withLine === -1) {
    throw new Error(`Release workflow invokes ${tauriActionPin} without a \`with:\` block.`);
  }

  const withIndent = lines[withLine].length - lines[withLine].trimStart().length;
  const keys: string[] = [];

  for (let index = withLine + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim()) continue;

    const indent = line.length - line.trimStart().length;

    if (indent <= withIndent) break;

    const key = line.trimStart().match(/^([A-Za-z0-9_]+):/);

    if (key && indent === withIndent + 2) keys.push(key[1]);
  }

  return keys;
}

function assertTauriActionInputsDeclared(workflow: string) {
  const undeclared = tauriActionStepInputs(workflow).filter(
    (name) => !tauriActionInputs.has(name),
  );

  if (undeclared.length > 0) {
    throw new Error(
      `Release workflow passes inputs that ${tauriActionPin} does not declare, so they are silently ignored: ${undeclared.join(", ")}`,
    );
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

const repositoryReleaseWorkflow = await fs.readFile(
  path.join(import.meta.dirname, "../.github/workflows/release.yml"),
  "utf8",
);
assertIncludes(repositoryReleaseWorkflow, [
  "Detect release commit",
  "needs.release-state.outputs.is_release == 'true'",
  "actions/upload-artifact@v4",
  "actions/download-artifact@v4",
  "gh release upload",
  "if: needs.release-state.outputs.is_release == 'true'",
]);
assertExcludes(repositoryReleaseWorkflow, ["gh workflow run release-smoke-app.yml"]);

const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "create-tauri-ui-workflow-"));

try {
  const fixtureArtifact = "src-tauri/target/release/fixture.exe";
  await fs.mkdir(path.join(projectDir, "src-tauri/target/release"), { recursive: true });
  await fs.writeFile(path.join(projectDir, fixtureArtifact), "portable-binary");
  await fs.writeFile(
    path.join(projectDir, "src-tauri/tauri.conf.json"),
    JSON.stringify({ productName: "fixture", version: "0.1.0" }),
  );

  await applyArtifactMetadata(projectDir, "1.2.3", "release-smoke");
  const releaseAssetsDir = path.join(projectDir, "release-assets");
  await exportBuildArtifacts(
    projectDir,
    [fixtureArtifact],
    ["release-smoke-v__VERSION__-portable.exe"],
    releaseAssetsDir,
    "1.2.3",
    "vite",
  );

  const exportedArtifact = await fs.readFile(
    path.join(releaseAssetsDir, "release-smoke-v1.2.3-portable.exe"),
    "utf8",
  );
  const artifactConfig = JSON.parse(
    await fs.readFile(path.join(projectDir, "src-tauri/tauri.conf.json"), "utf8"),
  );
  if (
    exportedArtifact !== "portable-binary" ||
    artifactConfig.version !== "1.2.3" ||
    artifactConfig.productName !== "release-smoke"
  ) {
    throw new Error("Release artifact export fixture is invalid.");
  }

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
    "bun-version: 1.4.4",
    "tauri-apps/tauri-action@action-v1.0.0",
    "APPLE_SIGNING_IDENTITY:",
    "startsWith(matrix.platform, 'macos-')",
    "The Windows portable executable requires the Microsoft Edge WebView2 Runtime.",
    'args: "--bundles nsis,msi"',
    'args: "--bundles appimage,deb,rpm"',
  ]);
  assertTauriActionInputsDeclared(workflow);
} finally {
  await fs.rm(projectDir, { recursive: true, force: true });
}

console.log("[create-tauri-ui:test] release workflow variants PASS");
