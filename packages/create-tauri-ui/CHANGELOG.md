# create-tauri-ui

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
