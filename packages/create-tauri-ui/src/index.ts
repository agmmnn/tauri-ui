import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { cancel, intro, log, note, outro, spinner } from "@clack/prompts";
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
import { applyTauriConfig, mergeTauri } from "./merge";
import { runPrompts } from "./prompts";
import { addStarterUI, scaffoldFrontend, scaffoldTauri } from "./scaffold";
import type { CliArgs } from "./types";
import {
  PatchError,
  ScaffoldError,
  execSafe,
  installCleanupHandlers,
  registerCleanupPath,
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

function printHelp() {
  console.log(`Usage: create-tauri-ui [target-dir] [options]

Options:
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
  -f, --force                   overwrite an existing target directory
  -y, --yes                     accept defaults
  -v, --version                 display version
  -h, --help                    display help`);
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

function formatShellPath(targetPath: string) {
  const relativePath = path.relative(process.cwd(), targetPath) || ".";
  return relativePath.includes(" ") ? `"${relativePath}"` : relativePath;
}

function pruneGeneratedInstallArtifacts(targetDir: string) {
  fs.rmSync(path.join(targetDir, "node_modules"), {
    recursive: true,
    force: true,
  });
}

function printInstructions(targetDir: string, includeWorkflow: boolean) {
  const steps = [
    `cd ${formatShellPath(targetDir)}`,
    "bun install",
    "bun run tauri dev",
    "bunx tauri icon app-icon.png",
  ];

  note(steps.join("\n"), "Next steps");

  if (includeWorkflow) {
    note(
      "Configure the GitHub release workflow secrets before publishing builds.",
      "Release workflow",
    );
  }
}

async function ensureBun() {
  try {
    await execSafe("bun", ["--version"]);
  } catch {
    throw new Error("bun is required. Install it from https://bun.sh.");
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
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (args.version) {
    console.log(getCliVersion());
    return;
  }

  intro(pc.bold("create-tauri-ui"));
  await ensureBun();

  const options = await runPrompts(args);
  installCleanupHandlers();
  registerCleanupPath(options.targetDir);
  const step = spinner();
  let tempDir: string | undefined;

  try {
    step.start("Creating the shadcn frontend scaffold");
    await scaffoldFrontend(options);

    step.message("Creating the Tauri native scaffold");
    const tauriScaffold = await scaffoldTauri(options);
    tempDir = tauriScaffold.tempDir;

    step.message("Merging the native layer into the frontend project");
    await mergeTauri(options.targetDir, tauriScaffold.projectDir, options);

    const adapter = getAdapter(options.template);
    step.message(`Patching the ${options.template} project for Tauri`);

    try {
      await adapter.apply(options.targetDir, options);
    } catch (error) {
      if (error instanceof PatchError) {
        log.warn(`${error.message} (${error.file})`);
      } else {
        throw error;
      }
    }

    await applyTauriConfig(options.targetDir, options, adapter.tauriConfig());

    if (options.includeSizeOptimization) {
      step.message("Applying the app size optimization battery");
      await applySizeOptimization(options.targetDir, options);
    }

    step.message("Applying the startup flash-prevention battery");
    await applyFlashPrevention(options.targetDir);

    step.message("Applying the desktop scroll container battery");
    await applyScrollContainer(options.targetDir, options);

    step.message("Applying the external link guard battery");
    await applyExternalLinkGuard(options.targetDir, options);

    if (options.includeStarterUI) {
      step.message("Installing the starter dashboard");

      try {
        await addStarterUI(options.targetDir, options);
      } catch (error) {
        if (error instanceof ScaffoldError) {
          log.warn(error.message);
          if (error.stderr.trim()) {
            log.message(error.stderr.trim());
          }
        } else {
          throw error;
        }
      }
    }

    step.message("Applying the development debug panel battery");
    await applyDebugPanel(options.targetDir, options);

    step.message("Applying the desktop selection-behavior battery");
    await applySelectionBehavior(options.targetDir, options);

    if (options.includeInvokeExample) {
      step.message("Adding the Rust invoke example");
      await applyInvokeExample(options.targetDir, options);
    }

    if (options.includeWorkflow) {
      step.message("Writing the GitHub release workflow");
      await applyWorkflow(options.targetDir, options);
    }

    step.message("Copying the app icon source");
    await applyIcon(options.targetDir);

    pruneGeneratedInstallArtifacts(options.targetDir);
    unregisterCleanupPath(options.targetDir);

    step.stop("Project ready");
    printInstructions(options.targetDir, options.includeWorkflow);
    outro(`Scaffolded ${pc.cyan(options.projectName)} in ${pc.dim(options.targetDir)}`);
  } catch (error) {
    const details = describeError(error);
    step.error("Scaffolding failed");
    cancel(details.message);

    if (details.detail) {
      log.message(details.detail);
    }

    process.exitCode = 1;
  } finally {
    if (tempDir) {
      unregisterCleanupPath(tempDir);
      try {
        removeTempDir(tempDir);
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
