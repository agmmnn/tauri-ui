import { useState } from "react"
import { invoke } from "@tauri-apps/api/tauri"

import { Menu } from "@/components/menu"

import { TailwindIndicator } from "./components/tailwind-indicator"
import { ThemeProvider } from "./components/theme-provider"
import DashboardPage from "./dashboard/page"
import { cn } from "./lib/utils"

function App() {
  const [greetMsg, setGreetMsg] = useState("")
  const [name, setName] = useState("")

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }))
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen overflow-clip">
        <Menu />
        <div
          className={cn(
            "h-screen overflow-auto border-t bg-background pb-8",
            // "scrollbar-none"
            "scrollbar scrollbar-track-transparent scrollbar-thumb-accent scrollbar-thumb-rounded-md"
          )}
        >
          <DashboardPage />
        </div>
      </div>
      <TailwindIndicator />
    </ThemeProvider>
  )
}

export default App
