![tauri-ui](https://user-images.githubusercontent.com/16024979/235379115-e5d9928b-6efe-4b6e-bd6e-66cfe718c829.png)

# Tauri UI Template

Tauri UI Template is a starting point for building modern desktop applications with web technologies. Customizable UI components with [shadcn/ui](https://github.com/shadcn/ui), a lightweight and secure desktop app framework [Tauri 2](https://github.com/tauri-apps/tauri), the React-based framework [Next.js 13](https://beta.nextjs.org/docs), the utility-first CSS framework [Tailwind](https://tailwindcss.com/).

- Support for dark and light modes
- Components-based UI design
- A draggable titlebar with minimize, maximize, and close buttons
- [Radix UI](https://www.radix-ui.com/) for UI primitives
- [TypeScript](https://www.typescriptlang.org/)
- [Lucide Icons](https://lucide.dev/)
- [Bundle size optimized](https://github.com/johnthagen/min-sized-rust) [`Cargo.toml`](/src-tauri/Cargo.toml) (.exe 3mb, .msi 2mb)
- [Tauri GitHub Action](https://github.com/tauri-apps/tauri-action)

> _You can download pre-built final bundles from the [Releases](https://github.com/agmmnn/tauri-ui/releases) section._

> _[Next.js](https://nextjs.org/) is used in this template to facilitate quick integration of the [`/examples`](https://github.com/shadcn/ui/tree/main/apps/www/app/examples) directory of shadcn/ui. You can also easily use shadcn/ui with the [React + Vite](https://tauri.app/v1/guides/getting-started/setup/vite/) stack and any [React router](https://react.libhunt.com/libs/router) library in Tauri._

## Getting Started

```
gh repo clone agmmnn/tauri-ui
cd tauri-ui
pnpm i
```

```
pnpm tauri dev
pnpm tauri build
```

![tauri-ui](https://user-images.githubusercontent.com/16024979/232823230-19d22434-8e28-43c2-bb70-e45a2fc2da88.gif)

## Customization

The template can be customized by editing the following files:

- [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json)
- [package.json](/package.json)
- [src-tauri/cargo.toml](src-tauri/Cargo.toml)
- To change the app icon, update `app-icon.png`, and then run `pnpm tauri icon`. This will automatically generate icon files into _src-tauri/icons_.

## Update Components

Note that **shadcn/ui** [is not a library](https://ui.shadcn.com/docs#faqs), therefore you will need to update the components manually. To do so, you can [download](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2Fshadcn%2Fui%2Ftree%2Fmain%2Fapps%2Fwww%2Fcomponents%2Fui) the _[shadcn/ui/apps/www/components/ui](https://github.com/shadcn/ui/tree/main/apps/www/components/ui)_ directory and paste it into _[src/components/ui](/src/components/ui)_.

## To-Do

- [x] Titlebar draggable.
- [x] Titlebar minimize, maximize, close buttons.
- [x] Titlebar double-click maximize.
- [x] Decomposing UI into components.
- [x] Dark-Light mode switch.
- [x] Get simple data from the Rust backend code.

## Folder Structure

```js
.
├── next-env.d.ts
├── next.config.js    //nextjs config file https://nextjs.org/docs/api-reference/next.config.js/introduction
├── package.json
├── postcss.config.js
├── README.md
├── public
├── src               //frontend src:
│   ├── app           //next.js appdir https://beta.nextjs.org/docs/routing/fundamentals
│   ├── assets
│   ├── components    //from shadcn/ui
│   │   └── ui
│   ├── data
│   ├── hooks
│   ├── lib
│   └── styles
├── src-tauri         //backend src:
│   ├── build.rs
│   ├── Cargo.lock
│   ├── Cargo.toml    //https://doc.rust-lang.org/cargo/reference/manifest.html
│   ├── icons         //https://tauri.app/v1/guides/features/icons/
│   ├── src           //rust codes
│   └── tauri.conf.json  //tauri config file https://next--tauri.netlify.app/next/api/config
├── prettier.config.js     //prettier config file https://prettier.io/docs/en/configuration.html
├── tailwind.config.js     //tailwind config file https://tailwindcss.com/docs/configuration
└── tsconfig.json          //typescript config file https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
