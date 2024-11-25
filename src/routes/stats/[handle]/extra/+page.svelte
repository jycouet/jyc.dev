<script lang="ts">
  import { PeriodType } from '@layerstack/utils'
  import { Area, AreaChart, LinearGradient, Tooltip } from 'layerchart'

  import { remult, type UserInfo } from 'remult'

  import { page } from '$app/stores'

  import { AgentController } from '$modules/at/AgentController'

  type ResolvedType<T> = T extends Promise<infer R> ? R : T
  let userInfo: UserInfo | undefined = $state(undefined)

  let dataApiFollowers =
    $state<ResolvedType<ReturnType<typeof AgentController.getHandleFollowers>>>()

  $effect(() => {
    remult.initUser().then((user) => {
      userInfo = user
    })
    AgentController.getHandleFollowers(new Date().getTimezoneOffset(), $page.params.handle).then(
      (res) => {
        dataApiFollowers = res
      },
    )
  })

  let followersPeriods = $derived(
    (
      dataApiFollowers?.followersPeriods ?? [
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
    ).map((d) => ({
      timestamp: new Date(d.timestamp),
      count: d.count,
    })),
  )

  const format = (d: Date, period: PeriodType) => {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short', // Displays the month in abbreviated form, e.g., "Nov"
      day: 'numeric',
      hour: 'numeric',
    }).format(d)
  }
</script>

<div class="card bg-base-300 p-4">
  <div class="flex items-start justify-between">
    <h3 class="mb-4 text-lg font-bold">
      Followers <span class="text-xs text-base-content/50">(Rolling 21 days)</span>
    </h3>
    <div class="stat-value text-primary">
      {#if dataApiFollowers}
        {dataApiFollowers?.nbFollowers}
      {:else}
        <div class="skeleton h-10 w-20 bg-base-200"></div>
      {/if}
    </div>
  </div>

  <div class="h-[200px] w-full">
    <AreaChart
      data={followersPeriods}
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
          class={dataApiFollowers
            ? 'from-primary/50 to-primary/0'
            : 'from-gray-600/50 to-gray-600/0'}
          vertical
          let:url
        >
          <Area
            tweened
            line={{
              class: `stroke-2 ${dataApiFollowers ? 'stroke-primary' : 'stroke-gray-600'}`,
            }}
            fill={url}
          />
        </LinearGradient>
      </svelte:fragment>
      <svelte:fragment slot="tooltip">
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(data.timestamp, PeriodType.Day)}</Tooltip.Header>
          <Tooltip.List>
            <!-- <Tooltip.Item
              label="Day"
              format="integer"
              value={data.rawCount.toLocaleString()}
              valueAlign="right"
            /> -->
            <Tooltip.Item
              label="Total"
              format="integer"
              value={data.count.toLocaleString()}
              valueAlign="right"
            />
          </Tooltip.List>
        </Tooltip.Root>
      </svelte:fragment>
    </AreaChart>
  </div>
</div>

<div class="mt-2 text-center text-sm text-base-content/50">
  {#if dataApiFollowers?.msg}
    {dataApiFollowers.msg}
  {/if}
</div>

<!-- Original button for testing -->
<!-- <button
  class="btn mt-4"
  onclick={() => AgentController.getExtraInfo(new Date().getTimezoneOffset())}
>
  Test
</button> -->
