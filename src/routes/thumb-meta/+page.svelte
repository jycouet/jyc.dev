<script lang="ts">
  let videoId = $state("");
</script>

<div class="flex gap-4 items-center">
  <input
    class="input input-bordered flex-grow"
    bind:value={videoId}
    placeholder="id or url"
  />
  <a class="btn btn-primary" href="/thumb-meta/{videoId}">Preview</a>
</div>
