---
"create-tauri-ui": minor
---

Add `add`, `update`, `remove`, and `list` subcommands for managing batteries in an existing project.

- `create-tauri-ui list` — show installed + available batteries with status
- `create-tauri-ui add <battery>` — install a battery into an existing project (prompts for missing options)
- `create-tauri-ui update <battery>` — re-apply the battery using the latest bundled templates; idempotent patches preserve existing wiring
- `create-tauri-ui remove <battery>` — delete owned files and best-effort revert mount/imports; prints a manual-cleanup checklist for external dependencies
- supported batteries: `debug-panel`, `workflow`
- template (`vite` / `next` / `start` / `react-router` / `astro`) auto-detected from `package.json` and project structure — no manifest file is written to your repo
- `--dir <path>` selects the project directory; `--target-os` sets workflow platforms; `--yes` skips confirmations; `--force` overrides safety checks
