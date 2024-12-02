<script lang="ts">
  import Og from '$lib/components/Og.svelte'
  import { route } from '$lib/ROUTES'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
</script>

<Og
  title="Thumbnail & metadata"
  description="A tool to generate thumbnail & metadata for your youtube videos"
  og="https://jyc.dev/og.png"
/>

<div class="m-auto flex flex-col gap-8 py-4" style="width: 480px">
  <h1 class="text-2xl text-primary">
    <center>
      <a href={route(`/thumb-meta`)}> Thumbnail & metadata </a>
    </center>
  </h1>

  {@render children?.()}

  <center>
    <a class="link link-primary" href={route(`/blog`)}>jyc.dev</a> |
    <a class="link link-primary" href={route(`/thumb-meta`)}>Home</a> |
    <a class="link link-primary" href={route('/thumb-meta/[videoId]', { videoId: 'WL95jQGMPX0' })}
      >Thumbnail - Example</a
    >
    |
    <a
      class="link link-primary"
      href={route('/blog/[link_under_blog]', { link_under_blog: '2024-04-15-thumb-meta' })}
      >How to use it ?</a
    >
  </center>
</div>
