import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const cliPackageDir = path.join(repoRoot, "packages/create-tauri-ui");
const cliEntry = path.join(repoRoot, "packages/create-tauri-ui/index.js");

export const templateNames = ["vite", "next", "start", "react-router", "astro"];

function formatDuration(durationMs) {
  const seconds = (durationMs / 1000).toFixed(1);
  return `${seconds}s`;
}

function log(message) {
  console.log(`[create-tauri-ui:test] ${message}`);
}

function ensureTemplateList(values) {
  if (values.length === 0) {
    return [...templateNames];
  }

  const invalid = values.filter((value) => !templateNames.includes(value));

  if (invalid.length > 0) {
    throw new Error(
      `Unsupported template selection: ${invalid.join(", ")}. Expected one of: ${templateNames.join(", ")}`,
    );
  }

  return values;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function assertPathExists(targetPath, message) {
  if (!(await pathExists(targetPath))) {
    throw new Error(message);
  }
}

async function runCommand(command, args, options = {}) {
  const { cwd = repoRoot, env = process.env, quiet = false } = options;

  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: quiet ? "ignore" : "inherit",
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      const detail = signal ? `signal ${signal}` : `exit code ${code ?? "unknown"}`;

      reject(new Error(`Command failed: ${command} ${args.join(" ")} (${detail})`));
    });
  });
}

async function ensureCommand(command, probeArgs) {
  try {
    await runCommand(command, probeArgs, { quiet: true });
  } catch {
    throw new Error(`${command} is required but was not found in PATH.`);
  }
}

function printSummary(mode, results) {
  console.log("");
  console.log(`[create-tauri-ui:test] ${mode} summary`);

  for (const result of results) {
    const status = result.ok ? "PASS" : "FAIL";
    console.log(
      `- ${status} ${result.template} (${formatDuration(result.durationMs)}) ${result.targetDir}`,
    );
  }

  console.log("");
}

export async function runCreateTauriUiMatrix({
  mode,
  includeWorkflow,
  runTauriBuild,
  selectedTemplates = [],
}) {
  const templates = ensureTemplateList(selectedTemplates);
  const baseDir = path.join(os.tmpdir(), `create-tauri-ui-${mode}`);
  const results = [];

  await ensureCommand("node", ["--version"]);
  await ensureCommand("bun", ["--version"]);

  if (runTauriBuild) {
    await ensureCommand("cargo", ["--version"]);
  }

  await assertPathExists(cliEntry, `Missing CLI entrypoint at ${cliEntry}.`);

  log(`Building create-tauri-ui before running the ${mode} matrix`);
  await runCommand("bun", ["run", "build"], { cwd: cliPackageDir });

  await fs.mkdir(baseDir, { recursive: true });
  log(`Using temp directory ${baseDir}`);

  for (const template of templates) {
    const targetDir = path.join(baseDir, template);
    const startMs = Date.now();

    await fs.rm(targetDir, { recursive: true, force: true });

    const scaffoldArgs = [cliEntry, targetDir, "--template", template, "--yes", "--force"];

    if (!includeWorkflow) {
      scaffoldArgs.push("--no-workflow");
    }

    try {
      log(`[${template}] scaffolding`);
      await runCommand("node", scaffoldArgs, { cwd: repoRoot });

      await assertPathExists(
        path.join(targetDir, "src-tauri"),
        `[${template}] expected src-tauri to exist in ${targetDir}`,
      );

      if (includeWorkflow) {
        await assertPathExists(
          path.join(targetDir, ".github/workflows/release.yml"),
          `[${template}] expected .github/workflows/release.yml to exist in ${targetDir}`,
        );
      }

      log(`[${template}] bun install`);
      await runCommand("bun", ["install"], { cwd: targetDir });

      log(`[${template}] bun run build`);
      await runCommand("bun", ["run", "build"], { cwd: targetDir });

      if (runTauriBuild) {
        log(`[${template}] bun run tauri build`);
        await runCommand("bun", ["run", "tauri", "build"], { cwd: targetDir });
      }

      results.push({
        template,
        ok: true,
        durationMs: Date.now() - startMs,
        targetDir,
      });
    } catch (error) {
      results.push({
        template,
        ok: false,
        durationMs: Date.now() - startMs,
        targetDir,
      });

      printSummary(mode, results);
      log(`[${template}] failed. Inspect the generated app at ${targetDir}`);
      throw error;
    }
  }

  printSummary(mode, results);
  log(`Completed the ${mode} matrix successfully`);
}
