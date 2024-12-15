<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'

  import og from '$lib/assets/og-turtle.png'
  import Avatar from '$lib/components/Avatar.svelte'
  import Og from '$lib/components/Og.svelte'
  import { route } from '$lib/ROUTES'
  import { AgentController } from '$modules/at/AgentController'

  const description = 'Get permanent links for Bluesky posts'

  let postUrl = $state('')
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
    const initialPostUrl = $page.url.searchParams.get('postUrl') ?? ''

    if (initialPostUrl) {
      postUrl = initialPostUrl
      $page.url.searchParams.delete('postUrl')
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
      if (res.data.actors.length === 0) {
        return
      }
      profile = {
        did: res.data.actors[0].did,
        handle: res.data.actors[0].handle,
        avatar: res.data.actors[0].avatar,
        displayName: res.data.actors[0].displayName ?? res.data.actors[0].handle,
      }
      permalink = route('bsky_post', { did: profile.did, rkey: s[6] })
    })
  })

  // Add this function to handle copying
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
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
            <div class="relative rounded-lg bg-base-300 p-4">
              <h3 class="mb-2 text-sm font-semibold">Permalink</h3>
              <code class="block w-full break-all font-mono">{permalink}</code>
              <button
                aria-label="Copy to clipboard"
                class="btn btn-ghost btn-sm absolute right-2 top-2"
                onclick={() => copyToClipboard(permalink)}
                title="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                  />
                </svg>
              </button>
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
