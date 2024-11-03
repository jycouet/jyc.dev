<script lang="ts">
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";

  let handle: string = "";
  let error: string = "";
  let loading: boolean = false;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    error = "";
    loading = true;

    // Remove @ if user included it
    const cleanHandle = handle.replace("@", "");

    if (cleanHandle) {
      try {
        await goto(`/at/${cleanHandle}`);
      } catch (e) {
        error = "An error occurred";
      } finally {
        loading = false;
      }
    } else {
      error = "Please enter a valid handle";
      loading = false;
    }
  };
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-4 max-w-md mx-auto">
  <div class="form-control">
    <div class="label">
      <span class="label-text">Enter your handle</span>
      {#if error}
        <span class="label-text-alt text-error">{error}</span>
      {/if}
    </div>

    <label
      class="input input-bordered flex items-center gap-2 {error
        ? 'input-error'
        : ''}"
    >
      @
      <input
        type="text"
        class="grow"
        id="handle"
        bind:value={handle}
        placeholder="handle.bsky.social"
      />
    </label>
  </div>

  <button type="submit" class="btn btn-primary" disabled={loading}>
    {#if loading}
      <span class="loading loading-spinner"></span>
    {/if}
    Look up handle
  </button>
</form>

<div class="mt-8 text-center text-sm text-base-content/70">
  <p>TIP: If you're viewing a profile on blue sky,</p>
  <p>
    <span class="text-secondary">prefix with</span>
    "<code class="font-mono text-primary">jyc.dev/</code>" to open it here!
  </p>
</div>
