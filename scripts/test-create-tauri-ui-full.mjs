import process from "node:process";

import { runCreateTauriUiMatrix } from "./create-tauri-ui-test-lib.mjs";

await runCreateTauriUiMatrix({
  mode: "full",
  includeWorkflow: true,
  runTauriBuild: true,
  selectedTemplates: process.argv.slice(2),
});
