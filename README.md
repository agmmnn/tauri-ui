<div align="center">
<a href="https://tauriui.vercel.app/"><img src="https://github.com/agmmnn/tauri-ui/assets/16024979/9c694ee2-f2c8-4bec-9c06-c3a6f7d4f901" width="44" height="44" alt="crab"/></a> 
<img src="https://github.com/user-attachments/assets/8e46eca9-458e-49f6-85c4-19d3834c16e3" alt="tauri-ui"/>

# tauri-ui

</div>

Create modern Tauri desktop apps with `shadcn/ui` and a desktop-first default setup.

`create-tauri-ui` scaffolds the frontend with the upstream `shadcn` CLI, generates the native shell with `create-tauri-app`, and merges the result into a Tauri-ready project. The goal is to stay close to upstream tools without maintaining a large local template tree.

## Features

- **🧱 Upstream-first scaffolding**: uses the `shadcn` CLI for the frontend and `create-tauri-app` for the native shell
- **🖥️ Desktop defaults out of the box**: window sizing, startup flash prevention, external link guarding, overscroll prevention, and desktop-style selection behavior
- **🔋 Built-in batteries**: optional starter dashboard, Rust invoke example, desktop release workflow, and a dev-only debug panel
- **🧭 Framework-aware adapters**: tuned for `vite`, `next`, `start`, `react-router`, and `astro`
- **🧹 Low-maintenance generator design**: no large local template tree, just a small asset and patch surface

## Quick Start

Primary commands:

```bash
bun create tauri-ui my-app

# direct binary command

bunx create-tauri-ui@latest my-app
```

Then run the generated app:

```bash
cd my-app
bun install
bun run tauri dev
```

<details>
<summary>Detailed Commands</summary>

Generate a Vite app with defaults:

```bash
npm create tauri-ui@latest my-app -- --template vite --yes
```

Generate a Next.js app without the starter dashboard or workflow:

```bash
npm create tauri-ui@latest my-app -- --template next --yes --no-starter --no-workflow
```

Generate an Astro app with a custom identifier:

```bash
bun create tauri-ui my-app --template astro --identifier com.example.astroapp --yes
```

</details>

## Batteries Included 🔋

**Core setup**

- `shadcn` frontend (upstream)
- merged `src-tauri` native layer
- framework adapters (`vite`, `next`, `start`, `react-router`, `astro`)

**Desktop defaults**

- centered `1400x918` window
- no startup flash (delayed show)
- external links open in system browser
- no overscroll / rubber-band scrolling
- desktop-style selection (`select-none` + opt-in)

**Dev tools**

- built-in debug panel  
  (invokes, events, logs, paths, webview info)

**Assets**

- included `app-icon.png`

**Optional**

- starter dashboard (`dashboard-01`)
- Rust `invoke` example
- GitHub Actions release workflow

## How It Works

```text
prompts -> shadcn init -> create-tauri-app (temp) -> merge src-tauri -> apply framework patches -> add batteries
```

This project avoids shipping full local project templates. It keeps a small local surface of assets and patch logic, and lets the upstream CLIs do the heavy lifting.

## Monorepo

This repository is a monorepo. The CLI package lives at [packages/create-tauri-ui](packages/create-tauri-ui).
For the full package documentation, examples, CLI options, and development notes, see [packages/create-tauri-ui/README.md](packages/create-tauri-ui/README.md).

## License

MIT
