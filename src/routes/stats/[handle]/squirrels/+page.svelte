<script lang="ts">
  import Avatar from '$lib/components/Avatar.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  let squadBefore = $derived([1, 2, 3])
  let squadAfter = $derived([4, 5, 6])
</script>

<div class="mb-8 flex flex-col gap-4">
  <h1 class="text-3xl font-bold text-primary">Squirrel Squad 🐿️</h1>
  <p class="text-md text-base-content/70">
    Here you'll find your Bluesky neighbors - users who registered around the same time as you! This
    includes 3 users who joined before you and 3 who joined after you.
  </p>
  <p class="text-md text-base-content/70">Welcome to your squad! 🐿️</p>
</div>

<div class="mt-16">
  <div class="flex items-start justify-center">
    <div class="grid grid-cols-2 justify-items-center">
      {#each squadBefore as member, i}
        <div class={i === 0 ? 'col-span-2' : '-mt-4'}>
          <Avatar {...data} size="w-20" />
        </div>
      {/each}
    </div>

    <div class="-mx-8 -mt-8">
      <Avatar {...data} size="w-28" />
    </div>

    <div class="grid grid-cols-2 justify-items-center">
      {#each squadAfter as member, i}
        <div class={i === 0 ? 'col-span-2' : '-mt-4'}>
          <Avatar {...data} size="w-20" />
        </div>
      {/each}
    </div>
  </div>
</div>
