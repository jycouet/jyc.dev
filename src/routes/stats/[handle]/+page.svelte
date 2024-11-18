<script lang="ts">
  import { Area, AreaChart, LinearGradient, PieChart, ScatterChart, Tooltip } from 'layerchart'
  import { fade } from 'svelte/transition'

  import { page } from '$app/stores'

  import Og from '$lib/components/Og.svelte'
  import Stat from '$lib/components/Stat.svelte'
  import ArrowLeft from '$lib/icons/ArrowLeft.svelte'
  import Heart from '$lib/icons/Heart.svelte'
  import Repost from '$lib/icons/Repost.svelte'
  import Send from '$lib/icons/Send.svelte'
  import { route } from '$lib/ROUTES.js'
  import { AtController } from '$modules/at/AtController.js'

  import JsonStyle from './JsonStyle.svelte'

  type ResolvedType<T> = T extends Promise<infer R> ? R : T

  let { data } = $props()
  let dataApi = $state<ResolvedType<ReturnType<typeof AtController.getHandleStats>>>()
  let dataApiFollows = $state<ResolvedType<ReturnType<typeof AtController.getHandleFollow>>>()

  let currentISOString = $state('')
  let pos_atproto = $state('')
  let pos_bsky = $state('')
  let createdAt = $state('')
  let startedToBeActiveOn = $state('')
  let skipFollow = $page.url.searchParams.get('skip_follow') === 'true'
  $effect(() => {
    const tzOffset = new Date().getTimezoneOffset()
    AtController.getHandleStats(
      tzOffset,
      data.did!,
      data.handle!,
      data.displayName!,
      data.avatar!,
    ).then((res) => {
      dataApi = res
    })
    if (!skipFollow) {
      AtController.getHandleFollow(tzOffset, data.did!).then((res) => {
        dataApiFollows = res
      })
    }

    currentISOString = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date())

    pos_atproto = data.pos_atproto ? new Intl.NumberFormat().format(data.pos_atproto) : ''
    pos_bsky = data.pos_bsky ? new Intl.NumberFormat().format(data.pos_bsky) : ''
    createdAt = data.createdAt ? new Intl.DateTimeFormat().format(new Date(data.createdAt)) : ''
    startedToBeActiveOn = data.startedToBeActiveOn
      ? new Intl.DateTimeFormat().format(new Date(data.startedToBeActiveOn))
      : ''
  })

  export function getBackgroundColor(
    name: string,
    options?: { saturation?: number; lightness?: number },
  ): string {
    const hue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    return `hsl(${hue}, ${options?.saturation ?? 70}%, ${options?.lightness ?? 70}%)`
  }

  const description = `${data.displayName} | Stats on Bluesky, At Protocol, ...`

  let selection = $state(['like', 'post', 'repost'])
  const toggleSelection = (name: string) => {
    if (selection.includes(name)) {
      selection = selection.filter((c) => c !== name)
    } else {
      selection.push(name)
    }
  }

  let hrefShare = $derived(
    createBSkyIntent([
      `${data.displayName} is ${dataApi?.category?.emoji} ${dataApi?.category?.title} on 🦋`,
      `📎 https://skyzoo.blue/${data.handle}`,
      '',
      `What about 🫵 ? 🐾 !?`,
    ]),
  )

  let kindOfPost = $derived(
    dataApi?.kindOfPost ?? [
      { key: 'like', value: 7 },
      { key: 'replies', value: 11 },
      { key: 'quotes', value: 21 },
    ],
  )

  let kindOfEmbed = $derived(
    dataApi?.kindOfEmbed ?? [
      { kind: 'image', count: 55 },
      { kind: 'video', count: 11 },
      { kind: 'link', count: 7 },
      { kind: 'gif', count: 5 },
      { kind: 'other', count: 1 },
    ],
  )

  let followsPeriods = $derived(
    (
      dataApiFollows?.followsPeriods ?? [
        { timestamp: new Date('2024-01-01'), count: 200 },
        { timestamp: new Date('2024-01-02'), count: 205 },
        { timestamp: new Date('2024-01-03'), count: 208 },
        { timestamp: new Date('2024-01-04'), count: 210 },
        { timestamp: new Date('2024-01-05'), count: 245 }, // First pick
        { timestamp: new Date('2024-01-06'), count: 250 },
        { timestamp: new Date('2024-01-07'), count: 255 },
        { timestamp: new Date('2024-01-08'), count: 258 },
        { timestamp: new Date('2024-01-09'), count: 320 }, // Second pick
        { timestamp: new Date('2024-01-10'), count: 325 },
        { timestamp: new Date('2024-01-11'), count: 330 },
        { timestamp: new Date('2024-01-12'), count: 335 },
        { timestamp: new Date('2024-01-13'), count: 340 },
        { timestamp: new Date('2024-01-14'), count: 415 }, // Third pick
        { timestamp: new Date('2024-01-15'), count: 420 },
      ]
    ).map((d) => {
      return { timestamp: new Date(d.timestamp), count: d.count }
    }),
  )

  let punchCard = $derived(
    (dataApi?.punchCard ?? generateFakePunchCard())
      .filter((c) => selection.includes(c.kind))
      .map((c, i) => {
        const colors = []
        if (selection.includes('like')) {
          colors.push(dataApi ? '#4ca2fe' : 'oklch(var(--n))')
        }
        if (selection.includes('post')) {
          colors.push(dataApi ? '#fd6f9c' : 'oklch(var(--n))')
        }
        if (selection.includes('repost')) {
          colors.push(dataApi ? '#b387fa' : 'oklch(var(--n))')
        }

        return {
          key: c.kind,
          data: c.data.map((d) => ({
            hour: d.hour,
            weekday: d.weekday,
            count: d.count,
          })),
          color: colors[i],
        }
      }),
  )

  function generateFakePunchCard() {
    const kinds = ['like', 'post', 'repost']
    return kinds.map((kind) => ({
      kind,
      data: Array.from({ length: 25 }, () => ({
        hour: Math.floor(Math.random() * 24) + 0.5,
        weekday: Math.floor(Math.random() * 7),
        count: Math.floor(Math.random() * 5) + 1,
      })),
    }))
  }

  // function getWeekStartsOnFromIntl() {
  //   const locale = new Intl.Locale(Intl.DateTimeFormat().resolvedOptions().locale)

  //   // @ts-expect-error
  //   const weekInfo = locale.weekInfo ?? locale.getWeekInfo?.()
  //   return (weekInfo?.firstDay ?? 0) % 7 // (in Intl, sunday is 7 not 0, so we need to mod 7)
  // }

  function getyDomain() {
    // TODO, we can't have a domain doing like: ["1, 2, 3, 4, 5, 6, 0"] (start of week is monday in EU ;))
    // const weekStartsOn = getWeekStartsOnFromIntl()
    // const weekEndsOn = (weekStartsOn + 6) % 7

    return [6, 0]
  }

  // TODO: fix this one day!
  // https://github.com/bluesky-social/social-app/issues/6133
  function createBSkyIntent(msg: string[]) {
    // If I'm on windows it should be <br>, if not it should be \n
    const lineBreak = navigator.userAgent.toLowerCase().includes('windows') ? '<br>' : '\n'
    return `https://bsky.app/intent/compose?text=${encodeURIComponent(msg.join(lineBreak))}`
  }

  type FormattedPart = string | { type: 'handle' | 'link' | 'hashtag'; content: string }
  function formatDescriptionLine(line: string): Array<FormattedPart> {
    const parts: Array<FormattedPart> = []
    let currentText = ''

    // Regular expression for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g
    // Split by URLs first
    const segments = line.split(urlRegex)

    segments.forEach((segment, index) => {
      // If it's an odd index, it's a URL
      if (index % 2 !== 0) {
        if (currentText) {
          parts.push(currentText)
          currentText = ''
        }
        parts.push({ type: 'link', content: segment })
        return
      }

      // Process regular text for @ mentions
      const words = segment.split(' ')
      words.forEach((word, wordIndex) => {
        if (word.startsWith('@')) {
          if (currentText) {
            parts.push(currentText)
            currentText = ''
          }
          parts.push({ type: 'handle', content: word.slice(1) })
        } else if (word.startsWith('#')) {
          if (currentText) {
            parts.push(currentText)
            currentText = ''
          }
          parts.push({ type: 'hashtag', content: word.slice(1) })
        } else {
          if (currentText && wordIndex > 0) currentText += ' '
          currentText += word
        }
      })
    })

    if (currentText) {
      parts.push(currentText)
    }

    return parts
  }

  // Helper function to render the formatted content
  function renderFormattedContent(part: FormattedPart) {
    if (typeof part === 'string') {
      return part
    }

    if (part.type === 'handle') {
      return ` <a href="${route(`bsky_profile`, { handle: part.content })}" 
        class="text-bsky hover:underline" 
        target="_blank">@${part.content}</a> `
    }

    if (part.type === 'hashtag') {
      return ` <a href="${route(`bsky_hashtag`, { hashtag: part.content })}" 
        class="text-bsky hover:underline" 
        target="_blank">#${part.content}</a> `
    }

    if (part.type === 'link') {
      if (part.content.startsWith(`https://${data.handle}`)) {
        return ` <a href="${part.content}" 
        class="text-secondary hover:underline" 
        target="_blank">${part.content.replace(/^https?:\/\//, '')}</a> `
      } else if (part.content.startsWith('https://github.com')) {
        return ` <a href="${part.content}" 
        class="text-white hover:underline" 
        target="_blank">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          class="inline-block stroke-current h-4 w-4"
          ><path
            fill="currentColor"
            d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
          /></svg> ${part.content.replace('https://github.com/', '')}</a> `
      } else {
        return ` <a href="${part.content}" 
        class="text-white hover:underline" 
        target="_blank">${part.content.replace(/^https?:\/\//, '')}</a> `
      }
    }
  }

  // Add this function near the other helper functions
  function getHandleComment(handle: string): string {
    if (handle.endsWith('.dev')) {
      return 'How to mention... Cool, you are a nerdy .dev too? 🤓'
    }
    if (handle.endsWith('.bsky.social')) {
      return '<i>Pro tip: you can have your own domain as handle! 🎯</i>'
    }
    if (handle.endsWith('.bsky.team')) {
      return 'How to mention... Hooo hello master! 🫡'
    }
    if (handle.endsWith('.me')) {
      return 'How to mention... All about ME, ME, ME! 🎭'
    }
    if (handle.endsWith('.io')) {
      return 'How to mention... IO? Tech vibes detected! 💻'
    }
    if (handle.endsWith('.eth')) {
      return 'How to mention... Web3 enthusiast spotted! ⛓️'
    }
    if (handle.endsWith('.com')) {
      return 'How to mention... classy company handle! 💼'
    }
    return 'How to mention... Nice handle! 👋'
  }
</script>

<Og title={`${data.displayName} | Sky Zoo - Stats`} {description} />

<div class="flex items-center justify-between">
  <a href={route(`/stats`)} class="btn btn-ghost">
    <ArrowLeft />
    Check another handle
  </a>
  {#if currentISOString}
    <div transition:fade class="font-mono text-xl text-secondary">{currentISOString}</div>
  {/if}
</div>

<div class="flex flex-col gap-4">
  <div class="card bg-base-300">
    <div class="card-body pb-3">
      <div
        class="flex flex-col items-center justify-between gap-4 md:flex-row md:items-start md:gap-14"
      >
        <h2 class="card-title flex flex-col items-start gap-2">
          <span class="flex items-end gap-2 text-2xl font-bold text-primary">
            {data.displayName}
            <!-- <span class="text-sm font-mono text-secondary">@{data.handle}</span>
            <div class="text-xs font-mono text-gray-500">{data.did}</div> -->
          </span>
          <div class="flex flex-col gap-1 border-l pl-4">
            {#each (data.description ?? '').split('\n') ?? [] as line}
              <p class="text-sm">
                {@html formatDescriptionLine(line).map(renderFormattedContent).join('')}
              </p>
            {/each}
          </div>
        </h2>
        <div class="flex flex-col items-center gap-1">
          <a href={`https://bsky.app/profile/${data.handle}`} target="_blank">
            <div class="avatar">
              <div class="mask mask-hexagon w-20">
                <img src={data.avatar} alt={`${data.displayName}'s avatar`} />
              </div>
            </div>
          </a>
          <button
            class="flex flex-col items-center gap-0 rounded-lg p-1 transition-colors hover:scale-110 hover:bg-base-content/30 active:bg-base-content/20"
            onclick={() =>
              // @ts-ignore
              document?.getElementById('modal_info_nerd').showModal()}
          >
            <span class="font-mono text-sm text-primary">@{data.handle}</span>
            {#if pos_bsky}
              <span
                class="font-mono text-sm text-secondary"
                title="User joined in position #{pos_bsky}"
              >
                #{pos_bsky}<span class="italic"
                  >{#if data.did.startsWith('did:web')}web{/if}</span
                >
              </span>
            {:else}
              <span class="h-5 text-base-content/50">&nbsp;</span>
            {/if}
            {#if createdAt}
              <span class="text-xs text-base-content/50" title={`User joined on ${createdAt}`}>
                {createdAt}
              </span>
            {:else}
              <span class="h-4 text-base-content/50">&nbsp;</span>
            {/if}
            {#if startedToBeActiveOn && startedToBeActiveOn !== createdAt}
              <span
                class="hidden text-xs text-base-content/50 md:block"
                title={`User started to be active on ${startedToBeActiveOn}`}
              >
                {startedToBeActiveOn}
              </span>
            {:else}
              <span class="h-4 text-base-content/50">&nbsp;</span>
            {/if}
          </button>
          <dialog id="modal_info_nerd" class="modal">
            <div class="modal-box">
              <h3 class="text-lg font-bold">Nerdy user info</h3>
              <div class="py-4 font-mono">
                <div>&#123;</div>
                <div class="flex flex-col gap-1">
                  <JsonStyle
                    key="handle"
                    value={'@' + data.handle}
                    comment={getHandleComment(data.handle)}
                  />
                  <JsonStyle key="did" value={data.did} comment="Kinda unique id" />
                  <JsonStyle key="createdAt" value={createdAt} comment="When joined ?" />
                  <JsonStyle
                    key="startedToBeActiveOn"
                    value={startedToBeActiveOn}
                    comment="Started to be active here (custom algo 🤯)"
                  />
                  <JsonStyle
                    key="pos_atproto"
                    value={pos_atproto}
                    comment="The position of arrival in At Protocol"
                  />
                  <JsonStyle
                    key="pos_bsky"
                    value={pos_bsky}
                    comment="Arrived in bsky in position... Welcome!"
                  />
                  {#if data.mushroom}
                    <JsonStyle
                      key="mushroom"
                      value={data.mushroom}
                      comment="Server name or mushroom name (<a class='link link-info' href='https://bsky.app/profile/jay.bsky.team/post/3lb6fa7sjzc2p' target='_blank'>source</a>)"
                    />
                  {/if}
                </div>
                <div>&#125;</div>
              </div>
            </div>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      </div>
    </div>
  </div>

  <div class="card bg-base-300 p-4">
    <div class="mb-6 flex items-start justify-between">
      <h3 class="mb-4 text-lg font-bold">
        Insights <span class="text-xs text-base-content/50"> (Rolling 28 days)</span>
      </h3>
      {#if dataApi}
        <a class="link link-secondary" href={hrefShare} target="_blank"> Share it on 🦋 </a>
      {:else}
        <div class="skeleton h-7 w-32 bg-base-200"></div>
      {/if}
    </div>

    <div class="flex h-[500px] w-full flex-col md:h-[250px] md:flex-row">
      <div class="flex h-[250px] w-full flex-col items-center gap-2">
        <PieChart
          data={kindOfPost}
          key="key"
          value="value"
          range={[-90, 90]}
          innerRadius={-20}
          cornerRadius={7}
          padAngle={0.02}
          props={{ group: { y: 0 }, pie: { sort: null, tweened: true }, arc: { tweened: true } }}
          padding={{ bottom: -100 }}
          cRange={dataApi
            ? ['oklch(var(--p))', 'oklch(var(--a))', 'oklch(var(--su))']
            : ['oklch(var(--n))']}
        ></PieChart>
        <div class="absolute left-4 top-20 text-xs text-base-content/30">Kind of post</div>
        <div
          class="absolute mt-14 text-center text-3xl sm:mt-20 {dataApi?.altPercentage === 100
            ? 'drop-shadow-[0_0_20px_rgba(234,179,8,1)]'
            : ''} "
        >
          {dataApi?.category?.emoji ?? '💡'}
        </div>
        <div class="mb-4 flex w-full flex-col items-center gap-2">
          {#if dataApi}
            <h4 class="z-10 -mx-4 text-center text-xl font-bold text-primary">
              {dataApi?.category?.title ?? '...'}
            </h4>
            <p class="z-10 text-center text-sm text-base-content/70">
              {dataApi?.category?.traits}
            </p>
          {:else}
            <div class="z-10 text-center text-xl font-bold text-primary">
              <div class="skeleton h-8 w-48 bg-base-200"></div>
            </div>
            <div class="z-10 text-center text-sm text-base-content/70">
              <div class="skeleton mx-auto mb-2 h-3 w-64 bg-base-200"></div>
              <div class="skeleton mx-auto mb-2 h-3 w-72 bg-base-200"></div>
              <div class="skeleton mx-auto mb-2 h-3 w-64 bg-base-200"></div>
              <div class="skeleton mx-auto h-3 w-10 bg-base-200"></div>
            </div>
          {/if}
        </div>
      </div>
      <div class="h-[250px] w-full">
        {#if kindOfEmbed.length > 0}
          <PieChart
            data={kindOfEmbed}
            cRange={dataApi
              ? dataApi?.kindOfEmbed?.map((d) => getBackgroundColor(d.kind))
              : ['oklch(var(--n))']}
            key="kind"
            value="count"
            innerRadius={-20}
            cornerRadius={7}
            padAngle={0.02}
            props={{ pie: { tweened: true } }}
          ></PieChart>
          <div class="absolute bottom-4 right-4 text-xs text-base-content/30">Kind of content</div>
        {:else if dataApi}
          <div
            class="flex h-full w-full flex-col items-center justify-center gap-2 text-base-content/50"
          >
            <span class="text-lg">No posts yet...</span>
            <span class="text-sm">Add something and come back! 😉</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="stats stats-vertical bg-base-300 shadow md:stats-horizontal">
    <Stat
      title="likes"
      value={dataApi?.likes?.today}
      comparisonToday={dataApi?.likes?.today ?? 0}
      comparisonYesterday={dataApi?.likes?.yesterday ?? 0}
      color="oklch(var(--a))"
      loading={!dataApi}
      icon={Heart}
    />

    <Stat
      title="posts"
      value={dataApi?.posts?.today}
      comparisonToday={dataApi?.posts?.today ?? 0}
      comparisonYesterday={dataApi?.posts?.yesterday ?? 0}
      color="oklch(var(--s))"
      loading={!dataApi}
      icon={Send}
    />

    <Stat
      title="reposts"
      value={dataApi?.reposts?.today}
      comparisonToday={dataApi?.reposts?.today ?? 0}
      comparisonYesterday={dataApi?.reposts?.yesterday ?? 0}
      color="rgb(168, 85, 247)"
      loading={!dataApi}
      icon={Repost}
    />
  </div>
  <div class="card bg-base-300 p-4">
    <div class="mb-6 flex items-start justify-between">
      <h3 class="mb-4 flex flex-col items-center gap-2 text-lg font-bold md:flex-row">
        <span>Your punchs</span>
        <span class="text-xs text-base-content/50"> (Rolling 28 days)</span>
      </h3>
      <div class="flex flex-col items-end gap-4 md:flex-row md:items-center">
        <button onclick={() => toggleSelection('like')}>
          <span
            class="stat-value {selection.includes('like')
              ? 'text-[#4ca2fe]'
              : 'text-base-content/10'}"
          >
            {#if dataApi}
              {new Intl.NumberFormat().format(dataApi?.totalLikes ?? 0)}
              <span class="text-sm text-gray-500"> likes</span>
            {:else}
              <div class="skeleton h-10 w-24 bg-base-200"></div>
            {/if}
          </span>
        </button>
        <button onclick={() => toggleSelection('post')}>
          <span
            class="stat-value {selection.includes('post')
              ? 'text-[#fd6f9c]'
              : 'text-base-content/10'}"
          >
            {#if dataApi}
              {new Intl.NumberFormat().format(dataApi?.totalPosts ?? 0)}
              <span class="text-sm text-gray-500"> posts</span>
            {:else}
              <div class="skeleton h-10 w-24 bg-base-200"></div>
            {/if}
          </span>
        </button>
        <button onclick={() => toggleSelection('repost')}>
          <span
            class="stat-value {selection.includes('repost')
              ? 'text-[#b387fa]'
              : 'text-base-content/10'}"
          >
            {#if dataApi}
              {new Intl.NumberFormat().format(dataApi?.totalReposts ?? 0)}
              <span class="text-sm text-gray-500"> reposts</span>
            {:else}
              <div class="skeleton h-10 w-24 bg-base-200"></div>
            {/if}
          </span>
        </button>
      </div>
    </div>

    <div class="h-[250px] w-full">
      <ScatterChart
        x="hour"
        y="weekday"
        r="count"
        xPadding={[20, 20]}
        yPadding={[20, 20]}
        padding={{ left: 24, bottom: 44, right: 8 }}
        xDomain={[0, 23]}
        yDomain={getyDomain()}
        props={{
          points: {
            tweened: true,
          },

          grid: { xTicks: 24, bandAlign: 'between' },
          rule: { x: false, y: false },
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
              return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(
                new Date(2024, 0, d === 0 ? 7 : d),
              )
            },
            ticks: 7,
            tickLength: 0,
            tickLabelProps: {
              class: 'fill-base-content/50',
            },
          },
        }}
        series={punchCard}
      >
        <svelte:fragment slot="tooltip">
          <Tooltip.Root let:data>
            <Tooltip.Header>{data.seriesKey}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item
                label="Weekday"
                value={new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(
                  new Date(2024, 0, data.weekday === 0 ? 7 : data.weekday),
                )}
                valueAlign="right"
              />
              <Tooltip.Item
                label="Hour"
                value={new Intl.DateTimeFormat(undefined, { hour: '2-digit' }).format(
                  new Date().setHours(data.hour),
                ) +
                  ' - ' +
                  new Intl.DateTimeFormat(undefined, { hour: '2-digit' }).format(
                    new Date().setHours(data.hour + 1),
                  )}
                valueAlign="right"
              />
              <Tooltip.Item label="Count" value={data.count} valueAlign="right" />
            </Tooltip.List>
          </Tooltip.Root>
        </svelte:fragment>
      </ScatterChart>
      <div class="absolute bottom-4 right-4 text-xs text-base-content/30">
        Each time you like, post or repost, the app will count <b>+1</b> on the correct day (y) and time
        (x).
      </div>
      <!-- <div class="absolute bottom-0 right-4 text-xs text-base-content/30">
        Clicking on the total number of likes, posts and reposts will hide/show on the punch card.
      </div> -->
    </div>
  </div>

  {#if !skipFollow}
    <div class="card bg-base-300 p-4">
      <div class="flex items-start justify-between">
        <h3 class="mb-4 text-lg font-bold">
          Following <span class="text-xs text-base-content/50"> (Rolling 7 days)</span>
        </h3>
        <div class="stat-value text-primary">
          {#if dataApiFollows}
            {dataApiFollows?.followsTotal}
          {:else}
            <div class="skeleton h-10 w-20 bg-base-200"></div>
          {/if}
        </div>
      </div>

      <div class="h-[200px] w-full">
        <AreaChart
          data={followsPeriods}
          x="timestamp"
          y="count"
          axis="y"
          padding={{ left: 24 }}
          grid={false}
          rule={false}
          props={{
            yAxis: {
              tickLength: 0,
              tickLabelProps: {
                class: 'fill-base-content/50',
              },
            },
          }}
          series={[{ key: 'count', label: 'Follow', color: 'oklch(var(--p))' }]}
        >
          <svelte:fragment slot="marks">
            <LinearGradient
              class={dataApiFollows
                ? 'from-primary/50 to-primary/0'
                : 'from-gray-600/50 to-gray-600/0'}
              vertical
              let:url
            >
              <Area
                tweened
                line={{
                  class: `stroke-2 ${dataApiFollows ? 'stroke-primary' : 'stroke-gray-600'}`,
                }}
                fill={url}
              />
            </LinearGradient>
          </svelte:fragment>
        </AreaChart>
      </div>
    </div>
  {/if}
</div>

<!-- <pre class="code text-xs">{JSON.stringify(dataApi, null, 2)}</pre> -->
