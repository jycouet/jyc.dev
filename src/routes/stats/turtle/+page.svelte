<script lang="ts">
  import { Agent } from '@atproto/api'
  import type { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs'

  import { goto } from '$app/navigation'
  import { page } from '$app/stores'

  import og from '$lib/assets/og-turtle.png'
  import Avatar from '$lib/components/Avatar.svelte'
  import Og from '$lib/components/Og.svelte'
  import { route } from '$lib/ROUTES'
  import { AgentController } from '$modules/at/AgentController'

  const description = 'Get permanent links for Bluesky posts'

  let part1 = '' //$derived($page.url.searchParams.get('part1'))
  let part2 = '' //$derived($page.url.searchParams.get('part2'))

  let postUrl = $state('https://bsky.app/profile/jyc.dev/post/3lb3acg4yv22z')
  let permalink = $state('')
  let profile:
    | {
        did: string
        handle: string
        avatar: string | undefined
        displayName: string
      }
    | undefined = $state(undefined)

  $effect(() => {
    part1 = $page.url.searchParams.get('part1') ?? ''
    part2 = $page.url.searchParams.get('part2') ?? ''

    if (part1 && part2) {
      postUrl = `https://bsky.app/profile/${part1}/post/${part2}`
      $page.url.searchParams.delete('part1')
      $page.url.searchParams.delete('part2')
      goto(`/stats/turtle`)
    }
  })

  $effect(() => {
    // I have https://bsky.app/profile/jyc.dev/post/3lb3acg4yv22z
    // And I want to get "jyc.dev"
    const s = postUrl.split('/')
    if (s.length !== 7) {
      profile = undefined
      permalink = ''
      return
    }
    const handle = s[4]

    AgentController.searchActorsTypeahead(handle).then((res) => {
      profile = {
        did: res.data.actors[0].did,
        handle: res.data.actors[0].handle,
        avatar: res.data.actors[0].avatar,
        displayName: res.data.actors[0].displayName ?? res.data.actors[0].handle,
      }
      permalink = route('bsky_post', { did: profile.did, rkey: s[6] })
    })
  })
</script>

<Og title="Sky Zoo - Turtle" {description} {og} />

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-4">
    <h1 class="text-4xl font-bold">🐢 Turtle</h1>
    <p class="text-base-content/70">Get permanent links for your Bluesky posts.</p>
  </div>

  <div class="card bg-base-200 shadow-xl">
    <div class="card-body">
      <div class="flex flex-col gap-4">
        <div class="form-control w-full">
          <input
            type="text"
            bind:value={postUrl}
            placeholder="https://bsky.app/profile/handle/post/post-id"
            class="input input-bordered w-full placeholder:text-base-content/30"
          />
        </div>

        {#if permalink}
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-base-300 p-4">
              <h3 class="mb-2 text-sm font-semibold">Permalink</h3>
              <code class="block w-full break-all font-mono">{permalink}</code>
            </div>
            {#if profile}
              <Avatar {...profile} size="w-20 md:w-28" linkToStats />
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
