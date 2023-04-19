"use client"

import { usePathname } from "next/navigation"

import {
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from "@/components/ui/menubar"

const examples = [
  {
    name: "Dashboard",
    href: "/examples/dashboard",
  },
  {
    name: "Cards",
    href: "/examples/cards",
  },
  {
    name: "Playground",
    href: "/examples/playground",
  },
  {
    name: "Music",
    href: "/examples/music",
  },
  {
    name: "Authentication",
    href: "/examples/authentication",
  },
]

interface ExamplesNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ExamplesNav({ className, ...props }: ExamplesNavProps) {
  const pathname = usePathname() === "/" ? "/examples/music" : usePathname()

  return (
    <MenubarMenu>
      <MenubarTrigger>{pathname}</MenubarTrigger>
      <MenubarContent forceMount>
        <MenubarRadioGroup value={pathname}>
          {examples.map((example) => (
            <a href={example.href} key={example.name}>
              <MenubarRadioItem value={example.href}>
                {example.name}
              </MenubarRadioItem>
            </a>
          ))}
        </MenubarRadioGroup>
      </MenubarContent>
    </MenubarMenu>
  )
}
