# create-tauri-ui

## 1.1.0

### Minor Changes

- 07b6577: Add `add`, `update`, `remove`, and `list` subcommands for managing batteries in an existing project.

  - `create-tauri-ui list` — show installed + available batteries with status
  - `create-tauri-ui add <battery>` — install a battery into an existing project (prompts for missing options)
  - `create-tauri-ui update <battery>` — re-apply the battery using the latest bundled templates; idempotent patches preserve existing wiring
  - `create-tauri-ui remove <battery>` — delete owned files and best-effort revert mount/imports; prints a manual-cleanup checklist for external dependencies
  - supported batteries: `debug-panel`, `workflow`
  - template (`vite` / `next` / `start` / `react-router` / `astro`) auto-detected from `package.json` and project structure — no manifest file is written to your repo
  - `--dir <path>` selects the project directory; `--target-os` sets workflow platforms; `--yes` skips confirmations; `--force` overrides safety checks

## 1.0.7

### Patch Changes

- 0122004: Extend the development debug panel with host-default diagnostics and source-snippet tooltips.

  - add Display, Locale, Input, and Network sections that surface live host signals (viewport, DPR, color gamut, locale chain, timezone, calendar, first day of week, pointer precision, hover, touch, platform, connection type, online/offline) driven by `matchMedia` and `navigator.*` listeners
  - merge Theme and Accessibility into a single Overview section covering color scheme, reduced motion, contrast, forced colors, inverted colors, and transparency
  - fold the former Webview panel into App; drop the speedbox-specific Resolution Trace
  - extend `KeyValueGrid` entries to accept an optional `{ code, origin: "web" | "tauri" }` meta tuple — labels with meta render a dotted underline and a hover tooltip showing the source snippet plus a colored origin chip (`WEB API` / `TAURI API`)
  - click the snippet inside the tooltip to copy it to the clipboard with a brief "Copied!" confirmation
  - self-host `TooltipProvider` inside the panel and thread the panel's CSS variables through a context so portaled tooltips match the panel's light/dark theme regardless of the parent app

## 1.0.6

### Patch Changes

- 080a981: Add an optional size optimization battery and improve the CLI/docs polish.
  - add `--size-optimize` / `--no-size-optimize` to apply smaller Tauri release profile settings and enable `removeUnusedCommands`
  - add `-v` / `--version`
  - refresh the root and package READMEs with clearer battery, workflow, and CLI documentation

## 1.0.5

### Patch Changes

- af26d08: Improve the generated desktop shell and debug tooling.
  - scope the generated scroll container to a dedicated root shell so starter layouts do not create nested `main` scrollbars
  - refresh the development debug panel with a denser inspector-style layout, improved docking behavior, and a dedicated tool palette
  - polish the workflow setup prompts with clearer target OS labels and document generated CSS battery behavior more clearly

## 1.0.4

### Patch Changes

- 59d46a3: Fix Windows release scaffolding and smoke workflow compatibility.
  - normalize edited files before patching so generated Windows files patch reliably
  - harden Vite and Cargo patch steps used by the debug panel and external link guard
  - improve the release smoke workflow app naming and dashboard setup

## 1.0.3

### Patch Changes

- 6226a01: Fix Windows Vite scaffolding and release workflow compatibility.
  - make Vite battery patching tolerant of Windows line endings
  - update generated release workflows for the current `tauri-action` input names
  - relax generated app Bun installs in CI so smoke builds are reproducible

## 1.0.2

### Patch Changes

- 8620dd6: Fix the generated release workflow and the repository smoke-release pipeline.
  - dispatch the smoke build workflow after package publish
  - pin `tauri-action` to the latest published action tag
  - update generated Tauri release workflows to use the same action pin

## 1.0.1

### Patch Changes

- 4e9124c: Fix the package release pipeline after the 1.0.0 bootstrap publish.
  - align the release workflow with the `master` branch
  - ensure package tags create GitHub releases
  - repair the release smoke app workflow and trigger behavior
