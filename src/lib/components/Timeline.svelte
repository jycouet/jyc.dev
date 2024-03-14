<script lang="ts">
  import TimelineIcon from "./TimelineIcon.svelte";
  import { Temporal } from "@js-temporal/polyfill";

  const items: {
    date: Temporal.PlainDate;
    title: string;
    description: string;
    href?: string;
    hrefLabel?: string;
    hrefAria?: string;
  }[] = [
    {
      date: Temporal.PlainDate.from("2024-03-13"),
      title: "jyc.dev is born",
      description: `After a long time thinking, 
      I finally decided to create a <i>"thing"</i> 
      to share my thoughts and experiences as a... <strong>developer</strong>! 
      I'll try to log things out...
      Hope you will a few things useful here 😉`,
    },
    {
      date: Temporal.PlainDate.from("2024-03-11"),
      title: "per hour vs per project 💡",
      description: `Per hour => You don't need scope, you can just start...
<br />
Per project => You need a defined scope (& timeline), agree and proceed.
<br />
<br />
So it's all about where you put the cursor on Risk/Trust/Flexibility/... both sides.`,
      href: "https://twitter.com/TejasKumar_/status/1767165463954374737",
      hrefAria: "Tejas Kumar's tweet",
    },
  ];
</script>

<ul
  class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical"
>
  {#each items as item, i}
    <li>
      <hr />
      <TimelineIcon></TimelineIcon>
      <div
        class="mb-10 {i % 2 === 0
          ? 'timeline-start md:text-end'
          : 'timeline-end'} "
      >
        <time class="font-mono italic">
          {item.date.toLocaleString(undefined, { dateStyle: "long" })}
        </time>
        <div class="text-lg font-black">{item.title}</div>
        {@html item.description}
        {#if item.href}
          <div>
            <a
              class="link link-primary italic"
              href={item.href}
              target="_blank"
              aria-label={item.hrefAria}
            >
              {item.hrefLabel ?? "Source"}
            </a>
          </div>
        {/if}
      </div>
      {#if i !== items.length - 1}
        <hr />
      {/if}
    </li>
  {/each}
</ul>
