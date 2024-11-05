<script lang="ts">
  import { formatDistanceToNow, parseISO } from 'date-fns'
  import { enUS, fr } from 'date-fns/locale'
  import { toPng } from 'html-to-image'

  import { page } from '$app/stores'

  let { data } = $props()

  let locale = $derived($page.data.locale)

  // const width = 480;
  // const height = 270;

  let theme: 'light' | 'dark' = $state('light')

  async function download() {
    const el = document.querySelector('#thumb')
    if (!el) return

    toPng(el as HTMLElement, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = `${data.snippet.title}.png`
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const displayCount = (nb: number) => {
    let viewWord = nb > 1 ? 'views' : 'view'
    if (locale.toLowerCase().includes('fr')) {
      viewWord = nb > 1 ? 'vues' : 'vue'
    }

    return new Intl.NumberFormat(locale, { notation: 'compact' }).format(nb) + ` ${viewWord}`
  }

  const displayWhen = (dateISO: string) => {
    const date = parseISO(dateISO)

    const relativeDate = formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale.toLowerCase().includes('fr') ? fr : enUS,
    })
    return relativeDate
  }

  function parseISOToTime(isoDuration: string) {
    try {
      const match = isoDuration.match(/PT(\d+M)?(\d+S)?/)
      if (match) {
        const minutes = match[1] ? parseInt(match[1]) : 0
        const seconds = match[2] ? parseInt(match[2]) : 0
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
    } catch (error) {
      return isoDuration
    }
  }

  function switchTheme() {
    theme = theme === 'light' ? 'dark' : 'light'
  }
</script>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<div
  id="thumb"
  class="flex flex-col gap-1 rounded-2xl {theme === 'light' ? 'bg-white' : 'bg-black'} relative p-4"
>
  <div class="relative">
    <img
      class="image aspect-video rounded-2xl"
      src={`data:image/jpeg;base64,${data.blob}`}
      alt="video: {data.snippet.title}"
    />
    <!-- style="width: {width}px; height:{height}px;" -->
    <!-- class="absolute bottom-28 right-6 bg-black text-white px-2 py-1 rounded-lg" -->
    <span class="absolute bottom-2 right-2 rounded-lg bg-black/60 px-2 py-1 text-white">
      {parseISOToTime(data.contentDetails.duration)}
    </span>
  </div>

  <h2 class="{theme === 'light' ? 'text-black' : 'text-white'} mt-2 text-xl font-medium">
    {data.snippet.title}
  </h2>

  <div class={theme === 'light' ? 'text-gray-400' : 'text-gray-600'}>
    <span>{displayCount(data.statistics.viewCount)}</span>
    -
    <span>{displayWhen(data.snippet.publishedAt)}</span>
  </div>
</div>

<div>
  <a
    class="link link-primary"
    target="_blank"
    href="https://www.youtube.com/watch?v={$page.params.videoId}">Check out the video</a
  >
</div>

<div class="flex gap-4">
  <button class="btn btn-primary" onclick={switchTheme}>{theme}</button>
  <button class="btn btn-primary flex-grow" onclick={download}>Download</button>
</div>

<style>
  #thumb,
  #thumb * {
    font-family: Arial, Helvetica, sans-serif !important;
  }

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
