<script lang="ts">
  import Timeline from '$lib/components/Timeline.svelte'

  let { data } = $props()
</script>

<Timeline items={data.mds}></Timeline>
