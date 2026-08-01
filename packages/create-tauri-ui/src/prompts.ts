import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { confirm, isCancel, select, text } from "@clack/prompts";
import pc from "picocolors";

import { compactMultiselect } from "./compact-prompts";
import { promptReleaseArtifacts } from "./release-prompt";
import type { CliArgs, ProjectOptions, TemplateName } from "./types";
import { TEMPLATE_NAMES } from "./types";
import { formatTargetDir, isEmpty, isValidPackageName, toValidPackageName } from "./utils";

const DEFAULT_TARGET_DIR = "tauri-ui";
const DEFAULT_PRESET = "b0";

type FeatureName = "starter" | "size-optimization" | "invoke-example" | "workflow";

const FEATURE_OPTIONS: Array<{
  value: FeatureName;
  label: string;
  summary: string;
  initialValue: boolean;
  arg: keyof Pick<
    CliArgs,
    "includeStarterUI" | "includeSizeOptimization" | "includeInvokeExample" | "includeWorkflow"
  >;
}> = [
  {
    value: "starter",
    label: `Starter dashboard ${pc.dim("(recommended)")}`,
    summary: "Starter dashboard",
    initialValue: true,
    arg: "includeStarterUI",
  },
  {
    value: "size-optimization",
    label: `App size optimization ${pc.dim("(smaller release builds)")}`,
    summary: "Size optimization",
    initialValue: true,
    arg: "includeSizeOptimization",
  },
  {
    value: "invoke-example",
    label: `Rust invoke example ${pc.dim("(recommended)")}`,
    summary: "Invoke example",
    initialValue: true,
    arg: "includeInvokeExample",
  },
  {
    value: "workflow",
    label: `GitHub release workflow ${pc.dim("(draft releases from version tags)")}`,
    summary: "Release workflow",
    initialValue: true,
    arg: "includeWorkflow",
  },
];

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

function normalizePreset(value: string) {
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  const match = trimmed.match(/^(?:--preset(?:=|\s+))?(.+)$/);

  return (match?.[1] ?? trimmed).trim();
}

export async function runPrompts(
  args: CliArgs,
  cwd = process.cwd(),
  options: { validateTarget?: boolean } = {},
): Promise<ProjectOptions> {
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

  if (options.validateTarget !== false && fs.existsSync(targetDir) && !isEmpty(targetDir)) {
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

  const selectedFeatures = new Set<FeatureName>();

  if (args.yes) {
    if (args.includeStarterUI ?? true) selectedFeatures.add("starter");
    if (args.includeSizeOptimization ?? false) selectedFeatures.add("size-optimization");
    if (args.includeInvokeExample ?? true) selectedFeatures.add("invoke-example");
    if (args.includeWorkflow ?? true) selectedFeatures.add("workflow");
  } else {
    const selectableFeatures = FEATURE_OPTIONS.filter(({ arg }) => args[arg] === undefined);

    for (const feature of FEATURE_OPTIONS) {
      if (args[feature.arg] === true) {
        selectedFeatures.add(feature.value);
      }
    }

    if (selectableFeatures.length > 0) {
      const selected = unwrapPrompt(
        await compactMultiselect<FeatureName>({
          message: "Project features",
          initialValues: selectableFeatures
            .filter(({ initialValue }) => initialValue)
            .map(({ value }) => value),
          required: false,
          options: selectableFeatures.map(({ value, label }) => ({
            value,
            label,
          })),
          formatSelection(values) {
            return selectableFeatures
              .filter(({ value }) => values.includes(value))
              .map(({ summary }) => summary)
              .join(", ");
          },
        }),
      );

      for (const feature of selected) {
        selectedFeatures.add(feature);
      }
    }
  }

  const includeStarterUI = selectedFeatures.has("starter");
  const includeSizeOptimization = selectedFeatures.has("size-optimization");
  const includeInvokeExample = selectedFeatures.has("invoke-example");
  const includeWorkflow = selectedFeatures.has("workflow");

  const releaseArtifacts = includeWorkflow ? await promptReleaseArtifacts(args.yes) : [];

  const defaultIdentifier = getDefaultIdentifier(packageName);
  let identifier = args.identifier ?? defaultIdentifier;
  let preset = args.preset ? normalizePreset(args.preset) : DEFAULT_PRESET;

  if (!args.yes && (!args.identifier || !args.preset)) {
    const customizeAdvanced = unwrapPrompt(
      await confirm({
        message: "Advanced settings",
        active: "Configure",
        inactive: "Defaults",
        initialValue: false,
      }),
    );

    if (customizeAdvanced) {
      if (!args.identifier) {
        identifier = unwrapPrompt(
          await text({
            message: "App identifier",
            ...withTextDefault(defaultIdentifier),
          }),
        );
      }

      if (!args.preset) {
        preset = normalizePreset(
          unwrapPrompt(
            await text({
              message: "shadcn preset",
              ...withTextDefault(DEFAULT_PRESET),
            }),
          ),
        );
      }
    }
  }

  return {
    projectName,
    packageName,
    template,
    identifier,
    preset,
    includeSizeOptimization,
    includeStarterUI,
    includeInvokeExample,
    includeWorkflow,
    releaseArtifacts,
    targetDir,
  };
}
