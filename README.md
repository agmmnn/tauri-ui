<div align="center">

<a href="https://tauriui.vercel.app/"><img src="https://github.com/agmmnn/tauri-ui/assets/16024979/9c694ee2-f2c8-4bec-9c06-c3a6f7d4f901" width="44" height="44" alt="crab"/></a>
<img alt="tauri-ui" src="https://github.com/user-attachments/assets/522ae78b-77d9-4cc2-b63f-41adafae4aaa" />

# tauri-ui

[![npm](https://img.shields.io/npm/v/create-tauri-ui?style=flat&color=18181b)](https://npmjs.com/package/create-tauri-ui)
[![release](https://img.shields.io/github/v/release/agmmnn/tauri-ui?style=flat&color=18181b)](https://github.com/agmmnn/tauri-ui/releases/latest)
[![tauri](https://img.shields.io/badge/tauri-v2-black?style=flat&logo=tauri&color=18181b)](https://tauri.app)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black?style=flat&logo=shadcnuit&color=18181b)](https://ui.shadcn.com)
[![license](https://img.shields.io/github/license/agmmnn/tauri-ui?style=flat&color=18181b)](LICENSE)

</div>

> ⚡ The fastest way to build a Tauri desktop app with [shadcn/ui](https://ui.shadcn.com/).

One command → shadcn frontend + native shell + desktop-ready defaults.  
No template to maintenance.

## Get started

```bash
bunx create-tauri-ui@latest
```

> Each release includes a demo build showing the expected output — available in [Releases](https://github.com/agmmnn/tauri-ui/releases/latest).

## 🔋 Batteries Included

**👩‍💻 Desktop defaults**

- no startup flash (hidden until first paint)
- external links open in system browser
- no overscroll / rubber-band scrolling
- desktop-style selection behavior
- sensible default window size and position

**➕ Extras (optional)**

- starter dashboard (`dashboard-01`)
- Rust `invoke` example
- smaller binary output (~65% smaller binary in our test)
- GitHub Actions release workflow

**🛠 Debug Panel**

- built-in debug panel for inspecting app state, invokes, events, logs, and system paths
- dev-only, zero production impact
- dockable and remembers its layout

**🧱 Upstream UI**

- `shadcn` frontend generated via official CLI
- no forks, always up to date
- adapters for `vite`, `next`, `react-router`, `astro`, `start`

## Why tauri-ui

A Tauri app isn’t desktop-ready by default.

You still need to fix window behavior, startup flash, links, scrolling, and selection otherwise it feels like a wrapped website.

`tauri-ui` handles this out of the box, while staying close to upstream.

<img alt="tauri-ui" src="https://github.com/user-attachments/assets/0b26c74b-204d-41f5-ad75-585f79af2c15" />

## How it works

```
prompts
  → official shadcn/ui init
  → official create-tauri-app setup
  → combine frontend + native shell
  → apply desktop-ready defaults
  → add optional batteries
```

No full local templates. Just a small asset and patch surface on top of the upstream CLIs.

---

📖 CLI reference and full options → [packages/create-tauri-ui](packages/create-tauri-ui/README.md)

## License

MIT
