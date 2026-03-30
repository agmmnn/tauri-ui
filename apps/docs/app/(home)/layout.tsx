import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { baseOptions, homeLinks } from "@/lib/layout.shared";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={homeLinks}
      className="[--color-fd-primary:var(--color-brand)]"
    >
      {children}
    </HomeLayout>
  );
}
