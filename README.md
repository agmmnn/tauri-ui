# tauri-ui

[npm](https://npmjs.com/package/create-tauri-ui)
[release](https://github.com/agmmnn/tauri-ui/releases/latest)
[tauri](https://tauri.app)
[shadcn/ui](https://ui.shadcn.com)
[license](LICENSE)

> ⚡ The fastest way to build a Tauri desktop app with [shadcn/ui](https://ui.shadcn.com/).

One command → shadcn frontend + native shell + desktop-ready defaults.  
No templates to maintain — upstream CLIs do the heavy lifting.

## Get started

```bash
bunx create-tauri-ui@latest
```

> Each release includes a demo build showing the expected output — available in [Releases](https://github.com/agmmnn/tauri-ui/releases/latest).

## After scaffold

```bash
cd my-app
bun install
bun run tauri dev
```

- swap icons: `bunx tauri icon ./app-icon.png`
- add shadcn components: `bunx shadcn@latest add dialog sonner`
- add tauri plugins: `bun run tauri add store` ([plugin list](https://tauri.app/plugin/))
- batteries live in `src/components/` (debug-panel, external-link-guard, theme-provider)
- tweak window defaults in `src-tauri/tauri.conf.json`
- CLI flags + opt-outs → [packages/create-tauri-ui](packages/create-tauri-ui/README.md)

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

**🛠 Debug Panel**  ·  Cmd / Ctrl + D

- inspects app state, route, window, tracked invokes, runtime events, plugin logs, and system paths
- live host diagnostics: theme & a11y, locale, display, input, network
- hover any field for the source snippet with a web / tauri origin chip — click to copy
- dev-only, zero production impact — dockable and remembers its layout

**🧱 Upstream UI**

- `shadcn` frontend generated via official CLI
- no forks, always up to date
- adapters for `vite`, `next`, `react-router`, `astro`, `start`

## Why tauri-ui

A fresh Tauri app feels like a wrapped website. Window state, startup flash, link routing, overscroll, native selection — chores you hit on every project.

`tauri-ui` handles them by default and stays close to upstream `shadcn` and `create-tauri-app` — nothing forks, nothing drifts from the docs.

**🦾 Better with AI coding agents:** one command lands a familiar `shadcn` + Tauri layout your agent already knows. No custom wrappers, no forked libraries, just the upstream APIs the agent was trained on. No tokens burned debating the stack.

## How it works

```
cli prompts
  → official shadcn/ui init
  → official create-tauri-app setup
  → combine frontend + native shell
  → apply desktop-ready defaults
  → add optional batteries
```

No full local templates. Just a small asset and patch surface on top of the upstream CLIs.

## Manage batteries after scaffold

Run inside an existing tauri-ui project to add, update, or remove batteries without re-scaffolding:

> *Template auto-detected (no manifest file written to your repo), updates are idempotent; commit first and review the diff.*

```bash
bunx create-tauri-ui@latest list                  # show install status
bunx create-tauri-ui@latest update debug-panel    # pull the latest template
bunx create-tauri-ui@latest add workflow          # add the release workflow later
bunx create-tauri-ui@latest remove workflow
```

## 🧑‍🍳 Built with **tauri-ui**

- **[speedbox](https://github.com/agmmnn/speedbox)** — internet and DNS speed test desktop app.

> *Built something with `tauri-ui`? [Open a PR](https://github.com/agmmnn/tauri-ui/pulls) adding it to this list — one line with a link and a short description.*

---

📖 CLI reference and full options → [packages/create-tauri-ui](packages/create-tauri-ui/README.md)

## License

MIT