<script lang="ts">
  let videoId = $state('')
</script>

<div class="flex items-center gap-4">
  <input class="input input-bordered flex-grow" bind:value={videoId} placeholder="id or url" />
  <a class="btn btn-primary" href="/thumb-meta/{videoId}">Preview</a>
</div>
