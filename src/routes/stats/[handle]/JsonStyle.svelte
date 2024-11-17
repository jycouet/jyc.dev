<script lang="ts">
  let {
    key,
    value,
    comment = undefined,
  } = $props<{
    key: string
    value: string | number
    comment?: string
  }>()
</script>

<div class="ml-4 text-sm">
  {#if comment}<span class="text-neutral-500">// {comment}</span>{/if}
  <div>
    <span class="text-gray-600">"</span><span class="text-gray-400">{key}</span><span
      class="text-gray-600">"</span
    >: <span class="text-gray-600">"</span><span class="text-secondary">{value}</span><span
      class="text-gray-600">"</span
    >
  </div>
</div>
