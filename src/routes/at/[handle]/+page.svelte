<script lang="ts">
  import { Area, AreaChart, LinearGradient, PieChart, ScatterChart } from 'layerchart'

  import { page } from '$app/stores'

  let { data } = $props()

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

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  export function getBackgroundColor(
    name: string,
    options?: { saturation?: number; lightness?: number },
  ): string {
    const hue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    return `hsl(${hue}, ${options?.saturation ?? 70}%, ${options?.lightness ?? 70}%)`
  }

  let canonicalUrl = $derived(`${$page.url.origin}${$page.url.pathname}`)

  const description = `${data.displayName} is ${data.category?.title}, and you ?`
</script>

<svelte:head>
  <title>{data.displayName} | AT Proto - Stats</title>

  <link rel="canonical" href={canonicalUrl} />
  <meta name="description" content={description} />
  <!-- <meta name="referrer" content="no-referrer" /> -->
  <meta property="og:type" content="WebApp" />
  <meta property="og:title" content="Aut-Pac-Man" />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={$page.url.origin} />
</svelte:head>

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
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          ></path>
        </svg>
      </div>
      <div class="stat-title">Likes today</div>
      <div class="stat-value text-accent">{data?.likes?.today}</div>
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
      <div class="stat-figure text-purple-500">
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
      <div class="stat-value text-purple-500">{data?.reposts?.today}</div>
      <div class="stat-desc">
        {@html getNumbersComparison(
          data?.reposts?.today ?? 0,
          data?.reposts?.yesterday ?? 0,
          'repost',
        )}
      </div>
    </div>
  </div>

  <div class="card bg-base-300 p-4">
    <div class="flex items-start justify-between">
      <h3 class="mb-4 text-lg font-bold">
        Follow <span class="text-xs"> (Rolling 7 days)</span>
      </h3>
      <div class="stat-value text-primary">
        {data.followsTotal}
      </div>
    </div>

    <div class="h-[200px] w-full">
      <AreaChart
        data={data.followsPeriods ?? []}
        x="timestamp"
        y="count"
        axis="y"
        padding={{ left: 24 }}
        props={{
          yAxis: {
            tickLabelProps: {
              class: 'fill-base-content/50',
            },
          },
        }}
      >
        <svelte:fragment slot="marks">
          <LinearGradient class="from-primary/50 to-primary/0" vertical let:url>
            <Area line={{ class: 'stroke-2 stroke-primary' }} fill={url} />
          </LinearGradient>
        </svelte:fragment>
      </AreaChart>
    </div>
  </div>

  <div class="card bg-base-300 p-4">
    <div class="mb-6 flex items-start justify-between">
      <h3 class="mb-4 text-lg font-bold">
        Insights <span class="text-xs"> (Rolling 28 days)</span>
      </h3>
      <a
        class="link link-secondary"
        href="https://bsky.app/intent/compose?text={encodeURI(
          `I'm __${data.category?.title}__ on 🦋<br><br>Check it out: https://jyc.dev/at/${data.handle}<br><br>🫵 Get in, and claim your digital beast too 🐾 ! ?`,
        )}"
        target="_blank"
      >
        🦋 Share it
      </a>
    </div>

    <div class="flex h-[500px] w-full flex-col md:h-[250px] md:flex-row">
      <div class="flex h-[250px] w-full flex-col items-center gap-4">
        <!-- TODO: how to remove the sorting ? -->
        <PieChart
          data={data.kindOfPost ?? []}
          key="key"
          value="value"
          range={[-90, 90]}
          innerRadius={-20}
          cornerRadius={7}
          padAngle={0.02}
          props={{ group: { y: 0 } }}
          padding={{ bottom: -100 }}
          cRange={['oklch(var(--p))', 'oklch(var(--a))', 'oklch(var(--su))']}
        ></PieChart>
        <div class="absolute left-4 top-20 text-xs text-base-content/30">Kind of post</div>
        <!-- sort={null} -->
        <div class="mb-4 flex w-full flex-col items-center gap-2">
          <h4 class="text-xl font-bold text-primary">{data.category?.title}</h4>
          <p class="text-center text-sm text-base-content/70">
            {data.category?.traits}
          </p>
        </div>
      </div>
      <div class="h-[250px] w-full">
        <PieChart
          data={data.kindOfEmbed ?? []}
          cRange={data.kindOfEmbed?.map((d) => getBackgroundColor(d.kind))}
          key="kind"
          value="count"
          innerRadius={-20}
          cornerRadius={7}
          padAngle={0.02}
        ></PieChart>
        <div class="absolute bottom-4 right-4 text-xs text-base-content/30">Kind of content</div>
      </div>
    </div>
  </div>

  <div class="card bg-base-300 p-4">
    <div class="mb-6 flex items-start justify-between">
      <h3 class="mb-4 text-lg font-bold">
        Your punchs <span class="text-xs"> (Rolling 28 days)</span>
      </h3>
      <div class="flex items-center gap-4">
        <div>
          <span class="stat-value text-[#4ca2fe]"
            >{new Intl.NumberFormat().format(data.totalLikes ?? 0)}</span
          >
          <span class="text-sm text-gray-500"> likes</span>
        </div>
        <div>
          <span class="stat-value text-[#fd6f9c]"
            >{new Intl.NumberFormat().format(data.totalPosts ?? 0)}</span
          >
          <span class="text-sm text-gray-500"> posts</span>
        </div>
        <div>
          <span class="stat-value text-[#b387fa]"
            >{new Intl.NumberFormat().format(data.totalReposts ?? 0)}</span
          >
          <span class="text-sm text-gray-500"> reposts</span>
        </div>
      </div>
    </div>
    <!-- TODO: on legend click, show/hide series (with a nice fade? bounce?) -->
    <div class="h-[250px] w-full">
      <ScatterChart
        x="hour"
        y="weekday"
        r="count"
        xPadding={[20, 20]}
        yPadding={[20, 20]}
        padding={{ left: 24, bottom: 44 }}
        legend
        props={{
          xAxis: {
            format: (d) => `${d}:00`,
            tickLabelProps: {
              class: 'fill-base-content/50',
            },
          },
          yAxis: {
            format: (d: number) => {
              if (d < 0) {
                return ''
              }
              if (d > 6) {
                return ''
              }
              return daysOfWeek[d]
            },
            ticks: 7,
            tickLength: 0,
            tickLabelProps: {
              class: 'fill-base-content/50',
            },
          },
        }}
        series={(data?.punchCard ?? []).map((c, i) => {
          return {
            key: c.kind,
            data: c.data.map((d) => ({
              hour: d.hour,
              weekday: daysOfWeek.indexOf(d.weekday),
              count: d.count,
            })),
            color: ['#4ca2fe', '#fd6f9c', '#b387fa'][i],
          }
        })}
      ></ScatterChart>
      <!-- legend={true} -->
    </div>
  </div>
</div>

<div class="mt-12 text-center text-sm text-gray-500">
  You have a request? Ask me here: 🦋 <a
    target="_blank"
    href="https://bsky.app/intent/compose?text={encodeURI(
      `Hey @jyc.dev could we have [YOUR REQUEST] 😉 ?`,
    )}"
    class="link link-primary">@jyc.dev</a
  > - I'll be happy to try ;)
</div>

<!-- <pre class="code text-xs">{JSON.stringify(data, null, 2)}</pre> -->
