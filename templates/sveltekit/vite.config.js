import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 1420,
    strictPort: true
  },
  plugins: [sveltekit()]
});
