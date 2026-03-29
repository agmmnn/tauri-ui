---
"create-tauri-ui": patch
---

Fix Windows Vite scaffolding and release workflow compatibility.

- make Vite battery patching tolerant of Windows line endings
- update generated release workflows for the current `tauri-action` input names
- relax generated app Bun installs in CI so smoke builds are reproducible
