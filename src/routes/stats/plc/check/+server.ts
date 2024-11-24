import { repo } from 'remult'

import { getProfile } from '$modules/at/agentHelper'
import { didToPds, getRecord, listRecords } from '$modules/at/helper'
import { RecordPlc } from '$modules/at/RecordPlc'

import type { RequestHandler } from './$types'

const checkPlcRecord = async (indexedAt: Date, inactiveDate: Date, plc: RecordPlc) => {
  const pds = await didToPds(plc.did)
  if (pds) {
    try {
      const [likes, posts, { data: profile }] = await Promise.all([
        listRecords(pds, plc.did, 'app.bsky.feed.like', { limit: 1 }),
        listRecords(pds, plc.did, 'app.bsky.feed.post', { limit: 1 }),
        getProfile(plc.did),
      ])

      const lastLike = likes.records.length > 0 ? new Date(likes.records[0].value.createdAt) : null
      const lastPost = posts.records.length > 0 ? new Date(posts.records[0].value.createdAt) : null
      const lastDate = !lastLike
        ? lastPost
        : !lastPost
          ? lastLike
          : lastLike > lastPost
            ? lastLike
            : lastPost

      const isInactive = lastDate ? lastDate < inactiveDate : true

      const toRet = {
        handle: profile?.handle,
        displayName: profile?.displayName,
        avatar: profile?.avatar,
        description: profile?.description,
        followersCount: profile?.followersCount,
        followsCount: profile?.followsCount,
        postsCount: profile?.postsCount,
        isInactive,
        indexedAt,
        // lastLike: likes.records.length > 0 ? new Date(likes.records[0].value.createdAt) : null,
        // lastPost: posts.records.length > 0 ? new Date(posts.records[0].value.createdAt) : null,
      }

      return toRet
    } catch (error) {
      console.error(`error`, error)
      return { isInactive: true, indexedAt }
    }
  }
}

export const GET: RequestHandler = async () => {
  const indexedAt = new Date()
  const inactiveThreshold = indexedAt.valueOf() - 90 * 24 * 60 * 60 * 1000
  const inactiveDate = new Date(inactiveThreshold)

  const plcs = await repo(RecordPlc).find({
    limit: 10,
    where: { pos_bsky: { $not: null } },
    orderBy: { createdAt: 'asc' },
  })

  for (let i = 0; i < plcs.length; i++) {
    const res = await checkPlcRecord(indexedAt, inactiveDate, plcs[i])
    if (res) {
      await repo(RecordPlc).update(plcs[i].did, res)
    }
  }

  return new Response(JSON.stringify({ profiles: 'cc' }), {
    headers: {
      'content-type': 'application/json',
    },
  })
}
