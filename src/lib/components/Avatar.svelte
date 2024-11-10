<script lang="ts">
  export let handle: string
  export let avatar: string
  export let displayName: string
  export let size: 'w-9' | 'w-6' | 'w-6 md:w-9' = 'w-9'
</script>

<div class="avatar">
  <div class="mask mask-hexagon {size}">
    <a
      href="https://bsky.app/profile/{handle}"
      class="tooltip"
      data-tip={displayName}
      target="_blank"
    >
      <img src={avatar} alt="{displayName} avatar" class="h-full w-full object-cover" />
    </a>
  </div>
</div>
