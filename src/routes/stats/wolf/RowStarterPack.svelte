<script lang="ts">
  import Avatar from '$lib/components/Avatar.svelte'
  import { route } from '$lib/ROUTES'
  import { parseUri } from '$modules/at/helper'
  import type { StarterPack } from '$modules/at/StarterPack'

  interface Props {
    pack: StarterPack
  }

  let { pack }: Props = $props()
</script>

<td>
  <div class="flex items-center gap-3">
    <Avatar {...pack.creator} />
    <a
      class="link link-info flex items-center gap-3"
      target="_blank"
      href={route(`bsky_starter_pack`, {
        creator_handle: pack.creator.handle,
        rkey: parseUri(pack.id).rkey,
      })}
    >
      <div class="font-bold">{pack.name}</div>
    </a>
  </div>
</td>
<td>
  {#each pack.description.split('\n') as line}<p>{line}</p>{/each}
  <div class="text-right text-sm text-secondary">
    {pack.nbMembers ?? 0} members
  </div>
</td>
