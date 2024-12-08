<script lang="ts">
  import Bluesky from '$lib/icons/Bluesky.svelte'
  import DynamicProcess from '$lib/icons/DynamicProcess.svelte'
  import Github from '$lib/icons/Github.svelte'
  import Linkedin from '$lib/icons/Linkedin.svelte'
  import Youtube from '$lib/icons/Youtube.svelte'

  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<div class="min-h-screen bg-base-200 px-4 py-12">
  <div class="mx-auto max-w-2xl">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body items-center gap-4 text-center">
        <!-- Profile Image -->
        <div class="avatar mb-4">
          <div class="h-32 w-32 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
            <img src={data.profile.avatar} alt={data.profile.displayName} />
          </div>
        </div>

        <!-- Profile Info -->
        <h1 class="text-5xl font-bold">Jean-Yves COUËT</h1>
        <h1 class="text-2xl font-bold">JYC</h1>

        <div class="m-4 mt-8 flex w-full justify-around">
          <DynamicProcess size={64} />
          <!-- href="https://dynamicprocess.io/" -->
          <Youtube size={64} />
          <!-- https://www.youtube.com/c/JeanYvesCOU%C3%8BT -->
          <Linkedin size={64} />
          <!-- https://www.linkedin.com/in/jycouet/ -->
          <Github size={64} />
          <!-- https://github.com/jycouet -->
          <Bluesky size={64} />
          <!-- https://bsky.app/profile/jyc.dev -->
        </div>
      </div>
    </div>
  </div>
</div>
