<script>
  import Timeline from "$lib/components/Timeline.svelte";

  export let data;
</script>

<Timeline items={data.mds}></Timeline>
