"use client";

import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import Image from "next/image";

import {
  Album,
  CreditCard,
  Globe,
  Keyboard,
  LayoutGrid,
  Library,
  ListMusic,
  LogOut,
  Mail,
  MessageSquare,
  Mic,
  Mic2,
  Music,
  Music2,
  PlayCircle,
  Plus,
  PlusCircle,
  Podcast,
  Radio,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { playlists, listenNowAlbums, madeForYouAlbums } from "@/app/data";
import logo from "../assets/logo.png";

interface Album {
  name: string;
  artist: string;
  cover: string;
}

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="rounded-md bg-white transition-all dark:bg-slate-900">
      <div className="grid grid-cols-4 xl:grid-cols-5">
        <aside className="pb-12">
          <div className="px-8 py-6">
            <p className="flex items-center text-2xl font-semibold tracking-tight">
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
                <Button
                  variant="subtle"
                  size="sm"
                  className="w-full justify-start"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Listen Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Browse
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <ListMusic className="mr-2 h-4 w-4" />
                  Playlists
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Music2 className="mr-2 h-4 w-4" />
                  Songs
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  Made for You
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Mic2 className="mr-2 h-4 w-4" />
                  Artists
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Library className="mr-2 h-4 w-4" />
                  Albums
                </Button>
              </div>
            </div>
            <div className="py-2">
              <h2 className="relative px-8 text-lg font-semibold tracking-tight">
                Playlists
              </h2>
              <ScrollArea className="h-[230px] px-4">
                <div className="space-y-1 p-2">
                  {playlists.map((playlist) => (
                    <Button
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
        <div className="col-span-3 border-l border-l-slate-200 dark:border-l-slate-700 xl:col-span-4">
          <div className="h-full px-8 py-6">
            <Tabs defaultValue="music" className="h-full space-y-6">
              <div className="space-between flex items-center">
                <TabsList>
                  <TabsTrigger value="music" className="relative">
                    Music
                  </TabsTrigger>
                  <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
                  <TabsTrigger value="live" disabled>
                    Live
                  </TabsTrigger>
                </TabsList>
                <div className="ml-auto mr-4">
                  <h3 className="text-sm font-semibold">Welcome back</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar>
                        <AvatarImage
                          src="https://github.com/shadcn.png"
                          alt="@shadcn"
                        />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Billing</span>
                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Keyboard className="mr-2 h-4 w-4" />
                        <span>Keyboard shortcuts</span>
                        <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Team</span>
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <UserPlus className="mr-2 h-4 w-4" />
                          <span>Invite users</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent forceMount>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Email</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              <span>Message</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              <span>More...</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <TabsContent value="music" className="border-none p-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Listen Now
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Top picks for you. Updated daily.
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="relative">
                  <div className="relative flex space-x-4">
                    {listenNowAlbums.map((album) => (
                      <AlbumArtwork
                        key={album.name}
                        album={album}
                        className="w-[250px]"
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-6 space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Made for You
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your personal playlists. Updated daily.
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="relative">
                  <ScrollArea>
                    <div className="flex space-x-4 pb-4">
                      {madeForYouAlbums.map((album) => (
                        <AlbumArtwork
                          key={album.name}
                          album={album}
                          className="w-[150px]"
                          aspectRatio={1 / 1}
                        />
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>
              </TabsContent>
              <TabsContent
                value="podcasts"
                className="h-full flex-col border-none p-0 data-[state=active]:flex"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      New Episodes
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Your favorite podcasts. Updated daily.
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <Podcast className="h-10 w-10 text-slate-400" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                      No episodes added
                    </h3>
                    <p className="mt-2 mb-4 text-sm text-slate-500 dark:text-slate-400">
                      You have not added any podcasts. Add one below.
                    </p>
                    <Dialog>
                      <DialogTrigger>
                        <Button size="sm" className="relative">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Podcast
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Podcast</DialogTitle>
                          <DialogDescription>
                            Copy and paste the podcast feed URL to import.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="url">Podcast URL</Label>
                            <Input
                              id="url"
                              placeholder="https://example.com/feed.xml"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button>Import Podcast</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

interface AlbumArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  album: Album;
  aspectRatio?: number;
}

function AlbumArtwork({
  album,
  aspectRatio = 2.8 / 4,
  className,
  ...props
}: AlbumArtworkProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <ContextMenu>
        <ContextMenuTrigger>
          <AspectRatio
            ratio={aspectRatio}
            className="overflow-hidden rounded-md"
          >
            <Image
              src={album.cover}
              alt={album.name}
              fill
              className="object-cover transition-all hover:scale-105"
            />
          </AspectRatio>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-40">
          <ContextMenuItem>Add to Library</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Add to Playlist</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Playlist
              </ContextMenuItem>
              <ContextMenuSeparator />
              {playlists.map((playlist) => (
                <ContextMenuItem key={playlist}>
                  <ListMusic className="mr-2 h-4 w-4" /> {playlist}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem>Play Next</ContextMenuItem>
          <ContextMenuItem>Play Later</ContextMenuItem>
          <ContextMenuItem>Create Station</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Like</ContextMenuItem>
          <ContextMenuItem>Share</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{album.name}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {album.artist}
        </p>
      </div>
    </div>
  );
}
