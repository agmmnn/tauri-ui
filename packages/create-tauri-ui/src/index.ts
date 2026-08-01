import fs from "node:fs";
import process from "node:process";
import { cancel, intro, log, outro } from "@clack/prompts";
import pc from "picocolors";

import { getAdapter } from "./adapters";
import { applyDebugPanel } from "./batteries/debug-panel";
import { applyExternalLinkGuard } from "./batteries/external-link-guard";
import { applyFlashPrevention } from "./batteries/flash-prevention";
import { applyIcon } from "./batteries/icon";
import { applyInvokeExample } from "./batteries/invoke-example";
import { applyScrollContainer } from "./batteries/scroll-container";
import { applySelectionBehavior } from "./batteries/selection-behavior";
import { applySizeOptimization } from "./batteries/size-optimization";
import { applyWorkflow } from "./batteries/workflow";
import { type ManageAction, type ManageArgs, runManageCommand } from "./commands/manage";
import { applyTauriConfig, mergeTauri } from "./merge";
import { runPrompts } from "./prompts";
import {
  addStarterUI,
  finalizeFrontendScaffold,
  scaffoldFrontend,
  scaffoldTauri,
} from "./scaffold";
import type { CliArgs, FrontendScaffoldResult, TargetOs } from "./types";
import { TARGET_OS } from "./types";
import {
  ProgressReporter,
  animationsEnabled,
  formatDuration,
  playBrandReveal,
  playSuccessBurst,
  printConfiguration,
  printInstructions,
} from "./ui";
import {
  CommandError,
  PatchError,
  ScaffoldError,
  execSafe,
  installCleanupHandlers,
  removeTempDir,
  unregisterCleanupPath,
} from "./utils";

function getCliVersion() {
  const packageJsonPath = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as {
    version?: string;
  };

  return packageJson.version ?? "0.0.0";
}

const MANAGE_ACTIONS = new Set<ManageAction>(["add", "update", "remove", "list"]);

function printHelp() {
  console.log(`Usage:
  create-tauri-ui [target-dir] [options]              scaffold a new project
  create-tauri-ui <add|update|remove> <battery>       manage batteries in an existing project
  create-tauri-ui list                                list available batteries + install status

Scaffold options:
  -t, --template <name>         vite | next | start | react-router | astro
      --identifier <value>      set the Tauri app identifier
      --preset <value>          set the shadcn preset (default: b0)
      --size-optimize           optimize the Tauri app for smaller release binaries
      --no-size-optimize        skip size optimization
      --starter                 include the starter dashboard
      --no-starter              skip the starter dashboard
      --invoke-example          include the Rust invoke example
      --no-invoke-example       skip the Rust invoke example
      --workflow                include the GitHub release workflow
      --no-workflow             skip the GitHub release workflow
      --animations              force terminal animations
      --no-animations           disable terminal animations

Manage options:
      --dir <path>              project directory (default: current working dir)
      --target-os <list>        comma-separated platforms for workflow (windows-latest,macos-latest,ubuntu-latest)
  -f, --force                   overwrite an existing target directory / battery
  -y, --yes                     accept defaults / skip confirmations
  -v, --version                 display version
  -h, --help                    display help

Batteries: debug-panel, workflow`);
}

function parseManageArgs(argv: string[]): ManageArgs {
  const [actionToken, ...rest] = argv;
  const action = actionToken as ManageAction;
  const args: ManageArgs = { action };
  const positional: string[] = [];

  const readValue = (index: number, flag: string) => {
    const value = rest[index + 1];
    if (!value || value.startsWith("-")) {
      throw new Error(`Missing value for ${flag}`);
    }
    return value;
  };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    switch (token) {
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      case "-f":
      case "--force":
        args.force = true;
        break;
      case "-y":
      case "--yes":
        args.yes = true;
        break;
      case "--dir":
        args.targetDir = readValue(index, token);
        index += 1;
        break;
      case "--target-os": {
        const raw = readValue(index, token);
        const values = raw
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean);
        for (const value of values) {
          if (!TARGET_OS.includes(value as TargetOs)) {
            throw new Error(`Unknown target OS "${value}". Allowed: ${TARGET_OS.join(", ")}`);
          }
        }
        args.targetOS = values as TargetOs[];
        index += 1;
        break;
      }
      default:
        if (token.startsWith("-")) {
          throw new Error(`Unknown flag: ${token}`);
        }
        positional.push(token);
    }
  }

  if (action !== "list" && positional.length === 0) {
    throw new Error(`Missing battery name. Usage: create-tauri-ui ${action} <battery>`);
  }

  if (positional.length > 1) {
    throw new Error("Only one battery may be provided per command.");
  }

  if (positional[0]) {
    args.batteryId = positional[0];
  }

  return args;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  const positional: string[] = [];

  const readValue = (index: number, flag: string) => {
    const value = argv[index + 1];

    if (!value || value.startsWith("-")) {
      throw new Error(`Missing value for ${flag}`);
    }

    return value;
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    switch (token) {
      case "-h":
      case "--help":
        args.help = true;
        break;
      case "-v":
      case "--version":
        args.version = true;
        break;
      case "-t":
      case "--template":
        args.template = readValue(index, token) as CliArgs["template"];
        index += 1;
        break;
      case "--identifier":
        args.identifier = readValue(index, token);
        index += 1;
        break;
      case "--preset":
        args.preset = readValue(index, token);
        index += 1;
        break;
      case "--size-optimize":
        args.includeSizeOptimization = true;
        break;
      case "--no-size-optimize":
        args.includeSizeOptimization = false;
        break;
      case "--starter":
        args.includeStarterUI = true;
        break;
      case "--no-starter":
        args.includeStarterUI = false;
        break;
      case "--invoke-example":
      case "--example":
        args.includeInvokeExample = true;
        break;
      case "--no-invoke-example":
      case "--no-example":
        args.includeInvokeExample = false;
        break;
      case "--workflow":
        args.includeWorkflow = true;
        break;
      case "--no-workflow":
        args.includeWorkflow = false;
        break;
      case "--animations":
        args.animations = true;
        break;
      case "--no-animations":
        args.animations = false;
        break;
      case "-f":
      case "--force":
        args.force = true;
        break;
      case "-y":
      case "--yes":
        args.yes = true;
        break;
      default:
        if (token.startsWith("-")) {
          throw new Error(`Unknown flag: ${token}`);
        }

        positional.push(token);
    }
  }

  if (positional.length > 1) {
    throw new Error("Only one target directory may be provided.");
  }

  if (positional[0]) {
    args.targetDir = positional[0];
  }

  return args;
}

async function ensureBun() {
  try {
    await execSafe("bun", ["--version"]);
  } catch {
    throw new Error("bun is required. Install it from https://bun.sh.");
  }
}

async function installDependencies(projectDir: string) {
  try {
    await execSafe("bun", ["install"], { cwd: projectDir });
  } catch (error) {
    if (error instanceof CommandError) {
      throw new ScaffoldError(
        "bun",
        "bun failed while finalizing project dependencies.",
        error.stderr || error.stdout,
      );
    }

    throw error;
  }
}

function describeError(error: unknown) {
  if (error instanceof ScaffoldError) {
    return {
      message: error.message,
      detail: error.stderr.trim(),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      detail: "",
    };
  }

  return {
    message: "An unknown error occurred.",
    detail: "",
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const firstToken = argv[0];

  if (firstToken && MANAGE_ACTIONS.has(firstToken as ManageAction)) {
    const manageArgs = parseManageArgs(argv);
    await runManageCommand(manageArgs);
    return;
  }

  const args = parseArgs(argv);

  if (args.help) {
    printHelp();
    return;
  }

  if (args.version) {
    console.log(getCliVersion());
    return;
  }

  const animate = animationsEnabled(args.animations);
  await playBrandReveal(animate);
  intro(`${pc.bold("create-tauri-ui")} ${pc.cyan("🦀")}`);
  await ensureBun();

  const options = await runPrompts(args);
  printConfiguration(options);
  installCleanupHandlers();
  const progress = new ProgressReporter(animate);
  const startedAt = Date.now();
  const warnings: string[] = [];
  let tauriTempDir: string | undefined;
  let frontendScaffold: FrontendScaffoldResult | undefined;

  try {
    progress.start("Frontend scaffold", [
      "Resolving the shadcn template",
      "Installing frontend dependencies",
      "First run takes longer while Bun warms its cache",
    ]);
    frontendScaffold = await scaffoldFrontend(options);
    const projectDir = frontendScaffold.projectDir;
    const stagingOptions = { ...options, targetDir: projectDir };
    progress.complete();

    progress.start("Tauri native layer", [
      "Generating the native project",
      "Merging Tauri configuration",
      "Applying native build settings",
    ]);
    const tauriScaffold = await scaffoldTauri(options);
    tauriTempDir = tauriScaffold.tempDir;

    await mergeTauri(projectDir, tauriScaffold.projectDir, stagingOptions);

    const adapter = getAdapter(options.template);

    try {
      await adapter.apply(projectDir, stagingOptions);
    } catch (error) {
      if (error instanceof PatchError) {
        warnings.push(`${error.message} (${error.file})`);
      } else {
        throw error;
      }
    }

    await applyTauriConfig(projectDir, stagingOptions, adapter.tauriConfig());

    if (options.includeSizeOptimization) {
      await applySizeOptimization(projectDir, stagingOptions);
    }
    progress.complete();

    progress.start("Components and batteries", [
      "Configuring desktop behavior",
      "Installing dashboard components",
      "Applying the selected project features",
    ]);
    await applyFlashPrevention(projectDir);

    await applyScrollContainer(projectDir, stagingOptions);

    await applyExternalLinkGuard(projectDir, stagingOptions);

    if (options.includeStarterUI) {
      try {
        await addStarterUI(projectDir, stagingOptions);
      } catch (error) {
        if (error instanceof ScaffoldError) {
          warnings.push([error.message, error.stderr.trim()].filter(Boolean).join("\n"));
        } else {
          throw error;
        }
      }
    }

    await applyDebugPanel(projectDir, stagingOptions);

    await applySelectionBehavior(projectDir, stagingOptions);

    if (options.includeInvokeExample) {
      await applyInvokeExample(projectDir, stagingOptions);
    }

    if (options.includeWorkflow) {
      await applyWorkflow(projectDir, stagingOptions);
    }

    await applyIcon(projectDir);
    progress.complete();

    progress.start("Finalizing project", [
      "Reusing the existing Bun installation",
      "Reconciling Tauri and frontend dependencies",
      "Preparing the completed project",
    ]);
    await installDependencies(projectDir);

    finalizeFrontendScaffold(frontendScaffold, options.targetDir);
    frontendScaffold = undefined;
    unregisterCleanupPath(options.targetDir);
    progress.complete();

    for (const warning of warnings) {
      log.warn(warning);
    }

    await playSuccessBurst(animate, `${options.projectName} is ready`);
    printInstructions(options);
    outro(`${pc.green("Built 4 phases")} in ${formatDuration(Date.now() - startedAt)}`);
  } catch (error) {
    const details = describeError(error);
    progress.error("Scaffolding failed");
    cancel(details.message);

    if (details.detail) {
      log.message(details.detail);
    }

    process.exitCode = 1;
  } finally {
    if (frontendScaffold) {
      unregisterCleanupPath(frontendScaffold.stagingDir);
      try {
        removeTempDir(frontendScaffold.stagingDir);
      } catch {}
    }

    if (tauriTempDir) {
      unregisterCleanupPath(tauriTempDir);
      try {
        removeTempDir(tauriTempDir);
      } catch {}
    }
  }
}

main().catch((error) => {
  const details = describeError(error);
  cancel(details.message);

  if (details.detail) {
    log.message(details.detail);
  }

  process.exit(1);
});
