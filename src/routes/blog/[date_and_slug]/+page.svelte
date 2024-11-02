<script lang="ts">
  import SvelteMarkdown from "svelte-markdown";
  let { data } = $props();
</script>

<h2 class="text-2xl text-primary">{data.title}</h2>

<article class="prose">
  <SvelteMarkdown source={data.source} />
</article>
