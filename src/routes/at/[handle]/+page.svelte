<script lang="ts">
  import type { PageData } from "./$types";
  import { page } from "$app/stores";

  export let data: PageData;
  const handle = $page.params.handle;
</script>

<a href="/at" class="btn btn-ghost">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
  Check another handle
</a>

<div class="flex flex-col gap-4">
  <div class="card bg-base-300">
    <div class="card-body">
      <div class="flex justify-between items-center">
        <h2 class="card-title flex flex-col gap-2 items-start">
          <span class="text-xl font-bold flex items-center gap-2">
            {data.app_bsky_actor_profile.records[0].value.displayName}
            <span class="text-sm font-mono text-secondary">@{handle}</span>
          </span>
          <div class="text-xs font-mono text-gray-500">{data.did}</div>
        </h2>
        <div class="avatar">
          <div class="mask mask-hexagon w-20">
            <img
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            />
          </div>
        </div>
      </div>
      <!-- Add more profile details here once you fetch the data -->
    </div>
  </div>

  <div class="stats shadow bg-base-300">
    <div class="stat">
      <div class="stat-figure text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="inline-block h-8 w-8 stroke-current"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          ></path>
        </svg>
      </div>
      <div class="stat-title">Total Likes</div>
      <div class="stat-value text-primary">25.6K</div>
      <div class="stat-desc">21% more than last month</div>
    </div>

    <div class="stat">
      <div class="stat-figure text-secondary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="inline-block h-8 w-8 stroke-current"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          ></path>
        </svg>
      </div>
      <div class="stat-title">Page Views</div>
      <div class="stat-value text-secondary">2.6M</div>
      <div class="stat-desc">21% more than last month</div>
    </div>

    <div class="stat">
      <div class="stat-figure text-secondary">
        <div class="avatar online">
          <div class="w-16 rounded-full">
            <img
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            />
          </div>
        </div>
      </div>
      <div class="stat-value">86%</div>
      <div class="stat-title">Tasks done</div>
      <div class="stat-desc text-secondary">31 tasks remaining</div>
    </div>
  </div>
</div>

<pre class="code text-xs">{JSON.stringify(data, null, 2)}</pre>
