<script lang="ts">
  import type { LayoutData } from "./$types";

  export let data: LayoutData;
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold text-center mb-8">@AT Protocol</h1>

  <div class="max-w-3xl mx-auto">
    <slot />
  </div>
</div>
