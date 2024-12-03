<script lang="ts">
  import Image from './Image.svelte'
  import IntersectionObserver from './IntersectionObserver.svelte'

  interface Props {
    src: string
    alt: string
  }

  let { src, alt }: Props = $props()

  let nativeLoading = false

  // Determine whether to bypass our intersecting check
  // onMount(() => {
  //   if ('loading' in HTMLImageElement.prototype) {
  //     nativeLoading = true
  //   }
  // })
</script>

<IntersectionObserver once={true}>
  {#snippet children({ intersecting })}
    {#if intersecting || nativeLoading}
      <Image {alt} {src} />
    {/if}
  {/snippet}
</IntersectionObserver>
