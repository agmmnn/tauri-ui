---
"create-tauri-ui": patch
---

Fix Windows release scaffolding and smoke workflow compatibility.

- normalize edited files before patching so generated Windows files patch reliably
- harden Vite and Cargo patch steps used by the debug panel and external link guard
- improve the release smoke workflow app naming and dashboard setup
