import { DidResolver, getPds, HandleResolver } from '@atproto/identity'
import { redirect } from '@sveltejs/kit'

import { Log } from '@kitql/helpers'

import { listRecords, listRecordsAll } from '$lib/at/helper'

import type { PageServerLoad } from './$types'

interface ActivityCounts {
  yesterday: number
  today: number
  nbRequest: number
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
    nbRequest: records.nbRequest,
  }
}

const log = new Log('at/[handle]/+page.server.ts')

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
          const [profile, likes, posts, reposts, follows] = await Promise.all([
            listRecords(event.fetch, pds, did, 'app.bsky.actor.profile'),
            getActivityCounts(event.fetch, pds, did, 'app.bsky.feed.like'),
            getActivityCounts(event.fetch, pds, did, 'app.bsky.feed.post'),
            getActivityCounts(event.fetch, pds, did, 'app.bsky.feed.repost'),
            listRecordsAll(event.fetch, pds, did, 'app.bsky.graph.follow'),
          ])

          const totalRequests =
            likes.nbRequest + posts.nbRequest + reposts.nbRequest + follows.nbRequest + 1

          log.info(`totalRequests`, totalRequests)

          const followsTotal = follows.records.length
          const followsPeriods: { timestamp: Date; count: number }[] = []

          // Get current time and round down to nearest 12h period
          const currentPeriodStart = new Date()
          followsPeriods.unshift({
            timestamp: new Date(currentPeriodStart),
            count: followsTotal,
          })
          currentPeriodStart.setMinutes(0, 0, 0)
          if (currentPeriodStart.getHours() >= 12) {
            currentPeriodStart.setHours(12)
          } else {
            currentPeriodStart.setHours(0)
          }

          // Get periods for last 7 days with cumulative counts
          const sevenDaysAgo = new Date(currentPeriodStart)
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

          follows.records.reverse()

          // Loop through follows from newest to oldest to build cumulative counts
          for (let i = follows.records.length - 1; i >= 0; i--) {
            const followDate = new Date(follows.records[i].value.createdAt)
            // console.log(`currentPeriodStart`, followDate, currentPeriodStart)

            // Skip if before 7 days ago
            if (followDate < sevenDaysAgo) continue

            if (followDate < currentPeriodStart) {
              followsPeriods.unshift({
                timestamp: new Date(currentPeriodStart),
                count: i + 1,
              })
              currentPeriodStart.setTime(currentPeriodStart.getTime() - 12 * 60 * 60 * 1000)
            }
          }

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
            followsPeriods,
            followsTotal,
          }
        }
      }
    }
  } catch (error) {
    console.error(`error`, error)
    redirect(307, `/at`)
  }
}) satisfies PageServerLoad
