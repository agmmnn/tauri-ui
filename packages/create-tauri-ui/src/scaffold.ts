import fs from "node:fs";
import path from "node:path";

import type { ProjectOptions, TauriScaffoldResult } from "./types";
import {
  CommandError,
  PatchError,
  ScaffoldError,
  editFile,
  execSafe,
  registerCleanupPath,
  makeTempDir,
  removeTempDir,
  unregisterCleanupPath,
} from "./utils";

async function runShadcn(projectDir: string, args: string[]) {
  try {
    await execSafe("bunx", ["--bun", "shadcn@latest", ...args], {
      cwd: projectDir,
    });
  } catch (error) {
    if (error instanceof CommandError) {
      throw new ScaffoldError(
        "shadcn",
        "shadcn CLI failed while updating the frontend scaffold.",
        error.stderr || error.stdout,
      );
    }

    throw error;
  }
}

const STARTER_AVATAR_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='24' fill='%23181f2a'/%3E%3Ccircle cx='48' cy='34' r='18' fill='%23f8fafc'/%3E%3Cpath d='M18 82c6-14 18-22 30-22s24 8 30 22' fill='%23f8fafc'/%3E%3C/svg%3E";

function ensureNextLayoutTooltipProvider(projectDir: string) {
  const layoutPath = path.join(projectDir, "app/layout.tsx");

  if (!fs.existsSync(layoutPath)) {
    return;
  }

  editFile(layoutPath, (content) => {
    let nextContent = content;

    if (!nextContent.includes('import { TooltipProvider } from "@/components/ui/tooltip"')) {
      nextContent = nextContent.replace(
        'import { ThemeProvider } from "@/components/theme-provider"\n',
        'import { ThemeProvider } from "@/components/theme-provider"\nimport { TooltipProvider } from "@/components/ui/tooltip"\n',
      );
    }

    if (nextContent.includes("<TooltipProvider>")) {
      return nextContent;
    }

    const wrappedContent = nextContent.replace(
      /<ThemeProvider>([\s\S]*?)<\/ThemeProvider>/,
      "<ThemeProvider><TooltipProvider>$1</TooltipProvider></ThemeProvider>",
    );

    if (wrappedContent === nextContent) {
      throw new PatchError(layoutPath, "Could not wrap the Next.js layout with TooltipProvider.");
    }

    return wrappedContent;
  });
}

function rewriteStarterAvatar(projectDir: string, options: ProjectOptions) {
  const appSidebarPath =
    options.template === "next"
      ? path.join(projectDir, "components/app-sidebar.tsx")
      : options.template === "react-router"
        ? path.join(projectDir, "app/components/app-sidebar.tsx")
        : path.join(projectDir, "src/components/app-sidebar.tsx");

  if (!fs.existsSync(appSidebarPath)) {
    return;
  }

  editFile(appSidebarPath, (content) =>
    content.replace('avatar: "/avatars/shadcn.jpg"', `avatar: "${STARTER_AVATAR_DATA_URL}"`),
  );
}

function buildDashboardReactPage(
  functionName: string,
  aliasPrefix: "@/" | "~/",
  dataImport: string,
  includeInvokeExample: boolean,
) {
  return `import type { CSSProperties } from "react"
import { AppSidebar } from "${aliasPrefix}components/app-sidebar"
import { ChartAreaInteractive } from "${aliasPrefix}components/chart-area-interactive"
import { DataTable } from "${aliasPrefix}components/data-table"
import { SectionCards } from "${aliasPrefix}components/section-cards"
import { SiteHeader } from "${aliasPrefix}components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "${aliasPrefix}components/ui/sidebar"
import { TooltipProvider } from "${aliasPrefix}components/ui/tooltip"
${includeInvokeExample ? `import { Greet } from "${aliasPrefix}components/greet"\n` : ""}import data from "${dataImport}"

export default function ${functionName}() {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
${includeInvokeExample ? `                <div className="px-4 lg:px-6">\n                  <Greet />\n                </div>\n` : ""}                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
`;
}

function buildStartDashboardPage(includeInvokeExample: boolean) {
  return `import { createFileRoute } from "@tanstack/react-router"
${buildDashboardReactPage(
  "DashboardPage",
  "@/",
  "@/app/dashboard/data.json",
  includeInvokeExample,
)}export const Route = createFileRoute("/")({
  component: DashboardPage,
})
`;
}

function buildAstroDashboardShell(includeInvokeExample: boolean) {
  return buildDashboardReactPage(
    "DashboardShell",
    "@/",
    "@/app/dashboard/data.json",
    includeInvokeExample,
  ).replace("export default function DashboardShell()", "export function DashboardShell()");
}

function moveScaffoldedProject(sourceDir: string, targetDir: string) {
  try {
    fs.renameSync(sourceDir, targetDir);
    return;
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "EXDEV") {
      throw error;
    }
  }

  fs.cpSync(sourceDir, targetDir, { recursive: true, force: true });
  fs.rmSync(sourceDir, { recursive: true, force: true });
}

export async function scaffoldFrontend(options: ProjectOptions) {
  fs.mkdirSync(path.dirname(options.targetDir), { recursive: true });
  const tempDir = makeTempDir("create-tauri-ui-frontend-");
  const tempProjectDir = path.join(tempDir, options.projectName);
  registerCleanupPath(tempDir);

  try {
    await execSafe(
      "bunx",
      [
        "--bun",
        "shadcn@latest",
        "init",
        "--name",
        options.projectName,
        "--template",
        options.template,
        "--preset",
        options.preset,
        "--yes",
      ],
      {
        cwd: tempDir,
      },
    );

    if (!fs.existsSync(tempProjectDir)) {
      throw new Error("shadcn CLI did not produce the expected project directory.");
    }

    fs.rmSync(path.join(tempProjectDir, "node_modules"), {
      recursive: true,
      force: true,
    });

    moveScaffoldedProject(tempProjectDir, options.targetDir);
  } catch (error) {
    if (error instanceof CommandError) {
      unregisterCleanupPath(tempDir);
      try {
        removeTempDir(tempDir);
      } catch {}

      throw new ScaffoldError(
        "shadcn",
        "shadcn CLI failed while creating the frontend scaffold.",
        error.stderr || error.stdout,
      );
    }

    unregisterCleanupPath(tempDir);
    try {
      removeTempDir(tempDir);
    } catch {}

    throw error;
  } finally {
    unregisterCleanupPath(tempDir);
    try {
      removeTempDir(tempDir);
    } catch {}
  }

  return options.targetDir;
}

export async function scaffoldTauri(options: ProjectOptions): Promise<TauriScaffoldResult> {
  const tempDir = makeTempDir("create-tauri-ui-");
  const tempProjectName = "tauri-native";
  registerCleanupPath(tempDir);

  try {
    await execSafe(
      "bunx",
      [
        "create-tauri-app",
        tempProjectName,
        "--template",
        "vanilla-ts",
        "--manager",
        "bun",
        "--identifier",
        options.identifier,
        "--yes",
      ],
      {
        cwd: tempDir,
      },
    );
  } catch (error) {
    if (error instanceof CommandError) {
      unregisterCleanupPath(tempDir);
      try {
        removeTempDir(tempDir);
      } catch {}

      throw new ScaffoldError(
        "cta",
        "create-tauri-app failed while creating the native scaffold.",
        error.stderr || error.stdout,
      );
    }

    unregisterCleanupPath(tempDir);
    try {
      removeTempDir(tempDir);
    } catch {}

    throw error;
  }

  return {
    tempDir,
    projectDir: path.join(tempDir, tempProjectName),
  };
}

export async function addStarterUI(projectDir: string, options: ProjectOptions) {
  await runShadcn(projectDir, ["add", "dashboard-01", "--yes"]);
  rewriteStarterAvatar(projectDir, options);

  const siteHeaderPath =
    options.template === "next"
      ? path.join(projectDir, "components/site-header.tsx")
      : options.template === "react-router"
        ? path.join(projectDir, "app/components/site-header.tsx")
        : path.join(projectDir, "src/components/site-header.tsx");

  if (fs.existsSync(siteHeaderPath)) {
    editFile(siteHeaderPath, (content) => {
      if (content.includes("<Button")) {
        return content;
      }

      return content.replace(/import \{ Button \} from ["'][@~]\/components\/ui\/button["']\n/, "");
    });
  }

  switch (options.template) {
    case "next":
      ensureNextLayoutTooltipProvider(projectDir);
      fs.writeFileSync(
        path.join(projectDir, "app/page.tsx"),
        buildDashboardReactPage(
          "Page",
          "@/",
          "@/app/dashboard/data.json",
          options.includeInvokeExample,
        ),
      );
      return;
    case "vite":
      fs.writeFileSync(
        path.join(projectDir, "src/App.tsx"),
        buildDashboardReactPage(
          "App",
          "@/",
          "@/app/dashboard/data.json",
          options.includeInvokeExample,
        ),
      );
      return;
    case "start":
      fs.writeFileSync(
        path.join(projectDir, "src/routes/index.tsx"),
        buildStartDashboardPage(options.includeInvokeExample),
      );
      return;
    case "react-router":
      fs.writeFileSync(
        path.join(projectDir, "app/routes/home.tsx"),
        buildDashboardReactPage(
          "Home",
          "~/",
          "~/dashboard/data.json",
          options.includeInvokeExample,
        ),
      );
      return;
    case "astro":
      fs.writeFileSync(
        path.join(projectDir, "src/components/dashboard-shell.tsx"),
        buildAstroDashboardShell(options.includeInvokeExample),
      );
      fs.writeFileSync(
        path.join(projectDir, "src/pages/index.astro"),
        `---
import Layout from "@/layouts/main.astro"
import { DashboardShell } from "@/components/dashboard-shell"
---

<Layout>
  <DashboardShell client:load />
</Layout>
`,
      );
      return;
    default:
      throw new PatchError(
        projectDir,
        `No starter UI implementation exists for template "${options.template}".`,
      );
  }
}

export async function addShadcnComponent(projectDir: string, component: string) {
  await runShadcn(projectDir, ["add", component, "--yes"]);
}
