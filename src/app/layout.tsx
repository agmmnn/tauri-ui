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
      <body className="bg-transparent font-sans antialiased scrollbar-none">
        <Greeting />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="h-screen overflow-clip rounded-lg border">
            <Menu />
            <div
              className={cn(
                "h-screen overflow-auto border-t bg-background pb-8",
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
}
