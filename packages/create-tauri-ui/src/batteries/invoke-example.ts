import fs from "node:fs";
import path from "node:path";

import type { ProjectOptions } from "../types";
import { addShadcnComponent } from "../scaffold";

function buildGreetComponent(aliasPrefix: "@/" | "~/") {
  return `"use client"

import { useState } from "react"
import { Button } from "${aliasPrefix}components/ui/button"
import { Input } from "${aliasPrefix}components/ui/input"
import { trackedInvoke } from "${aliasPrefix}lib/tauri"

export function Greet() {
  const [name, setName] = useState("")
  const [greeting, setGreeting] = useState("")

  async function handleGreet() {
    const result = await trackedInvoke<string>("greet", {
      name: name.trim() || "World",
    })

    setGreeting(result)
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 space-y-1">
        <h2 className="font-medium">Rust bridge</h2>
        <p className="text-sm text-muted-foreground">
          Call the bundled Tauri command and render the response from Rust.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter a name"
        />
        <Button onClick={handleGreet} disabled={!name.trim()}>
          Greet
        </Button>
      </div>
      {greeting ? (
        <p className="mt-3 text-sm text-muted-foreground">{greeting}</p>
      ) : null}
    </div>
  )
}
`;
}

function buildSimpleReactPage(functionName: string, aliasPrefix: "@/" | "~/") {
  return `import { Greet } from "${aliasPrefix}components/greet"

export default function ${functionName}() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Project ready!</h1>
          <p className="text-sm text-muted-foreground">
            Your shadcn frontend and Tauri native layer are wired together.
          </p>
        </div>
        <Greet />
      </div>
    </div>
  )
}
`;
}

function buildStartSimplePage() {
  return `import { createFileRoute } from "@tanstack/react-router"
import { Greet } from "@/components/greet"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Project ready!</h1>
          <p className="text-sm text-muted-foreground">
            Your shadcn frontend and Tauri native layer are wired together.
          </p>
        </div>
        <Greet />
      </div>
    </div>
  )
}
`;
}

function simplePagePath(template: ProjectOptions["template"], projectDir: string) {
  switch (template) {
    case "next":
      return path.join(projectDir, "app/page.tsx");
    case "vite":
      return path.join(projectDir, "src/App.tsx");
    case "start":
      return path.join(projectDir, "src/routes/index.tsx");
    case "react-router":
      return path.join(projectDir, "app/routes/home.tsx");
    case "astro":
      return path.join(projectDir, "src/pages/index.astro");
  }
}

function greetComponentPath(template: ProjectOptions["template"], projectDir: string) {
  switch (template) {
    case "next":
      return path.join(projectDir, "components/greet.tsx");
    case "vite":
    case "start":
    case "astro":
      return path.join(projectDir, "src/components/greet.tsx");
    case "react-router":
      return path.join(projectDir, "app/components/greet.tsx");
  }
}

export async function applyInvokeExample(projectDir: string, options: ProjectOptions) {
  if (!options.includeStarterUI) {
    await addShadcnComponent(projectDir, "input");
  }

  const aliasPrefix = options.template === "react-router" ? "~/" : "@/";

  fs.writeFileSync(
    greetComponentPath(options.template, projectDir),
    buildGreetComponent(aliasPrefix),
  );

  if (options.includeStarterUI) {
    return;
  }

  if (options.template === "astro") {
    fs.writeFileSync(
      simplePagePath(options.template, projectDir),
      `---
import Layout from "@/layouts/main.astro"
import { Greet } from "@/components/greet"
---

<Layout>
  <div class="flex min-h-svh items-center justify-center p-6">
    <div class="w-full max-w-xl space-y-6">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">Project ready!</h1>
        <p class="text-sm text-muted-foreground">
          Your shadcn frontend and Tauri native layer are wired together.
        </p>
      </div>
      <Greet client:load />
    </div>
  </div>
</Layout>
`,
    );
    return;
  }

  const content =
    options.template === "start"
      ? buildStartSimplePage()
      : buildSimpleReactPage(
          options.template === "vite"
            ? "App"
            : options.template === "react-router"
              ? "Home"
              : "Page",
          aliasPrefix,
        );

  fs.writeFileSync(simplePagePath(options.template, projectDir), content);
}
