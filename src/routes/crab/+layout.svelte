<script lang="ts">
  import { onDestroy } from 'svelte'

  import { remult } from 'remult'

  import { page } from '$app/stores'

  import Avatar from '$lib/components/Avatar.svelte'
  import Notification from '$lib/components/Notification.svelte'
  import { route } from '$lib/ROUTES'
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
  $effect(() => {
    if ($page.url.host === 'jyc.dev') {
      window.location.href = window.location.href.replace('jyc.dev', 'skyzoo.blue')
    }
  })

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

  const sponsors = [
    {
      handle: 'tigur.com',
      avatar:
        'https://cdn.bsky.app/img/avatar/plain/did:plc:bm3dt7cylgwkmn3t5326ow2l/bafkreihjlhxxdrxf2i7pinowdlgpps4nu2gwab7yve335txwng434iooyi@jpeg',
      displayName: 'Tigur',
    },
    {
      handle: 'imlunahey.com',
      avatar:
        'https://cdn.bsky.app/img/avatar/plain/did:plc:k6acu4chiwkixvdedcmdgmal/bafkreihwjqusqk5wyahldrx4spchtozxce6vpd47p2wyfccg2pvhrc3hya@jpeg',
      displayName: 'Luna',
    },
    {
      handle: 'harry-lewiston.bsky.social',
      avatar:
        'https://cdn.bsky.app/img/avatar/plain/did:plc:aqkumzmd7yas67hexhiixkyq/bafkreieliyf4xvtyv3bdbn6wuon7l4mojhkvpybi5zoza25yptqvafbwx4@jpeg',
      displayName: 'Harry Lewiston',
    },
    {
      handle: 'patak.dev',
      avatar:
        'https://cdn.bsky.app/img/avatar/plain/did:plc:2gkh62xvzokhlf6li4ol3b3d/bafkreifgzl4e5jqlakd77ajvnilsb5tufsv24h2sxfwmitkzxrh3sk6mhq@jpeg',
      displayName: 'patak',
    },
  ]
</script>

<div class="flex min-h-screen flex-col">
  <div class="container mx-auto flex-grow px-4 py-8">
    <div class="mb-8 flex items-center justify-center">
      <h1 class="text-4xl font-bold">
        <a href={route(`/crab`)}>Sky Zoo</a>
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
    <div class="flex items-center justify-center gap-2">
      <!-- <a href="/blog" class="link link-primary">Home</a>
      <span>•</span> -->
      <!-- <span>Made by </span> -->
      <a
        target="_blank"
        href={route(`bsky_profile`, { handle: 'jyc.dev' })}
        class="link link-secondary"
      >
        Follow me</a
      >
      <Avatar
        handle="jyc.dev"
        displayName="jyc"
        avatar="https://cdn.bsky.app/img/avatar/plain/did:plc:dacfxuonkf2qtqft22sc23tu/bafkreifwequnkii37j2xkzjrpbh5cnuqjykocrxb4cfiwu4h7eonwrl3vm@jpeg"
        size="w-6"
      />

      <a href="https://github.com/sponsors/jycouet" class="link link-secondary" target="_blank">
        Support me
      </a>
      <span>•</span>
      Sponsors 💖
      <div class="avatar-group -space-x-1">
        {#each sponsors as sponsor}
          <Avatar {...sponsor} />
        {/each}
      </div>
      <span>•</span>
      Source code
      <a href="https://github.com/jycouet/jyc.dev" target="_blank" aria-label="github"
        ><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
          ><path
            fill="#888888"
            d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
          /></svg
        >
      </a>
    </div>
  </footer>
</div>

<Notification />
