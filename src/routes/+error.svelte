<script lang="ts">
  import { page } from '$app/stores'

  import { route } from '$lib/ROUTES'
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-base-100">
  <div class="text-center">
    <h1 class="mb-4 text-4xl font-black leading-none text-primary">
      {$page.status}
    </h1>
    <p class="mb-12 text-4xl font-medium text-primary/80">
      {$page.error?.message || 'Something went wrong'}
    </p>
    <a
      href={route(`/stats`)}
      class="hover:bg-primary-focus link link-secondary transform rounded-xl bg-primary px-8 py-4 text-lg text-primary-content shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl"
    >
      Go Home
    </a>
  </div>
</div>
