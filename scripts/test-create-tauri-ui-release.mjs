import { runCreateTauriUiMatrix } from "./create-tauri-ui-test-lib.mjs";

await runCreateTauriUiMatrix({
  mode: "release",
  includeWorkflow: false,
  includeStarterUI: false,
  runTauriBuild: false,
  selectedTemplates: ["vite", "next"],
});
