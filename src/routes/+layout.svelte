<script>
  import "../app.pcss";
  import fav from "$lib/assets/favicon.png";
  import { onNavigate } from "$app/navigation";
  import posthog from "posthog-js";
  import { page } from "$app/stores";
  import { dev } from "$app/environment";

  $effect(() => {
    if (!dev) {
      posthog.init("phc_tmNtXMnAWyPJc6wq7Jvak0E3qWxsz9eEeedaw2DKVuL", {
        // api_host: "https://eu.posthog.com",
        api_host: `${$page.url.origin}/posthog`,
        ui_host: "https://eu.posthog.com",
      });
    }
  });

  onNavigate((navigation) => {
    // @ts-ignore
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      // @ts-ignore
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <link rel="icon" href={fav} />

  <title>jyc.dev</title>

  <!-- Defaults Meta Tags -->
  <meta
    name="description"
    content="jyc.dev - a thing where I share my thoughts..."
  />
  <meta property="og:title" content="jyc.dev" />
  <meta
    property="og:description"
    content="A thing where I share my thoughts..."
  />
  <meta property="og:type" content="blog" />
  <meta property="og:url" content="https://jyc.dev" />
  <meta property="og:image" content={fav} />

  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content="jyc.dev" />
  <meta property="twitter:url" content="https://jyc.dev" />
  <meta name="twitter:title" content="jyc.dev" />
  <meta
    name="twitter:description"
    content="A thing where I share my thoughts..."
  />
  <meta name="twitter:image" content={fav} />
</svelte:head>

<slot />
