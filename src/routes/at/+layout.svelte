<script lang="ts">
</script>

<div class="flex min-h-screen flex-col">
  <div class="container mx-auto flex-grow px-4 py-8">
    <h1 class="mb-8 text-center text-4xl font-bold">@AT Proto - Stats</h1>

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
