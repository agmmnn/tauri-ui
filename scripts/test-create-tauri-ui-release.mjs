import process from "node:process";

import { runCreateTauriUiMatrix } from "./create-tauri-ui-test-lib.mjs";

const selectedTemplates = process.argv.slice(2);

await runCreateTauriUiMatrix({
  mode: "release",
  includeWorkflow: true,
  includeStarterUI: false,
  runTauriBuild: false,
  selectedTemplates: selectedTemplates.length > 0 ? selectedTemplates : ["vite", "next"],
});
