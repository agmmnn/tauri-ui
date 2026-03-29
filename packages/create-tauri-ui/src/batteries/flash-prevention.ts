import path from "node:path";

import { PatchError, editFile, editJson } from "../utils";

const PAGE_LOAD_IMPORT = "use tauri::webview::PageLoadEvent;";

const PAGE_LOAD_HOOK = `        .on_page_load(|webview, payload| {
            if webview.label() == "main" && matches!(payload.event(), PageLoadEvent::Finished) {
                let _ = webview.window().show();
            }
        })
`;

export async function applyFlashPrevention(projectDir: string) {
  editJson<Record<string, any>>(path.join(projectDir, "src-tauri/tauri.conf.json"), (config) => {
    config.app = config.app || {};
    config.app.windows = Array.isArray(config.app.windows) ? config.app.windows : [{}];

    const mainWindow = config.app.windows[0] || {};
    config.app.windows[0] = {
      ...mainWindow,
      visible: false,
    };

    return config;
  });

  const libPath = path.join(projectDir, "src-tauri/src/lib.rs");

  editFile(libPath, (content) => {
    let nextContent = content;

    if (!nextContent.includes(PAGE_LOAD_IMPORT)) {
      if (nextContent.includes("use tauri::Manager;\n")) {
        nextContent = nextContent.replace("use tauri::Manager;\n", `${PAGE_LOAD_IMPORT}\n`);
      } else {
        nextContent = `${PAGE_LOAD_IMPORT}\n${nextContent}`;
      }
    }

    if (nextContent.includes(".on_page_load(")) {
      return nextContent;
    }

    const patchedContent = nextContent.replace(
      "        .run(tauri::generate_context!())",
      `${PAGE_LOAD_HOOK}        .run(tauri::generate_context!())`,
    );

    if (patchedContent === nextContent) {
      throw new PatchError(
        libPath,
        "Could not insert the startup flash-prevention page-load hook.",
      );
    }

    return patchedContent;
  });
}
