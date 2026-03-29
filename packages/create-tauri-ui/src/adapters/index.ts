import type { TemplateAdapter, TemplateName } from "../types";
import { astroAdapter } from "./astro";
import { nextAdapter } from "./next";
import { reactRouterAdapter } from "./react-router";
import { startAdapter } from "./start";
import { viteAdapter } from "./vite";

const adapters: Record<TemplateName, TemplateAdapter> = {
  vite: viteAdapter,
  next: nextAdapter,
  start: startAdapter,
  "react-router": reactRouterAdapter,
  astro: astroAdapter,
};

export function getAdapter(template: TemplateName) {
  return adapters[template];
}
