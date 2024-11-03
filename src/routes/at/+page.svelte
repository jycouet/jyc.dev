<script lang="ts">
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";

  let handle: string = "";
  let error: string = "";

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    error = "";
    // Remove @ if user included it
    const cleanHandle = handle.replace("@", "");

    if (cleanHandle) {
      goto(`/at/${cleanHandle}`);
    } else {
      error = "Please enter a valid handle";
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

  <button type="submit" class="btn btn-primary"> Look up handle </button>
</form>
