<script lang="ts">
  import { dev } from '$app/environment';
  import '../styles/globals.css';
  import { WindowTitlebar } from '@tauri-controls/svelte';

  import { ExamplesNav, TailwindIndicator } from '$components/docs';
  import { cn } from '$lib/utils';
  import { Sailboat } from 'lucide-svelte';

  import { onMount } from 'svelte';
  import LightSwitch from '$components/docs/light-switch/LightSwitch.svelte';
  import type { WebviewWindow } from '@tauri-apps/plugin-window';

  let appWindow: WebviewWindow;

  const closeWindow = async () => {
    appWindow.close();
  };

  onMount(async () => {
    const { appWindow: windowPlugin } = await import('@tauri-apps/plugin-window');
    appWindow = windowPlugin;
  });
</script>

<div class="h-screen overflow-clip">
  <WindowTitlebar class="ml-2">
    <div class="pl-2 flex items-center p-1">
      <Sailboat class="h-5 w-5 " />

      <ExamplesNav data-tauri-drag-region class="pl-1" />
      <LightSwitch />
    </div>
  </WindowTitlebar>

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
