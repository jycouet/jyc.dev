<script lang="ts">
  import '../app.pcss'

  import posthog from 'posthog-js'

  import { onNavigate } from '$app/navigation'
  import { page } from '$app/stores'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()

  $effect(() => {
    // if (!dev) {
    // It's a public key anyway!
    posthog.init('phc_tmNtXMnAWyPJc6wq7Jvak0E3qWxsz9eEeedaw2DKVuL', {
      // api_host: "https://eu.posthog.com",
      api_host: `${$page.url.origin}/posthog`,
      ui_host: 'https://eu.posthog.com',
    })
    // }
  })

  onNavigate((navigation) => {
    // @ts-ignore
    if (!document.startViewTransition) return

    return new Promise((resolve) => {
      // @ts-ignore
      document.startViewTransition(async () => {
        resolve()
        await navigation.complete
      })
    })
  })
</script>

{@render children?.()}
