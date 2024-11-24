import { repo } from 'remult'

import { getProfile } from '$modules/at/agentHelper'
import { didToPds, getRecord, listRecords } from '$modules/at/helper'
import { RecordPlc } from '$modules/at/RecordPlc'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  const plcs = await repo(RecordPlc).find({
    limit: 5,
    where: { pos_bsky: { $not: null } },
    orderBy: { createdAt: 'asc' },
  })
  const profiles = await Promise.all(
    plcs.map(async (plc) => {
      const pds = await didToPds(plc.did)
      if (pds) {
        try {
          const [likes, posts, { data: profile }] = await Promise.all([
            listRecords(pds, plc.did, 'app.bsky.feed.like', { limit: 1 }),
            listRecords(pds, plc.did, 'app.bsky.feed.post', { limit: 1 }),
            getProfile(plc.did),
          ])

          const toRet = {
            handle: profile?.handle,
            displayName: profile?.displayName,
            avatar: profile?.avatar,
            description: profile?.description,
            followersCount: profile?.followersCount,
            followsCount: profile?.followsCount,
            postsCount: profile?.postsCount,
            lastLike: likes.records.length > 0 ? new Date(likes.records[0].value.createdAt) : null,
            lastPost: posts.records.length > 0 ? new Date(posts.records[0].value.createdAt) : null,
          }

          // console.log(`toRet`, toRet)

          return toRet
        } catch (error) {
          console.error(`error`, error)
        }
      }
    }),
  )

  console.log(
    `profiles`,
    profiles.filter((p) => p),
  )

  return new Response(JSON.stringify(profiles.length), {
    headers: {
      'content-type': 'application/json',
    },
  })
}
