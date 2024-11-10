<script lang="ts">
  import { fade } from 'svelte/transition'

  import { notifications } from '$lib/stores/notifications'
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  {#each $notifications as notification (notification.id)}
    <div transition:fade class="rounded bg-base-300 px-4 py-2 text-white shadow-lg">
      <!-- class:bg-blue-500={notification.type === 'info'}
      class:bg-green-500={notification.type === 'success'}
      class:bg-yellow-500={notification.type === 'warning'}
      class:bg-red-500={notification.type === 'error'} -->
      <a class="link link-accent" href={notification.link}>
        {notification.message}
      </a>
    </div>
  {/each}
</div>
