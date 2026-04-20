---
"create-tauri-ui": patch
---

Extend the development debug panel with host-default diagnostics and source-snippet tooltips.

- add Display, Locale, Input, and Network sections that surface live host signals (viewport, DPR, color gamut, locale chain, timezone, calendar, first day of week, pointer precision, hover, touch, platform, connection type, online/offline) driven by `matchMedia` and `navigator.*` listeners
- merge Theme and Accessibility into a single Overview section covering color scheme, reduced motion, contrast, forced colors, inverted colors, and transparency
- fold the former Webview panel into App; drop the speedbox-specific Resolution Trace
- extend `KeyValueGrid` entries to accept an optional `{ code, origin: "web" | "tauri" }` meta tuple — labels with meta render a dotted underline and a hover tooltip showing the source snippet plus a colored origin chip (`WEB API` / `TAURI API`)
- click the snippet inside the tooltip to copy it to the clipboard with a brief "Copied!" confirmation
- self-host `TooltipProvider` inside the panel and thread the panel's CSS variables through a context so portaled tooltips match the panel's light/dark theme regardless of the parent app
