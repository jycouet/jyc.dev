<script lang="ts">
  import { page } from '$app/stores'

  const description = 'Some stats about Atmosphere'
</script>

<svelte:head>
  <title>Atmosphere - Stats</title>

  <meta name="description" content={description} />
  <!-- <meta name="referrer" content="no-referrer" /> -->
  <meta property="og:type" content="WebApp" />
  <meta property="og:title" content="Atmosphere - Stats" />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={$page.url.origin} />
</svelte:head>

<div class="flex min-h-screen flex-col">
  <div class="container mx-auto flex-grow px-4 py-8">
    <h1 class="mb-8 text-center text-4xl font-bold">Atmosphere - Stats</h1>

    <div class="mx-auto max-w-3xl">
      <slot />
    </div>
  </div>

  <footer class="border-t border-gray-800 py-6 text-center text-sm text-gray-600 backdrop-blur-sm">
    <div class="flex items-center justify-center gap-2">
      <a href="/blog" class="link link-primary">Home</a>
      <span>•</span>
      <span>Fun playground made by 🦋</span>
      <a href="https://bsky.app/profile/jyc.dev" class="link link-primary" target="_blank"
        >@jyc.dev</a
      >
    </div>
  </footer>
</div>
