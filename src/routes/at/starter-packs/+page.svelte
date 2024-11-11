<script lang="ts">
  import { parseUri } from '$lib/at/helper'
  import Avatar from '$lib/components/Avatar.svelte'
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
</script>

{#if $paginator.loading.init}
  <div class="container mx-auto">
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
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
        </tbody>
      </table>
    </div>
  </div>
{:else}
  <div class="container mx-auto">
    <div class="overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
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
        </tbody>
      </table>
    </div>
  </div>
{/if}
