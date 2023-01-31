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
- [src-tauri/icons](src-tauri/icons)

## Update Components

shadcn/ui [is not a library](https://ui.shadcn.com/docs#faqs). So you need to update components by hand. You can [download](https://download-directory.github.io/?url=https%3A%2F%2Fgithub.com%2Fshadcn%2Fui%2Ftree%2Fmain%2Fapps%2Fwww%2Fcomponents%2Fui) the [shadcn/ui/apps/www/components/ui](https://github.com/shadcn/ui/tree/main/apps/www/components/ui) directory and paste it into [src/components/ui](/src/components/ui).

## To-Do

- [x] Titlebar draggable.
- [ ] Titlebar minimize, maximize, close buttons.
- [ ] Get simple data from the Rust backend code.

## Folder Structure

```
.
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── src
│   ├── assets        //image assets
│   ├── components    //from shadcn/ui
│   │   └── ui        //from shadcn/ui
│   ├── lib
│   ├── pages         //next.js pages folder
│   ├── styles
│   └── types
├── src-tauri
│   ├── build.rs
│   ├── Cargo.lock
│   ├── Cargo.toml
│   ├── icons
│   ├── src
│   └── tauri.conf.json
├── tailwind.config.js
├── tsconfig.json
└── yarn.lock
```

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
