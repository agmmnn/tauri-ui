import { PatchError } from "../utils";

const TAURI_TARGET_GLOB = "**/src-tauri/target/**";

export function patchViteConfig(content: string, configFile: string, closingError: string) {
  let nextContent = content.split("__dirname").join("import.meta.dirname");

  if (nextContent.includes(TAURI_TARGET_GLOB)) {
    return nextContent;
  }

  if (nextContent.includes("strictPort: true,")) {
    return nextContent.replace(
      "strictPort: true,",
      `strictPort: true,
    watch: {
      ignored: ["${TAURI_TARGET_GLOB}"],
    },`,
    );
  }

  const closingIndex = nextContent.lastIndexOf("\n})");

  if (closingIndex === -1) {
    throw new PatchError(configFile, closingError);
  }

  return `${nextContent.slice(0, closingIndex)}
  server: {
    port: 3000,
    strictPort: true,
    watch: {
      ignored: ["${TAURI_TARGET_GLOB}"],
    },
  },${nextContent.slice(closingIndex)}`;
}
