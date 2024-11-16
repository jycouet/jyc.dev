<script lang="ts">
  import { queryParameters } from 'sveltekit-search-params'

  import Avatar from '$lib/components/Avatar.svelte'
  import Og from '$lib/components/Og.svelte'
  import { paginatorStore } from '$lib/paginatorStore'
  import { containsWords } from '$lib/remultHelper'
  import { route } from '$lib/ROUTES'
  import { parseUri } from '$modules/at/helper'
  import { StarterPack } from '$modules/at/StarterPack'

  const params = queryParameters(
    {
      q: true,
    },
    { pushHistory: false },
  )

  let pageSize = 20

  const paginator = paginatorStore(StarterPack, {
    pageSize,
    include: { creator: true },
    aggregate: {},
  })
  // remult.apiClient.httpClient = async (input: RequestInfo | URL, init?: RequestInit) => {
  //   console.log(init)
  //   const res = await fetch(input, {
  //     ...init,
  //   })

  //   return res
  // }
  let debounceTimer: ReturnType<typeof setTimeout>
  $effect(() => {
    if ($params.q === '') {
      paginator.load({})
    } else {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        paginator.load({
          $or: [
            containsWords(StarterPack, ['name', 'description'], $params.q ?? ''),
            // REMULT ?
            // @ts-ignore
            StarterPack.filterByCreator({ str: $params.q ?? '' }),
          ],
        })
      }, 433)
    }
  })

  const description = 'Looking for a starter pack? Here you go!'
</script>

<Og title="Sky Zoo - Starter Packs Browser" {description} />

<div class="container mx-auto space-y-4">
  <div class="relative mb-8">
    <input
      type="text"
      bind:value={$params.q}
      placeholder="Search by creator, title, description, ..."
      class="input input-bordered w-full placeholder:text-base-content/40"
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
          <th>Creator & Title</th>
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
            <tr class="hover:bg-base-200">
              <td>
                <div class="flex items-center gap-3">
                  <Avatar {...pack.creator} />
                  <a
                    class="link link-info flex items-center gap-3"
                    target="_blank"
                    href={route(`bsky_starter_pack`, {
                      creator_handle: pack.creator.handle,
                      rkey: parseUri(pack.id).rkey,
                    })}
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
