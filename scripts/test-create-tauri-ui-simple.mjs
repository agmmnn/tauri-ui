import process from "node:process";

import { runCreateTauriUiMatrix } from "./create-tauri-ui-test-lib.mjs";

await runCreateTauriUiMatrix({
  mode: "simple",
  includeWorkflow: false,
  runTauriBuild: false,
  selectedTemplates: process.argv.slice(2),
});
