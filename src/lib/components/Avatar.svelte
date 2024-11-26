<script lang="ts">
  import avatarDefault from '$lib/assets/avatar-default.jpg'
  import { route } from '$lib/ROUTES'

  interface Props {
    handle: string
    avatar: string | undefined
    displayName: string
    size?: 'w-9' | 'w-6' | 'w-6 md:w-9' | 'w-20' | 'w-16 md:w-20' | 'w-20 md:w-28'
  }

  let { handle, displayName, avatar, size = 'w-9' }: Props = $props()

  // Get initials from display name
  // let initials = $derived(
  //   (displayName ?? handle)
  //     .split(' ')
  //     .map((word) => word[0])
  //     .join('')
  //     .slice(0, 2)
  //     .toUpperCase(),
  // )
</script>

<div class="avatar">
  {#if handle}
    <div class="mask mask-hexagon {size}" title={displayName}>
      <a
        href={route(`bsky_profile`, { handle })}
        class="tooltip"
        data-tip={displayName}
        target="_blank"
      >
        <img
          src={avatar || avatarDefault}
          alt="{displayName}'s avatar"
          class="h-full w-full object-cover"
        />
      </a>
    </div>
  {:else}
    <div class="mask mask-hexagon {size}">
      <div class="skeleton h-full w-full bg-primary/10"></div>
    </div>
  {/if}
</div>
