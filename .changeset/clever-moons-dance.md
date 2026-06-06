---
"create-tauri-ui": patch
---

Fix scaffolding failures caused by upstream template drift in the shadcn templates.

- **TanStack Start**: scaffolding aborted with "Could not mount ExternalLinkGuard in the TanStack Start root route." The template now ships a `notFoundComponent` containing its own `<main>` element before `RootDocument`, and the scroll-container battery's "upgrade an existing `<main>`" path matched the first `<main>` in the file — tagging the 404 page's `<main>` with `data-ui-scroll-container` instead of wrapping `{children}`. The external-link-guard battery then failed because `<main>{children}</main>` never existed. The upgrade path now only targets a `<main>` that directly wraps the route content (`{children}`, `<App />`, `<Outlet />`, or `<slot />`) across all five templates.
- **Next.js**: scaffolding aborted with `ENOENT ... next.config.mjs`. The template now generates a typed `next.config.ts` (`const nextConfig: NextConfig = {}`) and a plain `next dev` script without `--turbopack`. The adapter now resolves `next.config.ts`/`.mjs`/`.js`, patches the typed config shape, and appends `-p 1420` to any `next dev` script that doesn't already pin a port.
