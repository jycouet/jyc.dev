<script lang="ts">
  import QRCode from 'qrcode'
  import { onMount } from 'svelte'

  import { page } from '$app/stores'

  import { myLinks } from '../myLinks'

  const myLink = myLinks.find((link) => link.name === $page.params.name)!
  let qrCodeDataUrl = ''

  onMount(async () => {
    qrCodeDataUrl = await QRCode.toDataURL(myLink.url, {
      width: 600,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#9fb9d0',
        light: '#121c22',
      },
    })
  })
</script>

<div class="min-h-screen bg-base-200 px-4 py-12">
  <div class="mx-auto flex max-w-2xl flex-col gap-8">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body items-center gap-6 text-center">
        <!-- Profile Image -->
        <myLink.icon size={128} />

        <a href={myLink.url} target="_blank" class="link link-secondary text-2xl md:text-3xl">
          {myLink.name}
        </a>

        <!-- QR Code -->
        {#if qrCodeDataUrl}
          <div class="mt-4">
            <img src={qrCodeDataUrl} alt="QR Code" class="" />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
