import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    useTypeScriptCli: true,
  },
  turbopack: {
    root: workspaceRoot,
  },
};

export default withMDX(config);
