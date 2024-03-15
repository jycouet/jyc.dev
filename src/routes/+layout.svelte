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
  <meta
    property="og:description"
    content="A thing where I share my thoughts..."
  />
  <meta property="og:type" content="blog" />
  <meta property="og:url" content="https://jyc.dev" />
  <meta property="og:image" content={fav} />
</svelte:head>

<div class="w-[800px] mx-auto p-4 flex flex-col gap-4 h-screen">
  <h1 class="text-primary text-3xl">jyc.dev</h1>

  <span class="italic text-sm">Some takes about web devs!</span>

  <div class="flex flex-col gap-4 flex-grow">
    <slot />
  </div>

  <footer class="footer items-center p-4 text-neutral-content">
    <aside class="items-center grid-flow-col">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        ><g
          fill="none"
          stroke="#888888"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          ><path
            d="M18.156 16.314c-2.583 2.085-5.177 1.491-6.469 1.491c-1.292 0-1.373.262-2.321 1.27a1.29 1.29 0 0 1-.424.302a1.223 1.223 0 0 1-1.01 0a1.293 1.293 0 0 1-.433-.303l-2.594-2.568a1.26 1.26 0 0 1-.303-.454a1.297 1.297 0 0 1-.101-.514a1.228 1.228 0 0 1 .404-.937c1.009-.947 1.292-1.128 1.292-2.327c0-1.51-.717-4.372 2.24-7.334a7.43 7.43 0 0 1 2.523-1.662a7.542 7.542 0 0 1 3.028-.524a7.47 7.47 0 0 1 5.45 2.61a7.52 7.52 0 0 1 .8 8.662a7.529 7.529 0 0 1-2.051 2.288zm-13.554-.01l-1.514 1.511a1.007 1.007 0 0 0-.202 1.26l2.11 2.014c.282.292.847.172 1.291-.242l1.423-1.52"
          /></g
        ></svg
      >
      <p>jyc.dev</p>
    </aside>
    <nav class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
      <a
        href="https://twitter.com/intent/follow?screen_name=jycouet"
        target="_blank"
        aria-label="Twitter / X"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          ><path
            fill="#888888"
            d="M18.205 2.25h3.308l-7.227 8.26l8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"
          /></svg
        >
      </a>
      <!-- <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a>
      <a><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a> -->
    </nav>
  </footer>
</div>
