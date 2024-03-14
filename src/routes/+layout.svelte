<script>
  import "../app.pcss";
  import fav from "$lib/assets/favicon.png";
</script>

<svelte:head>
  <link rel="icon" href={fav} />
  <title>jyc.dev</title>
  <meta
    name="description"
    content="jyc.dev - a thing where I share my thoughts..."
  />
  <meta property="og:title" content="jyc.dev" />
  <meta property="og:type" content="blog" />
  <meta property="og:url" content="https://jyc.dev" />
  <meta property="og:image" content={fav} />
</svelte:head>

<div class="w-[800px] mx-auto flex flex-col gap-4 p-4">
  <slot />
</div>
