import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions, docsLinks } from "@/lib/layout.shared";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()} links={docsLinks}>
      {children}
    </DocsLayout>
  );
}
