<script lang="ts">
  import type { ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
  import { BarChart } from 'layerchart'
  import { queryParameters } from 'sveltekit-search-params'

  import { repo } from 'remult'

  import { goto } from '$app/navigation'

  import avatarDefault from '$lib/assets/avatar-default.jpg'
  import og from '$lib/assets/og-insights.png'
  import Og from '$lib/components/Og.svelte'
  import { route } from '$lib/ROUTES'
  import { AgentController } from '$modules/at/AgentController'
  import { LogHandleStats } from '$modules/logs/LogHandleStats'
  import Shortcut from '$lib/components/Shortcut.svelte'

  const description = 'Assigns you a Bluesky animal based on your recent activity'

  let handle = $state('')
  let error = $state('')

  const params = queryParameters({
    h: true,
    e: true,
  })

  $effect(() => {
    if ($params.e) {
      if ($params.e === 'not-valid') {
        error = 'Not a valid handle'
      } else if ($params.e === 'not-found') {
        error = 'Profile not found'
      } else if ($params.e === 'no-unauthenticated') {
        error = `This account has "logged-out visibility" <b>enabled</b>.<br />I'll honor this request and not display its statistics.`
      } else {
        error = $params.e
      }
      $params.e = null
    }
    if ($params.h) {
      handle = $params.h
      $params.h = null
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
          await goto(route(`/stats/[handle]`, { handle }))
        } else {
          await goto(route(`/stats/[handle]`, { handle, skip_follow: 'true' }))
        }
      } catch (err) {
        error = 'An error occurred'
      } finally {
        loading = false
      }
    } else {
      error = 'Please enter a valid handle'
      loading = false
    }
  }

  let debounceTimer: ReturnType<typeof setTimeout>

  let suggestions = $state<ProfileViewBasic[]>([])
  let showSuggestions = $state(false)
  let loadingSuggestions = $state(false)

  let isFirstLoad = $state(true)

  let selectedIndex = $state(-1)
  let suggestionRefs = $state<HTMLElement[]>([])

  const handleInput = async (e: Event) => {
    clearTimeout(debounceTimer)
    e.preventDefault()
    if (handle) {
      loadingSuggestions = true
      showSuggestions = true
      debounceTimer = setTimeout(async () => {
        try {
          const res = await AgentController.searchActorsTypeahead(handle)
          suggestions = res.data.actors
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        } finally {
          loadingSuggestions = false
          isFirstLoad = false
        }
      }, 333)
      error = ''
    } else {
      suggestions = []
      showSuggestions = false
    }
  }

  const handleKeyNavigation = (direction: 'up' | 'down' | 'enter') => {
    if (!showSuggestions || suggestions.length === 0) return

    if (direction === 'up') {
      selectedIndex = selectedIndex <= 0 ? suggestions.length - 1 : selectedIndex - 1
    } else if (direction === 'down') {
      selectedIndex = selectedIndex >= suggestions.length - 1 ? 0 : selectedIndex + 1
    } else if (direction === 'enter' && selectedIndex !== -1) {
      selectSuggestion(suggestions[selectedIndex])
    }

    // Scroll selected item into view
    suggestionRefs[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }

  const selectSuggestion = async (suggestion: ProfileViewBasic) => {
    handle = suggestion.handle
    showSuggestions = false
    selectedIndex = -1
    // @ts-ignore
    handleSubmit({ preventDefault: () => {} })
  }

  $effect(() => {
    if (suggestions.length === 0) {
      selectedIndex = -1
    }
  })
</script>

<Og title="Sky Zoo" {description} {og} />

<div class="flex flex-col gap-16">
  <div class="grid grid-cols-1 items-end gap-8">
    <form
      onsubmit={handleSubmit}
      oninput={handleInput}
      class="flex flex-col gap-4"
      autocomplete="off"
    >
      <div class="form-control flex gap-4">
        <div class="flex items-end gap-4">
          <div class="flex-1">
            <div class="label">
              <span class="label-text whitespace-nowrap">Enter your handle</span>
              {#if error}
                <span class="label-text-alt text-error ml-2 text-right">{@html error}</span>
              {/if}
            </div>

            <div class="relative">
              <label
                class="input input-bordered flex items-center gap-2 {error ? 'input-error' : ''}"
              >
                @
                <input
                  type="text"
                  class="grow placeholder:text-base-content/30"
                  id="handle"
                  bind:value={handle}
                  placeholder="handle.bsky.social"
                />
              </label>

              {#if showSuggestions}
                <div
                  class="absolute z-10 mt-1 w-full rounded-lg border border-base-300 bg-base-200 shadow-lg"
                >
                  <ul class="menu p-2">
                    {#if isFirstLoad && loadingSuggestions}
                      <li>
                        <div class="flex items-center gap-2 py-2">
                          <span class="loading loading-spinner loading-sm"></span>
                          Loading suggestions...
                        </div>
                      </li>
                    {:else if suggestions.length === 0}
                      <li class="opacity-50">
                        <div class="flex items-center gap-2 py-2">No handles found</div>
                      </li>
                    {:else}
                      {#each suggestions as suggestion, index}
                        <li 
                          class={`
                            ${loadingSuggestions ? 'opacity-50' : ''} 
                            ${selectedIndex === index ? 'bg-primary/20' : ''}
                          `}
                          bind:this={suggestionRefs[index]}
                        >
                          <button
                            type="button"
                            class="flex items-center gap-2 py-2"
                            onclick={() => selectSuggestion(suggestion)}
                            onmouseenter={() => (selectedIndex = index)}
                          >
                            <div class="mask mask-hexagon size-8" title={suggestion.handle}>
                              <img
                                src={suggestion.avatar || avatarDefault}
                                alt="{suggestion.handle}'s avatar"
                                class="h-full w-full object-cover duration-500 ease-out hover:scale-110"
                              />
                            </div>
                            <span class="font-mono text-primary">@{suggestion.handle}</span>
                          </button>
                        </li>
                      {/each}
                    {/if}
                  </ul>
                </div>
              {/if}
            </div>
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
  </div>

  <div class=" h-[300px]">
    <BarChart
      data={stats}
      x="emoji"
      y="$count"
      padding={{ right: 30 }}
      props={{
        bars: { tweened: true },
        xAxis: { tickLabelProps: { class: 'text-xl md:text-3xl', dy: 30 }, tickLength: 0 },
        yAxis: { placement: 'right', tickLength: 0 },
      }}
      cRange={loadingChart ? ['oklch(var(--n)/1)'] : ['oklch(var(--s)/0.3)']}
    />
  </div>

  <div class="text-center text-sm text-base-content/70">
    <p>TIP: If you're viewing a profile on blue sky,</p>
    <p>
      <span class="text-secondary">prefix with</span>
      "<code class="font-mono text-primary">skyzoo.blue/</code>" to open it here!
    </p>
  </div>

  <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
    <a href={route(`/stats/wolf`)} class="btn btn-info flex h-28 w-full flex-col text-lg">
      <span class="italic">Wolf 🐺</span>
      <span>Starter Packs Browser</span>
      <span class="relative bottom-0 text-xs opacity-40"
        >To add a starter pack, enter your handle on the top!</span
      >
    </a>

    <a href={route(`/stats/whale`)} class="btn btn-secondary flex h-28 w-full flex-col text-lg">
      <span class="italic">Whale 🐋</span>
      <span>Global Statistics</span>
      <span class="relative bottom-0 text-xs opacity-40"> How many are we ? </span>
    </a>

    <a href={route(`/stats/lion`)} class="btn btn-warning flex h-28 w-full flex-col text-lg">
      <span class="italic">Lion 🦁</span>
      <span>Top followed accounts</span>
      <span class="relative bottom-0 text-xs opacity-40">Update from time to time</span>
    </a>
  </div>

  <Shortcut binds={['ArrowUp']} run={() => handleKeyNavigation('up')} />
  <Shortcut binds={['ArrowDown']} run={() => handleKeyNavigation('down')} />
  <Shortcut binds={['Enter']} run={() => handleKeyNavigation('enter')} />
</div>
