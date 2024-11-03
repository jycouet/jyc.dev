<script lang="ts">
  import { page } from "$app/stores";
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-base-100">
  <div class="text-center">
    <h1 class="text-4xl font-black text-primary mb-4 leading-none">
      {$page.status}
    </h1>
    <p class="text-4xl text-primary/80 mb-12 font-medium">
      {$page.error?.message || "Something went wrong"}
    </p>
    <a
      href="/"
      class="px-8 py-4 bg-primary link link-secondary text-primary-content text-lg rounded-xl hover:bg-primary-focus transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      Go Home
    </a>
  </div>
</div>
