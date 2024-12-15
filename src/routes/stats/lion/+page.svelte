<script lang="ts">
  import avatarDefault from '$lib/assets/avatar-default.jpg'
  import og from '$lib/assets/og-lion.png'
  import ImageLoader from '$lib/components/image/ImageLoader.svelte'
  import Og from '$lib/components/Og.svelte'
  import { route } from '$lib/ROUTES'
  import { LSContext } from '$lib/stores/LSContext'

  import type { PageData } from './$types'

  const description = 'Most followed accounts on Bluesky'

  let { data }: { data: PageData } = $props()

  // Add search functionality
  let searchQuery = $state('')
  let filteredProfiles = $derived.by(() => {
    return data.topProfiles.filter((profile) => {
      const query = searchQuery.toLowerCase()
      return (
        profile.displayName?.toLowerCase().includes(query) ||
        profile.handle?.toLowerCase().includes(query)
      )
    })
  })
</script>

<Og title="Sky Zoo - Top Followers 🦁" {description} {og} />

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-4">
    <h1 class="text-4xl font-bold">🦁 Top Followed</h1>

    <div class="flex items-center justify-between gap-4">
      <p class="text-base-content/70">The 999 most followed accounts.</p>

      <div class="flex flex-col items-center gap-1">
        <p class="text-xs text-base-content/60">Links to</p>
        <div class="flex items-center gap-2">
          <span class="text-right text-sm text-info">Bluesky profile</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            bind:checked={$LSContext.linkToSkyzooStats}
            title="Toggle between linking to Bluesky profiles or Skyzoo stats"
          />
          <span class="text-sm text-primary">Skyzoo stats</span>
        </div>
      </div>
    </div>
  </div>

  <div class="form-control w-full">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search by name or handle..."
      class="input input-bordered w-full placeholder:text-base-content/30"
    />
  </div>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
    {#each filteredProfiles as profile}
      <a
        href={$LSContext.linkToSkyzooStats
          ? route('/stats/[handle]', { handle: profile.handle ?? '' })
          : route('bsky_profile', { did: profile.did ?? '' })}
        target="_blank"
        class="card card-compact relative bg-base-200 transition-all hover:scale-105 hover:shadow-lg"
      >
        <div class=" badge absolute -left-2 -top-2 bg-base-300 text-secondary">{profile.pos}</div>
        <div class="card-body">
          <div class="flex items-center gap-3">
            <div class="mask mask-hexagon size-12 flex-shrink-0">
              <ImageLoader src={profile.avatar || avatarDefault} alt="{profile.handle}'s avatar"
              ></ImageLoader>
              <!-- class="h-full w-full object-cover" -->
            </div>
            <div class="flex w-full min-w-0 flex-col">
              <span class="truncate font-bold">{profile.displayName}</span>
              <span class="truncate font-mono text-sm text-primary">@{profile.handle}</span>
              <span class="text-right text-sm text-info">
                {(profile.followersCount ?? 0).toLocaleString()}
                <!-- <span class="text-[0.5rem]">Followers</span> -->
              </span>
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
