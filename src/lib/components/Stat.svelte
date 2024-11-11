<script lang="ts">
  import type { Component } from 'svelte'

  export let title: string
  export let value: number | undefined
  export let comparisonToday: number
  export let comparisonYesterday: number
  export let icon: Component
  export let color: string
  export let loading = false

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

    if (diff > 0) {
      return `${diff} <span class='text-success'>more</span> than yesterday`
    } else {
      return `${-diff} <span class='text-error'>less</span> than yesterday`
    }
  }
</script>

<div class="stat">
  <div class="stat-figure" style:color>
    <svelte:component this={icon} />
  </div>
  <div class="stat-title">Today's {title}</div>
  <div class="stat-value" style:color>
    {#if loading}
      <div class="skeleton h-10 w-24 bg-base-200"></div>
    {:else}
      {value}
    {/if}
  </div>
  <div class="stat-desc">
    {@html getNumbersComparison(comparisonToday, comparisonYesterday, title)}
  </div>
</div>
