import "@/styles/globals.css"
import { Metadata } from "next"

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
      <body
        className={cn("bg-transparent font-sans antialiased scrollbar-none")}
      >
        <Greeting />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="overflow-clip h-screen rounded-lg border border-slate-600  dark:border-blue-900">
            <Menu />
            <div
              className={cn(
                "overflow-auto h-screen pb-8 border-t bg-background",
                "scrollbar-none"
                // "scrollbar scrollbar-track-rounded-lg scrollbar-thumb-rounded-lg scrollbar-thumb-gray-900 scrollbar-track-gray-100"
              )}
            >
              {children}
            </div>
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
