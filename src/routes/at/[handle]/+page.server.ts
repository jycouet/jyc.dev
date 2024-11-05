import { DidResolver, getPds, HandleResolver } from '@atproto/identity'
import { redirect } from '@sveltejs/kit'

import { Log } from '@kitql/helpers'

import { listRecords } from '$lib/at/helper'

import type { PageServerLoad } from './$types'

const log = new Log('at/[handle]/+page.server.ts')

export const load = (async (event) => {
  try {
    const handleResolver = new HandleResolver({})
    let did = undefined
    if ((event.params.handle ?? '').startsWith('did:plc:')) {
      did = event.params.handle
    } else {
      did = await handleResolver.resolve(event.params.handle)
    }

    if (did) {
      const didResolver = new DidResolver({})
      const didDocument = await didResolver.resolve(did)

      if (didDocument) {
        const pds = getPds(didDocument)
        // console.log(`pds`, pds);
        // const repo = await describeRepo(event.fetch, pds!, did);
        // console.log(`repo`, repo);

        const four_weeks_ago = new Date()
        four_weeks_ago.setDate(four_weeks_ago.getDate() - 7 * 4)

        if (pds) {
          log.info(event.params.handle)
          const profile = await listRecords(pds, did, 'app.bsky.actor.profile')
          const profileData = profile.records[0]?.value

          return {
            did,
            displayName: profileData?.displayName || event.params.handle,
            handle: event.params.handle,
            avatar: profileData?.avatar?.ref?.$link
              ? `https://cdn.bsky.app/img/avatar/plain/${did}/${profileData.avatar.ref.$link}@jpeg`
              : 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
            description: profileData?.description || '',
          }
        }
      }
    }
  } catch (error) {
    console.error(`error`, error)
    redirect(307, `/at`)
  }
}) satisfies PageServerLoad
