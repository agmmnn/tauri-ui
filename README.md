![tauri-ui-boilerplate](https://user-images.githubusercontent.com/16024979/232823230-19d22434-8e28-43c2-bb70-e45a2fc2da88.gif)

# Tauri 2 + Next.js 13 + shadcn/ui

[Tauri](https://github.com/tauri-apps/tauri) boilerplate with [Next.js 13](https://beta.nextjs.org/docs) and [shadcn/ui](https://github.com/shadcn/ui).

- Tauri
- Next.js 13
- shadcn/ui
- Radix UI
- TypeScript
- Tailwind
- Lucide Icons
- [Bundle size optimized](https://github.com/johnthagen/min-sized-rust) [`Cargo.toml`](/src-tauri/Cargo.toml) (.msi 2mb)

## Getting Started

```
gh repo clone agmmnn/tauri-ui-boilerplate
cd tauri-ui-boilerplate
pnpm i
```

```
pnpm tauri dev
pnpm tauri build
```

## To-Do

- [x] Titlebar draggable.
- [x] Titlebar minimize, maximize, close buttons.
- [x] Titlebar double-click maximize.
- [x] Decomposing UI into components.
- [x] Dark-Light mode switch.
- [x] Get simple data from the Rust backend code.

## Customization

- [package.json](/package.json)
- [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json)
- Update `app-icon.png`, run `pnpm tauri icon`. This will automatically generate icon files into src-tauri/icons.

## Update Components

shadcn/ui [is not a library](https://ui.shadcn.com/docs#faqs). So you need to update components by hand. You can [download](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2Fshadcn%2Fui%2Ftree%2Fmain%2Fapps%2Fwww%2Fcomponents%2Fui) the [shadcn/ui/apps/www/components/ui](https://github.com/shadcn/ui/tree/main/apps/www/components/ui) directory and paste it into [src/components/ui](/src/components/ui).

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
