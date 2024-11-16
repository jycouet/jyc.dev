<script lang="ts">
  import { BarChart } from 'layerchart'
  import { queryParameters } from 'sveltekit-search-params'

  import { repo } from 'remult'

  import { goto } from '$app/navigation'

  import { route } from '$lib/ROUTES'
  import { LogHandleStats } from '$modules/logs/LogHandleStats'

  let handle = $state('')
  let error = $state('')

  const params = queryParameters({
    h: true,
    e: true,
  })

  $effect(() => {
    if ($params.h) {
      handle = $params.h
      $params.h = null
    }
    if ($params.e) {
      if ($params.e === 'not-valid') {
        error = 'Not a valid handle'
      } else {
        error = $params.e
      }
      $params.e = null
    }
  })

  let loading = $state(false)
  let withFollow = $state(true)

  let loadingChart = $state(true)

  let stats: { emoji: string; $count: number }[] = $state(
    [
      { emoji: '🦚', $count: Math.floor(Math.random() * 500) + 100 },
      { emoji: '🐝', $count: Math.floor(Math.random() * 500) + 100 },
      { emoji: '🦥', $count: Math.floor(Math.random() * 500) + 100 },
      { emoji: '🕷️', $count: Math.floor(Math.random() * 500) + 100 },
      { emoji: '🦋', $count: Math.floor(Math.random() * 500) + 100 },
      { emoji: '🐱', $count: Math.floor(Math.random() * 500) + 100 },
      { emoji: '🦉', $count: Math.floor(Math.random() * 500) + 100 },
    ].sort(() => Math.random() - 0.5),
  )

  $effect(() => {
    repo(LogHandleStats)
      .groupBy({
        group: ['emoji'],
        orderBy: { $count: 'asc' },
      })
      .then((c) => {
        loadingChart = false
        stats = []
        Object.entries(c).forEach(([key, { emoji, $count }]) => {
          if (emoji !== '') {
            stats.push({
              emoji,
              $count,
            })
          }
        })
      })
  })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    error = ''
    loading = true

    const cleanHandle = handle.replace('@', '').toLowerCase()

    if (cleanHandle) {
      try {
        if (withFollow) {
          await goto(route(`/at/[handle]`, { handle }))
        } else {
          await goto(route(`/at/[handle]`, { handle, skip_follow: 'true' }))
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

<div class="grid grid-cols-1 items-end gap-8 md:grid-cols-12">
  <form onsubmit={handleSubmit} class="flex flex-col gap-4 md:col-span-8">
    <div class="form-control flex gap-4">
      <div class="flex items-end gap-4">
        <div class="flex-1">
          <div class="label">
            <span class="label-text">Enter your handle</span>
            {#if error}
              <span class="label-text-alt text-error">{error}</span>
            {/if}
          </div>

          <label class="input input-bordered flex items-center gap-2 {error ? 'input-error' : ''} ">
            @
            <input
              type="text"
              class="grow placeholder:text-base-content/30"
              id="handle"
              bind:value={handle}
              placeholder="handle.bsky.social"
            />
          </label>
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

  <div class="md:col-span-4">
    <a href={route(`/at/wolf`)} class="btn btn-info flex h-28 w-full flex-col text-lg">
      <span>Starter Packs Browser</span>
      <span class="relative bottom-0 -mb-6 text-xs opacity-40"
        >To add a starter pack, enter your handle on the left!</span
      >
    </a>
  </div>
</div>

<div class="mt-10 h-[300px]">
  <BarChart
    data={stats}
    x="emoji"
    y="$count"
    props={{
      bars: { tweened: true },
      xAxis: { tickLabelProps: { class: 'text-xl md:text-3xl', dy: 30 }, tickLength: 0 },
      yAxis: { placement: 'right', tickLength: 0 },
    }}
    cRange={loadingChart ? ['oklch(var(--n)/1)'] : ['oklch(var(--s)/0.3)']}
  />
</div>

<div class="mt-16 text-center text-sm text-base-content/70">
  <p>TIP: If you're viewing a profile on blue sky,</p>
  <p>
    <span class="text-secondary">prefix with</span>
    "<code class="font-mono text-primary">jyc.dev/</code>" to open it here!
  </p>
</div>
