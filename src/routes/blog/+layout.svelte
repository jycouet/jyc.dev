<script lang="ts">
  import Og from '$lib/components/Og.svelte'
  import { route } from '$lib/ROUTES'

  interface Props {
    children?: import('svelte').Snippet
  }

  let { children }: Props = $props()
  // import "../../app.pcss";
</script>

<Og title="jyc.dev" description="Some takes about web devs!" og="https://jyc.dev/og.png" />

<div class="mx-auto flex h-screen w-[800px] flex-col gap-4 p-4">
  <h1 class="text-3xl text-primary">
    <a href={route(`/blog`)} aria-label="Back home">jyc.dev</a>
  </h1>

  <span class="text-sm italic">Some takes about web devs!</span>

  <div class="flex flex-grow flex-col gap-4">
    {@render children?.()}
  </div>

  <footer class="footer items-center justify-between p-4 text-neutral-content">
    <aside class="grid-flow-col items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
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

    <a href={route('/thumb-meta')} class="link link-primary">Thumb Meta</a>
    <a href={route('/stats')} class="link link-primary">Sky Zoo</a>
    <a href={route('/card')} class="link link-primary">Card</a>
  </footer>
</div>
