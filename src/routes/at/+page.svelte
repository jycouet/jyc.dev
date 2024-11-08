<script lang="ts">
  import { goto } from '$app/navigation'

  import { route } from '$lib/ROUTES'

  let handle: string = ''
  let error: string = ''
  let loading: boolean = false
  let withFollow: boolean = true

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    error = ''
    loading = true

    // Remove @ if user included it
    const cleanHandle = handle.replace('@', '')

    if (cleanHandle) {
      try {
        if (withFollow) {
          await goto(route(`/at/[handle]`, { handle: cleanHandle }))
        } else {
          await goto(route(`/at/[handle]`, { handle: cleanHandle, skip_follow: true }))
        }
      } catch (e) {
        error = 'An error occurred'
      } finally {
        loading = false
      }
    } else {
      error = 'Please enter a valid handle'
      loading = false
    }
  }
</script>

<form onsubmit={handleSubmit} class="mx-auto flex max-w-md flex-col gap-4">
  <div class="form-control flex gap-4">
    <div class="flex items-end gap-4">
      <div class="flex-1">
        <div class="label">
          <span class="label-text">Enter your handle</span>
          {#if error}
            <span class="label-text-alt text-error">{error}</span>
          {/if}
        </div>

        <label class="input input-bordered flex items-center gap-2 {error ? 'input-error' : ''}">
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
      <div class="flex h-12 items-center gap-2">
        <input type="checkbox" class="checkbox" id="skip_follow" bind:checked={withFollow} />
        <label for="skip_follow" class="label-text cursor-pointer"> With follow</label>
      </div>
    </div>

    <button type="submit" class="btn btn-primary" disabled={loading}>
      {#if loading}
        <span class="loading loading-spinner"></span>
      {/if}
      Look up handle
    </button>
  </div>
</form>

<div class="mt-8 text-center text-sm text-base-content/70">
  <p>TIP: If you're viewing a profile on blue sky,</p>
  <p>
    <span class="text-secondary">prefix with</span>
    "<code class="font-mono text-primary">jyc.dev/</code>" to open it here!
  </p>
</div>
