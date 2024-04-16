<script lang="ts">
  import html2canvas from "html2canvas-pro";
  import { parseISO, formatDistanceToNow } from "date-fns";
  import { fr, is } from "date-fns/locale";

  export let data;

  const width = 480;
  const height = 270;

  let theme: "light" | "dark" = "light";

  async function download() {
    const el = document.querySelector("#tumb");
    if (!el) return;

    // Capture the div as it is
    const capturedCanvas = await html2canvas(el as HTMLElement, {
      backgroundColor: null,
    });

    // const width = 506;
    // const height = 526;

    // Create a new canvas with desired dimensions
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = width;
    finalCanvas.height = height + 100;

    // Draw the captured image onto the new canvas, scaling it in the process
    const ctx = finalCanvas.getContext("2d");
    ctx!.drawImage(capturedCanvas, 0, 0, width, height + 100);

    // Convert to data URL and create download link
    const image = finalCanvas.toDataURL();
    const a = document.createElement("a");
    a.setAttribute("download", `${data.snippet.title}.png`);
    a.setAttribute("href", image);
    a.click();
  }

  const displayCount = (nb: number) => {
    if (nb > 1000000) {
      return `${(nb / 1000000).toFixed(2)} M vues`;
    }
    if (nb > 1000) {
      return `${(nb / 1000).toFixed(1)} k vues`;
    }
    return `${nb.toFixed(0)} vues`;
  };

  const displayWhen = (dateISO: string) => {
    const date = parseISO(dateISO);

    const relativeDate = formatDistanceToNow(date, {
      addSuffix: true,
      locale: fr,
    });
    return relativeDate;
  };

  function parseISOToTime(isoDuration: string) {
    try {
      const match = isoDuration.match(/PT(\d+M)?(\d+S)?/);
      const minutes = match[1] ? parseInt(match[1]) : 0;
      const seconds = match[2] ? parseInt(match[2]) : 0;
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } catch (error) {
      return isoDuration;
    }
  }

  function switchTheme() {
    theme = theme === "light" ? "dark" : "light";
  }
</script>

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->

<div
  id="tumb"
  class="rounded-2xl flex flex-col gap-4 {theme === 'light'
    ? 'bg-white'
    : 'bg-black'} p-4 relative"
  style="width: {width}px; height:{height + 100}px;"
>
  <img
    class="rounded-2xl"
    src={`data:image/jpeg;base64,${data.blob}`}
    alt="video: {data.snippet.title}"
    style="width: {width}px; height:{height}px;"
    {width}
    {height}
  />
  <span
    class="absolute top-56 right-6 bg-black text-white px-2 py-1 rounded-lg"
  >
    {parseISOToTime(data.contentDetails.duration)}
  </span>

  <h2 class="{theme === 'light' ? 'text-black' : 'text-white'} mt-1">
    {data.snippet.title}
  </h2>

  <div class="{theme === 'light' ? 'text-gray-400' : 'text-gray-600'} -mt-2">
    <span>{displayCount(data.statistics.viewCount)}</span>
    -
    <span>{displayWhen(data.snippet.publishedAt)}</span>
  </div>
</div>

<div class="flex gap-4">
  <button class="btn btn-primary" onclick={switchTheme}>{theme}</button>
  <button class="btn btn-primary flex-grow" onclick={download}>Download</button>
</div>
