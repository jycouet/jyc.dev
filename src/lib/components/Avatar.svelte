<script lang="ts">
  import { route } from '$lib/ROUTES'

  interface Props {
    handle: string
    avatar: string | undefined
    displayName: string
    size?: 'w-9' | 'w-6' | 'w-6 md:w-9' | 'w-20'
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
  <div class="mask mask-hexagon {size}">
    <a
      href={route(`bsky_profile`, { handle })}
      class="tooltip"
      data-tip={displayName}
      target="_blank"
    >
      <img src={avatar} alt="{displayName}'s avatar" class="h-full w-full object-cover" />
    </a>
  </div>
</div>
