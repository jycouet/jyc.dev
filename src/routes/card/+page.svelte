<script lang="ts">
  import Bluesky from '$lib/icons/Bluesky.svelte'
  import DynamicProcess from '$lib/icons/DynamicProcess.svelte'
  import Github from '$lib/icons/Github.svelte'
  import KoFi from '$lib/icons/KoFi.svelte'
  import Linkedin from '$lib/icons/Linkedin.svelte'
  import Youtube from '$lib/icons/Youtube.svelte'
  import { route } from '$lib/ROUTES'

  import type { PageData } from './$types'
  import { myLinks } from './myLinks'

  let { data }: { data: PageData } = $props()

  const sponsoring = [
    {
      name: 'Not Patrick',
      avatar:
        'https://cdn.bsky.app/img/avatar/plain/did:plc:d476bs72ukvewdfo76dnudbj/bafkreibn43dehdqphdfxbpzwozi3r5wd2s45bwa63ntcvmuj2txarhe5o4@jpeg',
      description:
        'Mainly for <a class="link link-secondary" href="https://www.patreon.com/c/RDVTech/posts">RDVTech</a>, a weekly podcast about tech in general. (in French!)',
    },
    {
      name: 'Sean Lynch',
      avatar:
        'https://cdn.bsky.app/img/avatar/plain/did:plc:jlvgxjh43wtfobeui5mdzepz/bafkreigabpnxmzmtttjky3ljnxxg67opz6c6bkxo5r5gqt5tbmocu64jeq@jpeg',
      description:
        'Great Svelte developer, author of <a class="link link-secondary" href="https://www.layerchart.com/">layerchart</a>.',
    },
    {
      name: 'Andras Bacsai',
      avatar:
        'https://cdn.bsky.app/img/avatar/plain/did:plc:dxdjdpz5ebvsjzxcm3j7xxsz/bafkreig2aczdsdlhfoiqtc6uhdkdnpiqezrguv5mxoruurig47cvgpjf3m@jpeg',
      description:
        'Author of <a class="link link-secondary" href="https://coolify.io/">coolify</a>, an #OSS project to host your website on your VPS.',
    },
    {
      name: 'Domingo',
      avatar:
        'https://static-cdn.jtvnw.net/jtv_user_pictures/3cdae7df-600c-4833-8dfe-8d2abc5a3b25-profile_image-70x70.png',
      description:
        'French streamer, great show: <a class="link link-secondary" href="https://www.twitch.tv/domingo">POPCORN</a>.',
    },
    {
      name: 'Joy of Code',
      avatar:
        'https://c10.patreonusercontent.com/4/patreon-media/p/campaign/9556439/ccff7763429440f4a52f68158cb2b90f/eyJ3IjoyMDB9/1.png?token-time=2145916800&token-hash=oTF1LfMSN3fSY3Bj2M6jCWz1oGGJN6QjjpQxZEYUOQ0%3D',
      description:
        '<a class="link link-secondary" href="https://www.youtube.com/@JoyofCodeDev">Youtuber</a> focusing on Svelte, nice and easy content.',
    },
  ]
</script>

<div class="min-h-screen bg-base-200 px-4 py-12">
  <div class="mx-auto flex max-w-2xl flex-col gap-8">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body items-center gap-4 text-center">
        <!-- Profile Image -->
        <div class="avatar mb-4">
          <div class="h-32 w-32 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
            <img src={data.profile.avatar} alt={data.profile.displayName} />
          </div>
        </div>

        <!-- Profile Info -->
        <h1 class="text-5xl font-bold">
          <a href={route('/card/[name]', { name: 'vcard' })}>Jean-Yves COUËT</a>
        </h1>
        <h2 class="text-2xl font-bold">JYC</h2>

        <div class="m-4 mt-8 flex w-full justify-around">
          {#each myLinks as link}
            <a href={route('/card/[name]', { name: link.name })}>
              <link.icon size={64} />
            </a>
          {/each}
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body gap-4">
        <h2 class="text-2xl font-bold">
          <span class="float-right">💖</span>
          I Sponsor...
        </h2>
        <div class="m-4 flex flex-col gap-8">
          {#each sponsoring as sponsor}
            <div class="flex items-center gap-6">
              <div class="avatar">
                <div
                  class="h-16 w-16 rounded-full ring ring-[#9fb9d0] ring-offset-2 ring-offset-base-100"
                >
                  <img src={sponsor.avatar} alt={sponsor.name} />
                </div>
              </div>
              <div class="flex flex-col">
                <h3 class="text-xl font-bold">{sponsor.name}</h3>
                <p class="mt-2 text-sm text-gray-500">
                  {@html sponsor.description}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body gap-4">
        <h2 class="text-2xl font-bold">Sponsor me</h2>
        <div class="m-4 mt-8 flex w-full justify-around">
          <Github size={64} />
          <!-- https://github.com/sponsors/jycouet -->
          <KoFi size={64} />
          <!-- https://ko-fi.com/E1E416BE51 -->
        </div>
      </div>
    </div>
  </div>
</div>
