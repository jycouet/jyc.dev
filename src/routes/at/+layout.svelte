<script lang="ts">
</script>

<div class="min-h-screen flex flex-col">
  <div class="container mx-auto px-4 py-8 flex-grow">
    <h1 class="text-4xl font-bold text-center mb-8">@AT Proto - Stats</h1>

    <div class="max-w-3xl mx-auto">
      <slot />
    </div>
  </div>

  <footer
    class="text-center py-6 text-sm text-gray-600 backdrop-blur-sm border-t border-gray-800"
  >
    <div class="flex items-center justify-center gap-2">
      <a href="/blog" class="link link-primary">Home</a>
      <span>•</span>
      <span>Fun playground made by 🦋</span>
      <a
        href="https://bsky.app/profile/jyc.dev"
        class="link link-primary"
        target="_blank">@jyc.dev</a
      >
    </div>
  </footer>
</div>
