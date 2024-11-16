<script lang="ts">
  import { onDestroy } from 'svelte'

  import { remult } from 'remult'

  import { page } from '$app/stores'

  import Avatar from '$lib/components/Avatar.svelte'
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

<Og title="Atmosphere - Stats" {description} />

<div class="flex min-h-screen flex-col">
  <div class="container mx-auto flex-grow px-4 py-8">
    <div class="mb-8 flex items-center justify-center">
      <h1 class="text-4xl font-bold">
        <a href="/at">Atmosphere - Stats</a>
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
      <span>Made by </span>

      <Avatar
        handle="jyc.dev"
        displayName="jyc"
        avatar="https://cdn.bsky.app/img/avatar/plain/did:plc:dacfxuonkf2qtqft22sc23tu/bafkreifwequnkii37j2xkzjrpbh5cnuqjykocrxb4cfiwu4h7eonwrl3vm@jpeg"
        size="w-6"
      />

      <a href="https://github.com/sponsors/jycouet" class="link link-secondary" target="_blank">
        support me
      </a>
      <span>•</span>
      Sponsors 💖
      <div class="avatar-group -space-x-1">
        {#each sponsors as sponsor}
          <Avatar {...sponsor} />
        {/each}
      </div>
    </div>
  </footer>
</div>

<Notification />
