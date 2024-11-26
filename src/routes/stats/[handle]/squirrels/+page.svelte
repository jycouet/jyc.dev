<script lang="ts">
  // import { toPng } from 'html-to-image'

  import Avatar from '$lib/components/Avatar.svelte'
  import Og from '$lib/components/Og.svelte'
  import { AtController } from '$modules/at/AtController'

  import JsonStyle from '../JsonStyle.svelte'
  import type { PageData } from './$types'

  type ResolvedType<T> = T extends Promise<infer R> ? R : T
  let { data }: { data: PageData } = $props()

  let dataApi = $state<ResolvedType<ReturnType<typeof AtController.getSquirrelSquad>>>()
  let followersCount: number | undefined = $state(undefined)
  let followsCount: number | undefined = $state(undefined)
  let postsCount: number | undefined = $state(undefined)
  // let score: number | undefined = $state(undefined)

  $effect(() => {
    AtController.getSquirrelSquad(data.pos_bsky!).then((res) => {
      dataApi = res
      followersCount =
        res.after.reduce((acc, curr) => acc + curr.followersCount, 0) +
        res.before.reduce((acc, curr) => acc + curr.followersCount, 0)
      followsCount =
        res.after.reduce((acc, curr) => acc + curr.followsCount, 0) +
        res.before.reduce((acc, curr) => acc + curr.followsCount, 0)
      postsCount =
        res.after.reduce((acc, curr) => acc + curr.postsCount, 0) +
        res.before.reduce((acc, curr) => acc + curr.postsCount, 0)
      // Calculate a balanced engagement score:
      // - Posts are weighted highest to encourage content creation
      // - Following count is capped to prevent follow-spam (500 per person)
      // // - Small follower counts don't heavily penalize the score
      // const normalizedFollows = Math.min(followsCount ?? 0, 5000) // Cap follows at 5000
      // const followersFactor = Math.log10(Math.max(followersCount ?? 1, 10)) // Logarithmic scaling for followers
      // score = Math.round(((postsCount ?? 0) * 3 + normalizedFollows) / followersFactor)
    })
  })

  // async function download() {
  //   const el = document.querySelector('#squad')
  //   if (!el) return

  //   toPng(el as HTMLElement, { cacheBust: true })
  //     .then((dataUrl) => {
  //       const link = document.createElement('a')
  //       link.download = `Squad_${data.pos_bsky}.png`
  //       link.href = dataUrl
  //       link.click()
  //     })
  //     .catch((err) => {
  //       console.error(err)
  //     })
  // }

  // TODO: fix this one day!
  // https://github.com/bluesky-social/social-app/issues/6133
  function createBSkyIntent(msg: string[]) {
    // If I'm on windows it should be <br>, if not it should be \n
    const lineBreak = navigator.userAgent.toLowerCase().includes('windows') ? '<br>' : '\n'
    return `https://bsky.app/intent/compose?text=${encodeURIComponent(msg.join(lineBreak))}`
  }

  let hrefShare = $derived(
    createBSkyIntent([
      `Squirrel Squad #${data.pos_bsky} 🐿️`,
      `${dataApi?.before.map((m) => `@${m.handle}`).join(' ')} ${dataApi?.after
        .map((m) => `@${m.handle}`)
        .join(' ')}`,
      '',
      'Squad created on the same minute in 🦋',
      `👉 https://skyzoo.blue/stats/${data.handle}/squirrels`,
      "Let's connect differently! 🐾",
    ]),
  )

  const defaultMember = {
    handle: '',
    avatar: '',
    displayName: '',
  }
  const defaultMembers = [defaultMember, defaultMember, defaultMember, defaultMember, defaultMember]
</script>

<Og
  title={`${data.displayName} | Squirrel Squad`}
  description={`Here you'll find your Bluesky neighbors, users who registered around the same time as you!`}
/>

<div class="mb-8 flex flex-col gap-4">
  <h1 class="text-3xl font-bold text-primary">Squirrel Squad 🐿️</h1>
  <p class="text-md text-base-content/70">
    Here you'll find your Bluesky neighbors - users who registered around the same time as you! This
    includes 5 users who joined before you and 5 who joined after you.
  </p>
  <p class="text-md text-base-content/70">Welcome to your squad! 🐿️</p>
</div>

<div class="mt-16">
  <div class="card bg-base-300 p-4 pt-8 md:pt-12" id="squad">
    <div class="flex items-start justify-center">
      <div class="grid grid-cols-2 justify-items-center">
        {#each dataApi?.before ?? defaultMembers as member, i}
          <div class={i === 0 ? 'col-span-2' : i === 1 || i === 2 ? '-mt-4' : '-ml-16 -mt-4'}>
            <Avatar {...member} size="w-16 md:w-20" />
          </div>
        {/each}
      </div>

      <div class="-mx-8 -mt-4 md:-mt-8">
        <Avatar {...data} size="w-20 md:w-28" />
        <div class="mt-12 text-center text-4xl md:mt-20">🐿️</div>
      </div>

      <div class="grid grid-cols-2 justify-items-center">
        {#each dataApi?.after ?? defaultMembers as member, i}
          <div
            class={`${i === 0 ? 'col-span-2' : i === 1 || i === 2 ? '-mt-4' : '-mr-16 -mt-4'} ${i === 3 && dataApi?.after.length === 4 ? 'col-start-2' : ''} ${i === 1 && dataApi?.after.length === 2 ? 'col-start-2' : ''}`}
          >
            <Avatar {...member} size="w-16 md:w-20" />
          </div>
        {/each}
      </div>
    </div>

    <div class="mt-2 flex flex-col items-center gap-4">
      <h2 class="text-2xl font-bold text-primary">
        {#if data?.pos_bsky}
          Squad <span class="font-mono"
            >#{new Intl.NumberFormat('en-US').format(data.pos_bsky)}</span
          >
        {:else}
          <div class="skeleton h-8 w-32"></div>
        {/if}
      </h2>

      <div class="flex rounded-lg bg-primary/10 p-4 pr-8 shadow">
        <JsonStyle
          key="Followers"
          value={followersCount
            ? followersCount >= 1000000
              ? `${(followersCount / 1000000).toFixed(1)}M`
              : followersCount >= 1000
                ? `${(followersCount / 1000).toFixed(1)}k`
                : followersCount.toString()
            : '....'}
        />
        <JsonStyle
          key="Following"
          value={followsCount
            ? followsCount >= 1000000
              ? `${(followsCount / 1000000).toFixed(1)}M`
              : followsCount >= 1000
                ? `${(followsCount / 1000).toFixed(1)}k`
                : followsCount.toString()
            : '....'}
        />
        <JsonStyle
          key="Posts"
          value={postsCount
            ? postsCount >= 1000000
              ? `${(postsCount / 1000000).toFixed(1)}M`
              : postsCount >= 1000
                ? `${(postsCount / 1000).toFixed(1)}k`
                : postsCount.toString()
            : '....'}
        />
        <!-- <JsonStyle
          key="Score"
          value={score
            ? score >= 1000000
              ? `${(score / 1000000).toFixed(1)}M`
              : score >= 1000
                ? `${(score / 1000).toFixed(1)}k`
                : score.toString()
            : '....'}
        /> -->
      </div>
      <p class="text-xs italic text-base-content/50">
        As squad leader, your mission is to guide and inspire your fellow squirrels! 🎉
      </p>
    </div>
  </div>

  <div class="mt-4 flex justify-center gap-4">
    {#if dataApi}
      <a href={hrefShare} class="link link-info"> Share your Squad on 🦋 </a>
    {:else}
      <div class="skeleton h-6 w-52"></div>
    {/if}
  </div>
</div>
