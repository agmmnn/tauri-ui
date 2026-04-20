import path from "node:path";
import process from "node:process";
import { cancel, confirm, intro, isCancel, log, multiselect, note, outro } from "@clack/prompts";
import pc from "picocolors";

import type { ProjectOptions, TargetOs } from "../types";
import { TARGET_OS } from "../types";
import { detectProject } from "./detect";
import { type BatteryDefinition, getBattery, getStatus, listBatteries } from "./battery-registry";

export type ManageAction = "add" | "update" | "remove" | "list";

export interface ManageArgs {
  action: ManageAction;
  batteryId?: string;
  targetDir?: string;
  force?: boolean;
  yes?: boolean;
  targetOS?: TargetOs[];
}

const TARGET_OS_LABELS: Record<string, string> = {
  "windows-latest": "Windows",
  "macos-latest": "macOS (Apple Silicon + Intel)",
  "ubuntu-latest": "Linux",
};

function unwrap<T>(value: T | symbol): T {
  if (isCancel(value)) {
    throw new Error("Operation cancelled");
  }

  return value as T;
}

async function promptTargetOS(yes: boolean | undefined): Promise<TargetOs[]> {
  const defaults: TargetOs[] = ["macos-latest", "ubuntu-latest", "windows-latest"];

  if (yes) {
    return defaults;
  }

  const selection = unwrap(
    await multiselect<TargetOs>({
      message: "Target platforms for the release workflow",
      options: TARGET_OS.map((value) => ({
        value,
        label: TARGET_OS_LABELS[value] ?? value,
      })),
      initialValues: defaults,
      required: true,
    }),
  );

  return selection as TargetOs[];
}

function buildOptions(
  projectDir: string,
  template: ProjectOptions["template"],
  targetOS: string[] = [],
): ProjectOptions {
  const packageName = path.basename(projectDir);

  return {
    projectName: packageName,
    packageName,
    template,
    identifier: `com.example.${packageName}`,
    preset: "b0",
    includeSizeOptimization: false,
    includeStarterUI: false,
    includeInvokeExample: false,
    includeWorkflow: false,
    targetOS,
    targetDir: projectDir,
  };
}

async function runAdd(battery: BatteryDefinition, args: ManageArgs) {
  const { template, projectDir } = detectProject(args.targetDir ?? process.cwd());
  const status = getStatus(battery, projectDir, template);

  if (status.installed && !args.force) {
    log.warn(
      `${battery.name} is already installed. Use \`update\` to overwrite, or pass --force.`,
    );
    for (const file of status.detectedFiles) {
      log.message(`  · ${path.relative(projectDir, file)}`);
    }
    return;
  }

  let targetOS: string[] = [];

  if (battery.id === "workflow") {
    targetOS = args.targetOS?.length ? args.targetOS : await promptTargetOS(args.yes);
  }

  const options = buildOptions(projectDir, template, targetOS);
  log.info(`Installing ${battery.name} in ${pc.dim(projectDir)}`);
  await battery.apply(projectDir, options);
  log.success(`${battery.name} installed.`);
}

async function runUpdate(battery: BatteryDefinition, args: ManageArgs) {
  const { template, projectDir } = detectProject(args.targetDir ?? process.cwd());
  const status = getStatus(battery, projectDir, template);

  if (!status.installed && !args.force) {
    log.warn(
      `${battery.name} is not installed yet. Use \`add\` to install, or pass --force to write anyway.`,
    );
    return;
  }

  if (!args.yes) {
    const confirmed = unwrap(
      await confirm({
        message: `Overwrite ${battery.name} files with the latest template?`,
        initialValue: true,
      }),
    );

    if (!confirmed) {
      log.info("Update cancelled.");
      return;
    }
  }

  let targetOS: string[] = [];

  if (battery.id === "workflow") {
    targetOS = args.targetOS?.length ? args.targetOS : await promptTargetOS(args.yes);
  }

  const options = buildOptions(projectDir, template, targetOS);
  await battery.apply(projectDir, options);
  log.success(`${battery.name} updated.`);
}

async function runRemove(battery: BatteryDefinition, args: ManageArgs) {
  const { template, projectDir } = detectProject(args.targetDir ?? process.cwd());
  const status = getStatus(battery, projectDir, template);

  if (!status.installed) {
    log.warn(`${battery.name} is not installed.`);
    return;
  }

  if (!args.yes) {
    const confirmed = unwrap(
      await confirm({
        message: `Remove ${battery.name} files from this project?`,
        initialValue: false,
      }),
    );

    if (!confirmed) {
      log.info("Remove cancelled.");
      return;
    }
  }

  const options = buildOptions(projectDir, template);
  const result = battery.remove(projectDir, options);

  if (result.removed.length === 0) {
    log.warn("No files removed.");
  } else {
    log.success(`Removed ${result.removed.length} file(s):`);
    for (const file of result.removed) {
      log.message(`  · ${file}`);
    }
  }

  if (result.manual.length > 0) {
    note(result.manual.map((line) => `- ${line}`).join("\n"), "Manual cleanup");
  }
}

function runList(args: ManageArgs) {
  const { template, projectDir } = detectProject(args.targetDir ?? process.cwd());
  const rows: string[] = [];

  for (const battery of listBatteries()) {
    const status = getStatus(battery, projectDir, template);
    const marker = status.installed ? pc.green("●") : pc.dim("○");
    const label = status.installed ? pc.green("installed") : pc.dim("not installed");
    rows.push(`${marker} ${pc.bold(battery.id.padEnd(14))}  ${label}`);
    rows.push(pc.dim(`    ${battery.description}`));
  }

  note(rows.join("\n"), `Batteries (${template})`);
}

export async function runManageCommand(args: ManageArgs) {
  intro(pc.bold(`create-tauri-ui · ${args.action}`));

  try {
    if (args.action === "list") {
      runList(args);
      outro("Done");
      return;
    }

    if (!args.batteryId) {
      throw new Error(
        `Missing battery name. Available: ${listBatteries()
          .map((battery) => battery.id)
          .join(", ")}`,
      );
    }

    const battery = getBattery(args.batteryId);

    switch (args.action) {
      case "add":
        await runAdd(battery, args);
        break;
      case "update":
        await runUpdate(battery, args);
        break;
      case "remove":
        await runRemove(battery, args);
        break;
    }

    outro("Done");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    cancel(message);
    process.exitCode = 1;
  }
}
