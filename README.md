> updates soon

<div align="center">
<a href="https://tauriui.vercel.app/"><img src="https://github.com/agmmnn/tauri-ui/assets/16024979/9c694ee2-f2c8-4bec-9c06-c3a6f7d4f901" width="44" height="44" alt="crab"/></a> <img src="https://github.com/agmmnn/tauri-ui/assets/16024979/fd89df5b-77f9-417e-89c8-ccf433cdf405" alt="tauri-ui"/>

<br>
<br>

Create modern Tauri desktop apps in just a few simple steps. Tauri UI Templates is a starting point for building modern desktop applications with web technologies with using [shadcn/ui](https://github.com/shadcn/ui), [Tauri](https://github.com/tauri-apps/tauri).

> _You can download pre-built final bundles from the [Releases](https://github.com/agmmnn/tauri-ui/releases) section._

## Getting Started

Use [create-tauri-ui](https://npmjs.com/package/create-tauri-ui) to quickly scaffold a Tauri UI project.

```bash
pnpm create tauri-ui
```

<details>

```bash
npx create-tauri-ui@latest
pnpm create tauri-ui
npm create tauri-ui@latest
yarn create tauri-ui
```

Then follow the prompts!

You can also directly specify the project name and the template you want to use via additional command line options. For example, to scaffold a Tauri-UI project, run:

```bash
# npm 7+, extra double-dash is needed:
npm create tauri-ui@latest my-tauri-app -- --template vite

# yarn
yarn create tauri-ui my-tauri-app --template next

# pnpm
pnpm create tauri-ui my-tauri-app --template sveltekit
```

</details>

![cli](https://github.com/agmmnn/tauri-ui/assets/16024979/86bf3b81-8671-4de3-bb48-7fb24fe48802)
You can use `.` for the project name to scaffold in the current directory.

<details>

<summary>
Or clone the repository
</summary>

```bash
gh repo clone agmmnn/tauri-ui
cd tauri-ui/templates/<template>

pnpm i
pnpm tauri dev
pnpm tauri build
```

</details>

## Features

- Components-based UI design with [shadcn/ui](https://ui.shadcn.com/). [Radix UI](https://www.radix-ui.com/) for UI primitives.
- Native-looking window controls with [tauri-controls](https://github.com/agmmnn/tauri-controls).
- Support for dark and light modes.
- [Lucide Icons](https://lucide.dev/), [Radix Icons](https://icons.radix-ui.com/).
- [Bundle size optimized](https://github.com/johnthagen/min-sized-rust) [`Cargo.toml`](/src-tauri/Cargo.toml) (.msi 2.5mb, .dmg 1.9mb, .deb 2mb)
- [Tauri GitHub Action](https://github.com/tauri-apps/tauri-action), Cross-platform releases.

![tauri-ui](https://user-images.githubusercontent.com/16024979/232823230-19d22434-8e28-43c2-bb70-e45a2fc2da88.gif)

## Update Components

### shadcn/ui

Update all components:

```bash
npx shadcn-ui@latest add --overwrite
# press "a" to select all components
```

Update a specific component:

```bash
npx shadcn-ui@latest add dialog --overwrite
```

## Acknowledgements

This project utilizes code from the following repository:

- [vitejs/create-vite](https://github.com/vitejs/vite/blob/main/packages/create-vite) - Used in _[create-tauri-ui](https://www.npmjs.com/package/create-tauri-ui)_
- [shadcn/ui](https://github.com/shadcn/ui/tree/main/apps/www) - Used in _[Next.js](https://github.com/vercel/next.js/)_ and _[Vite](https://github.com/vitejs/vite)_ templates
- [huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte) - Used in _[SvelteKit](https://github.com/sveltejs/svelte)_ template
