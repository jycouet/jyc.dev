<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<div class="m-auto flex flex-col gap-8 py-4" style="width: 480px">
  <h1 class="text-2xl text-primary">
    <center>
      <a href="/thumb-meta"> Thumbnail & metadata </a>
    </center>
  </h1>

  {@render children?.()}

  <center>
    <a class="link link-primary" href="/blog/2024-04-15-thumb-meta">How to use it ?</a>
  </center>
</div>
