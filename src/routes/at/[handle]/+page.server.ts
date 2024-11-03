import { DidResolver, getPds, HandleResolver } from '@atproto/identity'
import { redirect } from '@sveltejs/kit'

import { listRecords, listRecordsAll } from '$lib/at/helper'

import type { PageServerLoad } from './$types'

interface ActivityCounts {
  yesterday: number
  today: number
}

async function getActivityCounts(
  fetch: typeof globalThis.fetch,
  pds: string,
  did: string,
  collection: string,
): Promise<ActivityCounts> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const records = await listRecordsAll(fetch, pds, did, collection, {
    while: (record) => new Date(record.value.createdAt) > yesterday,
  })

  return {
    yesterday: records.records.filter((record) => new Date(record.value.createdAt) < today).length,
    today: records.records.filter((record) => new Date(record.value.createdAt) >= today).length,
  }
}

export const load = (async (event) => {
  try {
    const handleResolver = new HandleResolver({})
    const did = await handleResolver.resolve(event.params.handle)

    if (did) {
      const didResolver = new DidResolver({})
      const didDocument = await didResolver.resolve(did)

      if (didDocument) {
        const pds = getPds(didDocument)
        // console.log(`pds`, pds);
        // const repo = await describeRepo(event.fetch, pds!, did);
        // console.log(`repo`, repo);

        if (pds) {
          const [profile, likes, posts, reposts] = await Promise.all([
            listRecords(event.fetch, pds, did, 'app.bsky.actor.profile'),
            getActivityCounts(event.fetch, pds, did, 'app.bsky.feed.like'),
            getActivityCounts(event.fetch, pds, did, 'app.bsky.feed.post'),
            getActivityCounts(event.fetch, pds, did, 'app.bsky.feed.repost'),
          ])

          const profileData = profile.records[0]?.value
          return {
            did,
            displayName: profileData?.displayName || event.params.handle,
            handle: event.params.handle,
            avatar: profileData?.avatar?.ref?.$link
              ? `https://cdn.bsky.app/img/avatar/plain/${did}/${profileData.avatar.ref.$link}@jpeg`
              : 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
            description: profileData?.description || '',
            likes,
            posts,
            reposts,
          }
        }
      }
    }
  } catch (error) {
    console.error(`error`, error)
    redirect(307, `/at`)
  }
}) satisfies PageServerLoad
