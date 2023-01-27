![ss](https://user-images.githubusercontent.com/16024979/215224137-4ed3b36b-623b-4eaa-b5e1-a40b77086ef6.png)

# Tauri + Next.js 13 + shadcn/ui

https://github.com/tauri-apps/tauri boilerplate with [Next.js 13](https://beta.nextjs.org/docs) and https://github.com/shadcn/ui.

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
