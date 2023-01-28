![ss](https://user-images.githubusercontent.com/16024979/215265499-c90cd692-c960-48f9-94a2-a3abb81e1ae4.png)

> wip

# Tauri + Next.js 13 + shadcn/ui

[Tauri](https://github.com/tauri-apps/tauri) boilerplate with [Next.js 13](https://beta.nextjs.org/docs) and [shadcn/ui](https://github.com/shadcn/ui).

```
yarn tauri dev

yarn tauri build
```

## Customization

- [package.json](/package.json)
- [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json)
- [src-tauri/icons](src-tauri/icons)

## Folder Structure

```
.
├── next-env.d.ts
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── src
│   ├── app
│   ├── assets
│   ├── components
│   │   └── ui
│   ├── config
│   ├── lib
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
