<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  let currentISOString = new Date().toISOString().slice(0, 19)

  function getNumbersComparison(today: number, yesterday: number, topic: string): string {
    if (today === yesterday) {
      return "<span class='text-gray-500'>Same as yesterday</span>"
    }
    if (yesterday === 0) {
      return `<span class='text-error'>No ${topic} yesterday</span>`
    }
    if (today === 0) {
      return `<span class='text-gray-500'>No ${topic}... yet 🙈</span>`
    }

    const diff = today - yesterday
    // const percentage = Math.abs(Math.round((diff / yesterday) * 100));

    if (diff > 0) {
      return `${diff} <span class='text-success'>more</span> than yesterday`
    } else {
      return `${-diff} <span class='text-error'>less</span> than yesterday`
    }
  }
</script>

<div class="flex items-center justify-between">
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
  <div class="font-mono text-xl text-secondary">{currentISOString}</div>
</div>

<div class="flex flex-col gap-4">
  <div class="card bg-base-300">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <h2 class="card-title flex flex-col items-start gap-2">
          <span class="flex items-end gap-2 text-xl font-bold">
            {data.displayName}
            <!-- <span class="text-sm font-mono text-secondary">@{data.handle}</span>
            <div class="text-xs font-mono text-gray-500">{data.did}</div> -->
          </span>
          <div class="flex flex-col gap-1 border-l pl-4">
            {#each data.description.split('\n') as line}
              <p class="text-sm">{line}</p>
            {/each}
          </div>
        </h2>
        <div class="flex flex-col items-center gap-2">
          <a href={`https://bsky.app/profile/${data.handle}`} target="_blank">
            <div class="avatar">
              <div class="mask mask-hexagon w-20">
                <img src={data.avatar} alt={`${data.displayName}'s avatar`} />
              </div>
            </div>
          </a>
          <span class="font-mono text-sm text-secondary">@{data.handle}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="stats stats-vertical bg-base-300 shadow md:stats-horizontal">
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
      <div class="stat-title">Likes today</div>
      <div class="stat-value text-primary">{data?.likes?.today}</div>
      <div class="stat-desc">
        {@html getNumbersComparison(data?.likes?.today ?? 0, data?.likes?.yesterday ?? 0, 'like')}
      </div>
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
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          ></path>
        </svg>
      </div>
      <div class="stat-title">Posts Today</div>
      <div class="stat-value text-secondary">{data?.posts?.today}</div>
      <div class="stat-desc">
        {@html getNumbersComparison(data?.posts?.today ?? 0, data?.posts?.yesterday ?? 0, 'post')}
      </div>
    </div>

    <div class="stat">
      <div class="stat-figure text-accent">
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
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          ></path>
        </svg>
      </div>
      <div class="stat-title">Reposts Today</div>
      <div class="stat-value text-accent">{data?.reposts?.today}</div>
      <div class="stat-desc">
        {@html getNumbersComparison(
          data?.reposts?.today ?? 0,
          data?.reposts?.yesterday ?? 0,
          'repost',
        )}
      </div>
    </div>
  </div>
</div>

<div class="mt-12 text-center text-sm text-gray-500">
  You have a request? Just ping me here: 🦋 <a
    href="https://bsky.app/profile/jyc.dev"
    class="link link-primary">@jyc.dev</a
  > - I'll be happy to try ;)
</div>

<!-- <pre class="code text-xs">{JSON.stringify(data, null, 2)}</pre> -->
