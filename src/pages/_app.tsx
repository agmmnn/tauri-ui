import type { AppProps } from "next/app";

import { Inter as FontSans } from "@next/font/google";

import "@/styles/globals.css";

import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

interface RootLayoutProps {
  children: React.ReactNode;
}
// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <html lang="en">
      <body
        className={cn(
          "overflow-hidden  rounded-md font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Component {...pageProps} />
          {/* <TailwindIndicator /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
