<script lang="ts">
  import SvelteMarkdown from "svelte-markdown";
  let { data } = $props();
</script>

<div class="flex justify-between items-center">
  <h2 class="text-2xl text-primary">{data.title}</h2>
  <a
    class="link link-secondary"
    href="https://whtwnd.com/jyc.dev"
    target="_blank">Check it on WhiteWind</a
  >
</div>

<article class="prose min-w-[800px]">
  <SvelteMarkdown source={data.source} />
</article>
