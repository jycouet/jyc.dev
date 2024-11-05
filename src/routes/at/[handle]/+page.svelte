<script lang="ts">
  import { Area, AreaChart, LinearGradient, PieChart, ScatterChart } from 'layerchart'

  import { page } from '$app/stores'

  import { AtController } from '$lib/modules/at/AtController'

  type ResolvedType<T> = T extends Promise<infer R> ? R : T

  let { data } = $props()
  let dataApi = $state<ResolvedType<ReturnType<typeof AtController.getHandleStats>>>()

  let currentISOString = $state('')
  $effect(() => {
    AtController.getHandleStats(new Date().getTimezoneOffset(), data.handle!).then((res) => {
      dataApi = res
    })

    currentISOString = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date())
  })

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

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].reverse()

  export function getBackgroundColor(
    name: string,
    options?: { saturation?: number; lightness?: number },
  ): string {
    const hue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    return `hsl(${hue}, ${options?.saturation ?? 70}%, ${options?.lightness ?? 70}%)`
  }

  const description = `${data.displayName} | Some stats about Atmosphere`

  let selection = $state(['like', 'skeet', 'reskeet'])
  const toggleSelection = (name: string) => {
    if (selection.includes(name)) {
      selection = selection.filter((c) => c !== name)
    } else {
      selection.push(name)
    }
  }

  let hrefShare = $derived(
    `https://bsky.app/intent/compose?text=` +
      `${encodeURI(
        `${data.displayName} is ${dataApi?.category?.emoji} ${dataApi?.category?.title} on 🦋\n<br>` +
          `📎 https://jyc.dev/at/${data.handle}<br><br>\n\n` +
          `What about 🫵 ? 🐾 ! ?<br><br>\n\n` +
          `👀@jyc.dev<br>\n`,
      )}`,
  )

  let punchCard = $derived(
    (dataApi?.punchCard ?? [])
      .filter((c) => selection.includes(c.kind))
      .map((c, i) => {
        const colors = []
        if (selection.includes('like')) {
          colors.push('#4ca2fe')
        }
        if (selection.includes('skeet')) {
          colors.push('#fd6f9c')
        }
        if (selection.includes('reskeet')) {
          colors.push('#b387fa')
        }

        return {
          key: c.kind,
          data: c.data.map((d) => {
            return {
              hour: d.hour,
              weekday: daysOfWeek.indexOf(d.weekday),
              count: d.count,
            }
          }),
          color: colors[i],
        }
      }),
  )
</script>

<svelte:head>
  <title>{data.displayName} | Atmosphere - Stats</title>

  <meta name="description" content={description} />
  <!-- <meta name="referrer" content="no-referrer" /> -->
  <meta property="og:type" content="WebApp" />
  <meta property="og:title" content="Atmosphere - Stats" />
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
            {#each (data.description ?? '').split('\n') ?? [] as line}
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
          <span class="font-mono text-sm text-secondary">@{data.displayName}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-300 p-4">
    <div class="mb-6 flex items-start justify-between">
      <h3 class="mb-4 text-lg font-bold">
        Insights <span class="text-xs text-base-content/50"> (Rolling 28 days)</span>
      </h3>
      <a class="link link-secondary" href={hrefShare} target="_blank"> Share it on 🦋 </a>
    </div>

    <div class="flex h-[500px] w-full flex-col md:h-[250px] md:flex-row">
      <div class="flex h-[250px] w-full flex-col items-center gap-4">
        <!-- TODO: how to remove the sorting ? -->
        <PieChart
          data={dataApi?.kindOfPost ?? []}
          key="key"
          value="value"
          range={[-90, 90]}
          innerRadius={-20}
          cornerRadius={7}
          padAngle={0.02}
          props={{ group: { y: 0 }, pie: { sort: null } }}
          padding={{ bottom: -100 }}
          cRange={['oklch(var(--p))', 'oklch(var(--a))', 'oklch(var(--su))']}
        ></PieChart>
        <div class="absolute mt-16 text-3xl">{dataApi?.category?.emoji ?? '💡'}</div>
        <div class="absolute left-4 top-20 text-xs text-base-content/30">Kind of skeet</div>
        <div class="mb-4 flex w-full flex-col items-center gap-2">
          <h4 class="z-10 text-center text-xl font-bold text-primary">
            {dataApi?.category?.title ?? '...'}
          </h4>
          <p class="z-10 text-center text-sm text-base-content/70">
            {dataApi?.category?.traits}
          </p>
        </div>
      </div>
      <div class="h-[250px] w-full">
        {#if (dataApi?.kindOfEmbed ?? []).length > 0}
          <PieChart
            data={dataApi?.kindOfEmbed ?? []}
            cRange={dataApi?.kindOfEmbed?.map((d) => getBackgroundColor(d.kind))}
            key="kind"
            value="count"
            innerRadius={-20}
            cornerRadius={7}
            padAngle={0.02}
          ></PieChart>
          <div class="absolute bottom-4 right-4 text-xs text-base-content/30">Kind of content</div>
        {:else}
          <div
            class="flex h-full w-full flex-col items-center justify-center gap-2 text-base-content/50"
          >
            <span class="text-lg">No skeets yet...</span>
            <span class="text-sm">Add something and come back! 😉</span>
          </div>
        {/if}
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
      <div class="stat-title">Today's likes</div>
      <div class="stat-value text-accent">{dataApi?.likes?.today}</div>
      <div class="stat-desc">
        {@html getNumbersComparison(
          dataApi?.likes?.today ?? 0,
          dataApi?.likes?.yesterday ?? 0,
          'like',
        )}
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
      <div class="stat-title">Today's skeets</div>
      <div class="stat-value text-secondary">{dataApi?.posts?.today}</div>
      <div class="stat-desc">
        {@html getNumbersComparison(
          dataApi?.posts?.today ?? 0,
          dataApi?.posts?.yesterday ?? 0,
          'skeet',
        )}
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
      <div class="stat-title">Today's skeets</div>
      <div class="stat-value text-purple-500">{dataApi?.reposts?.today}</div>
      <div class="stat-desc">
        {@html getNumbersComparison(
          dataApi?.reposts?.today ?? 0,
          dataApi?.reposts?.yesterday ?? 0,
          'reskeet',
        )}
      </div>
    </div>
  </div>

  <div class="card bg-base-300 p-4">
    <div class="flex items-start justify-between">
      <h3 class="mb-4 text-lg font-bold">
        Follow <span class="text-xs text-base-content/50"> (Rolling 7 days)</span>
      </h3>
      <div class="stat-value text-primary">
        {dataApi?.followsTotal}
      </div>
    </div>

    <div class="h-[200px] w-full">
      <AreaChart
        data={dataApi?.followsPeriods ?? []}
        x="timestamp"
        y="count"
        axis="y"
        padding={{ left: 24 }}
        grid={false}
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
      <h3 class="mb-4 flex flex-col items-center gap-2 text-lg font-bold md:flex-row">
        <span>Your punchs</span>
        <span class="text-xs text-base-content/50"> (Rolling 28 days)</span>
      </h3>
      <div class="flex flex-col items-center gap-4 md:flex-row">
        <button onclick={() => toggleSelection('like')}>
          <span
            class="stat-value {selection.includes('like')
              ? 'text-[#4ca2fe]'
              : 'text-base-content/10'}"
          >
            {new Intl.NumberFormat().format(dataApi?.totalLikes ?? 0)}</span
          >
          <span class="text-sm text-gray-500"> likes</span>
        </button>
        <button onclick={() => toggleSelection('skeet')}>
          <span
            class="stat-value {selection.includes('skeet')
              ? 'text-[#fd6f9c]'
              : 'text-base-content/10'}"
          >
            {new Intl.NumberFormat().format(dataApi?.totalPosts ?? 0)}</span
          >
          <span class="text-sm text-gray-500"> skeets</span>
        </button>
        <button onclick={() => toggleSelection('reskeet')}>
          <span
            class="stat-value {selection.includes('reskeet')
              ? 'text-[#b387fa]'
              : 'text-base-content/10'}"
          >
            {new Intl.NumberFormat().format(dataApi?.totalReposts ?? 0)}</span
          >
          <span class="text-sm text-gray-500"> reskeets</span>
        </button>
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
        props={{
          grid: { x: true, y: true, bandAlign: 'between' },
          rule: { x: false, y: false },
          // points: { class: 'animate-pulse' },
          xAxis: {
            format: (d) =>
              new Intl.DateTimeFormat(undefined, { hour: '2-digit' }).format(
                new Date().setHours(d),
              ),
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
        series={punchCard}
      ></ScatterChart>
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
