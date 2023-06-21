<script lang="ts">
  import { dev } from '$app/environment';
  import '../styles/globals.css';

  import {
    ExamplesNav,
    Icons,
    PageHeader,
    PageHeaderDescription,
    PageHeaderHeading,
    TailwindIndicator
  } from '$components/docs';
  import { Button } from '$components/ui/button';
  import { cn } from '$lib/utils';
  import { Maximize, Sailboat, X } from 'lucide-svelte';

  import { onMount } from 'svelte';
  import Minimize from '$components/docs/icons/Minimize.svelte';
  import LightSwitch from '$components/docs/light-switch/LightSwitch.svelte';

  let appWindow;

  const minimizeWindow = async () => {
    const { appWindow: windowPlugin } = await import('@tauri-apps/plugin-window');
    appWindow = windowPlugin;
    appWindow?.minimize();
  };

  const maximizeWindow = async () => {
    const { appWindow: windowPlugin } = await import('@tauri-apps/plugin-window');
    appWindow = windowPlugin;
    const isMaximized = await appWindow?.isMaximized();

    if (isMaximized) {
      appWindow?.unmaximize();
    } else {
      appWindow?.maximize();
    }
  };

  const closeWindow = async () => {
    const { appWindow: windowPlugin } = await import('@tauri-apps/plugin-window');
    appWindow = windowPlugin;
    appWindow.close();
  };

  onMount(async () => {
    const { appWindow: windowPlugin } = await import('@tauri-apps/plugin-window');
    appWindow = windowPlugin;
  });
</script>

<div class="h-screen overflow-clip">
  <div data-tauri-drag-region class="ml-2 flex items-center p-1">
    <Sailboat class="h-5 w-5 " />

    <ExamplesNav data-tauri-drag-region class="pl-1" />
    <LightSwitch />

    <div data-tauri-drag-region class="inline-flex h-full justify-end">
      <Button
        variant="ghost"
        class="h-8 focus:outline-none"
        id="titlebar-minimize"
        on:click={() => minimizeWindow()}
      >
        <Minimize class="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        class="h-8 focus:outline-none"
        id="titlebar-minimize"
        on:click={() => maximizeWindow()}
      >
        <Maximize class="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        class="h-8 focus:outline-none"
        id="titlebar-minimize"
        on:click={() => closeWindow()}
      >
        <X class="h-4 w-4" />
      </Button>
    </div>
  </div>
  <div
    class={cn(
      'h-screen overflow-auto border-t bg-background pb-8',
      // "scrollbar-none"
      'scrollbar scrollbar-track-transparent scrollbar-thumb-accent scrollbar-thumb-rounded-md'
    )}
  >
    <slot />
  </div>
  {#if dev}
    <TailwindIndicator />
  {/if}
</div>
