<script lang="ts">
  import { route } from '$lib/ROUTES'

  import TimelineIcon from './TimelineIcon.svelte'

  interface Props {
    items?: {
      link_under_blog: string
      date: string
      title: string
    }[]
  }

  let { items = [] }: Props = $props()
</script>

<ul class="timeline timeline-vertical timeline-snap-icon max-md:timeline-compact">
  {#each items as item, i}
    <li>
      <hr />
      <TimelineIcon></TimelineIcon>
      <div class="mb-10 {i % 2 === 0 ? 'timeline-start md:text-end' : 'timeline-end'} ">
        <a href={route(`/blog/[link_under_blog]`, { link_under_blog: item.link_under_blog })}>
          <time class="font-mono italic" title="Yes, I display year-month-day">
            {item.date}
          </time>
          <div class="text-lg font-black">{item.title}</div>
        </a>
      </div>
      {#if i !== items.length - 1}
        <hr />
      {/if}
    </li>
  {/each}
</ul>
