import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";

const cleanupPaths = new Set<string>();
let cleanupHandlersInstalled = false;
let cleanupRunning = false;

export class CommandError extends Error {
  constructor(
    message: string,
    public readonly stdout: string,
    public readonly stderr: string,
    public readonly code: number | null,
  ) {
    super(message);
  }
}

export class ScaffoldError extends Error {
  constructor(
    public readonly tool: "shadcn" | "cta",
    message: string,
    public readonly stderr: string,
  ) {
    super(message);
  }
}

export class PatchError extends Error {
  constructor(
    public readonly file: string,
    message: string,
  ) {
    super(message);
  }
}

export function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, "");
}

export function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

export function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName);
}

export function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

export function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

export function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

export function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === ".git") {
      continue;
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

export function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

export function editFile(file: string, callback: (content: string) => string) {
  const content = fs.readFileSync(file, "utf-8");
  fs.writeFileSync(file, callback(content), "utf-8");
}

export function editJson<T = Record<string, unknown>>(
  filePath: string,
  transform: (content: T) => T,
) {
  const content = JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  const nextContent = transform(content);
  fs.writeFileSync(filePath, JSON.stringify(nextContent, null, 2) + "\n");
}

export async function execSafe(
  cmd: string,
  args: string[],
  opts?: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
  },
) {
  return await new Promise<string>((resolve, reject) => {
    execFile(
      cmd,
      args,
      {
        cwd: opts?.cwd,
        env: { ...process.env, ...opts?.env },
        maxBuffer: 1024 * 1024 * 10,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new CommandError(
              `Command failed: ${cmd} ${args.join(" ")}`,
              stdout,
              stderr,
              typeof error.code === "number" ? error.code : null,
            ),
          );
          return;
        }

        resolve(stdout.trim());
      },
    );
  });
}

export function makeTempDir(prefix: string) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function registerCleanupPath(dir: string) {
  cleanupPaths.add(dir);
}

export function unregisterCleanupPath(dir: string) {
  cleanupPaths.delete(dir);
}

export function removeTempDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return;
  }

  fs.rmSync(dir, { recursive: true, force: true });
}

function runRegisteredCleanup() {
  const paths = [...cleanupPaths].sort((left, right) => right.length - left.length);

  for (const targetPath of paths) {
    try {
      removeTempDir(targetPath);
    } catch {
      // Best-effort cleanup only. Signal handlers must never throw.
    } finally {
      cleanupPaths.delete(targetPath);
    }
  }
}

export function installCleanupHandlers() {
  if (cleanupHandlersInstalled) {
    return;
  }

  cleanupHandlersInstalled = true;

  const handleSignal = (signal: NodeJS.Signals, exitCode: number) => {
    if (cleanupRunning) {
      process.exit(exitCode);
    }

    cleanupRunning = true;
    runRegisteredCleanup();
    process.exit(exitCode);
  };

  process.once("SIGINT", () => handleSignal("SIGINT", 130));
  process.once("SIGTERM", () => handleSignal("SIGTERM", 143));
}

export function patchConfigFile(filePath: string, patches: Record<string, string>) {
  editFile(filePath, (content) => {
    let nextContent = content;

    for (const [searchValue, replacement] of Object.entries(patches)) {
      nextContent = nextContent.replace(searchValue, replacement);
    }

    return nextContent;
  });
}

export function toRustPackageName(packageName: string) {
  const normalized = packageName.replace(/^@[^/]+\//, "");
  return normalized.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
