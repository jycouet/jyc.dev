<script lang="ts">
  import { page } from '$app/stores'

  import fav from '$lib/assets/favicon.svg'
  import og from '$lib/assets/og.png'

  const {
    //
    title = 'jyc.dev',
    description = 'A place where I share my thoughts...',
  } = $props()

  let canonicalUrl = $derived(`${$page.url.origin}${$page.url.pathname}`)
</script>

<svelte:head>
  <link rel="icon" href={fav} />

  <title>{title}</title>

  <!-- Defaults Meta Tags -->
  <link rel="canonical" href={canonicalUrl} />
  <meta name="description" content={description} />

  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="blog" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={og} />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content={$page.url.host} />
  <meta property="twitter:url" content={$page.url.href} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={og} />
</svelte:head>
