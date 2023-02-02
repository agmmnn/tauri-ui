import { useEffect } from "react"
import type { AppProps } from "next/app"
import { Inter as FontSans } from "@next/font/google"

import "@/styles/globals.css"
import Head from "next/head"

import { cn } from "@/lib/utils"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document
      .querySelector("body")
      .classList.add(
        "overflow-hidden",
        "h-screen",
        "rounded-md",
        "font-sans",
        "text-slate-900",
        "antialiased",
        "dark:text-slate-50",
        fontSans.variable
      )
  }, [])

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="#" />
      </Head>

      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Component {...pageProps} />
        <TailwindIndicator />
      </ThemeProvider>
    </>
  )
}
