"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { type Icon as LucideIcon } from "lucide-react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState("");

  useEffect(() => {
    setCurrentTheme(
      theme === "system"
        ? systemTheme === "light"
          ? "light"
          : "dark"
        : theme === "light"
        ? "light"
        : "dark"
    );
  }, [theme, systemTheme]);

  const ThemeIcon = Icons[currentTheme === "light" ? "sun" : "moon"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <ThemeIcon className="hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Icons.sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Icons.moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Icons.laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
