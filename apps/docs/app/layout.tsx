import "./global.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tauriui.vercel.app"),
  icons: {
    icon: "/claw.svg",
    shortcut: "/claw.svg",
    apple: "/claw.svg",
  },
  title: {
    default: "tauri-ui",
    template: "%s | tauri-ui",
  },
  description:
    "Docs for create-tauri-ui: upstream-first scaffolding for modern Tauri desktop apps with shadcn/ui and desktop-ready defaults.",
  openGraph: {
    title: "tauri-ui",
    description:
      "Build modern Tauri desktop apps with shadcn/ui, desktop-ready batteries, and upstream-first tooling.",
    url: "https://tauriui.vercel.app",
    siteName: "tauri-ui",
    images: ["/dark.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "tauri-ui",
    description:
      "Build modern Tauri desktop apps with shadcn/ui, desktop-ready batteries, and upstream-first tooling.",
    images: ["/dark.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn(geist.variable, mono.variable)} suppressHydrationWarning>
      <body className="min-h-screen bg-fd-background font-[family-name:var(--font-sans)] text-fd-foreground antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
