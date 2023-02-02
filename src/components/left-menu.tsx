import Image from "next/image"
import {
  LayoutGrid,
  Library,
  ListMusic,
  Mic2,
  Music2,
  PlayCircle,
  Radio,
  User,
} from "lucide-react"
import { nanoid } from "nanoid"

import { playlists } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import logo from "../assets/logo.png"

export function LeftMenu() {
  return (
    <aside className="pb-12 h-screen">
      <div className="px-8 py-6">
        <p className="flex items-center text-2xl font-semibold tracking-tight select-none">
          <Image
            src={logo}
            alt="logo"
            width={30}
            height={30}
            className="mr-2"
          />
          Music Tauri
        </p>
      </div>
      <div className="space-y-4">
        <div className="px-6 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Discover
          </h2>
          <div className="space-y-1">
            <Button variant="subtle" size="sm" className="w-full justify-start">
              <PlayCircle className="mr-2 h-4 w-4" />
              Listen Now
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Browse
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Radio className="mr-2 h-4 w-4" />
              Radio
            </Button>
          </div>
        </div>
        <div className="px-6 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Library
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <ListMusic className="mr-2 h-4 w-4" />
              Playlists
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Music2 className="mr-2 h-4 w-4" />
              Songs
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Made for You
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Mic2 className="mr-2 h-4 w-4" />
              Artists
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Library className="mr-2 h-4 w-4" />
              Albums
            </Button>
          </div>
        </div>
        <div className="py-2">
          <h2 className="relative px-8 text-lg font-semibold tracking-tight">
            Playlists
          </h2>
          <ScrollArea className="h-80 px-4 mb-4">
            <div className="space-y-1 p-2">
              {playlists.map((playlist) => (
                <Button
                  key={nanoid()}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start font-normal"
                >
                  <ListMusic className="mr-2 h-4 w-4" />
                  {playlist}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </aside>
  )
}
