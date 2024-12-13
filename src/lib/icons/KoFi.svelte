<script lang="ts">
  import kofi from '$lib/assets/kofi_symbol.png'

  interface Props {
    size?: number
  }

  let { size = 28 }: Props = $props()
</script>

<img
  height={size}
  width={size}
  class="object-contain opacity-70"
  src={kofi}
  alt="Buy Me a Coffee at ko-fi.com"
/>
