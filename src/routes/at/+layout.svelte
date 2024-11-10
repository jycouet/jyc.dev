<script lang="ts">
  import { onDestroy } from 'svelte'

  import { remult } from 'remult'

  import { page } from '$app/stores'

  import Notification from '$lib/components/Notification.svelte'
  import Og from '$lib/components/Og.svelte'
  import { notifications } from '$lib/stores/notifications'
  import { LogHandleStats } from '$modules/logs/LogHandleStats'

  import type { LayoutData } from './$types'

  const description = 'Stats on Bluesky, At Protocol, ...'
  // let hideOthers = false
  let unSub: (() => void) | null = null

  interface Props {
    children?: import('svelte').Snippet
    data: LayoutData
  }

  let { children, data }: Props = $props()

  let first = $state(false)
  $effect(() => {
    remult.user = data.user

    unSub = remult
      .repo(LogHandleStats)
      .liveQuery({
        limit: 1,
        // where: { handle: { $not: $page.params.handle } },
      })
      .subscribe((info) => {
        if (first && info.items[0].handle !== $page.params.handle) {
          notifications.add(
            `${info.items[0].displayName} is a ${info.items[0].emoji}`,
            `https://bsky.app/profile/${info.items[0].handle}`,
          )
          // console.log(`info`, info)
        }
        first = true
      })
  })

  onDestroy(() => {
    unSub && unSub()
  })

  // function handleHideOthersChange() {
  //   notifications.add(hideOthers ? 'Others hidden' : 'Others visible', 'info')
  // }
</script>

<Og title="Atmosphere - Stats" {description} />

<div class="flex min-h-screen flex-col">
  <div class="container mx-auto flex-grow px-4 py-8">
    <div class="mb-8 flex items-center justify-center">
      <h1 class="text-4xl font-bold">Atmosphere - Stats</h1>
      <!-- <label class="flex items-center gap-1">
        <input
          type="checkbox"
          bind:checked={hideOthers}
          on:change={handleHideOthersChange}
          class="checkbox scale-75"
        />
        <span class="cursor-pointer text-sm">Hide others</span>
      </label> -->
    </div>

    <div class="mx-auto max-w-3xl">
      {@render children?.()}
    </div>
  </div>

  <footer class="border-t border-gray-800 py-6 text-center text-sm text-gray-600 backdrop-blur-sm">
    <div class="flex items-center justify-center gap-2">
      <a href="/blog" class="link link-primary">Home</a>
      <span>•</span>
      <span>Made by </span>

      <a
        href="https://bsky.app/profile/jyc.dev"
        class="link link-primary flex items-center gap-1"
        target="_blank"
      >
        <img
          src="https://cdn.bsky.app/img/avatar/plain/did:plc:dacfxuonkf2qtqft22sc23tu/bafkreifwequnkii37j2xkzjrpbh5cnuqjykocrxb4cfiwu4h7eonwrl3vm@jpeg"
          alt="jyc.dev avatar"
          class="h-6 w-6 rounded-full"
        />
      </a>

      <a href="https://github.com/sponsors/jycouet" class="link link-secondary" target="_blank">
        support me
      </a>
      <span>•</span>
      Sponsors 💖
      <a
        href="https://bsky.app/profile/tigur.com"
        class="link link-primary flex items-center gap-1"
        target="_blank"
      >
        <img
          src="https://cdn.bsky.app/img/avatar/plain/did:plc:bm3dt7cylgwkmn3t5326ow2l/bafkreihjlhxxdrxf2i7pinowdlgpps4nu2gwab7yve335txwng434iooyi@jpeg"
          alt="Tigur avatar"
          class="h-6 w-6 rounded-full"
        />
      </a>
    </div>
  </footer>
</div>

<Notification />
