<script lang="ts">
  export let handle: string
  export let avatar: string
  export let name: string
  export let size: 'sm' | 'md' | 'lg' = 'md'

  const sizeClasses = {
    sm: 'w-6',
    md: 'w-9',
    lg: 'w-12',
  }
</script>

<div class="avatar">
  <div class="mask mask-hexagon {sizeClasses[size]}">
    <a href="https://bsky.app/profile/{handle}" class="tooltip" data-tip={name} target="_blank">
      <img src={avatar} alt="{name} avatar" class="h-full w-full object-cover" />
    </a>
  </div>
</div>
