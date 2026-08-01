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

const cssFiles = {
  vite: "src/index.css",
  next: "app/globals.css",
  start: "src/styles.css",
  "react-router": "app/app.css",
  astro: "src/styles/global.css",
};

const debugPanelFiles = {
  vite: "src/components/debug-panel.tsx",
  next: "components/debug-panel.tsx",
  start: "src/components/debug-panel.tsx",
  "react-router": "app/components/debug-panel.tsx",
  astro: "src/components/debug-panel.tsx",
};

const viteConfigFiles = {
  vite: "vite.config.ts",
  start: "vite.config.ts",
  "react-router": "vite.config.ts",
  astro: "astro.config.mjs",
};

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

function readStringArrayEnv(name) {
  const raw = process.env[name];
  if (!raw) return [];

  let value;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${name} must be a JSON string array: ${error.message}`);
  }

  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${name} must be a JSON string array.`);
  }

  return value;
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

async function readText(targetPath) {
  return fs.readFile(targetPath, "utf8");
}

async function assertTextIncludes(targetPath, expected, message) {
  const content = await readText(targetPath);
  const values = Array.isArray(expected) ? expected : [expected];
  const missing = values.filter((value) => !content.includes(value));

  if (missing.length > 0) {
    throw new Error(`${message} Missing: ${missing.join(", ")}`);
  }

  return content;
}

async function assertNoStagingDirectories(baseDir, template) {
  const entries = await fs.readdir(baseDir);
  const stagingEntries = entries.filter((entry) => entry.startsWith(".create-tauri-ui-"));

  if (stagingEntries.length > 0) {
    throw new Error(
      `[${template}] staging directories were not cleaned: ${stagingEntries.join(", ")}`,
    );
  }
}

function normalizeRelativePath(value) {
  return value.split(path.sep).join("/");
}

function globPatternToRegExp(pattern) {
  const escaped = normalizeRelativePath(pattern)
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replaceAll("*", "[^/]*");
  return new RegExp(`^${escaped}$`);
}

async function listFiles(rootDir, currentDir = rootDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(rootDir, entryPath)));
    } else if (entry.isFile()) {
      files.push(normalizeRelativePath(path.relative(rootDir, entryPath)));
    }
  }

  return files;
}

async function assertBuildArtifacts(targetDir, patterns, template) {
  if (patterns.length === 0) return;

  const files = await listFiles(targetDir);
  const missing = patterns.filter((pattern) => {
    const matcher = globPatternToRegExp(pattern);
    return !files.some((file) => matcher.test(file));
  });

  if (missing.length > 0) {
    throw new Error(
      `[${template}] native build did not produce expected artifacts: ${missing.join(", ")}`,
    );
  }
}

async function findNextConfig(targetDir) {
  const candidates = [
    "next.config.ts",
    "next.config.mts",
    "next.config.js",
    "next.config.mjs",
    "next.config.cjs",
  ];

  for (const candidate of candidates) {
    const configPath = path.join(targetDir, candidate);
    if (await pathExists(configPath)) return configPath;
  }

  throw new Error(`[next] expected a Next.js config file in ${targetDir}`);
}

async function assertReleaseWorkflow(targetDir, template) {
  const workflowPath = path.join(targetDir, ".github/workflows/release.yml");
  await assertPathExists(
    workflowPath,
    `[${template}] expected .github/workflows/release.yml to exist`,
  );

  const workflow = await assertTextIncludes(
    workflowPath,
    [
      'tags:\n      - "v*"',
      'name: "Windows"',
      'args: "--bundles nsis"',
      "portableUpload: true",
      'name: "macOS Apple Silicon"',
      'rustTargets: "aarch64-apple-darwin"',
      'name: "macOS Intel"',
      'rustTargets: "x86_64-apple-darwin"',
      'name: "Linux"',
      'args: "--bundles appimage,deb"',
      "releaseDraft: true",
      "tauri-apps/tauri-action@action-v0.6.2",
      "bun-version: 1.3.14",
      "APPLE_SIGNING_IDENTITY:",
      "startsWith(matrix.platform, 'macos-')",
      "The Windows portable executable requires the Microsoft Edge WebView2 Runtime.",
    ],
    `[${template}] release workflow does not contain the expected default artifact matrix.`,
  );

  for (const unexpected of ["--bundles nsis,msi", "--bundles appimage,deb,rpm"]) {
    if (workflow.includes(unexpected)) {
      throw new Error(`[${template}] default workflow unexpectedly contains ${unexpected}`);
    }
  }
}

async function assertGeneratedProject(targetDir, template, includeWorkflow) {
  await assertPathExists(
    path.join(targetDir, "src-tauri"),
    `[${template}] expected src-tauri to exist`,
  );
  await assertPathExists(
    path.join(targetDir, "node_modules"),
    `[${template}] expected the finalized scaffold to retain node_modules`,
  );
  await assertPathExists(
    path.join(targetDir, "bun.lock"),
    `[${template}] expected the finalized scaffold to contain bun.lock`,
  );
  await assertPathExists(
    path.join(targetDir, debugPanelFiles[template]),
    `[${template}] expected the debug panel battery`,
  );

  const cssPath = path.join(targetDir, cssFiles[template]);
  await assertTextIncludes(
    cssPath,
    [
      "data-ui-scroll-container",
      "color-scheme: light",
      "html.dark",
      "color-scheme: dark",
      ".ui-selectable",
    ],
    `[${template}] generated desktop CSS is incomplete.`,
  );

  const tauriConfig = JSON.parse(await readText(path.join(targetDir, "src-tauri/tauri.conf.json")));
  if (tauriConfig.build?.devUrl !== "http://localhost:3000") {
    throw new Error(`[${template}] unexpected Tauri devUrl: ${tauriConfig.build?.devUrl}`);
  }
  if (tauriConfig.build?.beforeDevCommand !== "bun run dev") {
    throw new Error(
      `[${template}] unexpected beforeDevCommand: ${tauriConfig.build?.beforeDevCommand}`,
    );
  }

  if (template === "next") {
    const nextConfigPath = await findNextConfig(targetDir);
    await assertTextIncludes(
      nextConfigPath,
      ['output: "export"', "unoptimized: true", "root: process.cwd()"],
      "[next] generated config is missing static-export or Turbopack settings.",
    );
  } else {
    const viteConfigPath = path.join(targetDir, viteConfigFiles[template]);
    const viteConfig = await assertTextIncludes(
      viteConfigPath,
      "**/src-tauri/target/**",
      `[${template}] Vite config does not ignore Cargo build artifacts.`,
    );

    if (viteConfig.includes("__dirname")) {
      throw new Error(`[${template}] Vite config still uses native-loader-incompatible __dirname`);
    }
  }

  if (includeWorkflow) {
    await assertReleaseWorkflow(targetDir, template);
  } else if (await pathExists(path.join(targetDir, ".github/workflows/release.yml"))) {
    throw new Error(`[${template}] release workflow exists despite --no-workflow`);
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
  includeStarterUI = true,
  runTauriBuild,
  selectedTemplates = [],
}) {
  const templates = ensureTemplateList(selectedTemplates);
  const tauriBuildArgs = readStringArrayEnv("CREATE_TAURI_UI_TAURI_BUILD_ARGS");
  const expectedArtifacts = readStringArrayEnv("CREATE_TAURI_UI_EXPECT_ARTIFACTS");
  const baseDir = await fs.mkdtemp(path.join(os.tmpdir(), `create-tauri-ui-${mode}-`));
  const results = [];

  await ensureCommand("node", ["--version"]);
  await ensureCommand("bun", ["--version"]);

  if (runTauriBuild) {
    await ensureCommand("cargo", ["--version"]);
  }

  await assertPathExists(cliEntry, `Missing CLI entrypoint at ${cliEntry}.`);

  log(`Building create-tauri-ui before running the ${mode} matrix`);
  await runCommand("bun", ["run", "build"], { cwd: cliPackageDir });

  log(`Using temp directory ${baseDir}`);

  for (const template of templates) {
    const targetDir = path.join(baseDir, template);
    const startMs = Date.now();

    const scaffoldArgs = [cliEntry, targetDir, "--template", template, "--yes"];

    if (!includeStarterUI) {
      scaffoldArgs.push("--no-starter");
    }

    if (!includeWorkflow) {
      scaffoldArgs.push("--no-workflow");
    }

    try {
      log(`[${template}] scaffolding`);
      await runCommand("node", scaffoldArgs, { cwd: repoRoot });

      log(`[${template}] verifying generated project`);
      await assertGeneratedProject(targetDir, template, includeWorkflow);
      await assertNoStagingDirectories(baseDir, template);

      log(`[${template}] bun run build`);
      await runCommand("bun", ["run", "build"], { cwd: targetDir });

      if (runTauriBuild) {
        const printableArgs = tauriBuildArgs.length > 0 ? ` ${tauriBuildArgs.join(" ")}` : "";
        log(`[${template}] bun run tauri build${printableArgs}`);
        await runCommand("bun", ["run", "tauri", "build", ...tauriBuildArgs], {
          cwd: targetDir,
        });
        await assertBuildArtifacts(targetDir, expectedArtifacts, template);
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
      if (await pathExists(targetDir)) {
        log(`[${template}] failed. Inspect the generated app at ${targetDir}`);
      } else {
        log(
          `[${template}] failed before atomic publish; no partial target was created. Test workspace: ${baseDir}`,
        );
      }
      throw error;
    }
  }

  printSummary(mode, results);
  if (process.env.CREATE_TAURI_UI_KEEP_TEST_OUTPUT === "1") {
    log(`Keeping successful test projects at ${baseDir}`);
  } else {
    await fs.rm(baseDir, { recursive: true, force: true });
    log("Removed successful test projects (set CREATE_TAURI_UI_KEEP_TEST_OUTPUT=1 to keep them)");
  }
  log(`Completed the ${mode} matrix successfully`);
}
