<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    src: string
    alt: string
  }

  let { src, alt }: Props = $props()

  let loaded = $state(false)
  let thisImage: any = $state()

  onMount(() => {
    thisImage.onload = () => {
      loaded = true
    }
  })
</script>

<img {src} {alt} class:loaded bind:this={thisImage} loading="lazy" />

<style>
  img {
    opacity: 0;
    transition: opacity 1200ms ease-out;
  }
  img.loaded {
    opacity: 1;
  }
</style>
