import type { AppProps } from "next/app"

import "@/styles/globals.css"
import Head from "next/head"

import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
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
