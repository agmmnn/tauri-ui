![ss](https://user-images.githubusercontent.com/16024979/215265499-c90cd692-c960-48f9-94a2-a3abb81e1ae4.png)

> wip

# Tauri + Next.js 13 + shadcn/ui

[Tauri](https://github.com/tauri-apps/tauri) boilerplate with [Next.js 13](https://beta.nextjs.org/docs) and [shadcn/ui](https://github.com/shadcn/ui).

- Tauri
- Next.js 13
- shadcn/ui
- TypeScript
- Tailwind
- Lucide Icons
- [Bundle size optimized](https://github.com/johnthagen/min-sized-rust) [Cargo.toml](/src-tauri/Cargo.toml) (.msi 1.8mb)

## Getting Started

```
gh repo clone agmmnn/tauri-ui-boilerplate
cd tauri-ui-boilerplate
yarn
```

```
yarn tauri dev
yarn tauri build
```

## Customization

- [package.json](/package.json)
- [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json)
- Update `app-icon.png`, run `yarn tauri icon`. This will automatically generate icon files into src-tauri/icons.

## Update Components

shadcn/ui [is not a library](https://ui.shadcn.com/docs#faqs). So you need to update components by hand. You can [download](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2Fshadcn%2Fui%2Ftree%2Fmain%2Fapps%2Fwww%2Fcomponents%2Fui) the [shadcn/ui/apps/www/components/ui](https://github.com/shadcn/ui/tree/main/apps/www/components/ui) directory and paste it into [src/components/ui](/src/components/ui).

## To-Do

- [x] Titlebar draggable.
- [x] Titlebar minimize, maximize, close buttons.
- [x] Titlebar double-click maximize.
- [ ] Dark-Light mode switch.
- [ ] Get simple data from the Rust backend code.

## Folder Structure

```
.
├── next-env.d.ts
├── next.config.js    //nextjs config file https://nextjs.org/docs/api-reference/next.config.js/introduction
├── package.json
├── postcss.config.js
├── README.md
├── src               //frontend src:
│   ├── assets
│   ├── components    //from shadcn/ui
│   │   └── ui        //from shadcn/ui
│   ├── lib
│   ├── pages         //next.js pages folder
│   ├── styles
│   └── types
├── src-tauri         //backend src:
│   ├── build.rs
│   ├── Cargo.lock
│   ├── Cargo.toml    // https://doc.rust-lang.org/cargo/reference/manifest.html
│   ├── icons         // https://tauri.app/v1/guides/features/icons/
│   ├── src           //rust codes
│   └── tauri.conf.json    //tauri config file https://tauri.app/v1/api/config/
├── tailwind.config.js     //tailwind config file
├── tsconfig.json          //typescript config file
└── yarn.lock
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
