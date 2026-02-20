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
  {#if comment}<span class="text-neutral-500 font-extralight ml-1">// {@html comment}</span>{/if}
  <div>
    <span class="text-gray-600">"</span><span class="text-gray-400">{key}</span><span
      class="text-gray-600">"</span
    >: <span class="text-gray-600">"</span>{#if value.startsWith('https://')}<a class='link link-info' href={value} target='_blank'>{value.replace('https://', '')}</a>{:else}<span class="font-mono text-secondary">{value}</span>{/if}<span class="text-gray-600">"</span>
  </div>
</div>


<!-- <a class='link link-info' href='https://bsky.app/profile/jay.bsky.team/post/3lb6fa7sjzc2p' target='_blank'>source</a> -->