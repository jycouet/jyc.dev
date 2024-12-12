<script lang="ts">
  import QRCode from 'qrcode'
  import { onMount } from 'svelte'

  import { page } from '$app/stores'

  import Bluesky from '$lib/icons/Bluesky.svelte'

  import { myLinks } from '../myLinks'

  const myLink = myLinks.find((link) => link.name === $page.params.name) ?? {
    name: 'vcard',
    url: `BEGIN:VCARD
VERSION:3.0
N:COUET;Jean-Yves;;M.;
FN:Jean-Yves COUET
GENDER:M
LANG:fr-FR
ORG:Dynamic Process
PHOTO;TYPE=JPEG:https://avatars.githubusercontent.com/u/5312607?v=4
TEL;CELL:+33632322473
EMAIL:me@jyc.dev
NOTE:100% Enthusiast
URL:https://jyc.dev
REV:20241107T060504Z
END:VCARD`,
    icon: null,
  }
  let qrCodeDataUrl = ''

  onMount(async () => {
    qrCodeDataUrl = await QRCode.toDataURL(myLink.url, {
      width: 600,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0e171e',
        light: '#9fb9d0',
      },
    })
  })
</script>

<div class="min-h-screen bg-base-200 px-4 py-12">
  <div class="mx-auto flex max-w-2xl flex-col gap-8">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body items-center gap-6 text-center">
        <!-- Profile Image -->
        {#if myLink.icon}
          <myLink.icon size={128} />
        {/if}

        {#if myLink.name === 'vcard'}
          <span class="text-2xl md:text-3xl"> VCard </span>
        {:else}
          <a href={myLink.url} target="_blank" class="link link-secondary text-2xl md:text-3xl">
            {myLink.name}
          </a>
        {/if}

        <!-- QR Code -->
        {#if qrCodeDataUrl}
          <div class="mt-4">
            <img src={qrCodeDataUrl} alt="QR Code" class="rounded-xl" />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
