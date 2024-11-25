<script lang="ts">
  import '../app.pcss'

  import posthog from 'posthog-js'

  import { PUBLIC_POSTHOG_KEY } from '$env/static/public'
  import { onNavigate } from '$app/navigation'
  import { page } from '$app/stores'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()

  $effect(() => {
    if (PUBLIC_POSTHOG_KEY) {
      posthog.init(PUBLIC_POSTHOG_KEY, {
        // api_host: "https://eu.posthog.com",
        api_host: `${$page.url.origin}/posthog`,
        ui_host: 'https://eu.posthog.com',
      })
    } else {
      console.info('no posthog key')
    }
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
