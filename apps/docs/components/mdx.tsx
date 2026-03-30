import Image from "next/image";
import { Accordions, Accordion } from "fumadocs-ui/components/accordion";
import { Card, Cards } from "fumadocs-ui/components/card";
import * as FilesComponents from "fumadocs-ui/components/files";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    ...FilesComponents,
    Cards,
    Card,
    Accordions,
    Accordion,
    PreviewBlock,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

function PreviewBlock({
  title,
  note,
  src,
  alt,
}: {
  title: string;
  note?: string;
  src?: string;
  alt?: string;
}) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-fd-border bg-fd-card">
      <div className="border-b border-fd-border px-4 py-3">
        <p className="text-sm font-medium">{title}</p>
        {note ? <p className="mt-1 text-xs leading-5 text-fd-muted-foreground">{note}</p> : null}
      </div>
      <div className="p-4">
        {src ? (
          <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-background">
            <Image
              src={src}
              alt={alt ?? title}
              width={1600}
              height={1000}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-fd-border bg-fd-muted/40 px-4 py-10 text-center text-sm text-fd-muted-foreground">
            TODO: add screenshot or graphic here.
          </div>
        )}
      </div>
    </div>
  );
}
