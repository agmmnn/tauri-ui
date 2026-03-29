---
"create-tauri-ui": patch
---

Fix the generated release workflow and the repository smoke-release pipeline.

- dispatch the smoke build workflow after package publish
- pin `tauri-action` to the latest published action tag
- update generated Tauri release workflows to use the same action pin
