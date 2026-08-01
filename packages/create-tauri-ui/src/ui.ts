import process from "node:process";
import { log, note, spinner } from "@clack/prompts";
import pc from "picocolors";

import { formatReleaseArtifactCounts } from "./release-prompt";
import type { ProjectOptions, TemplateName } from "./types";

const TEMPLATE_LABELS: Record<TemplateName, string> = {
  vite: "Vite",
  next: "Next.js",
  start: "TanStack Start",
  "react-router": "React Router",
  astro: "Astro",
};

const SPINNER_FRAMES = ["◜", "◠", "◝", "◞", "◡", "◟"];

type ActivePhase = {
  label: string;
  startedAt: number;
  hintTimeouts?: NodeJS.Timeout[];
  indicator?: ReturnType<typeof spinner>;
};

export function formatDuration(elapsedMs: number) {
  if (elapsedMs < 1000) {
    return `${Math.max(1, Math.round(elapsedMs))}ms`;
  }

  return `${(elapsedMs / 1000).toFixed(elapsedMs < 10_000 ? 1 : 0)}s`;
}

export function animationsEnabled(override: boolean | undefined) {
  if (override !== undefined) return override;

  return Boolean(
    process.stdout.isTTY &&
    !process.env.CI &&
    process.env.TERM !== "dumb" &&
    process.env.CREATE_TAURI_UI_NO_MOTION !== "1",
  );
}

export class ProgressReporter {
  private active?: ActivePhase;

  constructor(
    private readonly animated: boolean,
    private readonly hintThresholds = [8_000, 20_000, 40_000],
  ) {}

  start(label: string, hints: string[] = []) {
    if (this.active) {
      throw new Error(`Cannot start "${label}" while "${this.active.label}" is still running.`);
    }

    const phase: ActivePhase = {
      label,
      startedAt: Date.now(),
    };

    if (this.animated) {
      phase.indicator = spinner({
        frames: SPINNER_FRAMES,
        delay: 80,
        styleFrame: (frame) => pc.cyan(frame),
      });
      phase.indicator.start(label);
      phase.hintTimeouts = hints.slice(0, 3).map((hint, index) => {
        return setTimeout(() => {
          phase.indicator?.message(`${label} ${pc.dim(`· ${hint}`)}`);
        }, this.hintThresholds[index]);
      });
    } else {
      log.step(label);
    }

    this.active = phase;
  }

  complete() {
    const phase = this.active;
    if (!phase) return;

    for (const timeout of phase.hintTimeouts ?? []) clearTimeout(timeout);
    const message = `${phase.label} ${pc.dim(`· ${formatDuration(Date.now() - phase.startedAt)}`)}`;

    if (phase.indicator) {
      phase.indicator.stop(message);
    } else {
      log.success(message);
    }

    this.active = undefined;
  }

  error(message = "Scaffolding failed") {
    const phase = this.active;

    for (const timeout of phase?.hintTimeouts ?? []) clearTimeout(timeout);
    if (phase?.indicator) {
      phase.indicator.error(message);
    } else {
      log.error(message);
    }

    this.active = undefined;
  }
}

export function printConfiguration(options: ProjectOptions) {
  const features = [
    options.includeStarterUI && "Starter dashboard",
    "Debug panel",
    options.includeSizeOptimization && "Size optimization",
    options.includeInvokeExample && "Invoke example",
    options.includeWorkflow && "Release workflow",
  ].filter((feature): feature is string => Boolean(feature));

  const summary = [
    `${pc.bold(options.projectName)} · ${TEMPLATE_LABELS[options.template]} · ${pc.dim(options.preset)}`,
    `${pc.dim("Features")}  ${features.length} selected`,
  ];

  if (options.includeWorkflow) {
    summary.push(`${pc.dim("Releases")}  ${formatReleaseArtifactCounts(options.releaseArtifacts)}`);
  }

  log.info(summary.join("\n"));
}

function shellPath(targetPath: string) {
  return targetPath.includes(" ") ? `"${targetPath.replace(/"/g, '\\"')}"` : targetPath;
}

export function printInstructions(options: ProjectOptions) {
  const instructions = [
    pc.bold("Run your app"),
    `  ${pc.cyan(`cd ${shellPath(options.targetDir)}`)}`,
    `  ${pc.cyan("bun run tauri dev")}`,
    "",
    pc.dim("Optional"),
    `  ${pc.dim("bunx tauri icon app-icon.png")}`,
  ];

  if (options.includeWorkflow) {
    instructions.push(`  ${pc.dim("Push a v* tag to create a draft GitHub release.")}`);
  }

  note(instructions.join("\n"), "Next steps", { format: (line) => line });
}

function wait(durationMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, durationMs));
}

export async function playBrandReveal(enabled: boolean) {
  if (!enabled || !process.stdout.isTTY) return;

  const frames = [pc.dim("·"), pc.cyan("✦"), pc.cyan("🦀")];

  process.stdout.write("\u001B[?25l");
  try {
    for (const frame of frames) {
      process.stdout.write(`\r\u001B[2K${pc.bold("create-tauri-ui")}  ${frame}`);
      await wait(110);
    }
  } finally {
    process.stdout.write("\r\u001B[2K\u001B[?25h");
  }
}

export async function playSuccessBurst(enabled: boolean, message = "Project ready") {
  if (!enabled) {
    log.success(message);
    return;
  }

  const celebration = spinner({
    frames: ["·", "✦", "◆", "✦"],
    delay: 120,
    styleFrame: (frame) => pc.cyan(frame),
  });

  celebration.start(message);
  await wait(840);
  celebration.stop(message);
}
