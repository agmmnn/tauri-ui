import "@/styles/globals.css"
import { Metadata } from "next"
import { usePathname } from "next/navigation"

import { fontMono, fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Greeting } from "@/components/greeting"
import { Menu } from "@/components/menu"
import { StyleSwitcher } from "@/components/style-switcher"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

export default function MyApp({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("bg-transparent font-sans antialiased")}>
        <Greeting />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="overflow-hidden h-screen bg-background rounded-lg border border-slate-600  dark:border-blue-900">
            <Menu />
            {children}
          </div>
          <TailwindIndicator />
        </ThemeProvider>
        <StyleSwitcher />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  icons: {
    shortcut: ["#"],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}
