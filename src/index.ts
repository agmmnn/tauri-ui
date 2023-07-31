// utilized code from: https://github.com/vitejs/vite/blob/main/packages/create-vite/src/index.ts
import type { Framework } from "./type";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import minimist from "minimist";
import prompts from "prompts";
import { blue, gray, green, lightGreen, red, reset } from "kolorist";

import {
  formatTargetDir,
  isEmpty,
  copy,
  copyDir,
  editFile,
  emptyDir,
  isValidPackageName,
  pkgFromUserAgent,
  toValidPackageName,
} from "./utils";

const argv = minimist<{
  t?: string;
  selectedTemplate?: string;
}>(process.argv.slice(2), { string: ["_"] });
const cwd = process.cwd();

const FRAMEWORKS: Framework[] = [
  { name: "vite", display: "⚡Vite + React", color: blue },
  { name: "next", display: "▲ Next.js", color: blue },
  {
    name: "sveltekit",
    display: "⚡Vite + SvelteKit",
    color: blue,
  },
];
const TEMPLATES = FRAMEWORKS.map((f) => f.name);
const TARGETOS = [
  { title: "Windows (x64)", value: "windows-latest" },
  { title: "macOS (x64)", value: "macos-latest" },
  { title: "Linux (x64)", value: "ubuntu-latest" },
];
const ALLOS = TARGETOS.map((f) => f.value);

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

const defaultTargetDir = "tauri-ui";

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  const argTemplate = argv.selectedTemplate || argv.t;

  let targetDir = argTargetDir || defaultTargetDir;
  const getProjectName = () =>
    targetDir === "." ? path.basename(path.resolve()) : targetDir;

  const result: prompts.Answers<
    "projectName" | "overwrite" | "packageName" | "framework" | "releaseOS"
  > = await prompts(
    [
      // Project name
      {
        type: argTargetDir ? null : "text",
        name: "projectName",
        message: reset("Project name:"),
        initial: defaultTargetDir,
        onState: (state) => {
          targetDir = formatTargetDir(state.value) || defaultTargetDir;
        },
      },
      // Check folder if exist
      {
        type: () =>
          !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm",
        name: "overwrite",
        message: () =>
          (targetDir === "."
            ? "Current directory"
            : `Target directory "${targetDir}"`) +
          ` is not empty. Remove existing templateFiles and continue?`,
      },
      {
        type: (_, { overwrite }: { overwrite?: boolean }) => {
          if (overwrite === false) {
            throw new Error(red("✖") + " Operation cancelled");
          }
          return null;
        },
        name: "overwriteChecker",
      },
      // Package name
      {
        type: () => (isValidPackageName(getProjectName()) ? null : "text"),
        name: "packageName",
        message: reset("Package name:"),
        initial: () => toValidPackageName(getProjectName()),
        validate: (dir) =>
          isValidPackageName(dir) || "Invalid package.json name",
      },
      // Select Framework
      {
        type: argTemplate && TEMPLATES.includes(argTemplate) ? null : "select",
        name: "framework",
        message:
          typeof argTemplate === "string" && !TEMPLATES.includes(argTemplate)
            ? reset(
                `"${argTemplate}" isn't a valid selectedTemplate . Please choose from below: `
              )
            : reset("Select a framework:"),
        initial: 0,
        choices: FRAMEWORKS.map((framework) => {
          const frameworkColor = framework.color;
          return {
            title: frameworkColor(framework.display || framework.name),
            value: framework,
          };
        }),
      },
      // Release OS
      {
        type: "multiselect",
        name: "releaseOS",
        message: "Target operating systems for the Tauri Github Action",
        choices: TARGETOS.map((target) => {
          return { title: target.title, value: target.value, selected: true };
        }),
        instructions: false,
        hint: "- Space to select/deselect. Press Enter to submit",
      },
    ],

    {
      onCancel: () => {
        throw new Error(red("✖") + " Operation cancelled");
      },
    }
  );

  // User choice associated with prompts
  const { framework, overwrite, packageName, releaseOS } = result;

  const projectRoot = path.join(cwd, targetDir);

  if (overwrite) {
    emptyDir(projectRoot); // Clear the project root directory if overwrite flag is true
  } else if (!fs.existsSync(projectRoot)) {
    fs.mkdirSync(projectRoot, { recursive: true }); // Create the project root directory if it doesn't exist
  }

  // determine template
  let selectedTemplate: string = framework?.name || argTemplate;

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  console.log(`\nScaffolding project in ${gray(projectRoot)}`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../templates/",
    selectedTemplate
  );

  const sharedDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../templates/.shared"
  );

  const writeToFile = (file: string, content?: string) => {
    const targetPath = path.join(projectRoot, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content); // Write content to the target file
    } else {
      copy(path.join(templateDir, file), targetPath); // Copy the template file to the target location
    }
  };

  // Copy template files
  const templateFiles = fs.readdirSync(templateDir);
  for (const file of templateFiles.filter(
    (f) => f !== "package.json" || "tauri.conf.json" || "Cargo.toml"
  )) {
    writeToFile(file);
  }

  // Copy .shared files
  if (selectedTemplate !== "sveltekit") {
    const sharedFiles = fs.readdirSync(sharedDir);
    for (const file of sharedFiles) {
      const sourcePath = path.join(sharedDir, file);
      const targetPath = path.join(projectRoot, file);
      copy(sourcePath, targetPath);
    }
  }

  // Edit files
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );
  packageJson.name = packageName || getProjectName();
  writeToFile("package.json", JSON.stringify(packageJson, null, 2) + "\n");

  const tauriConf = JSON.parse(
    fs.readFileSync(
      path.join(templateDir, `/src-tauri/tauri.conf.json`),
      "utf-8"
    )
  );
  tauriConf.tauri.windows[0].title = packageName || getProjectName();
  tauriConf.package.productName = packageName || getProjectName();
  writeToFile(
    "/src-tauri/tauri.conf.json",
    JSON.stringify(tauriConf, null, 2) + "\n"
  );

  const cargoToml = path.join(sharedDir, "/src-tauri/Cargo.toml");
  const cargoTomlContent = fs.readFileSync(cargoToml, "utf-8");
  const updatedCargoTomlContent = cargoTomlContent.replace(
    /name\s*=\s*"tauri-ui"/,
    `name = "${packageName || getProjectName()}"`
  );
  writeToFile("/src-tauri/Cargo.toml", updatedCargoTomlContent);

  const releaseYml = path.join(sharedDir, ".github/workflows/release.yml");
  const releaseYmlContent = fs.readFileSync(releaseYml, "utf-8");
  const modifiedReleaseYmlContent = releaseYmlContent.replace(
    "platform: [macos-latest, ubuntu-latest, windows-latest]",
    `platform: [${releaseOS.join(", ")}]` +
      (releaseOS.length < ALLOS.length
        ? ` # ${ALLOS.filter((item: string) => !releaseOS.includes(item)).join(
            ", "
          )}`
        : "")
  );
  writeToFile(".github/workflows/release.yml", modifiedReleaseYmlContent);
  // /Edit Files

  // Instructions
  const cdProjectName = path.relative(cwd, projectRoot);
  console.log(`\nDone. Now run:`);
  if (projectRoot !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
      }`
    );
  }
  switch (pkgManager) {
    case "yarn":
      console.log(`  yarn`);
      console.log(`  yarn tauri dev`);
      break;
    case "pnpm":
      console.log(`  pnpm i`);
      console.log(`  pnpm tauri dev`);
      break;
    default:
      console.log(`  ${pkgManager} install`);
      console.log(`  ${pkgManager} run tauri dev`);
      break;
  }
  console.log();
}

init().catch((e) => {
  console.error(e);
});
