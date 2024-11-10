<script lang="ts">
  import { fade } from 'svelte/transition'

  import { notifications } from '$lib/stores/notifications'

  import Avatar from './Avatar.svelte'
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  {#each $notifications as notification (notification.id)}
    <div transition:fade class="rounded bg-base-300 px-4 py-2 text-white shadow-lg">
      <div class="flex items-center justify-end gap-4 p-2 text-xl md:text-3xl">
        <Avatar {...notification.bskyProfile} size="w-6 md:w-9" />
        <a
          target="_blank"
          class="link link-accent"
          href={`https://bsky.app/profile/${notification.bskyProfile.handle}`}
        >
          {notification.bskyProfile.displayName}
        </a>
        <span class="text-base text-base-content/60 md:text-xl">is a</span>

        <span class="">{notification.emoji}</span>
      </div>
    </div>
  {/each}
</div>
