<script lang="ts">
  import { onDestroy } from 'svelte'

  import { remult } from 'remult'

  import { page } from '$app/stores'

  import Avatar from '$lib/components/Avatar.svelte'
  import Notification from '$lib/components/Notification.svelte'
  import ArrowLeft from '$lib/icons/ArrowLeft.svelte'
  import Github from '$lib/icons/Github.svelte'
  import KoFi from '$lib/icons/KoFi.svelte'
  import { route } from '$lib/ROUTES'
  import { sponsors } from '$lib/sponsors'
  import { notifications } from '$lib/stores/notifications'
  import { LogHandleStats } from '$modules/logs/LogHandleStats'

  import type { LayoutData } from './$types'

  // let hideOthers = false
  let unSub: (() => void) | null = null

  interface Props {
    children?: import('svelte').Snippet
    data: LayoutData
  }

  let { children, data }: Props = $props()

  let first = $state(false)
  // $effect(() => {
  //   if ($page.url.host === 'jyc.dev') {
  //     window.location.href = window.location.href.replace('jyc.dev', 'skyzoo.blue')
  //   }
  // })

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
          notifications.add({
            id: info.items[0].handle,
            bskyProfile: {
              did: info.items[0].did,
              displayName: info.items[0].displayName,
              handle: info.items[0].handle,
              avatar: info.items[0].avatar,
            },
            emoji: info.items[0].emoji,
          })
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

<div class="flex min-h-screen flex-col">
  <div class="container mx-auto flex-grow px-4 py-8">
    <div class="mx-auto mb-8 flex h-14 max-w-3xl text-center">
      {#if $page.url.pathname !== '/stats'}
        <a
          href={$page.url.pathname.split('/').slice(0, -1).join('/')}
          class="btn btn-ghost btn-sm absolute mt-2 w-14"
        >
          <ArrowLeft />
        </a>
      {/if}
      <h1 class="w-full text-4xl font-bold">
        <a href={route(`/stats`)}>Sky Zoo</a>
      </h1>
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
    <div class="flex flex-col items-center justify-center gap-2">
      <div class="flex items-center gap-2">
        <a
          target="_blank"
          href={route(`bsky_profile`, { did: 'did:plc:dacfxuonkf2qtqft22sc23tu' })}
          class="link link-secondary"
        >
          Follow me</a
        >
        <Avatar
          did="did:plc:dacfxuonkf2qtqft22sc23tu"
          handle="jyc.dev"
          displayName="jyc"
          avatar="https://cdn.bsky.app/img/avatar/plain/did:plc:dacfxuonkf2qtqft22sc23tu/bafkreigzfugomncmscljpivtkhuupmreoqkkg55c2egdetohj6v4cupbea@jpeg"
          size="w-6"
        />
        Support me:
        <a href="https://github.com/sponsors/jycouet" target="_blank" aria-label="github"
          ><Github />
        </a>
        <a href="https://ko-fi.com/E1E416BE51" target="_blank"><KoFi /></a>
      </div>

      <div class="flex flex-col items-center gap-2">
        <span>Sponsors 💖</span>
        <div class="flex flex-wrap justify-center gap-1">
          {#each sponsors as sponsor}
            <Avatar {...sponsor} />
          {/each}
        </div>
      </div>

      <div class="flex items-center gap-2">
        Source code
        <a href="https://github.com/jycouet/jyc.dev" target="_blank" aria-label="github"
          ><Github />
        </a>
      </div>
    </div>
  </footer>
</div>

<Notification />
