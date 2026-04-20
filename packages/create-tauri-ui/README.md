# create-tauri-ui

CLI to scaffold Tauri desktop apps with `shadcn/ui`. Drives the upstream `shadcn` and `create-tauri-app` CLIs — no local template tree to maintain.

## Install & run

```bash
# bun
bun create tauri-ui my-app
bunx create-tauri-ui@latest my-app

# npm
npm create tauri-ui@latest my-app
npx create-tauri-ui@latest my-app
```

## After generation

```bash
cd my-app
bun install
bun run tauri dev
```

To regenerate the Tauri icon set from the included source image:

```bash
bunx tauri icon app-icon.png
```

> Bun is required in generated projects.

## CLI reference

```
Usage:
  create-tauri-ui [target-dir] [options]              scaffold a new project
  create-tauri-ui <add|update|remove> <battery>       manage batteries in an existing project
  create-tauri-ui list                                list batteries + install status

Scaffold options:
  -t, --template <name>     vite | next | start | react-router | astro
      --identifier <value>  Tauri app identifier (e.g. com.example.myapp)
      --preset <value>      shadcn preset (default: b0)
      --size-optimize       optimize release binaries for size
      --no-size-optimize    skip size optimization
      --starter             include the starter dashboard
      --no-starter          skip the starter dashboard
      --invoke-example      include the Rust invoke example
      --no-invoke-example   skip the Rust invoke example
      --workflow            include the GitHub release workflow
      --no-workflow         skip the GitHub release workflow

Manage options:
      --dir <path>          project directory (default: current working dir)
      --target-os <list>    comma-separated platforms for workflow
                            (windows-latest,macos-latest,ubuntu-latest)
  -f, --force               overwrite an existing target directory / battery
  -y, --yes                 accept defaults / skip confirmations
  -v, --version             display version
  -h, --help                display help

Batteries: debug-panel, workflow
```

## Managing batteries in an existing project

Run inside a scaffolded project to install, update, or remove a battery after the fact.

```bash
# see which batteries are installed
bunx create-tauri-ui@latest list

# upgrade the debug panel to the latest template
bunx create-tauri-ui@latest update debug-panel

# add the release workflow later
bunx create-tauri-ui@latest add workflow --target-os macos-latest,ubuntu-latest

# remove it
bunx create-tauri-ui@latest remove workflow
```

`update` re-applies the battery using the latest CLI templates. Patches are idempotent — existing mounts, imports, and plugin registrations are preserved. Commit first, then run `update` and inspect the diff.

`remove` deletes the battery's owned files and best-effort reverts any wiring. For batteries with external dependencies (like the debug panel's `tauri-plugin-log` + `@tauri-apps/plugin-log`), the CLI prints a manual cleanup checklist.

The template is auto-detected from `package.json` and project structure — no manifest file is written to your repo.

## Examples

**Vite app with all defaults:**

```bash
npm create tauri-ui@latest my-app -- --template vite --yes
```

**Next.js app, no dashboard, no workflow:**

```bash
npm create tauri-ui@latest my-app -- --template next --yes --no-starter --no-workflow
```

**Astro app with a custom bundle identifier:**

```bash
bun create tauri-ui my-app --template astro --identifier com.example.astroapp --yes
```

**Vite app with size-optimized release binary:**

```bash
bun create tauri-ui my-app --template vite --size-optimize --yes
```

## Batteries included

Every generated project gets:

- `src-tauri` native layer (from `create-tauri-app`)
- shadcn frontend scaffold (from the upstream `shadcn` CLI)
- framework adapters for `vite`, `next`, `start`, `react-router`, `astro`
- Tauri config patches for desktop dev and build output
- centered `1400×918` main window
- startup flash prevention (window hidden until first paint)
- external link guard — internal links stay in-app, external links open in the system browser
- overscroll / rubber-band scroll disabled
- desktop selection defaults — global `select-none`, intrinsic selectable allowlist, `.ui-selectable` utility class
- dev-only debug panel with runtime info, tracked invokes, runtime events, and log stream
- `app-icon.png` source asset

**Optional** (prompted during scaffolding, or passed as flags):

| Battery                 | Flag                                       | Notes                                       |
| ----------------------- | ------------------------------------------ | ------------------------------------------- |
| Starter dashboard       | `--starter` / `--no-starter`               | based on `dashboard-01`                     |
| Rust invoke example     | `--invoke-example` / `--no-invoke-example` |                                             |
| Size optimization       | `--size-optimize` / `--no-size-optimize`   | ~65% smaller release binary (9 MB → 3.1 MB) |
| GitHub release workflow | `--workflow` / `--no-workflow`             |                                             |

## Template status

| Template           | Status                                          |
| ------------------ | ----------------------------------------------- |
| `vite`             | smoke-tested end to end                         |
| `next`             | stable                                          |
| `react-router`     | stable                                          |
| `astro`            | stable                                          |
| `start` (TanStack) | experimental — validate carefully after changes |

Scaffolding into `.` (current directory) is not supported yet.

## How it works

```
prompts → shadcn init → create-tauri-app (temp dir) → merge src-tauri → apply framework patches → add batteries
```

Local asset surface is intentionally small:

```
assets/app-icon.png
assets/release.yml.tmpl
```

No full frontend templates are shipped. The upstream CLIs do the heavy lifting; this package handles the merge, patching, and battery injection.

## Development

Run from the monorepo root:

```bash
bun run --cwd packages/create-tauri-ui check-types
bun run --cwd packages/create-tauri-ui build
```

Run the local build directly:

```bash
bun run --cwd packages/create-tauri-ui start -- --help
```

## Testing

**Type check + build:**

```bash
bun run --cwd packages/create-tauri-ui check-types
bun run --cwd packages/create-tauri-ui build
```

**Single template smoke test:**

```bash
rm -rf /tmp/ctui-vite
node packages/create-tauri-ui/index.js /tmp/ctui-vite --template vite --yes --no-workflow
cd /tmp/ctui-vite && bun install && bun run build
```

**All templates:**

```bash
for template in vite next start react-router astro; do
  dir="/tmp/create-tauri-ui-$template"
  rm -rf "$dir"
  node packages/create-tauri-ui/index.js "$dir" --template "$template" --yes --no-workflow
  (cd "$dir" && bun install && bun run build) || exit 1
done
```

## License

MIT
