import process from "node:process";
import { intro, log, outro } from "@clack/prompts";
import pc from "picocolors";

import { runPrompts } from "./prompts";
import {
  ProgressReporter,
  animationsEnabled,
  formatDuration,
  playBrandReveal,
  playSuccessBurst,
  printConfiguration,
  printInstructions,
} from "./ui";

const PHASES = [
  {
    label: "Frontend scaffold",
    duration: 2_600,
    hints: [
      "Resolving the shadcn template",
      "Installing frontend dependencies",
      "First run takes longer while Bun warms its cache",
    ],
  },
  {
    label: "Tauri native layer",
    duration: 900,
    hints: [
      "Generating the native project",
      "Merging Tauri configuration",
      "Applying native build settings",
    ],
  },
  {
    label: "Components and batteries",
    duration: 1_800,
    hints: [
      "Configuring desktop behavior",
      "Installing dashboard components",
      "Applying the selected project features",
    ],
  },
  {
    label: "Finalizing project",
    duration: 1_400,
    hints: [
      "Reusing the existing Bun installation",
      "Reconciling Tauri and frontend dependencies",
      "Preparing the completed project",
    ],
  },
];

function wait(durationMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, durationMs));
}

async function main() {
  const animationsOverride = process.argv.includes("--no-animations") ? false : true;
  const animate = animationsEnabled(animationsOverride);
  const skipPrompts = process.argv.includes("--yes");

  await playBrandReveal(animate);
  intro(`${pc.bold("create-tauri-ui")} ${pc.cyan("🦀")} ${pc.dim("UI preview")}`);

  const options = await runPrompts(
    { targetDir: "tauri-ui-preview", yes: skipPrompts },
    process.cwd(),
    { validateTarget: false },
  );
  printConfiguration(options);

  const progress = new ProgressReporter(animate, [600, 1_200, 2_000]);
  const startedAt = Date.now();

  for (const phase of PHASES) {
    progress.start(phase.label, phase.hints);
    await wait(phase.duration);
    progress.complete();
  }

  await playSuccessBurst(animate, `${options.projectName} is ready`);
  printInstructions(options);
  log.warn("Preview mode · no files were written.");
  outro(`${pc.green("Previewed 4 phases")} in ${formatDuration(Date.now() - startedAt)}`);
}

main().catch((error) => {
  log.error(error instanceof Error ? error.message : "UI preview failed");
  process.exitCode = 1;
});
