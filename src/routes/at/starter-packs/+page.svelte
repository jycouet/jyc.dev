<script lang="ts">
  import { parseUri } from '$lib/at/helper'
  import Avatar from '$lib/components/Avatar.svelte'
  import Og from '$lib/components/Og.svelte'
  import { paginatorStore } from '$lib/paginatorStore'
  import { containsWords } from '$lib/remultHelper'
  import { StarterPack } from '$modules/at/StarterPack'

  let pageSize = 20
  let search: string = $state('')

  const paginator = paginatorStore(StarterPack, {
    pageSize,
    include: { creator: true },
    aggregate: {},
  })

  let debounceTimer: ReturnType<typeof setTimeout>
  $effect(() => {
    if (search === '') {
      paginator.load(containsWords(StarterPack, ['name', 'description'], search))
    } else {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        paginator.load(containsWords(StarterPack, ['name', 'description'], search))
      }, 433)
    }
  })

  const description = 'Looking for a starter pack? Here you go!'
</script>

<Og title="Atmosphere - Starter Packs Browser" {description} />

<div class="container mx-auto space-y-4">
  <div class="relative mb-8">
    <input
      type="text"
      bind:value={search}
      placeholder="Search starter packs..."
      class="input input-bordered w-full"
    />
    <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center">
      <span class="text-2xl font-semibold text-gray-400">
        {$paginator?.aggregates?.$count ?? '...'}
      </span>
    </div>
  </div>

  <div class="overflow-x-auto">
    <table class="table w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {#if $paginator.loading.init}
          {#each Array(20) as _}
            <tr>
              <td>
                <div class="flex items-center gap-3">
                  <div class="skeleton h-12 w-12 rounded-full"></div>
                  <div class="skeleton h-4 w-48"></div>
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-2">
                  <div class="skeleton h-4 w-full"></div>
                  <div class="skeleton h-4 w-3/4"></div>
                  <div class="flex justify-end">
                    <div class="skeleton h-4 w-24"></div>
                  </div>
                </div>
              </td>
            </tr>
          {/each}
        {:else if $paginator.items.length === 0}
          <tr>
            <td colspan="2" class="text-center">No starter packs found</td>
          </tr>
        {:else}
          {#each $paginator.items as pack}
            <tr
              class="cursor-pointer hover:bg-base-200"
              onclick={() => (window.location.href = `/at/starter-packs/${pack.id}`)}
            >
              <td>
                <div class="flex items-center gap-3">
                  <Avatar {...pack.creator} />
                  <a
                    class="link link-info flex items-center gap-3"
                    href="https://bsky.app/starter-pack/{pack.creator.handle}/{parseUri(pack.id)
                      .rkey}"
                  >
                    <div class="font-bold">{pack.name}</div>
                  </a>
                </div>
              </td>
              <td>
                {#each pack.description.split('\n') as line}<p>{line}</p>{/each}
                <div class="text-right text-sm text-secondary">
                  {pack.nbMembers ?? 0} members
                </div>
              </td>
            </tr>
          {/each}
          {#if $paginator.loading.nextPage}
            {#each Array(pageSize) as _}
              <tr>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="skeleton h-8 w-8 rounded-full"></div>
                    <div class="skeleton h-4 w-32"></div>
                  </div>
                </td>
                <td>
                  <div class="skeleton h-4 w-full"></div>
                  <div class="mt-2 text-right">
                    <div class="skeleton inline-block h-4 w-24"></div>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        {/if}
      </tbody>
    </table>

    {#if $paginator.items.length > 0 && pageSize < ($paginator?.aggregates?.$count ?? 0)}
      <div class="col-span-full mt-8 flex justify-center">
        <button
          disabled={!$paginator.hasNextPage}
          class="btn btn-primary px-8 text-lg"
          onclick={paginator.loadMore}
        >
          Load more
        </button>
      </div>
    {/if}
  </div>
</div>
