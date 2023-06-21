<script lang="ts">
  import { cn } from '$lib/utils';

  let className: string | undefined | null = undefined;
  export { className as class };
</script>

<tr
  class={cn(
    'border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50',
    className
  )}
  {...$$restProps}
>
  <slot />
</tr>
