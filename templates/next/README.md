![tauri-ui](https://github.com/agmmnn/tauri-ui/assets/16024979/28295bae-8a36-4eff-8c33-2ed2bda82d84)

# Tauri UI Template

Tauri UI Template is a starting point for building modern desktop applications with web technologies. Customizable UI components with [shadcn/ui](https://github.com/shadcn/ui), a lightweight and secure desktop app framework [Tauri 2](https://github.com/tauri-apps/tauri), the React-based framework [Next.js 13](https://beta.nextjs.org/docs), the utility-first CSS framework [Tailwind](https://tailwindcss.com/).

> _You can download pre-built final bundles from the [Releases](https://github.com/agmmnn/tauri-ui/releases) section._

## Getting Started

Use [create-tauri-ui](https://github.com/agmmnn/create-tauri-ui) to quickly scaffold a Tauri UI project.

```bash
pnpm create tauri-ui
```

![](https://i.imgur.com/ONV0z45.png)

<details> 
<summary>
Or clone the repository
</summary>

```bash
gh repo clone agmmnn/tauri-ui
cd tauri-ui

pnpm i
pnpm tauri dev
pnpm tauri build
```

</details>

## Features

- Support for dark and light modes
- Components-based UI design
- A draggable titlebar with minimize, maximize, and close buttons
- [Radix UI](https://www.radix-ui.com/) for UI primitives
- [Lucide Icons](https://lucide.dev/)
- [Bundle size optimized](https://github.com/johnthagen/min-sized-rust) [`Cargo.toml`](/src-tauri/Cargo.toml) (.msi 2.2mb, .dmg 1.9mb, .deb 2mb)
- [Tauri GitHub Action](https://github.com/tauri-apps/tauri-action)

![tauri-ui](https://user-images.githubusercontent.com/16024979/232823230-19d22434-8e28-43c2-bb70-e45a2fc2da88.gif)

> _[Next.js](https://nextjs.org/) is used in this template to facilitate quick integration of the [`/examples`](https://github.com/shadcn/ui/tree/main/apps/www/app/examples) directory of shadcn/ui. You can also easily use shadcn/ui with the [React + Vite](https://tauri.app/v1/guides/getting-started/setup/vite/) stack and any [React router library](https://react.libhunt.com/libs/router) (optionally) in Tauri._

## Customization

The template can be customized by editing the following files:

- [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json)
- [package.json](/package.json)
- [src-tauri/cargo.toml](src-tauri/Cargo.toml)
- To change the app icon, update `app-icon.png`, and then run `pnpm tauri icon`. This will automatically generate icon files into _src-tauri/icons_.

## Update Components

Note that **shadcn/ui** [is not a library](https://ui.shadcn.com/docs#faqs), therefore you will need to update the components manually. To do so, you can [download](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2Fshadcn%2Fui%2Ftree%2Fmain%2Fapps%2Fwww%2Fcomponents%2Fui) the _[shadcn/ui/apps/www/components/ui](https://github.com/shadcn/ui/tree/main/apps/www/components/ui)_ directory and paste it into _[src/components/ui](/src/components/ui)_.

## Folder Structure

```js
.
├── next-env.d.ts
├── next.config.js    //nextjs config file https://nextjs.org/docs/pages/api-reference/next-config-js
├── package.json
├── postcss.config.js
├── README.md
├── public
├── src               //frontend src:
│   ├── app           //next.js appdir https://nextjs.org/docs/app/building-your-application/routing
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
│   ├── src
│   └── tauri.conf.json  //tauri config file https://next--tauri.netlify.app/next/api/config
├── prettier.config.js     //prettier config file https://prettier.io/docs/en/configuration.html
├── tailwind.config.js     //tailwind config file https://tailwindcss.com/docs/configuration
└── tsconfig.json          //typescript config file https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
