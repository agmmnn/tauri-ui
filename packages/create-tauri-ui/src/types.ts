export const TEMPLATE_NAMES = ["vite", "next", "start", "react-router", "astro"] as const;

export type TemplateName = (typeof TEMPLATE_NAMES)[number];

export const TARGET_OS = ["windows-latest", "macos-latest", "ubuntu-latest"] as const;

export type TargetOs = (typeof TARGET_OS)[number];

export interface CliArgs {
  targetDir?: string;
  template?: TemplateName;
  identifier?: string;
  preset?: string;
  includeSizeOptimization?: boolean;
  includeStarterUI?: boolean;
  includeInvokeExample?: boolean;
  includeWorkflow?: boolean;
  yes?: boolean;
  force?: boolean;
  version?: boolean;
  help?: boolean;
}

export interface ProjectOptions {
  projectName: string;
  packageName: string;
  template: TemplateName;
  identifier: string;
  preset: string;
  includeSizeOptimization: boolean;
  includeStarterUI: boolean;
  includeInvokeExample: boolean;
  includeWorkflow: boolean;
  targetOS: string[];
  targetDir: string;
}

export interface TauriBuildConfig {
  frontendDist: string;
  devUrl: string;
  beforeDevCommand: string;
  beforeBuildCommand: string;
}

export interface TemplateAdapter {
  name: TemplateName;
  apply(projectDir: string, options: ProjectOptions): Promise<void>;
  tauriConfig(): TauriBuildConfig;
}

export interface TauriScaffoldResult {
  tempDir: string;
  projectDir: string;
}
