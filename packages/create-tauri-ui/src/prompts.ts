import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { confirm, isCancel, multiselect, select, text } from "@clack/prompts";

import type { CliArgs, ProjectOptions, TemplateName } from "./types";
import { TARGET_OS, TEMPLATE_NAMES } from "./types";
import { formatTargetDir, isEmpty, isValidPackageName, toValidPackageName } from "./utils";

const DEFAULT_TARGET_DIR = "tauri-ui";
const DEFAULT_PRESET = "b0";

const TEMPLATE_LABELS: Record<TemplateName, string> = {
  vite: "Vite",
  next: "Next.js",
  start: "TanStack Start",
  "react-router": "React Router",
  astro: "Astro",
};

function unwrapPrompt<T>(value: T | symbol, message = "Operation cancelled") {
  if (isCancel(value)) {
    throw new Error(message);
  }

  return value;
}

function ensureTemplate(value: string): TemplateName {
  if (TEMPLATE_NAMES.includes(value as TemplateName)) {
    return value as TemplateName;
  }

  throw new Error(`Unsupported template "${value}". Expected one of: ${TEMPLATE_NAMES.join(", ")}`);
}

function getDefaultIdentifier(packageName: string) {
  try {
    const username = toValidPackageName(os.userInfo().username);
    const authority = username || "example";

    return `com.${authority}.${packageName}`;
  } catch {
    return `com.example.${packageName}`;
  }
}

function withTextDefault(value: string) {
  return {
    placeholder: value,
    defaultValue: value,
  };
}

export async function runPrompts(args: CliArgs, cwd = process.cwd()): Promise<ProjectOptions> {
  let targetInput = formatTargetDir(args.targetDir);

  if (!targetInput) {
    targetInput = unwrapPrompt(
      await text({
        message: "Project name",
        ...withTextDefault(DEFAULT_TARGET_DIR),
      }),
    );
  }

  if (!targetInput) {
    targetInput = DEFAULT_TARGET_DIR;
  }

  if (targetInput === ".") {
    throw new Error("Scaffolding into the current directory is not supported yet.");
  }

  const targetDir = path.resolve(cwd, targetInput);
  const projectName = path.basename(targetDir);
  const packageNameDefault = isValidPackageName(projectName)
    ? projectName
    : toValidPackageName(projectName);

  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    if (args.force) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    } else if (args.yes) {
      throw new Error(
        `Target directory "${targetInput}" is not empty. Re-run with --force to overwrite it.`,
      );
    } else {
      const overwrite = unwrapPrompt(
        await confirm({
          message: `Target directory "${targetInput}" is not empty. Remove it and continue?`,
          initialValue: false,
        }),
      );

      if (!overwrite) {
        throw new Error("Operation cancelled");
      }

      fs.rmSync(targetDir, { recursive: true, force: true });
    }
  }

  let packageName = packageNameDefault;

  if (!isValidPackageName(projectName)) {
    if (args.yes) {
      packageName = packageNameDefault;
    } else {
      packageName = unwrapPrompt(
        await text({
          message: "Package name",
          ...withTextDefault(packageNameDefault),
          validate(value) {
            if (!value || !isValidPackageName(value)) {
              return "Enter a valid package.json name";
            }
          },
        }),
      );
    }
  }

  const template = args.template
    ? ensureTemplate(args.template)
    : args.yes
      ? "vite"
      : unwrapPrompt(
          await select<TemplateName>({
            message: "Frontend template",
            initialValue: "vite",
            options: TEMPLATE_NAMES.map((value) => ({
              value,
              label: TEMPLATE_LABELS[value],
            })),
          }),
        );

  const identifier = args.identifier
    ? args.identifier
    : args.yes
      ? getDefaultIdentifier(packageName)
      : unwrapPrompt(
          await text({
            message: "App identifier",
            ...withTextDefault(getDefaultIdentifier(packageName)),
          }),
        );

  const preset = args.preset
    ? args.preset
    : args.yes
      ? DEFAULT_PRESET
      : unwrapPrompt(
          await text({
            message: "shadcn preset",
            ...withTextDefault(DEFAULT_PRESET),
          }),
        );

  const includeStarterUI =
    args.includeStarterUI ??
    (args.yes
      ? true
      : unwrapPrompt(
          await confirm({
            message: "Include starter UI?",
            initialValue: true,
          }),
        ));

  const includeInvokeExample =
    args.includeInvokeExample ??
    (args.yes
      ? true
      : unwrapPrompt(
          await confirm({
            message: "Include Rust invoke example?",
            initialValue: true,
          }),
        ));

  const includeWorkflow =
    args.includeWorkflow ??
    (args.yes
      ? true
      : unwrapPrompt(
          await confirm({
            message: "Include GitHub release workflow?",
            initialValue: true,
          }),
        ));

  const targetOS = includeWorkflow
    ? args.yes
      ? [...TARGET_OS]
      : unwrapPrompt(
          await multiselect<string>({
            message: "Target operating systems",
            initialValues: [...TARGET_OS],
            required: true,
            options: TARGET_OS.map((value) => ({
              value,
              label: value,
            })),
          }),
        )
    : [];

  return {
    projectName,
    packageName,
    template,
    identifier,
    preset,
    includeStarterUI,
    includeInvokeExample,
    includeWorkflow,
    targetOS,
    targetDir,
  };
}
