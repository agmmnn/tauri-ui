# create-tauri-ui

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
